import { Atributos, ClasseName, Marca, Origem, PericiaName } from '../types';
import { type BonusAcumulado, aplicarEfeitos, aplicarVarios, bonusVazio } from './efeitos';
import { somarPerdasDeRecurso } from './marcas';
import { CLASSES } from '../../data/character/classes';
import { ORIGENS } from '../../data/character/origins';
import { TRILHAS } from '../../data/character/tracks';
import { PODERES } from '../../data/character/powers';
import { nexParaNivel } from './progressao';

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
  periciaBonus: Partial<Record<PericiaName, number>>;
  periciaDados: Partial<Record<PericiaName, number>>;
}

export interface DerivedStatsInput {
  classe: ClasseName;
  atributos: Atributos;
  nex: number;
  estagio?: number;
  origemNome?: string;
  trilhaNome?: string;
  beneficioOrigem?: 'pericias' | 'poder' | 'ambos';
  qtdTranscender?: number;
  marcas?: readonly Marca[];
  poderes?: readonly { nome: string }[];
  periciasTreinadas?: readonly PericiaName[];
}

export function calcularBonusOrigem(
  origemNome: string | undefined,
  nex: number,
  atributos: Atributos,
  aplicar: boolean,
  jaTreinadas?: ReadonlySet<PericiaName>,
): BonusAcumulado & { resistenciaDanoMental: number } {
  const vazio = { ...bonusVazio(), resistenciaDanoMental: 0 };
  if (!aplicar || !origemNome) return vazio;

  const origem = ORIGENS.find((o) => o.nome === origemNome);
  if (!origem) return vazio;

  const bonus = aplicarEfeitos(origem.poder.efeitos, { nex, atributos, jaTreinadas });
  return { ...bonus, resistenciaDanoMental: bonus.resistencias.mental ?? 0 };
}

interface TrilhaBonus {
  periciaFixos: Partial<Record<PericiaName, number>>;
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
  atributos: Atributos,
): TrilhaBonus {
  const vazio: TrilhaBonus = {
    periciaFixos: {},
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

  const trilha = TRILHAS.find((t) => t.nome === trilhaNome);
  if (!trilha) return vazio;

  const progresso = trilha.classe === 'Sobrevivente' ? estagio : nex;

  const bonus = aplicarVarios(
    trilha.habilidades.filter((h) => progresso >= h.nex).map((h) => h.efeitos),
    { nex: progresso, atributos },
  );

  const pericia = (nome: PericiaName) => bonus.periciaFixos[nome] ?? 0;

  return {
    periciaFixos: bonus.periciaFixos,
    pvBonus: bonus.pvBonus,
    defesaBonus: bonus.defesaBonus,
    iniciativaBonus: pericia('Iniciativa'),
    resistenciaParanormal: bonus.resistencias.paranormal ?? 0,
    resistenciaDanoMentalBonus: bonus.resistencias.mental ?? 0,
    deslocamentoBonus: bonus.deslocamentoBonus,
    furtividadeBonus: pericia('Furtividade'),
    percepcaoBonus: pericia('Percepção'),
    enganacaoBonus: pericia('Enganação'),
    diplomaciaBonus: pericia('Diplomacia'),
    fortitudeBonus: pericia('Fortitude'),
  };
}

export function calcularBonusPoderes(
  poderes: readonly { nome: string }[] | undefined,
  nex: number,
  atributos: Atributos,
  jaTreinadas?: ReadonlySet<PericiaName>,
): BonusAcumulado {
  if (!poderes || poderes.length === 0) return bonusVazio();
  const efeitos = poderes.map((p) => {
    const catalogo = PODERES.find((c) => c.nome === p.nome || (c.apelidos ?? []).includes(p.nome));
    return catalogo?.efeitos;
  });
  return aplicarVarios(efeitos, { nex, atributos, jaTreinadas });
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
  let beneficioOrigem: 'pericias' | 'poder' | 'ambos' | undefined;
  let qtdTranscender = 0;
  let marcas: readonly Marca[] | undefined;
  let poderes: readonly { nome: string }[] | undefined;
  let periciasTreinadas: readonly PericiaName[] | undefined;

  if (typeof classeOrInput === 'object') {
    classe = classeOrInput.classe;
    attrs = classeOrInput.atributos;
    nexValue = classeOrInput.nex;
    estagioValue = classeOrInput.estagio ?? 1;
    origemNome = classeOrInput.origemNome;
    trilhaNome = classeOrInput.trilhaNome;
    beneficioOrigem = classeOrInput.beneficioOrigem;
    qtdTranscender = classeOrInput.qtdTranscender ?? 0;
    marcas = classeOrInput.marcas;
    poderes = classeOrInput.poderes;
    periciasTreinadas = classeOrInput.periciasTreinadas;
  } else {
    classe = classeOrInput;
    attrs = atributos!;
    nexValue = nex!;
    estagioValue = estagio;
  }

  const stats = CLASSES[classe];
  const nivel = nexParaNivel(nexValue);

  const growthSteps = Math.max(0, nivel - 1);
  const aplicarPoderOrigem = beneficioOrigem !== 'pericias';
  const jaTreinadas = new Set(periciasTreinadas ?? []);
  const bonusOrigem = calcularBonusOrigem(origemNome, nexValue, attrs, aplicarPoderOrigem, jaTreinadas);
  const bonusPoderes = calcularBonusPoderes(poderes, nexValue, attrs, jaTreinadas);
  const bonusTrilha = calcularBonusTrilha(trilhaNome, nexValue, estagioValue, attrs);
  const perdasPermanentes = somarPerdasDeRecurso(marcas);

  let pdMax = 0;
  let pvMax: number;
  let peMax: number;
  let sanMax: number;
  let peRodada: number;
  const sanInicial = Math.floor(stats.sanInicial * bonusOrigem.sanInicialFator);

  if (classe === 'Sobrevivente') {
    const survivorGrowth = Math.max(0, estagioValue - 1);
    pdMax = stats.pdInicial + attrs.PRE + (survivorGrowth * stats.pdPorNivel);

    pvMax = 8 + attrs.VIG + (survivorGrowth * 2) + bonusOrigem.pvBonus + bonusTrilha.pvBonus + bonusPoderes.pvBonus;
    peMax = 2 + attrs.PRE + (survivorGrowth * 1) + bonusOrigem.peBonus + bonusPoderes.peBonus;
    sanMax = sanInicial + (survivorGrowth * stats.sanPorNivel) + bonusOrigem.sanBonus + bonusPoderes.sanBonus - (qtdTranscender * stats.sanPorNivel);
    peRodada = 1;
  } else {
    pdMax = stats.pdInicial + attrs.PRE + (growthSteps * (stats.pdPorNivel + attrs.PRE));
    peRodada = nivel;

    pvMax = stats.pvInicial + attrs.VIG + (growthSteps * (stats.pvPorNivel + attrs.VIG)) + bonusOrigem.pvBonus + bonusTrilha.pvBonus + bonusPoderes.pvBonus;
    peMax = stats.peInicial + attrs.PRE + (growthSteps * (stats.pePorNivel + attrs.PRE)) + bonusOrigem.peBonus + bonusPoderes.peBonus;
    sanMax = sanInicial + (growthSteps * stats.sanPorNivel) + bonusOrigem.sanBonus + bonusPoderes.sanBonus - (qtdTranscender * stats.sanPorNivel);
  }

  pvMax = Math.max(0, pvMax - perdasPermanentes.pvMaxPerdido);
  peMax = Math.max(0, peMax - perdasPermanentes.peMaxPerdido);
  sanMax = Math.max(0, sanMax - perdasPermanentes.sanMaxPerdida);
  const defesa = 10 + attrs.AGI + bonusOrigem.defesaBonus + bonusTrilha.defesaBonus + bonusPoderes.defesaBonus;

  const periciaDadosTotal: Partial<Record<PericiaName, number>> = { ...bonusOrigem.periciaDados };
  for (const [pericia, valor] of Object.entries(bonusPoderes.periciaDados) as [PericiaName, number][]) {
    periciaDadosTotal[pericia] = (periciaDadosTotal[pericia] ?? 0) + valor;
  }

  const periciaBonusTotal: Partial<Record<PericiaName, number>> = { ...bonusOrigem.periciaFixos };
  for (const fonte of [bonusTrilha.periciaFixos, bonusPoderes.periciaFixos]) {
    for (const [pericia, valor] of Object.entries(fonte) as [PericiaName, number][]) {
      periciaBonusTotal[pericia] = (periciaBonusTotal[pericia] ?? 0) + valor;
    }
  }

  return {
    pvMax,
    peMax,
    sanMax,
    pdMax,
    peRodada,
    defesa,
    deslocamento: 9 + bonusTrilha.deslocamentoBonus + bonusPoderes.deslocamentoBonus + bonusOrigem.deslocamentoBonus,
    danoCorpoACorpoBonus: bonusOrigem.danoCorpoACorpoBonus,
    danoArmaFogoBonus: bonusOrigem.danoArmaFogoBonus,
    resistenciaDanoMental: bonusOrigem.resistenciaDanoMental + bonusTrilha.resistenciaDanoMentalBonus + (bonusPoderes.resistencias.mental ?? 0),
    iniciativaBonus: bonusTrilha.iniciativaBonus,
    resistenciaParanormal: bonusTrilha.resistenciaParanormal,
    furtividadeBonus: bonusTrilha.furtividadeBonus,
    percepcaoBonus: bonusTrilha.percepcaoBonus,
    enganacaoBonus: bonusTrilha.enganacaoBonus,
    diplomaciaBonus: bonusTrilha.diplomaciaBonus,
    fortitudeBonus: bonusTrilha.fortitudeBonus,
    periciaBonus: periciaBonusTotal,
    periciaDados: periciaDadosTotal,
  };
}
