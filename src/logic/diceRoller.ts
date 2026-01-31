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

function secureD20(): number {

  const g: any = globalThis as any;
  if (g?.crypto?.getRandomValues) {
    const arr = new Uint32Array(1);
    g.crypto.getRandomValues(arr);
    return (arr[0] % 20) + 1;
  }
  return Math.floor(Math.random() * 20) + 1;
}

export function rollPericia(detalhe: PericiaDetalhada): DiceRollResult {
  const baseDice = Math.max(1, Number.isFinite(detalhe.dados) ? detalhe.dados : 1);
  const bonusO = Number.isFinite(detalhe.bonusO) ? detalhe.bonusO : 0;


  const wouldBe = baseDice + bonusO;
  const belowOne = wouldBe < 1;
  const diceCount = belowOne ? baseDice + Math.abs(bonusO) : Math.max(1, wouldBe);
  const criterio: 'melhor' | 'pior' = (detalhe.criterio === 'pior' || belowOne) ? 'pior' : 'melhor';

  const dice: number[] = [];
  for (let i = 0; i < diceCount; i++) dice.push(secureD20());

  const chosen = criterio === 'melhor' ? Math.max(...dice) : Math.min(...dice);
  const bonusFixo = Number.isFinite(detalhe.bonusFixo) ? detalhe.bonusFixo : 0;
  const total = chosen + bonusFixo;

  return { dice, chosen, criterio, total, bonusFixo, diceCount, baseDice, bonusO };
}





