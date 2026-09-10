export type DiceStep = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

export const ESCALA_PASSOS = ['d4', 'd6', 'd8', 'd10', 'd12'] as const;

export type PassoNaEscala = (typeof ESCALA_PASSOS)[number];

export type AtributoOp2 = 'FISICO' | 'MENTE' | 'EMOCAO';

export const ATRIBUTOS_OP2: readonly AtributoOp2[] = ['FISICO', 'MENTE', 'EMOCAO'];

export const ROTULO_ATRIBUTO: Record<AtributoOp2, string> = {
  FISICO: 'Físico',
  MENTE: 'Mente',
  EMOCAO: 'Emoção',
};

export type PericiaOp2 =
  | 'Acrobacia'
  | 'Atletismo'
  | 'Crime'
  | 'Disciplina'
  | 'Enganação'
  | 'Furtividade'
  | 'Intimidar'
  | 'Intuição'
  | 'Luta'
  | 'Máquinas'
  | 'Medicina'
  | 'Ocultismo'
  | 'Percepção'
  | 'Persuasão'
  | 'Pesquisar'
  | 'Pontaria'
  | 'Sobrevivência'
  | 'Tecnologia'
  | 'Vigor';

export type CampoAptidao =
  | 'Artes'
  | 'Atualidades'
  | 'Burocracia'
  | 'Exatas'
  | 'Humanas'
  | 'Tática';

export type RefPericia =
  | { tipo: 'pericia'; nome: PericiaOp2 }
  | { tipo: 'aptidao'; campo: CampoAptidao };

export type Perfil = 'EXECUTOR' | 'ANALISTA' | 'VIGILANTE';

export type Ocupacao =
  | 'Cientista'
  | 'Professor'
  | 'Artista'
  | 'Operário'
  | 'Profissional de Escritório';

export const MAXIMO_IMPETO = 3;
export const MAXIMO_AVALIACAO = 2;

export type RecursoDePerfil =
  | { tipo: 'EXECUTOR'; impetoPreenchido: number }
  | { tipo: 'ANALISTA'; avaliacaoDisponivel: number }
  | { tipo: 'VIGILANTE' };

export interface PassoDeCena {
  alvo: AtributoOp2;
  delta: number;
  motivo: string;
}

export interface EstadoSessaoOp2 {
  pvDano: number;
  pdGasto: number;
  passosDeCena: PassoDeCena[];
  testesDeFerimentoFeitos: number;
  testesDeTraumaFeitos: number;
  condicoes: string[];
}

export type RevisaoRegrasOp2 = 'playtest-alpha';

export interface FichaOp2 {
  versaoDocumento: 1;
  sistema: 'op2';
  revisaoRegras: RevisaoRegrasOp2;

  id: string;
  nome: string;
  nivel: number;
  ocupacao: Ocupacao;
  perfil: RecursoDePerfil;

  atributos: Record<AtributoOp2, DiceStep>;
  pericias: Record<PericiaOp2, DiceStep>;
  aptidoes: Record<CampoAptidao, DiceStep>;

  pvMax: number;
  pdMax: number;

  habilidades: string[];

  sessao: EstadoSessaoOp2;
  anotacoes?: string;
}

export const NIVEL_MINIMO = 1;
export const NIVEL_MAXIMO = 10;
