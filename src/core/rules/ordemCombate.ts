export interface ParticipanteDaOrdem {
  id: string;
  isActive: boolean;
  initiative: number;
  entradaNaRodada?: number;
  desempates?: { rodada: number; ordem: number }[];
}

export interface ParticipanteDaIniciativa extends ParticipanteDaOrdem {
  type: 'agent' | 'npc' | 'creature';
  initiativeBonus: number;
  inimigo?: boolean;
  iniciativaManual?: boolean;
  iniciativaColetiva?: boolean;
  semTesteDeIniciativa?: boolean;
}

export type ModoDaOrdem = 'initiative' | 'manual';

interface EstadoDaOrdem<T extends ParticipanteDaOrdem> {
  combatants: readonly T[];
  currentTurnIndex: number;
  round: number;
  isActive: boolean;
  isPaused?: boolean;
  orderMode?: ModoDaOrdem;
}

function ordemDoDesempate(combatente: ParticipanteDaOrdem, rodada: number): number {
  return combatente.desempates?.reduce((ordem, registro) => registro.rodada <= rodada ? registro.ordem : ordem, 0) ?? 0;
}

export function ordenarAtivos<T extends ParticipanteDaOrdem>(
  combatentes: readonly T[], modo: ModoDaOrdem, rodada = Infinity,
): T[] {
  const ativos = combatentes.filter(c => c.isActive && (c.entradaNaRodada ?? 1) <= rodada);
  return modo === 'manual' ? ativos : ativos.sort((a, b) =>
    b.initiative - a.initiative || ordemDoDesempate(a, rodada) - ordemDoDesempate(b, rodada),
  );
}

export function preservarTurno(
  atual: EstadoDaOrdem<ParticipanteDaOrdem>,
  alterados: readonly ParticipanteDaOrdem[],
  novoModo = atual.orderMode ?? 'initiative',
): { currentTurnIndex: number; round: number } {
  const posicao = { currentTurnIndex: 0, round: atual.round };
  if (!atual.isActive && !atual.isPaused) return posicao;
  const ordemAnterior = ordenarAtivos(atual.combatants, atual.orderMode ?? 'initiative', atual.round);
  const ordemNova = ordenarAtivos(alterados, novoModo, atual.round);
  const combatenteAtual = ordemAnterior[atual.currentTurnIndex];
  if (!combatenteAtual) return posicao;
  if (!ordemNova.length && !alterados.some(c => c.isActive && c.entradaNaRodada === atual.round + 1)) return posicao;

  const indices = new Map(ordemNova.map(({ id }, indice) => [id, indice]));
  for (const { id } of ordemAnterior.slice(atual.currentTurnIndex)) {
    const indice = indices.get(id);
    if (indice !== undefined) return { ...posicao, currentTurnIndex: indice };
  }
  return { ...posicao, round: atual.round + 1 };
}

export function avancarNaOrdem<S extends EstadoDaOrdem<ParticipanteDaOrdem>>(atual: S): S {
  const ordem = ordenarAtivos(atual.combatants, atual.orderMode ?? 'initiative', atual.round);
  const currentTurnIndex = atual.currentTurnIndex + 1;
  if (currentTurnIndex < ordem.length) return { ...atual, currentTurnIndex };
  if (!ordem.length && !atual.combatants.some(c => c.isActive && c.entradaNaRodada === atual.round + 1)) return atual;
  return { ...atual, currentTurnIndex: 0, round: atual.round + 1 };
}

export function voltarNaOrdem<S extends EstadoDaOrdem<ParticipanteDaOrdem>>(atual: S): S {
  if (atual.currentTurnIndex > 0) return { ...atual, currentTurnIndex: atual.currentTurnIndex - 1 };
  if (atual.round <= 1) return atual;
  const round = atual.round - 1;
  const ordem = ordenarAtivos(atual.combatants, atual.orderMode ?? 'initiative', round);
  return { ...atual, currentTurnIndex: Math.max(0, ordem.length - 1), round };
}

type Rolar<T> = (combatente: T) => number;

export function participanteInimigo(c: Pick<ParticipanteDaIniciativa, 'type' | 'inimigo'>): boolean {
  return c.inimigo ?? c.type === 'creature';
}

export function lerPerfilDeIniciativa(texto?: string) {
  const perfil = texto?.trim() ?? '';
  const dados = perfil.match(/^(\d+)d20(?:\s*([+-])\s*(\d+))?/i);
  return {
    initiativeDice: dados ? Number(dados[1]) : 1,
    initiativeBonus: dados ? Number(dados[3] ?? 0) * (dados[2] === '-' ? -1 : 1)
      : Number(perfil.match(/^\+?([+-]?\d+)\b/)?.[1] ?? 0),
    semTesteDeIniciativa: /^[-–—]$/.test(perfil),
  };
}

function deMenorBonus<T extends ParticipanteDaIniciativa>(grupo: readonly T[]): T {
  return grupo.reduce((menor, atual) => atual.initiativeBonus < menor.initiativeBonus ? atual : menor);
}

function separarPorResultado<T>(itens: readonly T[], resultado: (item: T) => number): Map<number, T[]> {
  const grupos = new Map<number, T[]>();
  for (const item of itens) {
    const valor = resultado(item);
    const grupo = grupos.get(valor);
    if (grupo) grupo.push(item);
    else grupos.set(valor, [item]);
  }
  return grupos;
}

function desempatarUnidades<T extends ParticipanteDaIniciativa>(unidades: T[][], rolar: Rolar<T>, tentativas = 20): T[][] {
  if (unidades.length < 2 || tentativas === 0) return unidades;
  const porResultado = separarPorResultado(unidades, unidade => {
    const c = deMenorBonus(unidade);
    return c.semTesteDeIniciativa ? c.initiative : rolar(c);
  });
  return Array.from(porResultado.entries())
    .sort(([a], [b]) => b - a)
    .flatMap(([, empatadas]) => desempatarUnidades(empatadas, rolar, tentativas - 1));
}

function resolverEmpates<T extends ParticipanteDaIniciativa>(
  combatentes: T[], rodada: number, rolar: Rolar<T>, novos?: ReadonlySet<string>,
): T[] {
  const resultados = separarPorResultado(ordenarAtivos(combatentes, 'initiative', rodada), c => c.initiative);
  const posicoes = new Map<string, number>();
  for (const participantes of Array.from(resultados.values())) {
    if (novos && !participantes.some(c => novos.has(c.id))) continue;
    const unidades: T[][] = participantes.filter(c => !c.iniciativaColetiva).map(c => [c]);
    const grupo = participantes.filter(c => c.iniciativaColetiva);
    if (grupo.length) unidades.push(grupo);
    if (unidades.length < 2 && !grupo.length) continue;
    desempatarUnidades(unidades, rolar).forEach((unidade, ordem) => {
      unidade.forEach(c => posicoes.set(c.id, ordem));
    });
  }
  return combatentes.map(c => {
    const ordem = posicoes.get(c.id);
    if (ordem === undefined) return c;
    const anteriores = c.desempates?.filter(item => item.rodada < rodada) ?? [];
    return { ...c, desempates: [...anteriores, { rodada, ordem }] };
  });
}

// Ordem Paranormal RPG, Teste de Iniciativa, PyMuPDF 3308–3309.
export function prepararIniciativa<T extends ParticipanteDaIniciativa>(
  combatentes: readonly T[], rodada: number, rolar: Rolar<T>, rerrolar = false,
): T[] {
  const elegiveis = ordenarAtivos(combatentes, 'manual', rodada);
  const inimigos = elegiveis.filter(c => !c.semTesteDeIniciativa && participanteInimigo(c) && (rerrolar || !c.iniciativaManual));
  const idsColetivos = new Set(inimigos.map(c => c.id));
  const valores = new Map<string, number>();
  for (const c of elegiveis) {
    if (!idsColetivos.has(c.id)) valores.set(c.id, !c.semTesteDeIniciativa && (rerrolar || !c.iniciativaManual) ? rolar(c) : c.initiative);
  }
  if (inimigos.length) {
    const coletivo = rolar(deMenorBonus(inimigos));
    inimigos.forEach(c => valores.set(c.id, coletivo));
  }
  const preparados = combatentes.map(c => valores.has(c.id) ? {
    ...c,
    initiative: valores.get(c.id)!,
    iniciativaManual: c.iniciativaManual && (!rerrolar || c.semTesteDeIniciativa),
    iniciativaColetiva: idsColetivos.has(c.id),
    desempates: [],
  } : c);
  return desempatarEntradasFuturas(resolverEmpates(preparados, rodada, rolar), rodada, rolar);
}

function desempatarEntradasFuturas<T extends ParticipanteDaIniciativa>(combatentes: T[], atual: number, rolar: Rolar<T>): T[] {
  const pendentes = combatentes.filter(c => c.isActive && (c.entradaNaRodada ?? 1) > atual);
  const porRodada = separarPorResultado(pendentes, c => c.entradaNaRodada!);
  return Array.from(porRodada.entries()).sort(([a], [b]) => a - b).reduce(
    (ordem, [rodada, novos]) => resolverEmpates(ordem, rodada, rolar, new Set(novos.map(c => c.id))),
    combatentes,
  );
}

// Ordem Paranormal RPG, Entrando na Luta, PyMuPDF 3313–3314.
export function acrescentarNaOrdem<T extends ParticipanteDaIniciativa, S extends EstadoDaOrdem<T>>(
  atual: S, novos: readonly T[], rolar: Rolar<T>,
): S & { combatants: T[] } {
  if (!atual.isActive && !atual.isPaused) return { ...atual, combatants: [...atual.combatants, ...novos] };
  const entradaNaRodada = atual.round + 1;
  const reforcos = novos.map(combatente => ({
    ...combatente,
    initiative: combatente.semTesteDeIniciativa ? combatente.initiative : rolar(combatente),
    entradaNaRodada,
  }));
  const combatants = desempatarEntradasFuturas([...atual.combatants, ...reforcos], atual.round, rolar);
  return { ...atual, combatants };
}
