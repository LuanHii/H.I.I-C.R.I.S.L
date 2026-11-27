import type { Ritual } from '../types';

export const CUSTO_POR_CIRCULO: Record<Ritual['circulo'], number> = { 1: 1, 2: 3, 3: 6, 4: 10 };

export function custoDoRitual(circulo: Ritual['circulo']): number {
  return CUSTO_POR_CIRCULO[circulo];
}

export function formatarCustoDoRitual(circulo: Ritual['circulo'], usarPd?: boolean): string {
  return custoDoRitual(circulo) + (usarPd ? ' PD' : ' PE');
}

export function apresentarEfeitoDeRitual(texto: string, usarPd?: boolean): string {
  return usarPd ? texto.replace(/\bPE\b/g, 'PD') : texto;
}

export function circuloMaximoAprenderRitual(nex: number): 1 | 2 | 3 {
  if (nex >= 75) return 3;
  if (nex >= 45) return 2;
  return 1;
}
