import type { Efeito } from './rules/efeitos';

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
  /**
   * Pontos de Prestígio mínimos para a patente (Tabela 3.1).
   *
   * Patente é posição hierárquica na Ordem e NÃO deriva do NEX, que mede poder
   * individual — o livro é explícito nisso (Cap. 3, "Patente"). Antes deste
   * campo o motor usava `nexMin`, o que acoplava as duas escalas.
   */
  ppMin: number;
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
  periciasExtras?: number;
  poder: {
    nome: string;
    descricao: string;
    /**
     * Efeitos mecânicos estruturados. Quando presente, é a fonte de verdade —
     * `descricao` vira só o texto exibido. Ausente significa que a origem
     * ainda não foi migrada (o teste de cobertura mantém a lista do que falta).
     */
    efeitos?: Efeito[];
  };
  livro: 'Regras Básicas' | 'Sobrevivendo ao Horror';
}

export type Elemento = 'Sangue' | 'Morte' | 'Conhecimento' | 'Energia' | 'Medo';

export type { Requisito } from './rules/requisitos';
import type { Requisito } from './rules/requisitos';
export type { OrigemDeRegra } from './rules/catalogo';
import type { OrigemDeRegra } from './rules/catalogo';

export interface Poder {
  nome: string;
  descricao: string;
  /**
   * Efeitos mecânicos estruturados.
   *
   * Antes deste campo, NENHUM bônus de poder era aplicado: o `derivedStats` não
   * recebia sequer a lista de poderes do personagem. Vitalidade Reforçada,
   * Vontade Inabalável, Atlético e os Resistir a <Elemento> eram decorativos.
   */
  efeitos?: Efeito[];
  /**
   * O livro permite escolher este poder mais de uma vez ("Pode ser escolhido
   * várias vezes").
   *
   * Antes desta flag havia QUATRO portas independentes decidindo isso, cada uma
   * com uma lista diferente: o PowerChoiceModal liberava três nomes,
   * `getPoderesElegiveis` nenhum, `getPoderesParanormaisElegiveis` só Aprender
   * Ritual, e `choosePower` lançava exceção para qualquer repetição. Um poder
   * repetível ficava disponível ou bloqueado dependendo da tela usada.
   */
  repetivel?: boolean;
  /**
   * Escolha que o poder exige do jogador, no mesmo formato das habilidades de
   * trilha. `Poder` não tinha este campo, então todo poder que concede uma
   * escolha era ligado à mão num modal — ou não era ligado, e ficava sem efeito.
   */
  escolha?: {
    /**
     * `ritual` e `ritualAprendido` são distintos de propósito, e a distinção é
     * de regra, não de estilo:
     *
     *  - `ritual` REFERENCIA um ritual que o personagem já conhece (Ritual
     *    Predileto: "Escolha um ritual que você conhece");
     *  - `ritualAprendido` ENSINA um ritual novo (Aprender Ritual: "você aprende
     *    e pode conjurar um ritual de 1º círculo à sua escolha").
     *
     * Com um único valor para os dois, responder Ritual Predileto adicionaria um
     * ritual ao grimório — o personagem ganharia um ritual de graça ao escolher
     * um desconto.
     */
    tipo:
      | 'pericia'
      | 'elemento'
      | 'arma'
      | 'atributo'
      | 'ritual'
      | 'ritualAprendido'
      | 'poderParanormal'
      | 'custom';
    quantidade: number;
    opcoes?: string[];
  };
  tipo: 'Classe' | 'Paranormal' | 'Origem' | 'Geral' | 'Trilha' | 'Sobrevivente';
  elemento?: Elemento;
  requisitos?: string;
  preRequisitos?: Requisito[];
  origemRegras?: OrigemDeRegra;
  fonte?: string;
  apelidos?: string[];
  custo?: string;
  acao?: string;
  /**
   * O que o jogador escolheu ao ADQUIRIR o poder — o ritual de Aprender Ritual,
   * o elemento de Especialista em Elemento, a perícia de Foco em Perícia.
   *
   * Vive na instância que a ficha carrega, nunca na entrada do catálogo. Antes
   * deste campo a escolha era concatenada na `descricao` como "[Escolha: X]", e
   * três gerações de código escreveram três sufixos diferentes (`[Escolha:]`,
   * `[Escolhido:]`, `[Ritual Escolhido:]`) — foi por isso que o level-down
   * passou a descobrir o que remover por regex numa string de exibição.
   */
  escolhaInterna?: string;
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

export interface ItemStats {
  dano?: string;
  danoBase?: string;
  tipoDano?: string;
  critico?: string;
  alcance?: string;
  defesa?: number;
  resistencia?: number;
  ataqueBonus?: number;
  danoBonus?: number;
  margemAmeaca?: number;
  multiplicadorCritico?: number;
  automatica?: boolean;
}

export interface Item {
  nome: string;
  categoria: 0 | 1 | 2 | 3 | 4;
  categoriaBase?: 0 | 1 | 2 | 3 | 4;
  espaco: number;
  tipo: 'Arma' | 'Proteção' | 'Acessório' | 'Geral' | 'Amaldiçoado' |
  'Modificação Paranormal (Acessório)' |
  'Amaldiçoado (Sangue)' | 'Amaldiçoado (Sangue/Energia)' | 'Amaldiçoado (Morte)' | 'Amaldiçoado (Conhecimento)' | 'Amaldiçoado (Energia)' | 'Amaldiçoado (Medo)' |
  'Geral (Acessório)' | 'Geral (Utensílio)' | 'Geral (Medicamento)' | 'Geral (Operacional)' |
  'Explosivo' | 'Paranormal';
  descricao: string;
  stats?: ItemStats;
  modificacoes?: string[];
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

export interface ModificacaoArma {
  nome: string;
  tipo: 'universal' | 'cac' | 'disparo' | 'fogo' | 'municao';
  requisito?: string;
  efeito: string;
  stats: {
    ataqueBonus?: number;
    danoBonus?: number;
    espacoReduzido?: number;
    crimeBonus?: number;
    margemAmeaca?: number;
    saqueRapido?: boolean;
    dadoDanoExtra?: number;
    compensador?: boolean;
    automatica?: boolean;
    alcanceBonus?: number;
    ataqueFurtivoLongo?: boolean;
    silenciador?: boolean;
    ignoraCamuflagem?: boolean;
    multiplicadorCritico?: number;
    danoExtraFixo?: string;
    empunhaduraUmaMao?: boolean;
    capacidadeMunicaoDupla?: boolean;
    recargaLivre?: boolean;
  };
  livro: 'Regras Básicas' | 'Sobrevivendo ao Horror';
}

export interface ArmaModificada extends Weapow {
  modificacoes: ModificacaoArma[];
  categoriaOriginal: 0 | 1 | 2 | 3 | 4;
}

export interface Trilha {
  nome: string;
  classe: ClasseName;
  descricao: string;
  habilidades: {
    /** NEX exigido. Em trilhas de sobrevivente, é o ESTÁGIO. */
    nex: number;
    nome: string;
    descricao: string;
    /**
     * Efeitos mecânicos estruturados, aplicados quando o personagem alcança
     * `nex`. O gate vem do próprio dado — não precisa de `if` no motor.
     */
    efeitos?: Efeito[];
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
  | 'Ritual'
  | 'Patente';
  descricao: string;
  desbloqueado: boolean;
}

export interface PendenciaNex {
  id: string;
  tipo: 'poder' | 'atributo' | 'trilha' | 'trilhaHabilidade' | 'pericia' | 'afinidade' | 'versatilidade' | 'transcenderPoder' | 'ritual';
  descricao: string;
  nex: number;
  resolvida: boolean;

  quantidade?: number;

  opcoes?: string[];

  
  circuloMaximo?: 1 | 2 | 3 | 4;

  valorEscolhido?: string | string[];
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

export type MarcaTipo =
  | 'sanMaxPerdida'
  | 'pvMaxPerdido'
  | 'peMaxPerdido'
  | 'atributoPerdido'
  | 'nexForaDaEscada';

export interface Marca {
  id: string;
  tipo: MarcaTipo;
  pontos: number;
  motivo: string;
  registradaEm: string;
  atributo?: AtributoKey;
}

export interface LogEntry {
  timestamp: number;
  mensagem: string;
  tipo: 'dano' | 'cura' | 'gasto' | 'condicao' | 'sistema';
}

export interface BonusContexto {
  defesa?: number;
  deslocamento?: number;
  carga?: number;
  periciaFixos?: Partial<Record<PericiaName, number>>;
  periciaDados?: Partial<Record<PericiaName, number>>;
}

export interface Personagem {
  nome: string;
  conceito?: string;
  classe: ClasseName;
  origem: string;
  nex: number;
  estagio?: number;
  qtdTranscender?: number;
  patente?: Patente;
  /**
   * Pontos de Prestígio acumulados. A patente é derivada daqui
   * (ver `getPatentePorPP`), mas `patente` continua podendo ser fixada à mão
   * pelo mestre — promoções valem só a partir da missão seguinte, então o
   * valor gravado nem sempre acompanha o PP no mesmo instante.
   */
  pp?: number;
  pontosAtributoPendentes?: number;
  periciasTreinadasPendentes?: number;
  bonus?: BonusContexto;

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

  poderesClassePendentes?: number;
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

  pendenciasNex?: PendenciaNex[];
  marcas?: Marca[];
  log?: LogEntry[];

  overrides?: {
    pvMax?: number;
    peMax?: number;
    sanMax?: number;
    pdMax?: number;
    defesa?: number;

    periciaFixos?: Partial<Record<PericiaName, number>>;
  };
}

export interface NPC {
  nome: string;
  descricao?: string;
  vida: number;
  defesa: number;
  deslocamento?: string;
  atributos: Atributos;
  pericias: Partial<Record<PericiaName, string>>;
  ataques: {
    nome: string;
    teste: string;
    dano: string;
    critico?: string;
    alcance?: string;
    especial?: string;
  }[];
  habilidades: {
    nome: string;
    descricao: string;
  }[];
  inventario?: string;
  anotacoes?: string;
}

export interface NPCRegistro {
  id: string;
  npc: NPC;
  atualizadoEm: string;
  sincronizadoNaNuvem?: boolean;
}
