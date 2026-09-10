import { MAXIMO_AVALIACAO, MAXIMO_IMPETO, type AtributoOp2, type DiceStep, type Ocupacao, type Perfil } from './tipos';

export type FonteDaHabilidade = {
  pacote: 'Playtest Alpha';
  local: 'cartão de personagem' | 'livro';
  pagina?: number;
  personagem?: string;
};

export type CustoOp2 =
  | { tipo: 'nenhum' }
  | { tipo: 'pd'; quantidade: number }
  | { tipo: 'pv'; quantidade: number }
  | { tipo: 'impeto'; espacos: 1 | 3 }
  | { tipo: 'avaliacao'; dados: 1 | 2 };

export interface FiltroTeste {
  atributo?: AtributoOp2;
  exigeAlvoAvaliado?: true;
}

export type GatilhoOp2 =
  | { quando: 'aoFalharTeste'; efeito: { tipo: 'encherImpeto'; quantidade: number } }
  | {
      quando: 'antesDoTeste';
      filtro?: FiltroTeste;
      custo: CustoOp2;
      efeito: { tipo: 'passo'; quantidade: number } | { tipo: 'dadoExtra'; dado: DiceStep; quantidade: number };
    }
  | { quando: 'inicioDeCena'; custo: CustoOp2; efeito: { tipo: 'passoAteFimDaCena'; quantidade: number } }
  | { quando: 'inicioDeConflito'; custo: CustoOp2; efeito: { tipo: 'agirPrimeiro' } }
  | { quando: 'acao'; custo: CustoOp2; efeito: { tipo: 'concederDadosDeAvaliacao'; dado: DiceStep; quantidade: number } }
  | { quando: 'aoAjudar'; custo: CustoOp2; efeito: { tipo: 'substituirDadoPelaRA'; dt: number } }
  | { quando: 'narrativa' };

export interface HabilidadeOp2 {
  id: string;
  nome: string;
  origem: { tipo: 'perfil'; perfil: Perfil } | { tipo: 'ocupacao'; ocupacao: Ocupacao };
  descricao: string;
  gatilho: GatilhoOp2;
  fonte: FonteDaHabilidade;
}

const CARTAO = (personagem: string): FonteDaHabilidade => ({
  pacote: 'Playtest Alpha',
  local: 'cartão de personagem',
  personagem,
});

const TEXTO_IMPETO =
  'Você possui uma barra de ímpeto com três espaços. Sempre que falha em um teste, você preenche um espaço na barra. Você pode apagar espaços preenchidos para: gastar 1 espaço, receber +1 passo (+A) em um teste; gastar 3 espaços, aumentar um atributo em um passo até o fim da cena.';

const TEXTO_AVALIACAO =
  'Você pode gastar uma ação e 2 PD para observar um ser ou um ambiente. Você recebe 2 dados bônus d4 que pode usar em testes relativos àquele ser ou ambiente (você pode usá-los como quiser, recebendo +d4 d4 em um teste ou +d4 em dois testes). Você não pode acumular mais do que dois dados bônus por esta habilidade.';

export const HABILIDADES_OP2: readonly HabilidadeOp2[] = [
  {
    id: 'impeto',
    nome: 'Ímpeto',
    origem: { tipo: 'perfil', perfil: 'EXECUTOR' },
    descricao: TEXTO_IMPETO,
    gatilho: { quando: 'aoFalharTeste', efeito: { tipo: 'encherImpeto', quantidade: 1 } },
    fonte: CARTAO('Alan'),
  },
  {
    id: 'impeto.passo',
    nome: 'Ímpeto — impulso',
    origem: { tipo: 'perfil', perfil: 'EXECUTOR' },
    descricao: 'Gaste 1 espaço de ímpeto para receber +1 passo (+A) em um teste.',
    gatilho: {
      quando: 'antesDoTeste',
      custo: { tipo: 'impeto', espacos: 1 },
      efeito: { tipo: 'passo', quantidade: 1 },
    },
    fonte: CARTAO('Alan'),
  },
  {
    id: 'impeto.atributo',
    nome: 'Ímpeto — superação',
    origem: { tipo: 'perfil', perfil: 'EXECUTOR' },
    descricao: 'Gaste 3 espaços de ímpeto para aumentar um atributo em um passo até o fim da cena.',
    gatilho: {
      quando: 'inicioDeCena',
      custo: { tipo: 'impeto', espacos: 3 },
      efeito: { tipo: 'passoAteFimDaCena', quantidade: 1 },
    },
    fonte: CARTAO('Alan'),
  },
  {
    id: 'avaliacao',
    nome: 'Avaliação',
    origem: { tipo: 'perfil', perfil: 'ANALISTA' },
    descricao: TEXTO_AVALIACAO,
    gatilho: {
      quando: 'acao',
      custo: { tipo: 'pd', quantidade: 2 },
      efeito: { tipo: 'concederDadosDeAvaliacao', dado: 'd4', quantidade: MAXIMO_AVALIACAO },
    },
    fonte: CARTAO('Eloísa'),
  },
  {
    id: 'avaliacao.gastar',
    nome: 'Avaliação — usar dado bônus',
    origem: { tipo: 'perfil', perfil: 'ANALISTA' },
    descricao: 'Gaste um ou dois dados de Avaliação em um teste relativo ao ser ou ambiente observado.',
    gatilho: {
      quando: 'antesDoTeste',
      filtro: { exigeAlvoAvaliado: true },
      custo: { tipo: 'avaliacao', dados: 1 },
      efeito: { tipo: 'dadoExtra', dado: 'd4', quantidade: 1 },
    },
    fonte: CARTAO('Eloísa'),
  },
  {
    id: 'prontidao',
    nome: 'Prontidão',
    origem: { tipo: 'perfil', perfil: 'VIGILANTE' },
    descricao:
      'No início de qualquer conflito, você pode gastar 3 PD. Se fizer isso, ganha uma rodada na qual pode agir antes dos demais personagens e NPCs.',
    gatilho: {
      quando: 'inicioDeConflito',
      custo: { tipo: 'pd', quantidade: 3 },
      efeito: { tipo: 'agirPrimeiro' },
    },
    fonte: CARTAO('Victor'),
  },
  {
    id: 'foco.mente',
    nome: 'Foco Mental',
    origem: { tipo: 'ocupacao', ocupacao: 'Cientista' },
    descricao: 'Quando faz um teste mental, você pode gastar 2 PD para receber +1 passo (+A) no teste.',
    gatilho: {
      quando: 'antesDoTeste',
      filtro: { atributo: 'MENTE' },
      custo: { tipo: 'pd', quantidade: 2 },
      efeito: { tipo: 'passo', quantidade: 1 },
    },
    fonte: CARTAO('Alan'),
  },
  {
    id: 'foco.emocao',
    nome: 'Foco Emocional',
    origem: { tipo: 'ocupacao', ocupacao: 'Artista' },
    descricao: 'Quando faz um teste emocional, você pode gastar 2 PD para receber +1 passo (+A) no teste.',
    gatilho: {
      quando: 'antesDoTeste',
      filtro: { atributo: 'EMOCAO' },
      custo: { tipo: 'pd', quantidade: 2 },
      efeito: { tipo: 'passo', quantidade: 1 },
    },
    fonte: CARTAO('Eloísa'),
  },
  {
    id: 'mentoria',
    nome: 'Mentoria',
    origem: { tipo: 'ocupacao', ocupacao: 'Professor' },
    descricao:
      'Quando ajuda outro personagem, você pode fazer um teste da perícia que usou para ajudar contra DT 7. Se passar, o personagem ajudado pode substituir um dos dados rolados por ele pela sua rolagem alta.',
    gatilho: {
      quando: 'aoAjudar',
      custo: { tipo: 'nenhum' },
      efeito: { tipo: 'substituirDadoPelaRA', dt: 7 },
    },
    fonte: CARTAO('Victor'),
  },
  {
    id: 'esforcoESuor',
    nome: 'Esforço e Suor',
    origem: { tipo: 'ocupacao', ocupacao: 'Operário' },
    descricao: 'Você possui uma perícia física aumentada para d6 (já contabilizado na ficha).',
    gatilho: { quando: 'narrativa' },
    fonte: CARTAO('Edgar'),
  },
  {
    id: 'conhecimentoTecnico',
    nome: 'Conhecimento Técnico',
    origem: { tipo: 'ocupacao', ocupacao: 'Profissional de Escritório' },
    descricao: 'Você possui uma perícia mental aumentada para d6 (já contabilizado na ficha).',
    gatilho: { quando: 'narrativa' },
    fonte: CARTAO('Kênia'),
  },
];

const INDICE = new Map(HABILIDADES_OP2.map((habilidade) => [habilidade.id, habilidade]));

export function habilidadePorId(id: string): HabilidadeOp2 | undefined {
  return INDICE.get(id);
}

export function habilidadesDoPerfil(perfil: Perfil): HabilidadeOp2[] {
  return HABILIDADES_OP2.filter(
    (habilidade) => habilidade.origem.tipo === 'perfil' && habilidade.origem.perfil === perfil,
  );
}

export function habilidadesDaOcupacao(ocupacao: Ocupacao): HabilidadeOp2[] {
  return HABILIDADES_OP2.filter(
    (habilidade) => habilidade.origem.tipo === 'ocupacao' && habilidade.origem.ocupacao === ocupacao,
  );
}

export function temEfeitoEmRuntime(habilidade: HabilidadeOp2): boolean {
  return habilidade.gatilho.quando !== 'narrativa';
}

export interface ContextoDeElegibilidade {
  atributoDoTeste: AtributoOp2;
  impetoPreenchido: number;
  avaliacaoDisponivel: number;
  pdAtual: number;
  pvAtual: number;
  alvoFoiAvaliado: boolean;
}

export function custoCabe(custo: CustoOp2, contexto: ContextoDeElegibilidade): boolean {
  switch (custo.tipo) {
    case 'nenhum':
      return true;
    case 'pd':
      return contexto.pdAtual >= custo.quantidade;
    case 'pv':
      return contexto.pvAtual >= custo.quantidade;
    case 'impeto':
      return contexto.impetoPreenchido >= custo.espacos;
    case 'avaliacao':
      return contexto.avaliacaoDisponivel >= custo.dados;
  }
}

export function elegivelAntesDoTeste(
  habilidade: HabilidadeOp2,
  contexto: ContextoDeElegibilidade,
): boolean {
  const gatilho = habilidade.gatilho;
  if (gatilho.quando !== 'antesDoTeste') return false;
  if (gatilho.filtro?.atributo && gatilho.filtro.atributo !== contexto.atributoDoTeste) return false;
  if (gatilho.filtro?.exigeAlvoAvaliado && !contexto.alvoFoiAvaliado) return false;
  return custoCabe(gatilho.custo, contexto);
}

export function habilidadesElegiveisAntesDoTeste(
  ids: readonly string[],
  contexto: ContextoDeElegibilidade,
): HabilidadeOp2[] {
  return ids
    .map(habilidadePorId)
    .filter((habilidade): habilidade is HabilidadeOp2 => habilidade !== undefined)
    .filter((habilidade) => elegivelAntesDoTeste(habilidade, contexto));
}

export { MAXIMO_IMPETO, MAXIMO_AVALIACAO };
