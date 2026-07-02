import type { PericiaDetalhada } from '../core/types';

export interface DiceRollResult {
  dice: number[];
  chosen: number;
  criterio: 'melhor' | 'pior';
  total: number;
  bonusFixo: number;
  diceCount: number;
  baseDice: number;
  bonusO: number;
}

export type CustomRollMode = 'sum' | 'highest';

export interface CustomDiceRollResult {
  dice: number[];
  diceCount: number;
  sides: number;
  mode: CustomRollMode;
  baseTotal: number;
  bonus: number;
  total: number;
}

export interface CustomDiceRollConfig {
  diceCount: number;
  sides: number;
  mode: CustomRollMode;
  bonus: number;
}

function secureDie(sides: number): number {
  const g: any = globalThis as any;
  if (g?.crypto?.getRandomValues) {
    const arr = new Uint32Array(1);
    g.crypto.getRandomValues(arr);
    return (arr[0] % sides) + 1;
  }
  return Math.floor(Math.random() * sides) + 1;
}

export function rollPericia(detalhe: PericiaDetalhada): DiceRollResult {
  const baseDice = Math.max(1, Number.isFinite(detalhe.dados) ? detalhe.dados : 1);
  const bonusO = Number.isFinite(detalhe.bonusO) ? detalhe.bonusO : 0;

  const wouldBe = baseDice + bonusO;
  const belowOne = wouldBe < 1;
  const diceCount = belowOne ? baseDice + Math.abs(bonusO) : Math.max(1, wouldBe);
  const criterio: 'melhor' | 'pior' = (detalhe.criterio === 'pior' || belowOne) ? 'pior' : 'melhor';

  const dice: number[] = [];
  for (let i = 0; i < diceCount; i++) dice.push(secureDie(20));

  const chosen = criterio === 'melhor' ? Math.max(...dice) : Math.min(...dice);
  const bonusFixo = Number.isFinite(detalhe.bonusFixo) ? detalhe.bonusFixo : 0;
  const total = chosen + bonusFixo;

  return { dice, chosen, criterio, total, bonusFixo, diceCount, baseDice, bonusO };
}

export function rollCustomDice(config: CustomDiceRollConfig): CustomDiceRollResult {
  const diceCount = Math.min(100, Math.max(1, Math.trunc(config.diceCount)));
  const sides = Math.min(1000, Math.max(1, Math.trunc(config.sides)));
  const bonus = Math.min(9999, Math.max(-9999, Math.trunc(config.bonus)));
  const mode: CustomRollMode = config.mode === 'highest' ? 'highest' : 'sum';

  const dice = Array.from({ length: diceCount }, () => secureDie(sides));
  const baseTotal = mode === 'highest'
    ? Math.max(...dice)
    : dice.reduce((total, value) => total + value, 0);

  return {
    dice,
    diceCount,
    sides,
    mode,
    baseTotal,
    bonus,
    total: baseTotal + bonus,
  };
}
