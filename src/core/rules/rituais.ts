import type { Ritual } from '../types';

export const CUSTO_POR_CIRCULO: Record<Ritual['circulo'], number> = { 1: 1, 2: 3, 3: 6, 4: 10 };

export function custoDoRitual(circulo: Ritual['circulo']): number {
  return CUSTO_POR_CIRCULO[circulo];
}
