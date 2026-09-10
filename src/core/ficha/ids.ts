import type { ChaveNivel, EscolhaId, SlotKind } from './tipos';

export function chaveNex(nex: number): ChaveNivel {
  return `nex:${nex}`;
}

export function chaveEstagio(estagio: number): ChaveNivel {
  return `est:${estagio}`;
}

export function montarId(kind: SlotKind, chave: ChaveNivel, ordinal = 0): EscolhaId {
  return `${kind}@${chave}#${ordinal}`;
}

export function montarIdFilho(pai: EscolhaId, kind: SlotKind, ordinal = 0): EscolhaId {
  return `${pai}/${kind}#${ordinal}`;
}

export interface IdDecomposto {
  kind: SlotKind;
  chaveNivel: ChaveNivel;
  nivel: number;
  escala: 'nex' | 'est';
  ordinal: number;
  paiId?: EscolhaId;
}

const RE_SEGMENTO_RAIZ = /^([a-zA-Z]+)@(nex|est):(\d+)#(\d+)$/;
const RE_SEGMENTO_FILHO = /^([a-zA-Z]+)#(\d+)$/;

export function decomporId(id: EscolhaId): IdDecomposto | null {
  const segmentos = id.split('/');
  const raiz = segmentos[0].match(RE_SEGMENTO_RAIZ);
  if (!raiz) return null;

  const [, kindRaiz, escala, nivelTexto, ordinalRaiz] = raiz;
  const base: IdDecomposto = {
    kind: kindRaiz as SlotKind,
    chaveNivel: `${escala as 'nex' | 'est'}:${Number(nivelTexto)}` as ChaveNivel,
    nivel: Number(nivelTexto),
    escala: escala as 'nex' | 'est',
    ordinal: Number(ordinalRaiz),
  };

  if (segmentos.length === 1) return base;

  let atual = base;
  for (let i = 1; i < segmentos.length; i += 1) {
    const filho = segmentos[i].match(RE_SEGMENTO_FILHO);
    if (!filho) return null;
    atual = {
      ...base,
      kind: filho[1] as SlotKind,
      ordinal: Number(filho[2]),
      paiId: segmentos.slice(0, i).join('/'),
    };
  }
  return atual;
}

export function nivelDoId(id: EscolhaId): number | null {
  return decomporId(id)?.nivel ?? null;
}

export function paiDoId(id: EscolhaId): EscolhaId | undefined {
  return decomporId(id)?.paiId;
}

export function compararIds(a: EscolhaId, b: EscolhaId): number {
  const da = decomporId(a);
  const db = decomporId(b);
  if (!da || !db) return a.localeCompare(b);

  if (da.nivel !== db.nivel) return da.nivel - db.nivel;
  if (da.escala !== db.escala) return da.escala === 'nex' ? -1 : 1;

  const profA = a.split('/').length;
  const profB = b.split('/').length;
  if (profA !== profB) return profA - profB;

  if (da.kind !== db.kind) return da.kind.localeCompare(db.kind);
  if (da.ordinal !== db.ordinal) return da.ordinal - db.ordinal;
  return a.localeCompare(b);
}

export function ordenarPorId<T extends { id: EscolhaId }>(itens: readonly T[]): T[] {
  return [...itens].sort((x, y) => compararIds(x.id, y.id));
}
