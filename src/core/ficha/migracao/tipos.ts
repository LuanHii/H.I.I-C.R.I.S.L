import type { Confianca } from '../inferirFicha';
import type { Escolha, EscolhaId, FichaPersistida, Problema } from '../tipos';

/**
 * Tipos do conversor v0 → v2.
 *
 * A regra que governa o módulo inteiro: **nunca é `throw`; é relatório.** Uma
 * ficha corrompida tem de virar um relatório legível, porque um `throw` no meio
 * de uma migração em lote perde o resto do lote — e o mestre não tem como saber
 * qual ficha quebrou.
 */

/**
 * Algo que a ficha v0 tinha e o conversor NÃO conseguiu explicar.
 *
 * É o oposto de `recreateFromPersonagem`, que preenche a contagem de perícias com
 * perícias arbitrárias em ordem alfabética só para fechar o número. O conversor
 * nunca inventa: ou infere, ou registra a lacuna aqui e o mestre decide.
 */
export interface Lacuna {
  campo: string;
  /** O que estava no v0 e ficou sem explicação. */
  valor: unknown;
  /** Por que não deu para inferir, em português, para o wizard exibir. */
  motivo: string;
}

/**
 * Uma escolha que o conversor teve de arbitrar porque o v0 não a registra.
 *
 * `material: false` (inerte) significa que a arbitragem não muda NENHUM número
 * derivado nem slot futuro — qual marco de NEX concedeu qual ponto de atributo,
 * por exemplo. Essas são auto-aceitas.
 *
 * Essa separação é o que decide se o wizard é usável: sem ela o mestre responde
 * ~10 perguntas por ficha e passa a clicar sem ler, que é pior que não perguntar.
 */
export interface Ambiguidade {
  escolhaId: EscolhaId;
  descricao: string;
  /** O que o conversor arbitrou. */
  arbitrado: unknown;
  /** Alternativas igualmente compatíveis com o v0, se enumeráveis. */
  alternativas?: unknown[];
  /** Muda algum número derivado ou slot futuro? */
  material: boolean;
  confianca: Confianca;
}

/** Uma etapa do replay para frente que produziu estado ilegal. */
export interface FalhaReplay {
  nivel: number;
  codigo: string;
  mensagem: string;
}

/**
 * Round trip: o build da ficha convertida reproduz os números do v0?
 *
 * `endpointOk` sozinho NÃO basta, e essa é a razão de `replay` existir. O
 * endpoint é cego a causa mal atribuída: VIG-base um acima e o aumento de NEX 20
 * um abaixo produzem `pvMax` idêntico e futuro diferente. Má atribuição só
 * aparece quando se percorre os marcos exigindo que cada estado intermediário
 * seja legal.
 */
export interface RoundTripRelatorio {
  /** Os números finais batem? */
  endpointOk: boolean;
  divergencias: string[];
  /** Todo estado intermediário desde o primeiro marco é legal? */
  replayOk: boolean;
  falhasReplay: FalhaReplay[];
  /** Ambos. É esta a porta para a leitura preferir v2. */
  ok: boolean;
}

/**
 * Geração do documento v0.
 *
 * Pelo menos três gerações de código escreveram nesses documentos: a divergência
 * entre `[Escolha:]` (levelUp) e `[Escolhido:]` / `[Ritual Escolhido:]`
 * (PendingChoiceModal) é a prova. Um parser por geração; `desconhecida` quando
 * não há marcador nenhum, que é o caso da maioria das fichas.
 */
export type Geracao = 'escolha' | 'escolhido' | 'mista' | 'sem-marcador';

export interface ResultadoMigracao {
  ficha: FichaPersistida;
  /** O log reconstruído, com selo de confiança por entrada. */
  escolhas: (Escolha & { confianca: Confianca; nota: string })[];
  naoInferido: Lacuna[];
  ambiguidades: Ambiguidade[];
  problemas: Problema[];
  geracao: Geracao;
  confianca: Confianca;
  roundTrip: RoundTripRelatorio;
}
