import type {
  AtributoKey,
  Atributos,
  ClasseName,
  Elemento,
  Marca,
  PericiaName,
} from '../types';

/**
 * MOTOR NOVO — modelo persistido v2.
 *
 * Nada em `src/` fora de `core/ficha/` importa este módulo. É deliberado: o
 * motor novo é construído e testado em isolamento, ao lado do antigo, antes de
 * qualquer ficha real passar por ele.
 *
 * A ideia central: a ficha persistida guarda apenas o que NÃO é função de
 * `(identidade, progressao, escolhas, ajustes, catálogo)`. Tudo o mais é
 * derivado a cada build. O motor antigo persiste os derivados e os reconcilia
 * em nove lugares diferentes, que é a origem da maioria dos bugs — SAN máxima
 * voltando ao valor anterior, level-down descobrindo o que remover por regex
 * numa string, escolha de trilha gravada como sufixo de texto.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Identidade: a intenção imutável do jogador
// ─────────────────────────────────────────────────────────────────────────────

export interface FichaIdentidade {
  nome: string;
  conceito?: string;
  classe: ClasseName;
  origem: string;
  /** Atributos ANTES de qualquer aumento por NEX. Os aumentos são escolhas. */
  atributosBase: Atributos;
  /** Perícias escolhidas na criação, fora as obrigatórias da classe. */
  periciasLivres: PericiaName[];
  /**
   * O sobrevivente escolhe o que leva da origem: as perícias, o poder, ou ambos.
   * Sem registrar isso, o build não sabe se deve conceder o poder de origem — e
   * concedê-lo a quem optou por perícias inventaria um poder que a ficha não tem.
   */
  beneficioOrigem?: 'pericias' | 'poder' | 'ambos';
  livroBase?: 'Regras Básicas' | 'Sobrevivendo ao Horror';
}

export interface Progressao {
  nex: number;
  /** Só para a classe Sobrevivente, que progride por estágio. */
  estagio?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Slots: as obrigações que um nível cria
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tipo de obrigação. Deriva do que o livro concede em cada marco, não de como
 * a UI antiga chamava as coisas.
 */
export type SlotKind =
  | 'trilha'
  | 'trilhaHabilidade'
  | 'poderClasse'
  | 'atributo'
  | 'pericia'
  | 'afinidade'
  | 'versatilidade'
  | 'ritual'
  /**
   * CASCATAS — slots que só existem porque um slot anterior foi respondido de
   * um jeito específico. Emitidos com `montarIdFilho`, então o id carrega o pai:
   * `poderClasse@nex:15#0/poderParanormal#0`.
   *
   * Sem eles, escolher Transcender concedia NADA (o poder paranormal nunca era
   * escolhido) e escolher Aprender Ritual não registrava qual ritual — o que
   * deixa o poder sem elemento e trava os requisitos "<Elemento> N".
   */
  /** Transcender: escolhe um poder paranormal, que é de fato concedido. */
  | 'poderParanormal'
  /**
   * Decisão INTERNA de um poder já concedido: qual ritual ganha o desconto de
   * Ritual Predileto, qual elemento de Especialista em Elemento, qual perícia de
   * Foco em Perícia. Não concede nada novo — grava em `PoderDerivado.escolhaInterna`.
   */
  | 'escolhaInterna';

/**
 * Chave de nível. `nex:15` para agentes, `est:2` para sobreviventes.
 *
 * O motor antigo guarda estágio no campo `nex` das trilhas de sobrevivente
 * (`tracks.ts`), e é por isso que essas trilhas nunca disparam. Aqui as duas
 * escalas são distinguíveis no próprio identificador.
 */
export type ChaveNivel = `nex:${number}` | `est:${number}`;

/**
 * Identificador determinístico de escolha, derivado da OBRIGAÇÃO e não da
 * resposta: `` `${kind}@${chaveNivel}#${ordinal}` ``.
 *
 * Cascatas viram filhos, separadas por `/`:
 * `poderClasse@nex:15#0/atributo#0`.
 *
 * Isso substitui os `pend_${Date.now()}_${random}` do motor antigo. Como o id
 * não depende da resposta, re-responder é um OVERWRITE e não um append — o que
 * torna "voltar e alterar" estrutural em vez de um caso especial.
 */
export type EscolhaId = string;

export interface Slot {
  id: EscolhaId;
  kind: SlotKind;
  chaveNivel: ChaveNivel;
  /** NEX (ou estágio) numérico, para ordenação e comparação. */
  nivel: number;
  /** Quantos valores a resposta deve conter. Perícias promovem várias de uma vez. */
  quantidade: number;
  /** Slot criado por uma escolha anterior (cascata). */
  paiId?: EscolhaId;
  /**
   * Nome do poder que abriu esta cascata. Presente só em slot filho.
   *
   * `opcoesPara` precisa dele para saber O QUE oferecer: um slot
   * `escolhaInterna` de Foco em Perícia lista perícias, o de Especialista em
   * Elemento lista elementos. Sem este campo a única pista seria o `rotulo`,
   * que é texto de UI e não pode virar dado.
   */
  poderPai?: string;
  /** Rótulo legível, para a UI. Nunca usado como dado. */
  rotulo: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Escolhas: o log append-only
// ─────────────────────────────────────────────────────────────────────────────

export type ValorEscolha =
  | { tipo: 'trilha'; trilha: string }
  /**
   * Versatilidade (NEX 50%) — tipo PRÓPRIO, e a razão é um bug real.
   *
   * Antes o slot de versatilidade usava `{tipo:'trilha'}`, o mesmo valor da
   * escolha de trilha. `aplicar` não tinha como distinguir os dois, então
   * responder versatilidade TROCAVA a trilha do personagem: um Aniquilador que
   * escolhesse versatilidade virava Agente Secreto e perdia as habilidades da
   * trilha original. Silenciosamente.
   *
   * Dois significados diferentes não podem compartilhar a mesma forma.
   */
  | { tipo: 'versatilidade'; trilha: string }
  | { tipo: 'poder'; poder: string }
  | { tipo: 'atributo'; atributo: AtributoKey }
  | { tipo: 'pericias'; pericias: PericiaName[] }
  | { tipo: 'afinidade'; elemento: Elemento }
  | { tipo: 'ritual'; ritual: string }
  | { tipo: 'habilidadeTrilha'; habilidade: string; escolhaInterna?: string }
  /**
   * Decisão interna de um poder concedido por uma escolha anterior.
   *
   * Genérica de propósito: o que a decisão SIGNIFICA (perícia, elemento, ritual,
   * arma) está no catálogo, em `Poder.escolha.tipo`, e não precisa ser
   * duplicado na forma do valor. O poder alvo vem do `paiId` do próprio id.
   */
  | { tipo: 'escolhaInterna'; valor: string };

export interface Escolha {
  /** Igual ao `Slot.id` que ela responde. */
  id: EscolhaId;
  valor: ValorEscolha;
}

// ─────────────────────────────────────────────────────────────────────────────
// Ajustes do mestre — em DELTA, nunca absoluto
// ─────────────────────────────────────────────────────────────────────────────

/**
 * O motor antigo lê `overrides.pvMax` como ABSOLUTO, então um mestre que ajusta
 * PV uma vez congela o PV do personagem para sempre. Em delta, o ajuste compõe
 * com a progressão.
 */
export interface AjustesGm {
  pvMaxDelta?: number;
  peMaxDelta?: number;
  sanMaxDelta?: number;
  pdMaxDelta?: number;
  defesaDelta?: number;
  periciaFixos?: Partial<Record<PericiaName, number>>;
  /** Poderes que o mestre adicionou à mão, fora de qualquer slot. */
  poderesManuais?: string[];
  nota?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sessão: o que muda durante o jogo
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Guarda DANO, não valor atual.
 *
 * As cinco reconciliações divergentes do motor antigo colapsam em
 * `atual = clamp(max - dano, 0, max)`; `machucado`, `perturbado` e o limite de
 * PE por rodada caem de graça.
 */
export interface EstadoSessao {
  pvDano: number;
  peGasto: number;
  sanPerdida: number;
  pdGasto?: number;
  condicoes?: string[];
  /** Pontos de Prestígio. A patente é derivada daqui (Tabela 3.1). */
  pontosPrestigio?: number;
  marcas?: Marca[];
}

// ─────────────────────────────────────────────────────────────────────────────
// O documento
// ─────────────────────────────────────────────────────────────────────────────

export interface FichaPersistida {
  versao: 2;
  identidade: FichaIdentidade;
  progressao: Progressao;
  /** Append-only, ordenado por id. */
  escolhas: Escolha[];
  sessao: EstadoSessao;
  ajustes: AjustesGm;
}

// ─────────────────────────────────────────────────────────────────────────────
// Saída do build
// ─────────────────────────────────────────────────────────────────────────────

/** Obrigação ainda sem resposta. DERIVADA — nunca persistida. */
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

/**
 * Como um poder entrou na ficha. Substitui o regex de `levelUp.ts:607` e o
 * sufixo `[Escolha: X]` concatenado na descrição.
 *
 * `classeAutomatica` e `trilha` não carregam `escolhaId` porque não vêm de
 * escolha nenhuma: o livro as concede ao atingir o nível. Distinguir isso no
 * TIPO, e não por um `escolhaId` vazio, é o que impede o level-down de tentar
 * "desfazer" uma habilidade que nunca foi escolhida.
 */
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
