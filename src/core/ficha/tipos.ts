import type {
  AtributoKey,
  Atributos,
  ClasseName,
  Elemento,
  Marca,
  PericiaName,
} from '../types';

export interface FichaIdentidade {
  nome: string;
  conceito?: string;
  classe: ClasseName;
  origem: string;
  atributosBase: Atributos;
  periciasLivres: PericiaName[];
  beneficioOrigem?: 'pericias' | 'poder' | 'ambos';
  livroBase?: 'Regras Básicas' | 'Sobrevivendo ao Horror';
}

export interface Progressao {
  nex: number;
  estagio?: number;
}

export type SlotKind =
  | 'trilha'
  | 'trilhaHabilidade'
  | 'poderClasse'
  | 'atributo'
  | 'pericia'
  | 'afinidade'
  | 'versatilidade'
  | 'ritual'
  | 'poderParanormal'
  | 'poderDiletante'
  | 'origem'
  | 'escolhaInterna';

export type ChaveNivel = `nex:${number}` | `est:${number}`;

export type EscolhaId = string;

export interface Slot {
  id: EscolhaId;
  kind: SlotKind;
  chaveNivel: ChaveNivel;
  nivel: number;
  quantidade: number;
  paiId?: EscolhaId;
  poderPai?: string;
  rotulo: string;
}

export type ValorEscolha =
  | { tipo: 'trilha'; trilha: string }
  | { tipo: 'versatilidade'; trilha: string }
  | { tipo: 'poder'; poder: string }
  | { tipo: 'atributo'; atributo: AtributoKey }
  | { tipo: 'pericias'; pericias: PericiaName[] }
  | { tipo: 'afinidade'; elemento: Elemento }
  | { tipo: 'ritual'; ritual: string }
  | { tipo: 'origem'; origem: string }
  | { tipo: 'habilidadeTrilha'; habilidade: string; escolhaInterna?: string }
  | { tipo: 'escolhaInterna'; valor: string };

export interface Escolha {
  id: EscolhaId;
  valor: ValorEscolha;
}

export interface AjustesGm {
  pvMaxDelta?: number;
  peMaxDelta?: number;
  sanMaxDelta?: number;
  pdMaxDelta?: number;
  defesaDelta?: number;
  periciaFixos?: Partial<Record<PericiaName, number>>;
  poderesManuais?: string[];
  nota?: string;
}

export interface EstadoSessao {
  pvDano: number;
  peGasto: number;
  sanPerdida: number;
  pdGasto?: number;
  condicoes?: string[];
  pontosPrestigio?: number;
  marcas?: Marca[];
}

export interface FichaPersistida {
  versao: 2;
  identidade: FichaIdentidade;
  progressao: Progressao;
  escolhas: Escolha[];
  sessao: EstadoSessao;
  ajustes: AjustesGm;
}

export interface Pendencia {
  slot: Slot;
}

export type GravidadeProblema = 'erro' | 'aviso' | 'info';

export interface Problema {
  gravidade: GravidadeProblema;
  codigo: string;
  mensagem: string;
  escolhaId?: EscolhaId;
}

export type PoderProvenancia =
  | { kind: 'origem'; origem: string }
  | { kind: 'classeAutomatica'; nivel: number }
  | { kind: 'classe' | 'versatilidade' | 'paranormal'; nivel: number; escolhaId: EscolhaId }
  | { kind: 'trilha'; trilha: string; nivel: number }
  | { kind: 'manual'; nota?: string };

export interface PoderDerivado {
  nome: string;
  provenancia: PoderProvenancia;
  escolhaInterna?: string;
}
