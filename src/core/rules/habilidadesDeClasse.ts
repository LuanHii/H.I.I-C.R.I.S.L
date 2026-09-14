import type { ClasseName } from '../types';
import { CLASS_ABILITIES } from '../../data/character/classAbilities';
import { PODERES } from '../../data/character/powers';

export interface HabilidadeAutomatica {
  nome: string;
  nivel: number;
}

export const HABILIDADES_DE_CLASSE: Record<ClasseName, HabilidadeAutomatica[]> = {
  Combatente: [
    { nome: 'Ataque Especial', nivel: 5 },
  ],
  Especialista: [
    { nome: 'Eclético', nivel: 5 },
    { nome: 'Perito', nivel: 5 },
  ],
  Ocultista: [
    { nome: 'Escolhido pelo Outro Lado', nivel: 5 },
  ],
  Sobrevivente: [
    { nome: 'Empenho', nivel: 1 },
    { nome: 'Cicatrizado', nivel: 5 },
  ],
};

export function habilidadesAutomaticas(
  classe: ClasseName,
  nivel: number,
): readonly HabilidadeAutomatica[] {
  return HABILIDADES_DE_CLASSE[classe].filter((h) => h.nivel <= nivel);
}

export interface DescricaoAutomatica {
  descricao: string;
  custo?: string;
  acao?: string;
  livro: 'Regras Básicas' | 'Sobrevivendo ao Horror';
}

export function descricaoAutomatica(nome: string): DescricaoAutomatica | undefined {
  for (const [classe, lista] of Object.entries(CLASS_ABILITIES) as [ClasseName, (typeof CLASS_ABILITIES)[ClasseName]][]) {
    const hab = lista.find((h) => h.nome === nome);
    if (hab) {
      return {
        descricao: hab.descricao,
        ...(hab.custo ? { custo: hab.custo } : {}),
        ...(hab.acao ? { acao: hab.acao } : {}),
        livro: classe === 'Sobrevivente' ? 'Sobrevivendo ao Horror' : 'Regras Básicas',
      };
    }
  }
  const poder = PODERES.find((p) => p.nome === nome);
  if (poder) {
    return {
      descricao: poder.descricao,
      ...(poder.custo ? { custo: poder.custo } : {}),
      ...(poder.acao ? { acao: poder.acao } : {}),
      livro: poder.livro,
    };
  }
  return undefined;
}

export function nomesAutomaticos(): Set<string> {
  return new Set(
    Object.values(HABILIDADES_DE_CLASSE).flatMap((lista) => lista.map((h) => h.nome)),
  );
}
