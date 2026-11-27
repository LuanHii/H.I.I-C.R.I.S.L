import { getCondicao } from '../../data/combat/conditions';

export function ehCondicao(nome: string): boolean {
  return getCondicao(nome)?.nome === nome;
}

export function apenasCondicoes(efeitos: readonly string[] | undefined): string[] {
  const nomes = (efeitos ?? []).flatMap(efeito => {
    const condicao = getCondicao(efeito);
    return condicao ? [condicao.nome] : [];
  });
  return Array.from(new Set(nomes));
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
  const mesmaCondicao = (efeito: string) => getCondicao(efeito) === condicao;
  if (!efeitos.some(mesmaCondicao)) return [...efeitos, condicao.nome];
  if (reaplicacao !== 'acumulo-permitido' || !condicao.acumulo) return [...efeitos];
  return aplicarCondicao(efeitos.filter(efeito => !mesmaCondicao(efeito)), condicao.acumulo, reaplicacao);
}
