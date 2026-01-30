import { Atributos, ClasseName, Origem } from '../types';
import { CLASSES } from '../../data/classes';
import { ORIGENS } from '../../data/origins';

export interface DerivedStats {
  pvMax: number;
  peMax: number;
  sanMax: number;
  pdMax: number;
  peRodada: number;
  defesa: number;
  deslocamento: number;
  danoCorpoACorpoBonus: number;
  danoArmaFogoBonus: number;
  resistenciaDanoMental: number;
  iniciativaBonus: number;
  resistenciaParanormal: number;
  furtividadeBonus: number;
  percepcaoBonus: number;
  enganacaoBonus: number;
  diplomaciaBonus: number;
  fortitudeBonus: number;
}

export interface DerivedStatsInput {
  classe: ClasseName;
  atributos: Atributos;
  nex: number;
  estagio?: number;
  origemNome?: string;
  trilhaNome?: string;
  sobreviventeBeneficioOrigem?: 'pericias' | 'poder' | 'ambos';
  qtdTranscender?: number;
}


function calcularBonusOrigem(
  origemNome: string | undefined,
  nex: number,
  atributos: Atributos,
  aplicar: boolean
): {
  pvBonus: number;
  peBonus: number;
  sanBonus: number;
  defesaBonus: number;
  danoCorpoACorpoBonus: number;
  danoArmaFogoBonus: number;
  resistenciaDanoMental: number;
} {
  const vazio = {
    pvBonus: 0,
    peBonus: 0,
    sanBonus: 0,
    defesaBonus: 0,
    danoCorpoACorpoBonus: 0,
    danoArmaFogoBonus: 0,
    resistenciaDanoMental: 0,
  };

  if (!aplicar || !origemNome) return vazio;

  switch (origemNome) {
    case 'Desgarrado':
      return { ...vazio, pvBonus: Math.floor(nex / 5) };

    case 'Mergulhador':
      return { ...vazio, pvBonus: 5 };

    case 'Universitário':
      const nexImpares = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95, 99].filter(n => nex >= n).length;
      return { ...vazio, peBonus: 1 + nexImpares };

    case 'Vítima':
      return { ...vazio, sanBonus: Math.floor(nex / 5) };

    case 'Policial':
      return { ...vazio, defesaBonus: 2 };

    case 'Lutador':
      return { ...vazio, danoCorpoACorpoBonus: 2 };

    case 'Militar':
      return { ...vazio, danoArmaFogoBonus: 2 };

    case 'Teórico da Conspiração':
      return { ...vazio, resistenciaDanoMental: atributos.INT };

    default:
      return vazio;
  }
}


interface TrilhaBonus {
  pvBonus: number;
  defesaBonus: number;
  iniciativaBonus: number;
  resistenciaParanormal: number;
  resistenciaDanoMentalBonus: number;
  deslocamentoBonus: number;
  furtividadeBonus: number;
  percepcaoBonus: number;
  enganacaoBonus: number;
  diplomaciaBonus: number;
  fortitudeBonus: number;
}


function calcularBonusTrilha(
  trilhaNome: string | undefined,
  nex: number,
  estagio: number,
  atributos: Atributos
): TrilhaBonus {
  const vazio: TrilhaBonus = {
    pvBonus: 0,
    defesaBonus: 0,
    iniciativaBonus: 0,
    resistenciaParanormal: 0,
    resistenciaDanoMentalBonus: 0,
    deslocamentoBonus: 0,
    furtividadeBonus: 0,
    percepcaoBonus: 0,
    enganacaoBonus: 0,
    diplomaciaBonus: 0,
    fortitudeBonus: 0,
  };
  if (!trilhaNome) return vazio;
  const result = { ...vazio };

  switch (trilhaNome) {
    case 'Monstruoso':
      if (nex >= 10) {
        result.pvBonus += atributos.FOR;
      }
      break;

    case 'Tropa de Choque':
      if (nex >= 10) {
        result.pvBonus += Math.floor(nex / 5);
      }
      break;

    case 'Caçador':
      if (nex >= 65) {
        result.furtividadeBonus += 10;
        result.percepcaoBonus += 10;
      }
      break;

    case 'Operações Especiais':
      if (nex >= 10) {
        result.iniciativaBonus += 5;
      }
      break;
    case 'Infiltrador':
      if (nex >= 10) {
        result.enganacaoBonus += 5;
        result.diplomaciaBonus += 5;
      }
      break;

    case 'Técnico':
      if (nex >= 10) {
        result.defesaBonus += 2;
      }
      break;

    case 'Médico de Campo':
      if (nex >= 99) {
        result.fortitudeBonus += 5;
      }
      break;
    case 'Intuitivo':
      if (nex >= 10) {
        result.resistenciaParanormal += 5;
      }
      if (nex >= 65) {
        result.resistenciaDanoMentalBonus += 10;
      }
      break;
    case 'Durão':
      if (estagio >= 2) {
        result.pvBonus += estagio >= 3 ? 6 : 4;
      }
      break;
  }

  return result;
}

export function calculateDerivedStats(
  classe: ClasseName,
  atributos: Atributos,
  nex: number,
  estagio?: number
): DerivedStats;

export function calculateDerivedStats(
  input: DerivedStatsInput
): DerivedStats;

export function calculateDerivedStats(
  classeOrInput: ClasseName | DerivedStatsInput,
  atributos?: Atributos,
  nex?: number,
  estagio: number = 1
): DerivedStats {
  let classe: ClasseName;
  let attrs: Atributos;
  let nexValue: number;
  let estagioValue: number;
  let origemNome: string | undefined;
  let trilhaNome: string | undefined;
  let sobreviventeBeneficioOrigem: 'pericias' | 'poder' | 'ambos' | undefined;
  let qtdTranscender = 0;

  if (typeof classeOrInput === 'object') {
    classe = classeOrInput.classe;
    attrs = classeOrInput.atributos;
    nexValue = classeOrInput.nex;
    estagioValue = classeOrInput.estagio ?? 1;
    origemNome = classeOrInput.origemNome;
    trilhaNome = classeOrInput.trilhaNome;
    sobreviventeBeneficioOrigem = classeOrInput.sobreviventeBeneficioOrigem;
    qtdTranscender = classeOrInput.qtdTranscender ?? 0;
  } else {
    classe = classeOrInput;
    attrs = atributos!;
    nexValue = nex!;
    estagioValue = estagio;
  }

  const stats = CLASSES[classe];
  let nivel = Math.ceil(nexValue / 5);
  if (nivel < 1) nivel = 1;
  if (nivel > 20) nivel = 20;

  const growthSteps = Math.max(0, nivel - 1);
  const aplicarPoderOrigem = !(classe === 'Sobrevivente' && sobreviventeBeneficioOrigem === 'pericias');
  const bonusOrigem = calcularBonusOrigem(origemNome, nexValue, attrs, aplicarPoderOrigem);
  const bonusTrilha = calcularBonusTrilha(trilhaNome, nexValue, estagioValue, attrs);

  let pdMax = 0;
  let pvMax: number;
  let peMax: number;
  let sanMax: number;
  let peRodada: number;

  if (classe === 'Sobrevivente') {
    const survivorGrowth = Math.max(0, estagioValue - 1);
    pdMax = stats.pdInicial + attrs.PRE + (survivorGrowth * stats.pdPorNivel);

    pvMax = 8 + attrs.VIG + (survivorGrowth * 2) + bonusOrigem.pvBonus + bonusTrilha.pvBonus;
    peMax = 2 + attrs.PRE + (survivorGrowth * 1) + bonusOrigem.peBonus;
    sanMax = stats.sanInicial + (survivorGrowth * stats.sanPorNivel) + bonusOrigem.sanBonus;
    peRodada = 1;
  } else {
    pdMax = stats.pdInicial + attrs.PRE + (growthSteps * (stats.pdPorNivel + attrs.PRE));
    peRodada = nivel;

    pvMax = stats.pvInicial + attrs.VIG + (growthSteps * (stats.pvPorNivel + attrs.VIG)) + bonusOrigem.pvBonus + bonusTrilha.pvBonus;
    peMax = stats.peInicial + attrs.PRE + (growthSteps * (stats.pePorNivel + attrs.PRE)) + bonusOrigem.peBonus;
    sanMax = stats.sanInicial + (growthSteps * stats.sanPorNivel) + bonusOrigem.sanBonus - (qtdTranscender * stats.sanPorNivel);
  }
  const defesa = 10 + attrs.AGI + bonusOrigem.defesaBonus + bonusTrilha.defesaBonus;

  return {
    pvMax,
    peMax,
    sanMax,
    pdMax,
    peRodada,
    defesa,
    deslocamento: 9,
    danoCorpoACorpoBonus: bonusOrigem.danoCorpoACorpoBonus,
    danoArmaFogoBonus: bonusOrigem.danoArmaFogoBonus,
    resistenciaDanoMental: bonusOrigem.resistenciaDanoMental + bonusTrilha.resistenciaDanoMentalBonus,
    iniciativaBonus: bonusTrilha.iniciativaBonus,
    resistenciaParanormal: bonusTrilha.resistenciaParanormal,
    furtividadeBonus: bonusTrilha.furtividadeBonus,
    percepcaoBonus: bonusTrilha.percepcaoBonus,
    enganacaoBonus: bonusTrilha.enganacaoBonus,
    diplomaciaBonus: bonusTrilha.diplomaciaBonus,
    fortitudeBonus: bonusTrilha.fortitudeBonus,
  };
}
