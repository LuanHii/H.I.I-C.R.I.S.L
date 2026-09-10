import type { PericiaName, Personagem } from '../../types';
import { CLASSES } from '../../../data/character/classes';
import { buildFicha } from '../buildFicha';
import { inferirFicha, type Confianca } from '../inferirFicha';
import { detectarGeracao } from './geracao';
import { replayParaFrente } from './replay';
import type { Ambiguidade, Lacuna, ResultadoMigracao, RoundTripRelatorio } from './tipos';

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

export function podeLerV2(
  roundTrip: RoundTripRelatorio,
  mestreConfirmou: boolean,
): boolean {
  return roundTrip.ok || mestreConfirmou;
}

export function numerosReconstruidos(resultado: ResultadoMigracao) {
  return buildFicha({ ficha: resultado.ficha });
}
