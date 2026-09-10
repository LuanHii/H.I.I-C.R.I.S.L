import type { ClasseName } from '../types';

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

export function nomesAutomaticos(): Set<string> {
  return new Set(
    Object.values(HABILIDADES_DE_CLASSE).flatMap((lista) => lista.map((h) => h.nome)),
  );
}
