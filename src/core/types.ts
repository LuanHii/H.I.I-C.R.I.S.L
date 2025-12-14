export type AtributoKey = 'AGI' | 'FOR' | 'INT' | 'PRE' | 'VIG';

export type Atributos = Record<AtributoKey, number>;

export type ClasseName = 'Combatente' | 'Especialista' | 'Ocultista' | 'Sobrevivente';

export type Patente =
  | 'Recruta'
  | 'Operador'
  | 'Agente Especial'
  | 'Oficial de Operações'
  | 'Agente de Elite';

export type PericiaName = 
  | 'Acrobacia' | 'Adestramento' | 'Artes' | 'Atletismo' | 'Atualidades' 
  | 'Ciências' | 'Crime' | 'Diplomacia' | 'Enganação' | 'Fortitude' 
  | 'Furtividade' | 'Iniciativa' | 'Intimidação' | 'Intuição' | 'Investigação' 
  | 'Luta' | 'Medicina' | 'Ocultismo' | 'Percepção' | 'Pilotagem' 
  | 'Pontaria' | 'Profissão' | 'Reflexos' | 'Religião' | 'Sobrevivência' 
  | 'Tática' | 'Tecnologia' | 'Vontade';

export type GrauTreinamento = 'Destreinado' | 'Treinado' | 'Veterano' | 'Expert';

export interface LimiteItens {
  I: number;
  II: number;
  III: number;
  IV: number;
}

export interface PatenteConfig {
  nome: Patente;
  credito: 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto' | 'Ilimitado';
  limiteItens: LimiteItens;
  nexMin: number;
}

export interface ClasseStats {
  pvInicial: number;
  pvPorNivel: number;
  peInicial: number;
  pePorNivel: number;
  sanInicial: number;
  sanPorNivel: number;
  pdInicial: number;
  pdPorNivel: number;
  periciasIniciais: number;
  periciasObrigatorias: PericiaName[];
  proficiencias: string[];
}

export interface Origem {
  nome: string;
  pericias: PericiaName[];
  periciasTexto?: string;
  poder: {
    nome: string;
    descricao: string;
  };
  livro: 'Regras Básicas' | 'Sobrevivendo ao Horror';
}

export type Elemento = 'Sangue' | 'Morte' | 'Conhecimento' | 'Energia' | 'Medo';

export interface Poder {
  nome: string;
  descricao: string;
  tipo: 'Classe' | 'Paranormal' | 'Origem' | 'Geral' | 'Trilha' | 'Sobrevivente';
  elemento?: Elemento;
  requisitos?: string;
  custo?: string;
  acao?: string;
  livro: 'Regras Básicas' | 'Sobrevivendo ao Horror';
}

export interface Ritual {
  nome: string;
  elemento: Elemento;
  circulo: 1 | 2 | 3 | 4;
  execucao: string;
  alcance: string;
  alvo: string;
  duracao: string;
  resistencia?: string;
  descricao: string;
  efeito: {
    padrao: string;
    discente?: string;
    verdadeiro?: string;
  };
  livro: 'Regras Básicas' | 'Sobrevivendo ao Horror';
}

export interface Ameaca {
  nome: string;
  vd: number;
  tipo: string;
  tamanho: string;
  atributos: Atributos;
  pericias: Partial<Record<PericiaName, string>>;
  defesa: number;
  vida: number;
  sentidos?: string;
  fortitude?: string;
  reflexos?: string;
  vontade?: string;
  imunidades?: string[];
  resistencias?: string[];
  vulnerabilidades?: string[];
  deslocamento?: string;
  presencaPerturbadora?: {
    dt: number;
    dano: string;
    nexImune?: number;
  };
  acoes: {
    nome: string;
    descricao: string;
    tipo?: string;
    teste?: string;
    dano?: string;
  }[];
  habilidades: {
    nome: string;
    descricao: string;
  }[];
  enigmaDeMedo?: string;
  livro: 'Regras Básicas' | 'Sobrevivendo ao Horror';
}

export interface Item {
  nome: string;
  categoria: 0 | 1 | 2 | 3 | 4;
  espaco: number;
  tipo: 'Arma' | 'Proteção' | 'Acessório' | 'Geral' | 'Amaldiçoado' | 
        'Modificação Paranormal (Acessório)' | 
        'Amaldiçoado (Sangue)' | 'Amaldiçoado (Sangue/Energia)' | 'Amaldiçoado (Morte)' | 'Amaldiçoado (Conhecimento)' | 'Amaldiçoado (Energia)' |
        'Geral (Acessório)' | 'Geral (Utensílio)' | 'Geral (Medicamento)' | 'Geral (Operacional)' |
        'Explosivo' | 'Paranormal';
  descricao: string;
  stats?: {
    dano?: string;
    tipoDano?: string;
    critico?: string;
    alcance?: string;
    defesa?: number;
    resistencia?: number;
  };
  livro: 'Regras Básicas' | 'Sobrevivendo ao Horror';
}

export interface Weapow {
  nome: string;
  categoria: 0 | 1 | 2 | 3 | 4;
  espaco: number;
  tipo: string;
  proficiencia: string;
  descricao: string;
  stats: {
    Dano_Base: string;
    Dano_Tipo: string;
    Critico: string;
    Alcance: string;
  };
  livro: string;
}

export interface Trilha {
  nome: string;
  classe: ClasseName;
  descricao: string;
  habilidades: {
    nex: number;
    nome: string;
    descricao: string;
    escolha?: {
      tipo: 'pericia' | 'elemento' | 'arma' | 'atributo' | 'ritual' | 'custom';
      quantidade: number;
      opcoes?: string[];
    };
  }[];
  livro: 'Regras Básicas' | 'Sobrevivendo ao Horror';
}

export interface PericiaDetalhada {
  atributoBase: AtributoKey;
  dados: number;
  criterio: 'melhor' | 'pior';
  bonusFixo: number;
  bonusO: number;
  grau: GrauTreinamento;
}

export interface NexEvento {
  requisito: number;
  tipo:
    | 'Trilha'
    | 'Atributo'
    | 'Poder'
    | 'Pericia'
    | 'Afinidade'
    | 'Versatilidade'
    | 'Patente';
  descricao: string;
  desbloqueado: boolean;
}

export interface EfeitoCondicao {
  defesa?: number;
  pericias?: {
    atributos?: AtributoKey[];
    penalidadeDados?: number;
    penalidadeValor?: number;
  };
  deslocamento?: 'zero' | 'metade';
  acoes?: 'nenhuma' | 'mentais' | 'padrao';
}

export interface Condicao {
  nome: string;
  descricao: string;
  efeito?: EfeitoCondicao;
}

export interface LogEntry {
  timestamp: number;
  mensagem: string;
  tipo: 'dano' | 'cura' | 'gasto' | 'condicao' | 'sistema';
}

export interface Personagem {
  nome: string;
  conceito?: string;
  classe: ClasseName;
  origem: string;
  nex: number;
  estagio?: number;
  patente?: Patente;
  pontosAtributoPendentes?: number;
  periciasTreinadasPendentes?: number;
  // Promoção de grau de treinamento em marcos de NEX (35%/70%).
  // Quando presente, o jogador/mestre deve escolher perícias elegíveis para promover.
  periciasPromocaoPendentes?: {
    alvo: 'Veterano' | 'Expert';
    restante: number;
  };
  escolhaTrilhaPendente?: boolean;
  habilidadesTrilhaPendentes?: {
    trilha: string;
    habilidade: string;
    escolha: {
      tipo: 'pericia' | 'elemento' | 'arma' | 'atributo' | 'ritual' | 'custom';
      quantidade: number;
      opcoes?: string[];
    };
  }[];
  trilha?: string;
  afinidade?: Elemento;
  atributos: Atributos;
  pericias: Record<PericiaName, GrauTreinamento>;
  periciasDetalhadas: Record<PericiaName, PericiaDetalhada>;
  pv: { atual: number; max: number; temp: number; machucado: number };
  pe: { atual: number; max: number; rodada: number };
  san: { atual: number; max: number; perturbado: boolean };
  pd?: { atual: number; max: number };
  usarPd?: boolean;
  ativo?: boolean;
  defesa: number;
  deslocamento: number;
  carga: { atual: number; maxima: number };
  limiteItens: LimiteItens;
  eventosNex: NexEvento[];
  equipamentos: Item[];
  poderes: Poder[];
  rituais: Ritual[];
  proficiencias: string[];
  efeitosAtivos: string[];
  log?: LogEntry[];
  // Overrides persistentes (modo Mestre/Operador) para ajustes pontuais fora da regra padrão.
  // Sempre que possível, o sistema deve calcular derivados automaticamente; overrides existem
  // para casos excepcionais (regras da casa, correções de ficha, bônus temporários).
  overrides?: {
    pvMax?: number;
    peMax?: number;
    sanMax?: number;
    pdMax?: number;
    // Bônus fixos adicionais (delta) por perícia. Soma ao bônus calculado (grau + outros bônus).
    periciaFixos?: Partial<Record<PericiaName, number>>;
  };
}
