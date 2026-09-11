import { ORIGENS } from '../../data/character/origins';

export function desduplicarEfeitosDeOrigem(efeitos: readonly string[] | undefined): string[] {
  if (!efeitos) return [];

  const descricoes = new Map(ORIGENS.map((o) => [o.poder.nome, `${o.poder.nome}: ${o.poder.descricao}`] as const));
  const presentes = new Set(efeitos);

  const saida = efeitos.filter((efeito) => {
    const dois = efeito.indexOf(': ');
    if (dois === -1) return true;
    const descricao = descricoes.get(efeito.slice(0, dois));
    if (!descricao || efeito === descricao) return true;
    return !presentes.has(descricao);
  });

  return saida.length === efeitos.length ? [...efeitos] : saida;
}
