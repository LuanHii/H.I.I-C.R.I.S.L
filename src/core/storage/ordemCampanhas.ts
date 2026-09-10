export interface ComOrdem {
  id: string;
  ordem: number;
}

export function ordenadas<T extends ComOrdem>(campanhas: readonly T[]): T[] {
  return [...campanhas].sort((a, b) => a.ordem - b.ordem);
}

export function moverNaOrdem<T extends ComOrdem>(
  campanhas: readonly T[],
  id: string,
  direcao: -1 | 1,
): T[] | null {
  const atual = ordenadas(campanhas);
  const indice = atual.findIndex((c) => c.id === id);
  const destino = indice + direcao;
  if (indice < 0 || destino < 0 || destino >= atual.length) return null;

  const trocadas = [...atual];
  [trocadas[indice], trocadas[destino]] = [trocadas[destino], trocadas[indice]];
  return renumerar(trocadas);
}

export function priorizarNaOrdem<T extends ComOrdem>(
  campanhas: readonly T[],
  id: string,
): T[] | null {
  const atual = ordenadas(campanhas);
  if (atual.length === 0 || atual[0].id === id) return null;

  const alvo = atual.find((c) => c.id === id);
  if (!alvo) return null;

  return renumerar([alvo, ...atual.filter((c) => c.id !== id)]);
}

export function renumerar<T extends ComOrdem>(campanhas: readonly T[]): T[] {
  return campanhas.map((c, indice) => ({ ...c, ordem: indice }));
}

export function apenasAsQueMudaram<T extends ComOrdem>(
  antes: readonly T[],
  depois: readonly T[],
): T[] {
  const ordemAntiga = new Map(antes.map((c) => [c.id, c.ordem]));
  return depois.filter((c) => ordemAntiga.get(c.id) !== c.ordem);
}
