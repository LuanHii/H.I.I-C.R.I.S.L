import {
  AtributoKey,
  Atributos,
  ClasseName,
  Elemento,
  GrauTreinamento,
  LimiteItens,
  NexEvento,
  Origem,
  Patente,
  PatenteConfig,
  PericiaDetalhada,
  PericiaName,
  Personagem,
  Poder,
  Ritual,
  Item,
  BonusContexto,
} from '../core/types';
import { validateAttributes } from '../core/rules/attributes';
import { CLASSES } from '../data/classes';
import { ORIGENS } from '../data/origins';

export const TODAS_PERICIAS: PericiaName[] = [
  'Acrobacia',
  'Adestramento',
  'Artes',
  'Atletismo',
  'Atualidades',
  'Ciências',
  'Crime',
  'Diplomacia',
  'Enganação',
  'Fortitude',
  'Furtividade',
  'Iniciativa',
  'Intimidação',
  'Intuição',
  'Investigação',
  'Luta',
  'Medicina',
  'Ocultismo',
  'Percepção',
  'Pilotagem',
  'Pontaria',
  'Profissão',
  'Reflexos',
  'Religião',
  'Sobrevivência',
  'Tática',
  'Tecnologia',
  'Vontade',
];

export const PERICIA_ATRIBUTO: Record<PericiaName, AtributoKey> = {
  Acrobacia: 'AGI',
  Adestramento: 'PRE',
  Artes: 'PRE',
  Atletismo: 'FOR',
  Atualidades: 'INT',
  Ciências: 'INT',
  Crime: 'AGI',
  Diplomacia: 'PRE',
  Enganação: 'PRE',
  Fortitude: 'VIG',
  Furtividade: 'AGI',
  Iniciativa: 'AGI',
  Intimidação: 'PRE',
  Intuição: 'INT',
  Investigação: 'INT',
  Luta: 'FOR',
  Medicina: 'INT',
  Ocultismo: 'INT',
  Percepção: 'PRE',
  Pilotagem: 'AGI',
  Pontaria: 'AGI',
  Profissão: 'INT',
  Reflexos: 'AGI',
  Religião: 'PRE',
  Sobrevivência: 'INT',
  Tática: 'INT',
  Tecnologia: 'INT',
  Vontade: 'PRE',
};

const GRAU_BONUS: Record<GrauTreinamento, number> = {
  Destreinado: 0,
  Treinado: 5,
  Veterano: 10,
  Expert: 15,
};

const PATENTE_CONFIGS: PatenteConfig[] = [
  {
    nome: 'Recruta',
    credito: 'Baixo',
    limiteItens: { I: 2, II: 0, III: 0, IV: 0 },
    nexMin: 0,
  },
  {
    nome: 'Operador',
    credito: 'Médio',
    limiteItens: { I: 3, II: 1, III: 0, IV: 0 },
    nexMin: 20,
  },
  {
    nome: 'Agente Especial',
    credito: 'Médio',
    limiteItens: { I: 5, II: 2, III: 1, IV: 0 },
    nexMin: 35,
  },
  {
    nome: 'Oficial de Operações',
    credito: 'Alto',
    limiteItens: { I: 99, II: 3, III: 2, IV: 1 },
    nexMin: 50,
  },
  {
    nome: 'Agente de Elite',
    credito: 'Ilimitado',
    limiteItens: { I: 99, II: 5, III: 3, IV: 2 },
    nexMin: 70,
  },
];

interface ClasseResourceData {
  pv: { base: number; baseAttr?: AtributoKey; porNivel: number; porNivelAttr?: AtributoKey };
  pe: { base: number; baseAttr?: AtributoKey; porNivel: number; porNivelAttr?: AtributoKey };
  san: { base: number; porNivel: number };
}

const CLASS_RESOURCES = {
  Combatente: {
    pv: { base: 20, baseAttr: 'VIG', porNivel: 4, porNivelAttr: 'VIG' },
    pe: { base: 2, baseAttr: 'PRE', porNivel: 2, porNivelAttr: 'PRE' },
    san: { base: 12, porNivel: 3 },
  },
  Especialista: {
    pv: { base: 16, baseAttr: 'VIG', porNivel: 3, porNivelAttr: 'VIG' },
    pe: { base: 3, baseAttr: 'PRE', porNivel: 3, porNivelAttr: 'PRE' },
    san: { base: 16, porNivel: 4 },
  },
  Ocultista: {
    pv: { base: 12, baseAttr: 'VIG', porNivel: 2, porNivelAttr: 'VIG' },
    pe: { base: 4, baseAttr: 'PRE', porNivel: 4, porNivelAttr: 'PRE' },
    san: { base: 20, porNivel: 5 },
  },
  Sobrevivente: {
    pv: { base: 8, baseAttr: 'VIG', porNivel: 2, porNivelAttr: undefined },
    pe: { base: 2, baseAttr: 'PRE', porNivel: 1, porNivelAttr: undefined },
    san: { base: 8, porNivel: 2 },
  },
} as const;

const PD_NEX_CONFIG = {
  Combatente: { base: 6, porNivel: 3 },
  Especialista: { base: 8, porNivel: 4 },
  Ocultista: { base: 10, porNivel: 5 },
  Sobrevivente: { base: 4, porNivel: 2 },
} as const;

const PD_PATENTE_CONFIG: Record<ClasseName, { base: number; porPatente: number }> = {
  Combatente: { base: 8, porPatente: 4 },
  Especialista: { base: 12, porPatente: 6 },
  Ocultista: { base: 16, porPatente: 8 },
  Sobrevivente: { base: 4, porPatente: 0 },
};

const NEX_EVENTOS_BASE: { requisito: number; tipo: NexEvento['tipo']; descricao: string }[] = [
  { requisito: 10, tipo: 'Trilha', descricao: 'Escolha de Trilha e 1ª habilidade' },
  { requisito: 15, tipo: 'Poder', descricao: 'Desbloqueia um Poder de Classe' },
  { requisito: 20, tipo: 'Atributo', descricao: '+1 em qualquer atributo' },
  { requisito: 30, tipo: 'Poder', descricao: 'Desbloqueia um Poder de Classe' },
  { requisito: 35, tipo: 'Pericia', descricao: 'Promove 2 + INT perícias em um grau' },
  { requisito: 40, tipo: 'Trilha', descricao: '2ª habilidade da Trilha' },
  { requisito: 45, tipo: 'Poder', descricao: 'Desbloqueia um Poder de Classe' },
  { requisito: 50, tipo: 'Atributo', descricao: '+1 em qualquer atributo' },
  { requisito: 50, tipo: 'Versatilidade', descricao: 'Ganha Versatilidade' },
  { requisito: 50, tipo: 'Afinidade', descricao: 'Escolhe Afinidade elemental (Ocultista)' },
  { requisito: 60, tipo: 'Poder', descricao: 'Desbloqueia um Poder de Classe' },
  { requisito: 65, tipo: 'Trilha', descricao: '3ª habilidade da Trilha' },
  { requisito: 70, tipo: 'Pericia', descricao: 'Promove novamente 2 + INT perícias' },
  { requisito: 75, tipo: 'Poder', descricao: 'Desbloqueia um Poder de Classe' },
  { requisito: 80, tipo: 'Atributo', descricao: '+1 em qualquer atributo' },
  { requisito: 90, tipo: 'Poder', descricao: 'Desbloqueia um Poder de Classe' },
  { requisito: 99, tipo: 'Trilha', descricao: '4ª habilidade da Trilha' },
];

export const TODAS_PATENTES: Patente[] = PATENTE_CONFIGS.map((cfg) => cfg.nome);
const ORDEM_PATENTE: Patente[] = TODAS_PATENTES;

export interface ClassePreferencias {
  ofensiva?: Extract<PericiaName, 'Luta' | 'Pontaria'>;
  defensiva?: Extract<PericiaName, 'Fortitude' | 'Reflexos'>;
}

interface TrilhaConfigOptions {
  monstruosoElemento?: Elemento;
  monstruosoPericiaSocial?: Extract<
    PericiaName,
    'Diplomacia' | 'Enganação' | 'Intimidação'
  >;
}

// BonusContexto removido (agora importado de tipos)

/**
 * Resultado do cálculo de bônus dos poderes de origem.
 * Estes bônus são aplicados automaticamente ao personagem.
 */
interface BonusPoderOrigem {
  pvBonus: number;
  peBonus: number;
  sanBonus: number;
  defesaBonus: number;
  danoCorpoACorpoBonus: number;
  danoArmaFogoBonus: number;
  resistenciaDanoMental: number;
  periciaFixos: Partial<Record<PericiaName, number>>;
  periciaDados: Partial<Record<PericiaName, number>>;
  efeitos: string[];
}

export interface CriacaoInput {
  nome: string;
  conceito?: string;
  classe: ClasseName;
  atributos: Atributos;
  origem: Origem;
  periciasLivres: PericiaName[];
  nex?: number;
  estagio?: number;
  trilha?: string;
  afinidade?: Elemento;
  patente?: Patente;
  usarPd?: boolean;
  preferenciasClasse?: ClassePreferencias;
  sobreviventeBeneficioOrigem?: 'pericias' | 'poder' | 'ambos';
  trilhaConfig?: TrilhaConfigOptions;
  bonus?: BonusContexto;
  rituais?: Ritual[];
  equipamentos?: Item[];
}

interface RecursosResultado {
  pv: number;
  pe: number;
  san: number;
  pd?: number;
}

interface PericiaBuildResult {
  graus: Record<PericiaName, GrauTreinamento>;
  extrasFixos: Partial<Record<PericiaName, number>>;
  extrasDados: Partial<Record<PericiaName, number>>;
  logs: string[];
  pendentesLivres: number;
}

interface TrilhaEffectResult {
  pvBonus: number;
  extrasFixos: Partial<Record<PericiaName, number>>;
  extrasDados: Partial<Record<PericiaName, number>>;
  efeitos: string[];
}

export function listarPatentes(): PatenteConfig[] {
  return PATENTE_CONFIGS;
}

export function getPatentePorNex(nex: number): Patente {
  const config = [...PATENTE_CONFIGS]
    .sort((a, b) => b.nexMin - a.nexMin)
    .find((cfg) => nex >= cfg.nexMin);
  return config?.nome ?? 'Recruta';
}

export function getPatenteConfig(patente: Patente): PatenteConfig {
  const cfg = PATENTE_CONFIGS.find((p) => p.nome === patente);
  if (!cfg) throw new Error(`Patente desconhecida: ${patente}`);
  return cfg;
}

export function calcularPericiasDisponiveis(
  classe: ClasseName,
  intelecto: number,
  origem: Origem,
  preferenciasClasse?: ClassePreferencias,
): { qtdEscolhaLivre: number; obrigatorias: PericiaName[] } {
  const obrigatorias = new Set<PericiaName>();
  // Modo permissivo: evita quebrar se `origem` vier incompleta por dados antigos/edge cases.
  const origemPericias = (origem as any)?.pericias ?? [];
  origemPericias.forEach((p: PericiaName) => obrigatorias.add(p));

  switch (classe) {
    case 'Combatente':
      // Combatente escolhe 1 perícia ofensiva (Luta/Pontaria) e 1 defensiva (Fortitude/Reflexos).
      // Guardamos a escolha em `preferenciasClasse`. Se não houver, usamos padrão (Luta + Fortitude).
      obrigatorias.add(preferenciasClasse?.ofensiva ?? 'Luta');
      obrigatorias.add(preferenciasClasse?.defensiva ?? 'Fortitude');
      return { qtdEscolhaLivre: Math.max(1, 1 + intelecto), obrigatorias: Array.from(obrigatorias) };
    case 'Especialista':
      return { qtdEscolhaLivre: Math.max(1, 7 + intelecto), obrigatorias: Array.from(obrigatorias) };
    case 'Ocultista':
      obrigatorias.add('Ocultismo');
      obrigatorias.add('Vontade');
      return { qtdEscolhaLivre: Math.max(1, 3 + intelecto), obrigatorias: Array.from(obrigatorias) };
    case 'Sobrevivente':
      return { qtdEscolhaLivre: Math.max(1, 1 + intelecto), obrigatorias: Array.from(obrigatorias) };
    default:
      return { qtdEscolhaLivre: 1, obrigatorias: Array.from(obrigatorias) };
  }
}

export function gerarFicha(input: CriacaoInput): Personagem {
  const nexBase = input.nex ?? (input.classe === 'Sobrevivente' ? 0 : 5);
  const estagio =
    input.classe === 'Sobrevivente'
      ? input.estagio ?? inferirEstagioDoNex(nexBase)
      : undefined;

  const atributos = { ...input.atributos };
  const validacao = validateAttributes(atributos, input.classe);
  if (!validacao.valid) {
    throw new Error(validacao.message ?? 'Distribuição de atributos inválida');
  }

  const patente = input.patente ?? getPatentePorNex(nexBase);
  const origem = input.origem ?? ORIGENS[0];

  const periciasBase = construirPericias({
    classe: input.classe,
    atributos,
    origem,
    periciasLivres: input.periciasLivres,
    nex: nexBase,
    preferenciasClasse: input.preferenciasClasse,
    sobreviventeBeneficioOrigem: input.sobreviventeBeneficioOrigem,
  });

  const trilhaEfeito = aplicarTrilhaEfeitos({
    trilhaNome: input.trilha,
    nex: nexBase,
    atributos,
    pericias: periciasBase.graus,
    extrasFixos: periciasBase.extrasFixos,
    extrasDados: periciasBase.extrasDados,
    config: input.trilhaConfig,
  });

  // Calcular bônus de poderes de origem
  const aplicarPoderOrigem =
    input.classe === 'Sobrevivente' && input.sobreviventeBeneficioOrigem === 'pericias'
      ? false
      : true;
  const bonusOrigem = aplicarPoderOrigem
    ? calcularBonusPoderOrigem(origem, nexBase, atributos)
    : criarBonusOrigemVazio();

  const recursos = calcularRecursos({
    classe: input.classe,
    atributos,
    nex: nexBase,
    estagio,
    usarPd: input.usarPd ?? false,
    patente,
    pvBonus: trilhaEfeito.pvBonus + bonusOrigem.pvBonus,
    peBonus: bonusOrigem.peBonus,
    sanBonus: bonusOrigem.sanBonus,
  });

  const afinidadeFinal =
    input.afinidade ?? (input.classe === 'Ocultista' && nexBase >= 50 ? 'Conhecimento' : undefined);

  const limiteItens = getPatenteConfig(patente).limiteItens;
  const defesa = 10 + atributos.AGI + (input.bonus?.defesa ?? 0) + bonusOrigem.defesaBonus;
  const deslocamento = 9 + (input.bonus?.deslocamento ?? 0);

  const poderes = coletarPoderes(origem, input.classe, input.sobreviventeBeneficioOrigem);
  const carga = calcularCarga({
    atributos,
    itens: input.equipamentos ?? [],
    poderes,
    bonusCarga: input.bonus?.carga
  });

  const periciasDetalhadas = gerarDetalhesPericia({
    atributos,
    graus: periciasBase.graus,
    extrasFixos: combinePericiaBonus(periciasBase.extrasFixos, trilhaEfeito.extrasFixos, input.bonus?.periciaFixos, bonusOrigem.periciaFixos),
    extrasDados: combinePericiaBonus(periciasBase.extrasDados, trilhaEfeito.extrasDados, input.bonus?.periciaDados, bonusOrigem.periciaDados),
  });

  const eventosNex = listarEventosNex(nexBase);
  const efeitosAtivos = construirEfeitosAtivos({
    origem,
    classe: input.classe,
    sobreviventeBeneficioOrigem: input.sobreviventeBeneficioOrigem,
    trilhaEfeitos: [...trilhaEfeito.efeitos, ...bonusOrigem.efeitos],
    afinidade: afinidadeFinal,
  });

  return {
    nome: input.nome,
    conceito: input.conceito,
    classe: input.classe,
    origem: origem.nome,
    nex: nexBase,
    estagio,
    patente,
    trilha: input.trilha,
    afinidade: afinidadeFinal,
    atributos,
    pericias: periciasBase.graus,
    periciasDetalhadas,
    periciasTreinadasPendentes: periciasBase.pendentesLivres > 0 ? periciasBase.pendentesLivres : undefined,
    pv: {
      atual: recursos.pv,
      max: recursos.pv,
      temp: 0,
      machucado: Math.floor(recursos.pv / 2),
    },
    pe: {
      atual: recursos.pe,
      max: recursos.pe,
      // Limite de PE por turno segue a Tabela 1.2 (5%->1 ... 95%->19, 99%->20)
      rodada: input.classe === 'Sobrevivente' ? 1 : Math.min(20, Math.max(1, Math.ceil(nexBase / 5))),
    },
    san: {
      atual: recursos.san,
      max: recursos.san,
      // Perturbado é derivado da SAN atual vs SAN máxima (não PV).
      // Na criação, SAN atual == SAN máxima, então começa como false.
      perturbado: false,
    },
    pd: recursos.pd ? { atual: recursos.pd, max: recursos.pd } : undefined,
    defesa,
    deslocamento,
    carga,
    limiteItens,
    eventosNex,
    equipamentos: input.equipamentos ?? [],
    poderes,
    rituais: input.rituais ?? [],
    proficiencias: CLASSES[input.classe]?.proficiencias ?? [],
    efeitosAtivos,
  };
}

export function listarEventosNex(nex: number): NexEvento[] {
  return NEX_EVENTOS_BASE.map((evento) => ({
    requisito: evento.requisito,
    tipo: evento.tipo,
    descricao: evento.descricao,
    desbloqueado: nex >= evento.requisito,
  }));
}

// DT para resistir a rituais (OPRPG): mesma regra de DT de habilidades (p. 78),
// usando Presença como atributo (ver seção de rituais).
// DT = 10 + limite de PE por turno + Presença + bônus situacionais.
export function calcularDTRitual(params: {
  atributos: Atributos;
  limitePe: number;
  bonusDT?: number;
}): number {
  const { atributos, limitePe, bonusDT } = params;
  return 10 + limitePe + atributos.PRE + (bonusDT ?? 0);
}

function inferirEstagioDoNex(nex: number): number {
  if (nex >= 55) return 4;
  if (nex >= 35) return 3;
  if (nex >= 15) return 2;
  return 1;
}

function construirPericias(params: {
  classe: ClasseName;
  atributos: Atributos;
  origem: Origem;
  periciasLivres: PericiaName[];
  nex: number;
  preferenciasClasse?: ClassePreferencias;
  sobreviventeBeneficioOrigem?: 'pericias' | 'poder' | 'ambos';
}): PericiaBuildResult {
  const { classe, origem, periciasLivres, atributos, nex } = params;
  const graus: Record<PericiaName, GrauTreinamento> = Object.fromEntries(
    TODAS_PERICIAS.map((p) => [p, 'Destreinado']),
  ) as Record<PericiaName, GrauTreinamento>;
  const extrasFixos: Partial<Record<PericiaName, number>> = {};
  const extrasDados: Partial<Record<PericiaName, number>> = {};
  const logs: string[] = [];

  const intelecto = atributos.INT;
  let slotsLivres = calcularSlotsLivres(classe, intelecto);

  const adicionaPericia = (pericia: PericiaName, substituivel: boolean) => {
    if (graus[pericia] !== 'Destreinado') {
      if (substituivel) slotsLivres += 1;
      return;
    }
    graus[pericia] = 'Treinado';
  };

  const origemConcedePericias =
    classe === 'Sobrevivente' && params.sobreviventeBeneficioOrigem === 'poder'
      ? false
      : true;

  if (origemConcedePericias) {
    origem.pericias.forEach((pericia) => adicionaPericia(pericia, true));
  }

  switch (classe) {
    case 'Combatente': {
      const ofensiva = params.preferenciasClasse?.ofensiva ?? 'Luta';
      const defensiva = params.preferenciasClasse?.defensiva ?? 'Fortitude';
      adicionaPericia(ofensiva, false);
      adicionaPericia(defensiva, false);
      break;
    }
    case 'Ocultista':
      adicionaPericia('Ocultismo', false);
      adicionaPericia('Vontade', false);
      break;
    default:
      break;
  }

  periciasLivres.forEach((pericia) => {
    if (slotsLivres <= 0) {
      throw new Error('Quantidade de perícias excede o limite permitido.');
    }
    if (graus[pericia] !== 'Destreinado') {
      throw new Error(`A perícia ${pericia} já está treinada. Escolha outra.`);
    }
    graus[pericia] = 'Treinado';
    slotsLivres -= 1;
  });

  // Regra: o jogador escolhe suas perícias treinadas. Não preenchemos automaticamente.
  // Se o fluxo de UI permitir finalizar com escolhas incompletas, isso deve gerar aviso,
  // não alterar a ficha silenciosamente.
  if (slotsLivres > 0) {
    logs.push(`Faltam ${slotsLivres} perícia(s) livre(s) para escolher.`);
  }

  // Promoções de Grau de Treinamento (35%/70%) são escolhas do jogador e devem ser tratadas na progressão.
  return { graus, extrasFixos, extrasDados, logs, pendentesLivres: slotsLivres };
}

function calcularSlotsLivres(classe: ClasseName, intelecto: number): number {
  switch (classe) {
    case 'Combatente':
      return Math.max(1, 1 + intelecto);
    case 'Especialista':
      return Math.max(1, 7 + intelecto);
    case 'Ocultista':
      return Math.max(1, 3 + intelecto);
    case 'Sobrevivente':
      return Math.max(1, 1 + intelecto);
    default:
      return 1;
  }
}

function aplicarTrilhaEfeitos(params: {
  trilhaNome?: string;
  nex: number;
  atributos: Atributos;
  pericias: Record<PericiaName, GrauTreinamento>;
  extrasFixos: Partial<Record<PericiaName, number>>;
  extrasDados: Partial<Record<PericiaName, number>>;
  config?: TrilhaConfigOptions;
}): TrilhaEffectResult {
  const efeito: TrilhaEffectResult = {
    pvBonus: 0,
    extrasFixos: {},
    extrasDados: {},
    efeitos: [],
  };

  if (!params.trilhaNome) return efeito;

  const nome = params.trilhaNome;
  const adicionaPenaltySocial = (valor: number) => {
    const alvo = params.config?.monstruosoPericiaSocial ?? 'Diplomacia';
    efeito.extrasDados[alvo] = (efeito.extrasDados[alvo] ?? 0) - valor;
    efeito.efeitos.push(`Trilha ${nome}: penalidade de ${valor}O em ${alvo}.`);
  };

  if (nome === 'Monstruoso') {
    if (params.nex >= 10) {
      efeito.pvBonus += params.atributos.FOR;
      adicionaPenaltySocial(1);
      efeito.efeitos.push('Monstruoso (Traços da Entidade): resistência 5 ao elemento escolhido e +2 em ataques/dano C.A.C.');
    }
    if (params.nex >= 40) {
      efeito.efeitos.push('Monstruoso (Ser Macabro): penalidade aumenta para –2d20 na perícia social escolhida.');
      adicionaPenaltySocial(1);
    }
    if (params.nex >= 99) {
      efeito.efeitos.push('Monstruoso (Ascensão do Horror): aplique as alterações finais de atributo/ritual conforme elemento.');
    }
  } else if (nome === 'Agente Secreto' && params.nex >= 10) {
    const alvo: PericiaName = params.pericias.Diplomacia === 'Destreinado' ? 'Diplomacia' : 'Enganação';
    if (params.pericias[alvo] === 'Destreinado') {
      params.pericias[alvo] = 'Treinado';
      efeito.efeitos.push(`Agente Secreto: ${alvo} treinada pela Carteirada.`);
    } else {
      efeito.extrasFixos[alvo] = (efeito.extrasFixos[alvo] ?? 0) + 2;
      efeito.efeitos.push(`Agente Secreto: ${alvo} recebe +2 por Carteirada.`);
    }
  } else if (nome === 'Bibliotecário' && params.nex >= 40) {
    efeito.efeitos.push('Bibliotecário: Leitor Contumaz aumenta bônus da ação de ler para 2d8.');
  } else if (nome === 'Perseverante' && params.nex >= 99) {
    efeito.efeitos.push('Perseverante: Pode gastar 5 PE para permanecer com 1 PV (Só Mais um Passo...).');
  }

  return efeito;
}

function construirEfeitosAtivos(params: {
  origem: Origem;
  classe: ClasseName;
  sobreviventeBeneficioOrigem?: 'pericias' | 'poder' | 'ambos';
  trilhaEfeitos: string[];
  afinidade?: Elemento;
}): string[] {
  const efeitos: string[] = [];
  const aplicarPoderOrigem =
    params.classe === 'Sobrevivente' && params.sobreviventeBeneficioOrigem === 'pericias'
      ? false
      : true;
  if (aplicarPoderOrigem) {
    efeitos.push(`${params.origem.poder.nome}: ${params.origem.poder.descricao}`);
  }
  efeitos.push(...params.trilhaEfeitos);
  if (params.afinidade) {
    efeitos.push(`Afinidade ${params.afinidade}: rituais desse elemento não exigem componentes.`);
  }
  return efeitos;
}

function coletarPoderes(
  origem: Origem,
  classe: ClasseName,
  sobreviventeBeneficioOrigem?: 'pericias' | 'poder' | 'ambos',
): Poder[] {
  const poderes: Poder[] = [];

  const incluirOrigem =
    classe === 'Sobrevivente' && sobreviventeBeneficioOrigem === 'pericias'
      ? false
      : true;

  if (incluirOrigem) {
    poderes.push({
      nome: origem.poder.nome,
      descricao: origem.poder.descricao,
      tipo: classe === 'Sobrevivente' ? 'Sobrevivente' : 'Origem',
      livro: origem.livro,
    });
  }

  if (classe === 'Combatente') {
    poderes.push({
      nome: 'Ataque Especial',
      descricao: 'Quando faz um ataque, você pode gastar 2 PE para receber +5 no teste de ataque ou na rolagem de dano.',
      tipo: 'Classe',
      livro: 'Regras Básicas'
    });
  } else if (classe === 'Especialista') {
    poderes.push({
      nome: 'Eclético',
      descricao: 'Quando faz um teste de uma perícia, você pode gastar 2 PE para receber treinamento na perícia para aquele teste.',
      tipo: 'Classe',
      livro: 'Regras Básicas'
    });
  } else if (classe === 'Ocultista') {
    poderes.push({
      nome: 'Escolhido pelo Outro Lado',
      descricao: 'Você pode lançar rituais de 1º círculo.',
      tipo: 'Classe',
      livro: 'Regras Básicas'
    });
  } else if (classe === 'Sobrevivente') {
    poderes.push({
      nome: 'Empenho',
      descricao: 'Quando faz um teste de perícia, você pode gastar 1 PE para receber +2 nesse teste.',
      custo: '1 PE',
      tipo: 'Classe',
      livro: 'Sobrevivendo ao Horror'
    });
  }

  return poderes;
}

function gerarDetalhesPericia(params: {
  atributos: Atributos;
  graus: Record<PericiaName, GrauTreinamento>;
  extrasFixos: Partial<Record<PericiaName, number>>;
  extrasDados: Partial<Record<PericiaName, number>>;
}): Record<PericiaName, PericiaDetalhada> {
  const detalhes = {} as Record<PericiaName, PericiaDetalhada>;
  for (const pericia of TODAS_PERICIAS) {
    const atributoBase = PERICIA_ATRIBUTO[pericia];
    const atributoValor = params.atributos[atributoBase];
    const dadosBase = atributoValor > 0 ? atributoValor : 2;
    const criterio = atributoValor > 0 ? 'melhor' : 'pior';
    // O bônus fixo NÃO deve somar o valor do atributo. O atributo define os DADOS.
    // O bônus fixo vem APENAS do grau de treinamento e outros bônus (itens, poderes).
    const grau = params.graus[pericia] || 'Destreinado';
    const bonusFixo = GRAU_BONUS[grau] + (params.extrasFixos[pericia] ?? 0);
    const bonusO = params.extrasDados[pericia] ?? 0;
    detalhes[pericia] = {
      atributoBase,
      dados: dadosBase,
      criterio,
      bonusFixo,
      bonusO,
      grau: grau,
    };
  }
  return detalhes;
}

function combinePericiaBonus(
  ...fontes: Array<Partial<Record<PericiaName, number>> | undefined>
): Partial<Record<PericiaName, number>> {
  const resultado: Partial<Record<PericiaName, number>> = {};
  for (const fonte of fontes) {
    if (!fonte) continue;
    for (const [pericia, valor] of Object.entries(fonte)) {
      const chave = pericia as PericiaName;
      resultado[chave] = (resultado[chave] ?? 0) + (valor ?? 0);
    }
  }
  return resultado;
}

function calcularRecursos(params: {
  classe: ClasseName;
  atributos: Atributos;
  nex: number;
  estagio?: number;
  usarPd: boolean;
  patente: Patente;
  pvBonus?: number;
  peBonus?: number;
  sanBonus?: number;
}): RecursosResultado {
  const data = CLASS_RESOURCES[params.classe];

  const isSurvivor = params.classe === 'Sobrevivente';
  const niveisExtras = isSurvivor
    ? Math.max(0, (params.estagio || 1) - 1)
    : Math.max(0, Math.min(20, Math.max(1, Math.ceil(params.nex / 5))) - 1);

  const pvBase = data.pv.base + (data.pv.baseAttr ? params.atributos[data.pv.baseAttr] : 0);
  const peBase = data.pe.base + (data.pe.baseAttr ? params.atributos[data.pe.baseAttr] : 0);
  const sanBase = data.san.base;

  const pv =
    pvBase +
    niveisExtras * (data.pv.porNivel + (data.pv.porNivelAttr ? params.atributos[data.pv.porNivelAttr] : 0)) +
    (params.pvBonus ?? 0);
  const pe =
    peBase +
    niveisExtras * (data.pe.porNivel + (data.pe.porNivelAttr ? params.atributos[data.pe.porNivelAttr] : 0)) +
    (params.peBonus ?? 0);
  const san = sanBase + niveisExtras * data.san.porNivel + (params.sanBonus ?? 0);

  const resultado: RecursosResultado = { pv, pe, san };

  if (params.usarPd) {
    const pd = calcularPd(params.classe, params.atributos, params.nex, params.estagio, params.patente);
    resultado.pd = pd;
    resultado.pe = 0;
    resultado.san = 0;
  }

  return resultado;
}

function calcularPd(
  classe: ClasseName,
  atributos: Atributos,
  nex: number,
  estagio: number | undefined,
  patente: Patente,
  modo: 'NEX' | 'PATENTE' = 'NEX'
): number {
  const presenca = atributos.PRE;

  const cfg = PD_NEX_CONFIG[classe];
  const base = cfg.base + presenca;

  if (classe === 'Sobrevivente') {
    const estagioAtual = estagio ?? 1;
    const incrementos = Math.max(0, estagioAtual - 1);
    const valorPorNivel = cfg.porNivel;
    return base + incrementos * valorPorNivel;
  }

  const nivel = Math.min(20, Math.max(1, Math.ceil(Math.max(nex, 0) / 5)));
  const incrementos = Math.max(0, nivel - 1);
  // SaH p.104: a cada novo NEX soma (porNivel + PRE)
  const valorPorNivel = cfg.porNivel + presenca;
  return base + incrementos * valorPorNivel;
}

export function calcularPericiasDetalhadas(
  atributos: Atributos,
  graus: Record<PericiaName, GrauTreinamento>,
  extras?: {
    fixos?: Partial<Record<PericiaName, number>>;
    dados?: Partial<Record<PericiaName, number>>;
  },
): Record<PericiaName, PericiaDetalhada> {
  return gerarDetalhesPericia({
    atributos,
    graus,
    extrasFixos: extras?.fixos ?? {},
    extrasDados: extras?.dados ?? {},
  });
}

export function calcularRecursosClasse(params: {
  classe: ClasseName;
  atributos: Atributos;
  nex: number;
  estagio?: number;
  patente: Patente;
  usarPd?: boolean;
  pvBonus?: number;
}) {
  return calcularRecursos({
    classe: params.classe,
    atributos: params.atributos,
    nex: params.nex,
    estagio: params.estagio,
    usarPd: params.usarPd ?? false,
    patente: params.patente,
    pvBonus: params.pvBonus,
  });
}

export function calcularCarga(params: {
  atributos: Atributos;
  itens: Item[];
  poderes: Poder[];
  bonusCarga?: number;
}): { atual: number; maxima: number } {
  const forca = params.atributos.FOR;
  let cargaMaxima = Math.max(5, forca * 5);

  const temMochilaMilitar = params.itens.some(i => i.nome === 'Mochila Militar');
  if (temMochilaMilitar) cargaMaxima += 2;

  const temMascate = params.poderes.some(p => p.nome === 'Mascate');
  if (temMascate) cargaMaxima += 5;

  if (params.bonusCarga) cargaMaxima += params.bonusCarga;

  let cargaAtual = 0;
  for (const item of params.itens) {
    cargaAtual += item.espaco;
  }

  return { atual: cargaAtual, maxima: cargaMaxima };
}

/**
 * Cria um objeto de bônus de origem vazio (para quando o poder não se aplica)
 */
function criarBonusOrigemVazio(): BonusPoderOrigem {
  return {
    pvBonus: 0,
    peBonus: 0,
    sanBonus: 0,
    defesaBonus: 0,
    danoCorpoACorpoBonus: 0,
    danoArmaFogoBonus: 0,
    resistenciaDanoMental: 0,
    periciaFixos: {},
    periciaDados: {},
    efeitos: [],
  };
}

/**
 * Calcula os bônus mecânicos concedidos pelo poder da origem do personagem.
 * Esses bônus são aplicados automaticamente ao personagem.
 */
function calcularBonusPoderOrigem(
  origem: Origem,
  nex: number,
  atributos: Atributos
): BonusPoderOrigem {
  const bonus = criarBonusOrigemVazio();
  const nomeOrigem = origem.nome;
  const nomePoder = origem.poder.nome;

  switch (nomeOrigem) {
    // ===================================================================
    // BÔNUS DE PV
    // ===================================================================
    case 'Desgarrado':
      // Calejado: +1 PV para cada 5% de NEX
      bonus.pvBonus = Math.floor(nex / 5);
      bonus.efeitos.push(`Calejado: +${bonus.pvBonus} PV (${nex}% NEX ÷ 5)`);
      break;

    case 'Mergulhador':
      // Fôlego de Nadador: +5 PV
      bonus.pvBonus = 5;
      bonus.efeitos.push('Fôlego de Nadador: +5 PV');
      break;

    // ===================================================================
    // BÔNUS DE PE
    // ===================================================================
    case 'Universitário':
      // Dedicação: +1 PE, e +1 PE adicional a cada NEX ímpar
      // NEX 5, 15, 25, 35, 45, 55, 65, 75, 85, 95, 99
      const nexImpares = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95, 99].filter(n => nex >= n).length;
      bonus.peBonus = 1 + nexImpares;
      bonus.efeitos.push(`Dedicação: +${bonus.peBonus} PE (1 base + ${nexImpares} por NEX ímpar)`);
      break;

    // ===================================================================
    // BÔNUS DE SANIDADE
    // ===================================================================
    case 'Vítima':
      // Cicatrizes Psicológicas: +1 SAN para cada 5% de NEX
      bonus.sanBonus = Math.floor(nex / 5);
      bonus.efeitos.push(`Cicatrizes Psicológicas: +${bonus.sanBonus} SAN (${nex}% NEX ÷ 5)`);
      break;

    // ===================================================================
    // BÔNUS DE DEFESA
    // ===================================================================
    case 'Policial':
      // Patrulha: +2 Defesa
      bonus.defesaBonus = 2;
      bonus.efeitos.push('Patrulha: +2 Defesa');
      break;

    // ===================================================================
    // BÔNUS DE DANO
    // ===================================================================
    case 'Lutador':
      // Mão Pesada: +2 dano corpo a corpo
      bonus.danoCorpoACorpoBonus = 2;
      bonus.efeitos.push('Mão Pesada: +2 dano corpo a corpo');
      break;

    case 'Militar':
      // Para Bellum: +2 dano com armas de fogo
      bonus.danoArmaFogoBonus = 2;
      bonus.efeitos.push('Para Bellum: +2 dano com armas de fogo');
      break;

    // ===================================================================
    // BÔNUS DE PERÍCIAS (FIXOS)
    // ===================================================================
    case 'Diplomata':
      // Conexões: +2 Diplomacia
      bonus.periciaFixos.Diplomacia = 2;
      bonus.efeitos.push('Conexões: +2 Diplomacia');
      break;

    case 'Profetizado':
      // Luta ou Fuga: +2 Vontade
      bonus.periciaFixos.Vontade = 2;
      bonus.efeitos.push('Luta ou Fuga: +2 Vontade');
      break;

    case 'Religioso':
      // Acalentar: +5 Religião para acalmar
      bonus.periciaFixos.Religião = 5;
      bonus.efeitos.push('Acalentar: +5 Religião (para acalmar)');
      break;

    case 'Experimento':
      // Mutação: +2 em uma perícia FOR/AGI/VIG (aqui aplicamos em Atletismo como padrão)
      // e -O em Diplomacia
      bonus.periciaFixos.Atletismo = 2;
      bonus.periciaDados.Diplomacia = -1;
      bonus.efeitos.push('Mutação: +2 Atletismo, –1d20 Diplomacia');
      break;

    // ===================================================================
    // RESISTÊNCIA A DANO MENTAL
    // ===================================================================
    case 'Teórico da Conspiração':
      // Eu Já Sabia: resistência a dano mental = Intelecto
      bonus.resistenciaDanoMental = atributos.INT;
      bonus.efeitos.push(`Eu Já Sabia: RD ${atributos.INT} dano mental`);
      break;

    // ===================================================================
    // OUTROS PODERES (sem efeitos numéricos automáticos)
    // Estes são listados como efeitos textuais apenas
    // ===================================================================
    case 'Acadêmico':
      bonus.efeitos.push('Saber é Poder: gaste 2 PE para +5 em teste INT');
      break;

    case 'Agente de Saúde':
      bonus.efeitos.push('Técnica Medicinal: +INT em PV curados');
      break;

    case 'Astronauta':
      bonus.efeitos.push('Acostumado ao Extremo: gaste PE para –5 dano fogo/frio/mental');
      break;

    case 'Atleta':
      bonus.efeitos.push('110%: gaste 2 PE para +5 em teste FOR/AGI (exceto Luta/Pontaria)');
      break;

    case 'Criminoso':
      bonus.efeitos.push('O Crime Compensa: pode guardar item encontrado');
      break;

    case 'Investigador':
      bonus.efeitos.push('Faro para Pistas: 1x/cena, 1 PE para +5 em procurar pistas');
      break;

    case 'Magnata':
      bonus.efeitos.push('Patrocinador da Ordem: crédito +1 categoria');
      break;

    case 'Mercenário':
      bonus.efeitos.push('Posição de Combate: 1º turno, 2 PE para ação de movimento extra');
      break;

    case 'Servidor Público':
      bonus.efeitos.push('Espírito Cívico: gaste 1 PE para +2 ao ajudar');
      break;

    case 'T.I.':
      bonus.efeitos.push('Motor de Busca: com internet, 2 PE para usar Tecnologia em vez de outra perícia');
      break;

    case 'Trabalhador Rural':
      bonus.efeitos.push('Desbravador: 2 PE para +5 Adestramento/Sobrevivência, sem penalidade terreno difícil');
      break;

    case 'Trambiqueiro':
      bonus.efeitos.push('Impostor: 1x/cena, 2 PE para usar Enganação em vez de outra perícia');
      break;
  }

  return bonus;
}

export { calcularBonusPoderOrigem, criarBonusOrigemVazio };
