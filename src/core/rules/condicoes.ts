import { condicoes } from '../../data/combat/conditions';

const NOMES = new Set(condicoes.map((c) => c.nome));

export function ehCondicao(nome: string): boolean {
  return NOMES.has(nome);
}

export function apenasCondicoes(efeitos: readonly string[] | undefined): string[] {
  return (efeitos ?? []).filter(ehCondicao);
}
