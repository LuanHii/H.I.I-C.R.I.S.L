import { Atributos, ClasseName } from '../types';
import { CLASSES } from '../../data/classes';

export interface DerivedStats {
  pvMax: number;
  peMax: number;
  sanMax: number;
  pdMax: number;
  peRodada: number;
}

export function calculateDerivedStats(
  classe: ClasseName,
  atributos: Atributos,
  nex: number,
  estagio: number = 1
): DerivedStats {
  const stats = CLASSES[classe];
  
  // NEX avança em degraus: 5%, 10%, ..., 95%, 99%.
  // Para cálculos, isso equivale a níveis 1..20 (Tabela 1.2 do OPRPG):
  // 5% -> 1, 10% -> 2, ..., 95% -> 19, 99% -> 20.
  let nivel = Math.ceil(nex / 5);
  if (nivel < 1) nivel = 1;
  if (nivel > 20) nivel = 20;
  
  const growthSteps = Math.max(0, nivel - 1);

  let pdMax = 0;
  
  if (classe === 'Sobrevivente') {
    const survivorGrowth = Math.max(0, estagio - 1);
    pdMax = stats.pdInicial + atributos.PRE + (survivorGrowth * stats.pdPorNivel);
    
    return {
      pvMax: 8 + atributos.VIG + (survivorGrowth * 2),
      peMax: 2 + atributos.PRE + (survivorGrowth * 1),
      sanMax: stats.sanInicial + (survivorGrowth * stats.sanPorNivel),
      pdMax: pdMax,
      peRodada: 1
    };
  }

  pdMax = stats.pdInicial + atributos.PRE + (growthSteps * (stats.pdPorNivel + atributos.PRE));

  // Limite de PE por turno segue o mesmo degrau do NEX (Tabela 1.2).
  const peRodada = nivel;

  return {
    pvMax: stats.pvInicial + atributos.VIG + (growthSteps * (stats.pvPorNivel + atributos.VIG)),
    peMax: stats.peInicial + atributos.PRE + (growthSteps * (stats.pePorNivel + atributos.PRE)),
    sanMax: stats.sanInicial + (growthSteps * stats.sanPorNivel),
    pdMax,
    peRodada: peRodada
  };
}
