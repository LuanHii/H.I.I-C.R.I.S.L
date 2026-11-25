import { condicoes, getCondicao } from '../../data/combat/conditions';

const NOMES = new Set(condicoes.map((c) => c.nome));

export function ehCondicao(nome: string): boolean {
  return NOMES.has(nome);
}

export function apenasCondicoes(efeitos: readonly string[] | undefined): string[] {
  return (efeitos ?? []).filter(ehCondicao);
}

export type ReaplicacaoCondicao = 'acumulo-permitido' | 'entre-rituais';

/** Livro de Regras v1.3, Apêndice, Exceções & Explicações: Rituais e Condições. */
export function aplicarCondicao(
  efeitos: readonly string[],
  nome: string,
  reaplicacao?: ReaplicacaoCondicao,
): string[] {
  const condicao = getCondicao(nome);
  if (!condicao) return [...efeitos];
  if (!efeitos.includes(condicao.nome)) return [...efeitos, condicao.nome];
  if (reaplicacao !== 'acumulo-permitido' || !condicao.acumulo) return [...efeitos];
  return aplicarCondicao(efeitos.filter(efeito => efeito !== condicao.nome), condicao.acumulo, reaplicacao);
}
