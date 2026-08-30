import type { PericiaName, Personagem } from '../../types';
import { CLASSES } from '../../../data/character/classes';
import { buildFicha } from '../buildFicha';
import { inferirFicha, type Confianca } from '../inferirFicha';
import { detectarGeracao } from './geracao';
import { replayParaFrente } from './replay';
import type { Ambiguidade, Lacuna, ResultadoMigracao, RoundTripRelatorio } from './tipos';

/**
 * `migrarFicha` — a porta única de conversão v0 → v2.
 *
 * Envolve `inferirFicha` com as três coisas que a inferência sozinha não dá, e
 * sem as quais migrar seria apostar:
 *
 *  1. **Replay para frente.** O round trip numérico é cego a causa mal
 *     atribuída; só percorrer os marcos exigindo estado intermediário legal
 *     denuncia. Ver `replay.ts`.
 *  2. **Lacunas nomeadas.** O que não deu para explicar aparece com nome, em vez
 *     de ser preenchido com um palpite. É o anti-padrão de
 *     `recreateFromPersonagem`, que inventa perícias em ordem alfabética só para
 *     fechar a contagem.
 *  3. **Ambiguidade separada em inerte e material.** Auto-aceitar a inerte é o
 *     que faz o wizard perguntar ~2 coisas por ficha em vez de ~10 — e ~10 é o
 *     número que faz o mestre clicar sem ler, que é pior do que não perguntar.
 *
 * NUNCA lança. Ficha corrompida vira relatório; um `throw` no meio de um lote
 * perde o resto do lote.
 */

/**
 * Confiança do conjunto.
 *
 * Só a ambiguidade MATERIAL conta. A inerte — qual marco concedeu qual ponto de
 * atributo — é auto-aceita por construção, e o replay já provou que o caminho
 * inteiro é legal; deixá-la rebaixar o selo faria TODA ficha acima de NEX 20
 * aparecer como "média", e um selo que nunca é verde não informa nada.
 *
 * O que rebaixa de verdade: round trip vermelho, lacuna, ou uma arbitragem que
 * muda número derivado ou slot futuro.
 */
function consolidarConfianca(
  ambiguidades: readonly Ambiguidade[],
  roundTrip: RoundTripRelatorio,
  lacunas: readonly Lacuna[],
): Confianca {
  if (!roundTrip.ok || lacunas.length > 0) return 'baixa';

  const materiais = ambiguidades.filter((a) => a.material);
  if (materiais.some((a) => a.confianca === 'baixa')) return 'baixa';
  if (materiais.length > 0) return 'media';
  return 'alta';
}

/**
 * Perícias treinadas no v0 que o v2 não reproduz.
 *
 * Déficit é `Lacuna`: alguma perícia sumiu e o conversor não sabe de onde ela
 * vinha. Excedente NÃO é lacuna — vai para `ajustes`, porque a ficha ter uma
 * perícia a mais é fato observado, não erro a corrigir.
 */
function lacunasDePericia(v0: Personagem, ficha: ResultadoMigracao['ficha']): Lacuna[] {
  const treinadasV0 = (Object.entries(v0.pericias) as [PericiaName, string][])
    .filter(([, grau]) => grau !== 'Destreinado')
    .map(([nome]) => nome);

  const reproduzidas = new Set<PericiaName>([
    ...CLASSES[ficha.identidade.classe].periciasObrigatorias,
    ...ficha.identidade.periciasLivres,
  ]);

  const faltando = treinadasV0.filter((p) => !reproduzidas.has(p));
  if (faltando.length === 0) return [];

  return [{
    campo: 'pericias',
    valor: faltando,
    motivo:
      'Treinadas na ficha antiga e não explicadas por classe, origem ou escolha de criação. ' +
      'Nada foi apagado — mas o motor novo não sabe de onde vieram.',
  }];
}

/** Poderes que não casaram com slot nenhum. Preservados, mas sem procedência. */
function lacunasDePoder(ficha: ResultadoMigracao['ficha']): Lacuna[] {
  const manuais = ficha.ajustes.poderesManuais ?? [];
  if (manuais.length === 0) return [];
  return [{
    campo: 'poderes',
    valor: manuais,
    motivo:
      'Não casaram com nenhum slot deste nível. Ficam como poderes manuais — a ficha ' +
      'continua tendo todos eles, mas o motor não sabe qual marco os concedeu.',
  }];
}

export function migrarFicha(v0: Personagem): ResultadoMigracao {
  const geracao = detectarGeracao(v0);
  const inferencia = inferirFicha(v0);
  const { ficha } = inferencia;

  /*
   * O ENDPOINT vem da inferência; o CAMINHO vem do replay. As duas checagens
   * respondem perguntas diferentes e nenhuma substitui a outra.
   */
  const replay = replayParaFrente(ficha);
  const roundTrip: RoundTripRelatorio = {
    endpointOk: inferencia.roundTripOk,
    divergencias: inferencia.divergencias,
    replayOk: replay.ok,
    falhasReplay: replay.falhas,
    ok: inferencia.roundTripOk && replay.ok,
  };

  const naoInferido = [...lacunasDePericia(v0, ficha), ...lacunasDePoder(ficha)];

  const ambiguidades: Ambiguidade[] = inferencia.inferidas
    .filter((e) => e.confianca !== 'alta')
    .map((e) => ({
      escolhaId: e.id,
      descricao: e.nota,
      arbitrado: e.valor,
      /*
       * MATERIAL vs INERTE.
       *
       * Qual marco concedeu qual ponto de atributo não muda número derivado nem
       * slot futuro: o total é o que aparece na ficha, e o replay já garante que
       * o caminho é legal. Inerte, auto-aceita.
       *
       * Já um poder atribuído a um marco muda o que estará disponível nos marcos
       * seguintes (pré-requisito é de aquisição), então precisa dos olhos do
       * mestre.
       */
      material: e.valor.tipo !== 'atributo',
      confianca: e.confianca,
    }));

  return {
    ficha,
    escolhas: inferencia.inferidas.map(({ id, valor, confianca, nota }) => ({
      id, valor, confianca, nota,
    })),
    naoInferido,
    ambiguidades,
    problemas: inferencia.problemas,
    geracao,
    confianca: consolidarConfianca(ambiguidades, roundTrip, naoInferido),
    roundTrip,
  };
}

/**
 * Migração em lote, para a visão por campanha.
 *
 * Uma ficha que explode não pode derrubar as outras — por isso cada item é
 * envolvido individualmente. `migrarFicha` já promete não lançar; este `catch` é
 * a segunda linha, para o caso de o documento estar corrompido de um jeito que a
 * inferência nem chega a examinar.
 */
export function migrarLote(
  personagens: readonly { id: string; personagem: Personagem }[],
): { id: string; resultado: ResultadoMigracao | null; erro?: string }[] {
  return personagens.map(({ id, personagem }) => {
    try {
      return { id, resultado: migrarFicha(personagem) };
    } catch (erro) {
      return { id, resultado: null, erro: String(erro) };
    }
  });
}

/**
 * A leitura pode preferir o v2 desta ficha?
 *
 * Round trip verde OU confirmação explícita do mestre. Nunca automático só por
 * existir: um documento v2 gravado não é permissão para usá-lo.
 */
export function podeLerV2(
  roundTrip: RoundTripRelatorio,
  mestreConfirmou: boolean,
): boolean {
  return roundTrip.ok || mestreConfirmou;
}

/** Reexporta o build para quem só quer os números reconstruídos. */
export function numerosReconstruidos(resultado: ResultadoMigracao) {
  return buildFicha({ ficha: resultado.ficha });
}
