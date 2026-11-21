export type TipoParticipante = 'agente' | 'ameaca' | 'npc';

export interface EntradaEncontro {
  tipo: TipoParticipante;
  id: string;
  quantidade: number;
}

export const LIMITE_COPIAS_ENCONTRO = 50;

export function quantificarEncontro(entradas: readonly EntradaEncontro[], tipo: TipoParticipante, id: string, quantidade: number): EntradaEncontro[] {
  const atual = entradas.findIndex(item => item.tipo === tipo && item.id === id);
  const total = Number.isFinite(quantidade)
    ? Math.min(tipo === 'ameaca' ? LIMITE_COPIAS_ENCONTRO : 1, Math.max(0, Math.trunc(quantidade)))
    : 0;
  if (!total) return entradas.filter(item => item.tipo !== tipo || item.id !== id);
  const novo = { tipo, id, quantidade: total };
  if (atual < 0) return [...entradas, novo];
  return entradas.map((item, indice) => indice === atual ? novo : item);
}

export function lerEncontro(valor: unknown): EntradaEncontro[] {
  if (!Array.isArray(valor)) return [];
  let entradas: EntradaEncontro[] = [];
  for (const item of valor) {
    if (!item || typeof item.id !== 'string' || !item.id || typeof item.quantidade !== 'number') continue;
    if (item.tipo !== 'agente' && item.tipo !== 'ameaca' && item.tipo !== 'npc') continue;
    entradas = quantificarEncontro(entradas, item.tipo, item.id, item.quantidade);
  }
  return entradas;
}

export function resumirDesafio(
  ameacas: readonly { vd?: number; quantidade: number }[],
  agentes: readonly { nex?: number; sobrevivente: boolean }[],
) {
  const vdConhecido = ameacas.every(entrada => typeof entrada.vd === 'number' && Number.isFinite(entrada.vd) && entrada.vd >= 0);
  const vd = vdConhecido ? ameacas.reduce((soma, entrada) => soma + (entrada.vd ?? 0) * entrada.quantidade, 0) : null;
  const nex = agentes.length > 0 && agentes.every(agente => !agente.sobrevivente && typeof agente.nex === 'number' && Number.isFinite(agente.nex) && agente.nex > 0)
    ? agentes.reduce((soma, agente) => soma + (agente.nex ?? 0), 0)
    : null;
  return { vd, nex };
}
