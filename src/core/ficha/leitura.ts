import type { Personagem } from '../types';
import { CLASSES } from '../../data/character/classes';
import { buildFicha } from './buildFicha';
import { paraPersonagem } from './paraPersonagem';
import { replayParaFrente } from './migracao/replay';
import type { FichaPersistida } from './tipos';

export type FonteDaFicha = 'v0' | 'v2';

export interface RegistroLegivel {
  personagem: Personagem;
  atualizadoEm: string;
  ficha?: FichaPersistida;
  fichaMigradaDe?: string;
  fichaConfirmada?: boolean;
}

export interface Resolucao {
  personagem: Personagem;
  fonte: FonteDaFicha;
  motivo: string;
}

export function conversaoDesatualizada(ficha: FichaPersistida): string | null {
  const pares = CLASSES[ficha.identidade.classe].periciasEmPar ?? [];
  if (pares.length === 0) return null;

  const livres = new Set(ficha.identidade.periciasLivres);
  const nenhumLado = pares.every(([a, b]) => !livres.has(a) && !livres.has(b));
  if (!nenhumLado) return null;

  return (
    `A regra de perícias do ${ficha.identidade.classe} foi corrigida (${pares.map(([a, b]) => `${a} ou ${b}`).join(', ')} — Ordem:705) `
    + 'e esta conversão é anterior à correção. Converta de novo e confira as perícias treinadas.'
  );
}

export function resolverPersonagem(registro: RegistroLegivel): Resolucao {
  const v0 = registro.personagem;

  if (!registro.ficha) {
    return { personagem: v0, fonte: 'v0', motivo: 'Ficha ainda não convertida.' };
  }

  if (registro.fichaMigradaDe && registro.fichaMigradaDe !== registro.atualizadoEm) {
    return {
      personagem: v0,
      fonte: 'v0',
      motivo: 'A ficha foi editada depois da conversão; o documento novo ficou para trás. Converta de novo para usá-lo.',
    };
  }

  try {
    const desatualizada = conversaoDesatualizada(registro.ficha);
    if (desatualizada) {
      return { personagem: v0, fonte: 'v0', motivo: desatualizada };
    }

    const replay = replayParaFrente(registro.ficha);
    if (!replay.ok && !registro.fichaConfirmada) {
      return {
        personagem: v0,
        fonte: 'v0',
        motivo: `A reconstrução falhou em ${replay.falhas.length} ponto(s): ${replay.falhas[0]?.mensagem ?? 'motivo não registrado'}`,
      };
    }

    const build = buildFicha({ ficha: registro.ficha });

    const endpoint = compararEndpoint(v0, build);
    if (endpoint.length > 0 && !registro.fichaConfirmada) {
      return {
        personagem: v0,
        fonte: 'v0',
        motivo: `Os números do motor novo não batem mais com a ficha: ${endpoint.join('; ')}. Converta de novo.`,
      };
    }

    const verificada = replay.ok && endpoint.length === 0;
    return {
      personagem: paraPersonagem({ ficha: registro.ficha, carregarDe: v0, build }),
      fonte: 'v2',
      motivo: verificada
        ? 'Lendo do motor novo: números conferidos e reconstrução legal em todos os marcos.'
        : 'Lendo do motor novo por confirmação sua, apesar do relatório com pendências.',
    };
  } catch (erro) {
    return {
      personagem: v0,
      fonte: 'v0',
      motivo: `O motor novo falhou ao reconstruir esta ficha (${String(erro)}). Usando a ficha antiga.`,
    };
  }
}

function compararEndpoint(
  v0: Personagem,
  build: ReturnType<typeof buildFicha>,
): string[] {
  const fora: string[] = [];

  const conferir = (rotulo: string, a: unknown, b: unknown) => {
    if (a !== b) fora.push(`${rotulo} ${String(a)}≠${String(b)}`);
  };

  conferir('PV', v0.pv.max, build.derivados.pv.max);
  conferir('PE', v0.pe.max, build.derivados.pe.max);
  conferir('SAN', v0.san.max, build.derivados.san.max);
  for (const atributo of ['AGI', 'FOR', 'INT', 'PRE', 'VIG'] as const) {
    conferir(atributo, v0.atributos[atributo], build.atributos[atributo]);
  }
  return fora;
}

export function fonteDaFicha(registro: RegistroLegivel): FonteDaFicha {
  return resolverPersonagem(registro).fonte;
}
