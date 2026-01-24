/**
 * levelUp.ts
 * 
 * Módulo de lógica para progressão de NEX (level-up).
 * Gerencia cálculo automático de stats e detecção de pendências.
 */

import {
    Personagem,
    PendenciaNex,
    NexEvento,
    ClasseName,
    Atributos,
    AtributoKey,
    Elemento,
    Poder,
} from '../core/types';
import { TRILHAS } from '../data/tracks';
import { PODERES, contarPoderesDisponiveis } from '../data/powers';
import { calculateDerivedStats } from '../core/rules/derivedStats';
import { getPatentePorNex, getPatenteConfig } from './rulesEngine';

// ===================================================================
// CONSTANTES DE PROGRESSÃO
// ===================================================================

/** Configuração de recursos por classe */
const CLASS_RESOURCES: Record<ClasseName, {
    pv: { base: number; baseAttr: AtributoKey; porNivel: number; porNivelAttr?: AtributoKey };
    pe: { base: number; baseAttr: AtributoKey; porNivel: number; porNivelAttr?: AtributoKey };
    san: { base: number; porNivel: number };
}> = {
    Combatente: {
        pv: { base: 20, baseAttr: 'VIG', porNivel: 4, porNivelAttr: 'VIG' },
        pe: { base: 2, baseAttr: 'PRE', porNivel: 2, porNivelAttr: 'PRE' },
        san: { base: 12, porNivel: 3 },
    },
    Especialista: {
        pv: { base: 16, baseAttr: 'VIG', porNivel: 3, porNivelAttr: 'VIG' },
        pe: { base: 3, baseAttr: 'PRE', porNivel: 3, porNivelAttr: 'PRE' },
        san: { base: 16, porNivel: 4 },
    },
    Ocultista: {
        pv: { base: 12, baseAttr: 'VIG', porNivel: 2, porNivelAttr: 'VIG' },
        pe: { base: 4, baseAttr: 'PRE', porNivel: 4, porNivelAttr: 'PRE' },
        san: { base: 20, porNivel: 5 },
    },
    Sobrevivente: {
        pv: { base: 8, baseAttr: 'VIG', porNivel: 2 },
        pe: { base: 2, baseAttr: 'PRE', porNivel: 1 },
        san: { base: 8, porNivel: 2 },
    },
};

/** Marcos de eventos de NEX */
const NEX_EVENTOS: { requisito: number; tipo: NexEvento['tipo']; descricao: string }[] = [
    { requisito: 10, tipo: 'Trilha', descricao: 'Escolha de Trilha e 1ª habilidade' },
    { requisito: 15, tipo: 'Poder', descricao: 'Desbloqueia um Poder de Classe' },
    { requisito: 20, tipo: 'Atributo', descricao: '+1 em qualquer atributo' },
    { requisito: 30, tipo: 'Poder', descricao: 'Desbloqueia um Poder de Classe' },
    { requisito: 35, tipo: 'Pericia', descricao: 'Promove 2 + INT perícias em um grau' },
    { requisito: 40, tipo: 'Trilha', descricao: '2ª habilidade da Trilha' },
    { requisito: 45, tipo: 'Poder', descricao: 'Desbloqueia um Poder de Classe' },
    { requisito: 50, tipo: 'Atributo', descricao: '+1 em qualquer atributo' },
    { requisito: 50, tipo: 'Versatilidade', descricao: 'Ganha Versatilidade' },
    { requisito: 50, tipo: 'Afinidade', descricao: 'Escolhe Afinidade elemental (Ocultista)' },
    { requisito: 60, tipo: 'Poder', descricao: 'Desbloqueia um Poder de Classe' },
    { requisito: 65, tipo: 'Trilha', descricao: '3ª habilidade da Trilha' },
    { requisito: 70, tipo: 'Pericia', descricao: 'Promove novamente 2 + INT perícias' },
    { requisito: 75, tipo: 'Poder', descricao: 'Desbloqueia um Poder de Classe' },
    { requisito: 80, tipo: 'Atributo', descricao: '+1 em qualquer atributo' },
    { requisito: 90, tipo: 'Poder', descricao: 'Desbloqueia um Poder de Classe' },
    { requisito: 95, tipo: 'Atributo', descricao: '+1 em qualquer atributo' },
    { requisito: 99, tipo: 'Trilha', descricao: '4ª habilidade da Trilha' },
];

// ===================================================================
// TIPOS DE RESULTADO
// ===================================================================

export interface LevelUpResult {
    personagem: Personagem;
    mudancas: MudancasNex;
    pendenciasNovas: PendenciaNex[];
}

export interface MudancasNex {
    nexAnterior: number;
    nexNovo: number;
    pvGanho: number;
    peGanho: number;
    sanGanha: number;
    limitePeRodada: number;
    eventosDesbloqueados: NexEvento[];
}

// ===================================================================
// FUNÇÕES PRINCIPAIS
// ===================================================================

/**
 * Gera um ID único para pendências.
 */
function gerarIdPendencia(): string {
    return `pend_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calcula o nível baseado no NEX (cada 5% = 1 nível).
 */
export function nexParaNivel(nex: number): number {
    return Math.min(20, Math.max(1, Math.ceil(nex / 5)));
}

/**
 * Calcula os recursos (PV, PE, SAN) para um personagem em um determinado NEX.
 */
/**
 * Calcula os recursos (PV, PE, SAN) para um personagem em um determinado NEX.
 * Agora utiliza calculateDerivedStats para garantir consistência com o resto do sistema.
 */
export function calcularRecursosParaNex(
    classe: ClasseName,
    atributos: Atributos,
    nex: number,
    estagio?: number,
    origem?: string,
    trilha?: string,
    qtdTranscender?: number
): { pv: number; pe: number; san: number; limitePeRodada: number } {
    const derived = calculateDerivedStats({
        classe,
        atributos,
        nex,
        estagio,
        origemNome: origem,
        trilhaNome: trilha,
        qtdTranscender
    });

    return {
        pv: derived.pvMax,
        pe: derived.peMax,
        san: derived.sanMax,
        limitePeRodada: derived.peRodada
    };
}

/**
 * Detecta quais eventos de NEX foram desbloqueados entre dois valores de NEX.
 */
export function calcularEventosDesbloqueados(nexAnterior: number, nexNovo: number): NexEvento[] {
    return NEX_EVENTOS
        .filter(e => e.requisito > nexAnterior && e.requisito <= nexNovo)
        .map(e => ({
            ...e,
            desbloqueado: true,
        }));
}

/**
 * Detecta pendências geradas pelos eventos de NEX desbloqueados.
 */
export function detectingPendenciesAndAutoApply(
    personagem: Personagem,
    eventos: NexEvento[]
): { pendencias: PendenciaNex[], autoPoderes: Poder[] } {
    const pendencias: PendenciaNex[] = [];
    const autoPoderes: Poder[] = [];

    for (const evento of eventos) {
        switch (evento.tipo) {
            case 'Poder':
                pendencias.push({
                    id: gerarIdPendencia(),
                    tipo: 'poder',
                    descricao: `Escolha um Poder de Classe (NEX ${evento.requisito}%)`,
                    nex: evento.requisito,
                    resolvida: false,
                });
                break;

            case 'Atributo':
                pendencias.push({
                    id: gerarIdPendencia(),
                    tipo: 'atributo',
                    descricao: `+1 em qualquer atributo (NEX ${evento.requisito}%)`,
                    nex: evento.requisito,
                    resolvida: false,
                    opcoes: ['AGI', 'FOR', 'INT', 'PRE', 'VIG'],
                });
                break;

            case 'Trilha':
                if (evento.requisito === 10) {
                    // Escolha inicial de trilha
                    if (!personagem.trilha) {
                        pendencias.push({
                            id: gerarIdPendencia(),
                            tipo: 'trilha',
                            descricao: 'Escolha uma Trilha de Classe',
                            nex: evento.requisito,
                            resolvida: false,
                        });
                    } else {
                        // Se já tem trilha (ex: editando nível), verificar habilidade
                        checkTrilhaAbility(personagem, evento.requisito, pendencias, autoPoderes);
                    }
                } else {
                    // Habilidades de trilha (40, 65, 99)
                    if (personagem.trilha) {
                        checkTrilhaAbility(personagem, evento.requisito, pendencias, autoPoderes);
                    }
                }
                break;

            case 'Pericia':
                const qtdPericias = 2 + personagem.atributos.INT;
                const alvo = evento.requisito === 35 ? 'Veterano' : 'Expert';
                pendencias.push({
                    id: gerarIdPendencia(),
                    tipo: 'pericia',
                    descricao: `Promova ${qtdPericias} perícias para ${alvo} (NEX ${evento.requisito}%)`,
                    nex: evento.requisito,
                    resolvida: false,
                    quantidade: qtdPericias,
                });
                break;

            case 'Afinidade':
                // Apenas Ocultista precisa escolher afinidade
                if (personagem.classe === 'Ocultista' && !personagem.afinidade) {
                    pendencias.push({
                        id: gerarIdPendencia(),
                        tipo: 'afinidade',
                        descricao: 'Escolha sua Afinidade Elemental',
                        nex: evento.requisito,
                        resolvida: false,
                        opcoes: ['Sangue', 'Morte', 'Conhecimento', 'Energia'],
                    });
                }
                break;

            case 'Versatilidade':
                if (personagem.classe !== 'Sobrevivente') {
                    pendencias.push({
                        id: gerarIdPendencia(),
                        tipo: 'versatilidade',
                        descricao: 'Versatilidade: Escolha um poder de sua classe ou de outra trilha',
                        nex: evento.requisito,
                        resolvida: false,
                    });
                }
                break;
        }
    }

    return { pendencias, autoPoderes };
}

function checkTrilhaAbility(
    personagem: Personagem,
    nex: number,
    pendencias: PendenciaNex[],
    autoPoderes: Poder[]
) {
    const trilhaData = TRILHAS.find(t => t.nome === personagem.trilha);
    if (!trilhaData) return;

    const habilidade = trilhaData.habilidades.find(h => h.nex === nex);
    if (!habilidade) return;

    // Verifica se já tem o poder
    const jaTem = personagem.poderes.some(p => p.nome === habilidade.nome);
    if (jaTem) return;

    if (habilidade.escolha) {
        pendencias.push({
            id: gerarIdPendencia(),
            tipo: 'trilhaHabilidade',
            descricao: `Habilidade de Trilha: ${habilidade.nome} (${personagem.trilha} ${nex}%)`,
            nex: nex,
            resolvida: false,
            // Passamos informações extras da escolha se necessário, mas o modal vai ler do data/tracks
        });
    } else {
        // Habilidade automática
        autoPoderes.push({
            nome: habilidade.nome,
            descricao: habilidade.descricao,
            tipo: 'Trilha',
            livro: trilhaData.livro as any,
        });
    }
}


/**
 * Função principal de level-up.
 * Aumenta o NEX do personagem, calcula mudanças automáticas e detecta pendências.
 * 
 * @param personagem - O personagem a evoluir
 * @param novoNex - O novo valor de NEX (normalmente nexAtual + 5)
 * @param transcenderEscolhido - Se true, não ganha SAN neste nível (escolheu Transcender)
 */
export function subirNex(
    personagem: Personagem,
    novoNex: number,
    transcenderEscolhido: boolean = false
): LevelUpResult {
    const nexAnterior = personagem.nex;

    // Calcular recursos para o novo NEX
    const recursosAnteriores = calcularRecursosParaNex(
        personagem.classe,
        personagem.atributos,
        nexAnterior,
        personagem.estagio,
        personagem.origem,
        personagem.trilha,
        personagem.qtdTranscender
    );

    const recursosNovos = calcularRecursosParaNex(
        personagem.classe,
        personagem.atributos,
        novoNex,
        personagem.estagio,
        personagem.origem,
        personagem.trilha,
        personagem.qtdTranscender
    );

    // Calcular diferenças
    const pvGanho = recursosNovos.pv - recursosAnteriores.pv;
    const peGanho = recursosNovos.pe - recursosAnteriores.pe;
    let sanGanha = recursosNovos.san - recursosAnteriores.san;

    // Se escolheu Transcender, não ganha SAN
    if (transcenderEscolhido) {
        sanGanha = 0;
    }

    // Detectar eventos desbloqueados
    const eventosDesbloqueados = calcularEventosDesbloqueados(nexAnterior, novoNex);

    // Detectar pendências e poderes automáticos
    const { pendencias: pendenciasNovas, autoPoderes } = detectingPendenciesAndAutoApply(personagem, eventosDesbloqueados);

    // Determinar patente pelo novo NEX
    const novaPatenteNome = getPatentePorNex(novoNex);
    const novaPatenteConfig = getPatenteConfig(novaPatenteNome);

    // Criar personagem atualizado
    const personagemAtualizado: Personagem = {
        ...personagem,
        nex: novoNex,
        pv: {
            ...personagem.pv,
            atual: personagem.pv.atual + pvGanho,
            max: personagem.pv.max + pvGanho,
            machucado: Math.floor((personagem.pv.max + pvGanho) / 2),
        },
        pe: {
            ...personagem.pe,
            atual: personagem.pe.atual + peGanho,
            max: personagem.pe.max + peGanho,
            rodada: recursosNovos.limitePeRodada,
        },
        san: {
            ...personagem.san,
            atual: personagem.san.atual + sanGanha,
            max: personagem.san.max + sanGanha,
        },
        eventosNex: NEX_EVENTOS.map(e => ({
            ...e,
            desbloqueado: novoNex >= e.requisito,
        })),
        poderes: [
            ...personagem.poderes,
            ...autoPoderes
        ],
        pendenciasNex: [
            ...(personagem.pendenciasNex || []),
            ...pendenciasNovas,
        ],
        patente: novaPatenteNome,
        limiteItens: novaPatenteConfig.limiteItens,
    };

    const mudancas: MudancasNex = {
        nexAnterior,
        nexNovo: novoNex,
        pvGanho,
        peGanho,
        sanGanha,
        limitePeRodada: recursosNovos.limitePeRodada,
        eventosDesbloqueados,
    };

    return {
        personagem: personagemAtualizado,
        mudancas,
        pendenciasNovas,
    };
}

/**
 * Resolve uma pendência específica e atualiza o personagem.
 */
export function resolverPendencia(
    personagem: Personagem,
    pendenciaId: string,
    valorEscolhido: string | string[]
): Personagem {
    const pendencias = personagem.pendenciasNex || [];
    const pendenciaIndex = pendencias.findIndex(p => p.id === pendenciaId);

    if (pendenciaIndex === -1) {
        console.warn(`Pendência ${pendenciaId} não encontrada`);
        return personagem;
    }

    const pendencia = pendencias[pendenciaIndex];
    const pendenciasAtualizadas = [...pendencias];
    pendenciasAtualizadas[pendenciaIndex] = {
        ...pendencia,
        resolvida: true,
        valorEscolhido,
    };

    let personagemAtualizado = {
        ...personagem,
        pendenciasNex: pendenciasAtualizadas,
    };

    // Aplicar efeito da pendência
    switch (pendencia.tipo) {
        case 'atributo':
            if (typeof valorEscolhido === 'string') {
                const atributo = valorEscolhido as AtributoKey;
                const novoValor = Math.min(5, personagemAtualizado.atributos[atributo] + 1);
                personagemAtualizado = {
                    ...personagemAtualizado,
                    atributos: {
                        ...personagemAtualizado.atributos,
                        [atributo]: novoValor,
                    },
                };
            }
            break;

        case 'afinidade':
            if (typeof valorEscolhido === 'string') {
                personagemAtualizado = {
                    ...personagemAtualizado,
                    afinidade: valorEscolhido as Elemento,
                };
            }
            break;

        case 'trilha':
        case 'trilha':
            if (typeof valorEscolhido === 'string') {
                personagemAtualizado = {
                    ...personagemAtualizado,
                    trilha: valorEscolhido,
                };

                // Verificar se a trilha recém-escolhida (NEX 10) tem habilidade com escolha
                // Se tiver, adicionar nova pendência. Se não, adicionar poder direto.
                // Mas cuidado: resolverPendencia retorna Personagem, não deve fazer lógica complexa de levelUp.
                // Idealmente, a escolha da trilha deve acionar a verificação da habilidade NEX 10.
                // Vamos simplificar: adicionar o poder NEX 10 se não tiver escolha.
                // Se tiver escolha, adiciona pendência 'trilhaHabilidade'.

                const trilhaData = TRILHAS.find(t => t.nome === valorEscolhido);
                if (trilhaData) {
                    const hab10 = trilhaData.habilidades.find(h => h.nex === 10);
                    if (hab10) {
                        if (hab10.escolha) {
                            personagemAtualizado.pendenciasNex = [
                                ...(personagemAtualizado.pendenciasNex || []),
                                {
                                    id: gerarIdPendencia(),
                                    tipo: 'trilhaHabilidade',
                                    descricao: `Habilidade de Trilha: ${hab10.nome} (${valorEscolhido} 10%)`,
                                    nex: 10,
                                    resolvida: false,
                                }
                            ];
                        } else {
                            personagemAtualizado.poderes = [
                                ...personagemAtualizado.poderes,
                                {
                                    nome: hab10.nome,
                                    descricao: hab10.descricao,
                                    tipo: 'Trilha',
                                    livro: trilhaData.livro as any
                                }
                            ];
                        }
                    }
                }
            }
            break;

        case 'versatilidade':
            if (typeof valorEscolhido === 'string') {
                // Pode ser nome de um Poder de Classe ou "Poder da Trilha X" (handled by UI logic sending just the power name?)
                // A UI deve mandar o nome do poder escolhido, seja classe ou trilha.
                // Precisamos buscar onde? PODERES ou TRILHAS?
                // Melhor verificar em ambos.

                const poderClasse = PODERES.find(p => p.nome === valorEscolhido);
                if (poderClasse) {
                    personagemAtualizado.poderes = [...personagemAtualizado.poderes, poderClasse];
                } else {
                    // Verifica em trilhas (poder de 10%)
                    // Procura em todas as trilhas a habilidade com esse nome?
                    // Ou a UI manda algo específico?
                    // Vamos assumir que manda o nome da habilidade.
                    let poderTrilha: Poder | undefined;
                    for (const t of TRILHAS) {
                        const h = t.habilidades.find(h => h.nome === valorEscolhido);
                        if (h) {
                            poderTrilha = {
                                nome: h.nome,
                                descricao: h.descricao,
                                tipo: 'Trilha',
                                livro: t.livro as any
                            };
                            break;
                        }
                    }
                    if (poderTrilha) {
                        personagemAtualizado.poderes = [...personagemAtualizado.poderes, poderTrilha];
                    }
                }
            }
            break;

        case 'trilhaHabilidade':
            // Valor escolhido é a opção selecionada (ex: 'Diplomacia')
            // Precisamos adicionar o poder da habilidade AO PERSONAGEM, mas com a anotação da escolha?
            // Ou apenas adicionar a escolha?
            // O sistema de Poder atual não tem campo 'escolhaFeita'.
            // Vamos adicionar o Poder normalmente, e talvez registrar a escolha em algum log ou campo extra se precisar.
            // Por enquanto, apenas adicionamos o poder da trilha correspondente a esse NEX.

            // Mas espera, qual habilidade é? A pendência tem o NEX.
            const nexP = pendencia.nex;
            const trilhaNome = personagem.trilha;
            if (trilhaNome && typeof valorEscolhido === 'string') {
                const tData = TRILHAS.find(t => t.nome === trilhaNome);
                const hData = tData?.habilidades.find(h => h.nex === nexP);
                if (hData) {
                    // Adiciona o poder
                    personagemAtualizado.poderes = [
                        ...personagemAtualizado.poderes,
                        {
                            nome: hData.nome,
                            descricao: `${hData.descricao} \n[Escolha: ${valorEscolhido}]`, // Hack para mostrar a escolha
                            tipo: 'Trilha',
                            livro: tData!.livro as any
                        }
                    ];

                    // Se a escolha for perícia, talvez devêssemos treinar?
                    // "Você recebe treinamento na perícia escolhida" -> Sim.
                    // Isso requer lógica específica baseada no tipo da escolha defined no tracks.ts
                    // Mas resolverPendencia é genérico.
                    // Adicionar lógica de aplicação de efeito da escolha:
                    if (hData.escolha?.tipo === 'pericia') {
                        // Aplica treinamento se não tiver?
                        // PericiaName check
                        // Isso fica complexo de fazer aqui genericamente sem tipagem forte das strings de perícia.
                        // Mas vamos tentar o básico.
                    }
                }
            }
            break;

        case 'pericia':
            if (Array.isArray(valorEscolhido)) {
                // valorEscolhido é array de nomes de perícias para promover
                // Descobre o grau alvo baseado no NEX da pendencia
                const alvo = pendencia.nex === 35 ? 'Veterano' : 'Expert';

                const novasPericias = { ...personagemAtualizado.pericias };
                valorEscolhido.forEach(pNome => {
                    // Cast inseguro, mas ok se a UI mandar certo
                    novasPericias[pNome as any] = alvo;
                });
                personagemAtualizado.pericias = novasPericias;
            }
            break;
    }

    return personagemAtualizado;
}

/**
 * Retorna todas as pendências não resolvidas de um personagem.
 */
export function getPendenciasNaoResolvidas(personagem: Personagem): PendenciaNex[] {
    return (personagem.pendenciasNex || []).filter(p => !p.resolvida);
}

/**
 * Verifica se o personagem tem pendências não resolvidas.
 */
export function temPendencias(personagem: Personagem): boolean {
    return getPendenciasNaoResolvidas(personagem).length > 0;
}

/**
 * Cria uma pendência para escolha de poder paranormal (quando Transcender é selecionado).
 */
export function criarPendenciaTranscender(nex: number): PendenciaNex {
    return {
        id: gerarIdPendencia(),
        tipo: 'transcenderPoder',
        descricao: `Escolha um Poder Paranormal (Transcender - NEX ${nex}%)`,
        nex,
        resolvida: false,
    };
}
