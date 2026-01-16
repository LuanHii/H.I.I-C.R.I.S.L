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
} from '../core/types';
import { contarPoderesDisponiveis } from '../data/powers';

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
export function calcularRecursosParaNex(
    classe: ClasseName,
    atributos: Atributos,
    nex: number,
    estagio?: number
): { pv: number; pe: number; san: number; limitePeRodada: number } {
    const data = CLASS_RESOURCES[classe];
    const isSurvivor = classe === 'Sobrevivente';

    const niveisExtras = isSurvivor
        ? Math.max(0, (estagio || 1) - 1)
        : Math.max(0, nexParaNivel(nex) - 1);

    const pvBase = data.pv.base + atributos[data.pv.baseAttr];
    const peBase = data.pe.base + atributos[data.pe.baseAttr];
    const sanBase = data.san.base;

    const pv = pvBase + niveisExtras * (data.pv.porNivel + (data.pv.porNivelAttr ? atributos[data.pv.porNivelAttr] : 0));
    const pe = peBase + niveisExtras * (data.pe.porNivel + (data.pe.porNivelAttr ? atributos[data.pe.porNivelAttr] : 0));
    const san = sanBase + niveisExtras * data.san.porNivel;

    const limitePeRodada = isSurvivor ? 1 : Math.min(20, Math.max(1, Math.ceil(nex / 5)));

    return { pv, pe, san, limitePeRodada };
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
export function detectarPendencias(
    personagem: Personagem,
    eventos: NexEvento[]
): PendenciaNex[] {
    const pendencias: PendenciaNex[] = [];

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
                    }
                }
                // Habilidades de trilha (40, 65, 99) são tratadas após escolher trilha
                if (personagem.trilha && evento.requisito > 10) {
                    pendencias.push({
                        id: gerarIdPendencia(),
                        tipo: 'trilhaHabilidade',
                        descricao: `Habilidade de Trilha ${personagem.trilha} (NEX ${evento.requisito}%)`,
                        nex: evento.requisito,
                        resolvida: false,
                    });
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
                // Versatilidade é automática (ganha o poder)
                break;
        }
    }

    return pendencias;
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
        personagem.estagio
    );

    const recursosNovos = calcularRecursosParaNex(
        personagem.classe,
        personagem.atributos,
        novoNex,
        personagem.estagio
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

    // Detectar pendências
    const pendenciasNovas = detectarPendencias(personagem, eventosDesbloqueados);

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
        pendenciasNex: [
            ...(personagem.pendenciasNex || []),
            ...pendenciasNovas,
        ],
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
            if (typeof valorEscolhido === 'string') {
                personagemAtualizado = {
                    ...personagemAtualizado,
                    trilha: valorEscolhido,
                };
            }
            break;

        // Outros tipos (poder, pericia, trilhaHabilidade) são tratados em componentes específicos
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
