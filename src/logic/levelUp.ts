import {
    Personagem,
    PendenciaNex,
    NexEvento,
    ClasseName,
    Atributos,
    AtributoKey,
    Elemento,
    Poder,
    PericiaName,
} from '../core/types';
import { RITUAIS } from '../data/rituals';
import { TRILHAS } from '../data/tracks';
import { PODERES, contarPoderesDisponiveis } from '../data/powers';
import { calculateDerivedStats } from '../core/rules/derivedStats';
import { getPatentePorNex, getPatenteConfig, calcularRecursosClasse } from './rulesEngine';
import { NEX_EVENTOS } from '../core/rules/nexEventos';

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

function gerarIdPendencia(): string {
    return `pend_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function nexParaNivel(nex: number): number {
    return Math.min(20, Math.max(1, Math.ceil(nex / 5)));
}

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

export function calcularEventosDesbloqueados(nexAnterior: number, nexNovo: number): NexEvento[] {
    return NEX_EVENTOS
        .filter(e => e.requisito > nexAnterior && e.requisito <= nexNovo)
        .map(e => ({
            ...e,
            desbloqueado: true,
        }));
}

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

                    if (!personagem.trilha) {
                        pendencias.push({
                            id: gerarIdPendencia(),
                            tipo: 'trilha',
                            descricao: 'Escolha uma Trilha de Classe',
                            nex: evento.requisito,
                            resolvida: false,
                        });
                    } else {

                        checkTrilhaAbility(personagem, evento.requisito, pendencias, autoPoderes);
                    }
                } else {

                    if (personagem.trilha) {
                        checkTrilhaAbility(personagem, evento.requisito, pendencias, autoPoderes);
                    }
                }
                break;

            case 'Pericia':
                // Especialista recebe 5+INT; Combatente e Ocultista recebem 2+INT
                const qtdPericias = personagem.classe === 'Especialista'
                    ? 5 + personagem.atributos.INT
                    : 2 + personagem.atributos.INT;
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

            case 'Ritual':
                // Apenas Ocultistas aprendem rituais via Escolhido pelo Outro Lado
                if (personagem.classe === 'Ocultista') {
                    // Determina o círculo máximo desbloqueado neste NEX
                    const circuloPorNex: Record<number, 1 | 2 | 3 | 4> = { 5: 1, 25: 2, 55: 3, 85: 4 };
                    const circuloMaximo = circuloPorNex[evento.requisito] ?? 1;
                    pendencias.push({
                        id: gerarIdPendencia(),
                        tipo: 'ritual',
                        descricao: `Escolha 1 ritual de até ${circuloMaximo}º círculo (NEX ${evento.requisito}%)`,
                        nex: evento.requisito,
                        resolvida: false,
                        circuloMaximo,
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

    const jaTem = personagem.poderes.some(p => p.nome === habilidade.nome);
    if (jaTem) return;

    if (habilidade.escolha) {
        pendencias.push({
            id: gerarIdPendencia(),
            tipo: 'trilhaHabilidade',
            descricao: `Habilidade de Trilha: ${habilidade.nome} (${personagem.trilha} ${nex}%)`,
            nex: nex,
            resolvida: false,

        });
    } else {

        autoPoderes.push({
            nome: habilidade.nome,
            descricao: habilidade.descricao,
            tipo: 'Trilha',
            livro: trilhaData.livro as any,
        });
    }
}

export function subirNex(
    personagem: Personagem,
    novoNex: number,
    transcenderEscolhido: boolean = false
): LevelUpResult {
    const nexAnterior = personagem.nex;

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

    const pvGanho = recursosNovos.pv - recursosAnteriores.pv;
    const peGanho = recursosNovos.pe - recursosAnteriores.pe;
    let sanGanha = recursosNovos.san - recursosAnteriores.san;

    if (transcenderEscolhido) {
        sanGanha = 0;
    }

    const eventosDesbloqueados = calcularEventosDesbloqueados(nexAnterior, novoNex);

    const { pendencias: pendenciasNovas, autoPoderes } = detectingPendenciesAndAutoApply(personagem, eventosDesbloqueados);

    const novaPatenteNome = getPatentePorNex(novoNex);
    const novaPatenteConfig = getPatenteConfig(novaPatenteNome);

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

    switch (pendencia.tipo) {
        case 'atributo':
            if (typeof valorEscolhido === 'string') {
                const atributo = valorEscolhido as AtributoKey;
                const novoValor = Math.min(5, personagemAtualizado.atributos[atributo] + 1);
                let novasPendenciasPericias = personagemAtualizado.periciasTreinadasPendentes || 0;
                if (atributo === 'INT') {
                    novasPendenciasPericias += 1;
                }

                personagemAtualizado = {
                    ...personagemAtualizado,
                    atributos: {
                        ...personagemAtualizado.atributos,
                        [atributo]: novoValor,
                    },
                    periciasTreinadasPendentes: novasPendenciasPericias > 0 ? novasPendenciasPericias : undefined,
                };
                
                const statsAnteriores = calculateDerivedStats({
                    classe: personagem.classe,
                    atributos: personagem.atributos,
                    nex: personagem.nex,
                    estagio: personagem.estagio,
                    qtdTranscender: personagem.qtdTranscender
                });
                const statsAtualizados = calculateDerivedStats({
                    classe: personagemAtualizado.classe,
                    atributos: personagemAtualizado.atributos,
                    nex: personagemAtualizado.nex,
                    estagio: personagemAtualizado.estagio,
                    qtdTranscender: personagemAtualizado.qtdTranscender
                });

                if (atributo === 'VIG') {
                    const diffPV = statsAtualizados.pvMax - statsAnteriores.pvMax;
                    personagemAtualizado.pv = {
                        ...personagemAtualizado.pv,
                        max: personagemAtualizado.pv.max + diffPV,
                        atual: personagemAtualizado.pv.atual + diffPV,
                    };
                }
                if (atributo === 'PRE') {
                    const diffPE = statsAtualizados.peMax - statsAnteriores.peMax;
                    personagemAtualizado.pe = {
                        ...personagemAtualizado.pe,
                        max: personagemAtualizado.pe.max + diffPE,
                        atual: personagemAtualizado.pe.atual + diffPE,
                    };
                    if (personagemAtualizado.pd) {
                        const diffPD = statsAtualizados.pdMax - statsAnteriores.pdMax;
                        personagemAtualizado.pd = {
                            ...personagemAtualizado.pd,
                            max: personagemAtualizado.pd.max + diffPD,
                            atual: personagemAtualizado.pd.atual + diffPD,
                        };
                    }
                }
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

                const poderClasse = PODERES.find(p => p.nome === valorEscolhido);
                if (poderClasse) {
                    personagemAtualizado.poderes = [...personagemAtualizado.poderes, poderClasse];
                } else {

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

            const nexP = pendencia.nex;
            const trilhaNome = personagem.trilha;
            if (trilhaNome && typeof valorEscolhido === 'string') {
                const tData = TRILHAS.find(t => t.nome === trilhaNome);
                const hData = tData?.habilidades.find(h => h.nex === nexP);
                if (hData) {

                    personagemAtualizado.poderes = [
                        ...personagemAtualizado.poderes,
                        {
                            nome: hData.nome,
                            descricao: `${hData.descricao} \n[Escolha: ${valorEscolhido}]`,
                            tipo: 'Trilha',
                            livro: tData!.livro as any
                        }
                    ];

                    if (hData.escolha?.tipo === 'pericia') {

                    }
                }
            }
            break;

        case 'pericia':
            if (Array.isArray(valorEscolhido)) {

                const alvo = pendencia.nex === 35 ? 'Veterano' : 'Expert';

                const novasPericias = { ...personagemAtualizado.pericias };
                valorEscolhido.forEach(pNome => {

                    novasPericias[pNome as any] = alvo;
                });
                personagemAtualizado.pericias = novasPericias;
            }
            break;

        case 'ritual':
            if (typeof valorEscolhido === 'string') {
                const ritualEscolhido = RITUAIS.find(r => r.nome === valorEscolhido);
                if (ritualEscolhido) {
                    personagemAtualizado = {
                        ...personagemAtualizado,
                        rituais: [...(personagemAtualizado.rituais || []), ritualEscolhido],
                    };
                }
            }
            break;
    }

    return personagemAtualizado;
}

export function getPendenciasNaoResolvidas(personagem: Personagem): PendenciaNex[] {
    return (personagem.pendenciasNex || []).filter(p => !p.resolvida);
}

export function temPendencias(personagem: Personagem): boolean {
    return getPendenciasNaoResolvidas(personagem).length > 0;
}

export function criarPendenciaTranscender(nex: number): PendenciaNex {
    return {
        id: gerarIdPendencia(),
        tipo: 'transcenderPoder',
        descricao: `Escolha um Poder Paranormal (Transcender - NEX ${nex}%)`,
        nex,
        resolvida: false,
    };
}

export function rebaixarNex(
    personagem: Personagem,
    novoNex: number
): Personagem {
    let atualizado = { ...personagem };
    const nexAnterior = atualizado.nex;

    if (novoNex >= nexAnterior) return atualizado;

    const pendenciasParaReverter = (atualizado.pendenciasNex || [])
        .filter(p => p.nex > novoNex)
        .sort((a, b) => b.nex - a.nex);

    const poderesARemover = new Set<string>();

    for (const ped of pendenciasParaReverter) {
        if (!ped.resolvida) continue;

        switch (ped.tipo) {
            case 'atributo':
                if (typeof ped.valorEscolhido === 'string') {
                    const attr = ped.valorEscolhido as AtributoKey;
                    atualizado.atributos = {
                        ...atualizado.atributos,
                        [attr]: Math.max(0, atualizado.atributos[attr] - 1)
                    };
                }
                break;
            case 'afinidade':
            case 'trilha':
                if (ped.tipo === 'afinidade') atualizado.afinidade = undefined;
                if (ped.tipo === 'trilha') atualizado.trilha = undefined;
                break;
            case 'versatilidade':
            case 'transcenderPoder':
                if (typeof ped.valorEscolhido === 'string') {
                    poderesARemover.add(ped.valorEscolhido);
                }
                if (ped.tipo === 'transcenderPoder') {
                    atualizado.qtdTranscender = Math.max(0, (atualizado.qtdTranscender || 0) - 1);
                }
                break;
            case 'trilhaHabilidade':
                const descMatch = ped.descricao.match(/Habilidade de Trilha: (.*?) \(/);
                if (descMatch && descMatch[1]) {
                    poderesARemover.add(descMatch[1].trim());
                }
                break;
            case 'pericia':
                if (Array.isArray(ped.valorEscolhido)) {
                    const alvoAnterior = ped.nex === 35 ? 'Treinado' : 'Veterano';
                    const novasPericias = { ...atualizado.pericias };
                    ped.valorEscolhido.forEach(pNome => {
                        novasPericias[pNome as PericiaName] = alvoAnterior;
                    });
                    atualizado.pericias = novasPericias;
                }
                break;
            case 'ritual':
                if (typeof ped.valorEscolhido === 'string') {
                    const nomeRitual = ped.valorEscolhido;
                    atualizado.rituais = (atualizado.rituais || []).filter(r => r.nome !== nomeRitual);
                }
                break;
        }
    }

    const autoPoderesParaRemover = NEX_EVENTOS
        .filter(e => e.requisito > novoNex && e.requisito <= nexAnterior)
        .filter(e => e.tipo === 'Trilha' && e.requisito > 10);

    if (atualizado.trilha) {
        const tData = TRILHAS.find(t => t.nome === atualizado.trilha);
        if (tData) {
            autoPoderesParaRemover.forEach(evento => {
                const hab = tData.habilidades.find(h => h.nex === evento.requisito);
                if (hab && !hab.escolha) {
                    poderesARemover.add(hab.nome);
                }
            });
        }
    }

    if (poderesARemover.size > 0) {
        atualizado.poderes = atualizado.poderes.filter(p => !poderesARemover.has(p.nome));
    }

    atualizado.pendenciasNex = (atualizado.pendenciasNex || []).filter(p => p.nex <= novoNex);

    atualizado.eventosNex = NEX_EVENTOS.map(e => ({
        ...e,
        desbloqueado: novoNex >= e.requisito,
    }));

    atualizado.nex = novoNex;

    const novaPatenteNome = getPatentePorNex(novoNex);
    atualizado.patente = novaPatenteNome;
    atualizado.limiteItens = getPatenteConfig(novaPatenteNome).limiteItens;

    const recursosNovos = calcularRecursosParaNex(
        atualizado.classe,
        atualizado.atributos,
        novoNex,
        atualizado.estagio,
        atualizado.origem,
        atualizado.trilha,
        atualizado.qtdTranscender
    );

    atualizado.pv = {
        ...atualizado.pv,
        max: recursosNovos.pv,
        atual: Math.min(atualizado.pv.atual, recursosNovos.pv),
        machucado: Math.floor(recursosNovos.pv / 2),
    };

    atualizado.pe = {
        ...atualizado.pe,
        max: recursosNovos.pe,
        atual: Math.min(atualizado.pe.atual, recursosNovos.pe),
        rodada: recursosNovos.limitePeRodada,
    };

    atualizado.san = {
        ...atualizado.san,
        max: recursosNovos.san,
        atual: Math.min(atualizado.san.atual, recursosNovos.san),
    };

    return atualizado;
}
