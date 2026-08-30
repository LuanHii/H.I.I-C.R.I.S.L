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
  /**
   * Bônus de perícia de QUALQUER perícia, vindos de origem e trilha.
   *
   * Os cinco campos nomeados acima são um resquício: cobriam só Furtividade,
   * Percepção, Enganação, Diplomacia e Fortitude, então um bônus em Atletismo
   * ou Crime — como o +5 de Gatuno, do Infiltrador — não tinha onde ser
   * escrito. Ficam como apelidos derivados deste mapa; use este.
   */
  periciaBonus: Partial<Record<PericiaName, number>>;
  /** Dados extras/penalidades de dado por perícia (o –1d20 do Experimento). */
  periciaDados: Partial<Record<PericiaName, number>>;
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
  marcas?: readonly Marca[];
  /**
   * Poderes do personagem, pelos nomes. Sem isto nenhum bônus de poder era
   * aplicado — o motor simplesmente não sabia quais poderes a ficha tinha.
   */
  poderes?: readonly { nome: string }[];
  /**
   * Perícias já treinadas. Necessário para o padrão do livro
   * "recebe treinamento em X ou, se já for treinado, recebe +2 nela" — sem
   * isto, os ~25 poderes gerais que usam essa fórmula não rendem número algum.
   */
  periciasTreinadas?: readonly PericiaName[];
}

/**
 * Bônus permanentes da origem, derivados de `origem.poder.efeitos`.
 *
 * Antes era um `switch` com 8 origens, e havia um SEGUNDO switch em
 * `rulesEngine.calcularBonusPoderOrigem` com 12 — usado só na criação. As
 * origens que existiam apenas no segundo (Diplomata, Profetizado, Religioso,
 * Experimento) davam bônus na criação que o primeiro save apagava. Agora os
 * dois caminhos leem o mesmo dado pelo mesmo interpretador.
 */
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
  /** Todas as perícias afetadas, não só as cinco com campo nomeado. */
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

/**
 * Bônus permanentes da trilha, derivados de `habilidade.efeitos`.
 *
 * O gate de NEX vem do próprio dado (`habilidade.nex`), então não há mais `if`
 * por trilha no motor. Em trilhas de sobrevivente esse campo é o ESTÁGIO.
 *
 * O switch que existia aqui tinha bônus que NÃO estão no livro. Conferido
 * contra o Livro de Regras e Sobrevivendo ao Horror, um a um:
 *
 *  - Caçador NEX 65 dava +10 Furtividade e +10 Percepção. "Atacar das Sombras"
 *    só remove penalidades de Furtividade; não concede bônus nenhum.
 *  - Infiltrador NEX 10 dava +5 Enganação e +5 Diplomacia. "Ataque Furtivo" é
 *    dano extra. O +5 real é em Atletismo e Crime, e vem em NEX 40 (Gatuno) —
 *    que não era implementado.
 *  - Médico de Campo NEX 99 dava +5 Fortitude. "Reanimação" ressuscita um
 *    personagem; não tem bônus de perícia.
 *  - Técnico NEX 10 dava +2 Defesa. "Inventário Otimizado" soma Intelecto à
 *    Força para carga — coisa completamente diferente, e que faltava.
 *  - Monstruoso NEX 10 somava Força aos PV sempre. Isso é o efeito do elemento
 *    MORTE; um Monstruoso de Sangue, Conhecimento ou Energia não recebe nada
 *    disso.
 */
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

  // Sobrevivente progride por estágio; as demais classes, por NEX.
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

/**
 * Bônus permanentes dos poderes que a ficha possui.
 *
 * O `treinamento` só contribui com a metade "+2 se já treinado": conceder
 * treinamento altera o GRAU da perícia, o que é escolha do jogador e não cabe
 * num cálculo derivado. A declaração fica no dado para o commit de escolhas.
 */
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
  let sobreviventeBeneficioOrigem: 'pericias' | 'poder' | 'ambos' | undefined;
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
    sobreviventeBeneficioOrigem = classeOrInput.sobreviventeBeneficioOrigem;
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
  const aplicarPoderOrigem = !(classe === 'Sobrevivente' && sobreviventeBeneficioOrigem === 'pericias');
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

  if (classe === 'Sobrevivente') {
    const survivorGrowth = Math.max(0, estagioValue - 1);
    pdMax = stats.pdInicial + attrs.PRE + (survivorGrowth * stats.pdPorNivel);

    pvMax = 8 + attrs.VIG + (survivorGrowth * 2) + bonusOrigem.pvBonus + bonusTrilha.pvBonus + bonusPoderes.pvBonus;
    peMax = 2 + attrs.PRE + (survivorGrowth * 1) + bonusOrigem.peBonus + bonusPoderes.peBonus;
    sanMax = stats.sanInicial + (survivorGrowth * stats.sanPorNivel) + bonusOrigem.sanBonus + bonusPoderes.sanBonus - (qtdTranscender * stats.sanPorNivel);
    peRodada = 1;
  } else {
    pdMax = stats.pdInicial + attrs.PRE + (growthSteps * (stats.pdPorNivel + attrs.PRE));
    peRodada = nivel;

    pvMax = stats.pvInicial + attrs.VIG + (growthSteps * (stats.pvPorNivel + attrs.VIG)) + bonusOrigem.pvBonus + bonusTrilha.pvBonus + bonusPoderes.pvBonus;
    peMax = stats.peInicial + attrs.PRE + (growthSteps * (stats.pePorNivel + attrs.PRE)) + bonusOrigem.peBonus + bonusPoderes.peBonus;
    sanMax = stats.sanInicial + (growthSteps * stats.sanPorNivel) + bonusOrigem.sanBonus + bonusPoderes.sanBonus - (qtdTranscender * stats.sanPorNivel);
  }

  pvMax = Math.max(0, pvMax - perdasPermanentes.pvMaxPerdido);
  peMax = Math.max(0, peMax - perdasPermanentes.peMaxPerdido);
  sanMax = Math.max(0, sanMax - perdasPermanentes.sanMaxPerdida);
  const defesa = 10 + attrs.AGI + bonusOrigem.defesaBonus + bonusTrilha.defesaBonus + bonusPoderes.defesaBonus;

  // Bônus de perícia de origem e trilha juntos, sem passar pelos campos nomeados.
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
