import { Atributos, ClasseName } from '../types';

export interface ValidationResult {
  valid: boolean;
  message?: string;
  pointsSpent: number;
  pointsAllowed: number;
}

export const INITIAL_ATTRIBUTES: Atributos = {
  AGI: 1,
  FOR: 1,
  INT: 1,
  PRE: 1,
  VIG: 1,
};

export function validateAttributes(atributos: Atributos, classe: ClasseName): ValidationResult {

  for (const key in atributos) {
    const val = atributos[key as keyof Atributos];
    if (val < 0) return { valid: false, message: `Atributo ${key} não pode ser negativo.`, pointsSpent: 0, pointsAllowed: 0 };
    if (val > 3) return { valid: false, message: `Atributo ${key} não pode ser maior que 3 no nível inicial.`, pointsSpent: 0, pointsAllowed: 0 };
  }

  const zeroCount = Object.values(atributos).filter(v => v === 0).length;
  if (zeroCount > 1) {
    return { valid: false, message: 'Apenas um atributo pode ser reduzido para 0.', pointsSpent: 0, pointsAllowed: 0 };
  }


  const currentSum = Object.values(atributos).reduce((a, b) => a + b, 0);
  const baseSum = 5;
  const pointsSpent = currentSum - baseSum;

  let pointsAllowed = (classe === 'Sobrevivente') ? 3 : 4;

  const targetSum = (classe === 'Sobrevivente') ? 8 : 9;

  if (currentSum !== targetSum) {
    const diff = targetSum - currentSum;
    const msg = diff > 0
      ? `Você ainda tem ${diff} ponto(s) para distribuir.`
      : `Você gastou ${Math.abs(diff)} ponto(s) a mais do que o permitido.`;

    return {
      valid: false,
      message: msg,
      pointsSpent: pointsSpent,
      pointsAllowed: pointsAllowed + (zeroCount > 0 ? 1 : 0)
    };
  }

  return { valid: true, pointsSpent, pointsAllowed };
}
