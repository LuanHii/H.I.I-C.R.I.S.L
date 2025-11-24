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
  
  let nivel = Math.floor(nex / 5);
  if (nivel < 1) nivel = 1;
  
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

  let peRodada = 1;
  if (nex >= 5) peRodada = 1;
  if (nex >= 10) peRodada = 2;
  if (nex >= 25) peRodada = 3;
  if (nex >= 40) peRodada = 4;
  if (nex >= 55) peRodada = 5;
  if (nex >= 70) peRodada = 6;
  if (nex >= 85) peRodada = 7;
  if (nex >= 99) peRodada = 8;

  return {
    pvMax: stats.pvInicial + atributos.VIG + (growthSteps * (stats.pvPorNivel + atributos.VIG)),
    peMax: stats.peInicial + atributos.PRE + (growthSteps * (stats.pePorNivel + atributos.PRE)),
    sanMax: stats.sanInicial + (growthSteps * stats.sanPorNivel),
    pdMax: stats.pdInicial + atributos.PRE + (growthSteps * stats.pdPorNivel),
    peRodada: peRodada
  };
}
