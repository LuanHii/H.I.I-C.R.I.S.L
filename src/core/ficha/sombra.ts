import type { Personagem } from '../types';
import { buildFicha } from './buildFicha';
import { inferirFicha } from './inferirFicha';
import type { Problema } from './tipos';

export interface Divergencia {
  campo: string;
  v0: unknown;
  v2: unknown;
}

export interface RelatorioSombra {
  personagem: string;
  divergencias: Divergencia[];
  problemas: Problema[];
  inferenciasIncertas: { id: string; confianca: string; nota: string }[];
  ok: boolean;
}

function clonar<T>(valor: T): T {
  return JSON.parse(JSON.stringify(valor)) as T;
}

function comparaNumero(
  divergencias: Divergencia[],
  campo: string,
  v0: number | undefined,
  v2: number | undefined,
): void {
  if (v0 === undefined && v2 === undefined) return;
  if (v0 !== v2) divergencias.push({ campo, v0, v2 });
}

export function comparar(personagemOriginal: Personagem): RelatorioSombra {
  const v0 = clonar(personagemOriginal);

  const inferencia = inferirFicha(v0);
  const v2 = buildFicha({ ficha: inferencia.ficha });

  const divergencias: Divergencia[] = [];

  comparaNumero(divergencias, 'pv.max', v0.pv.max, v2.derivados.pv.max);
  comparaNumero(divergencias, 'pe.max', v0.pe.max, v2.derivados.pe.max);
  comparaNumero(divergencias, 'san.max', v0.san.max, v2.derivados.san.max);

  for (const atributo of ['AGI', 'FOR', 'INT', 'PRE', 'VIG'] as const) {
    comparaNumero(divergencias, `atributos.${atributo}`, v0.atributos[atributo], v2.atributos[atributo]);
  }

  if ((v0.trilha ?? undefined) !== (v2.trilha ?? undefined)) {
    divergencias.push({ campo: 'trilha', v0: v0.trilha, v2: v2.trilha });
  }
  if ((v0.afinidade ?? undefined) !== (v2.afinidade ?? undefined)) {
    divergencias.push({ campo: 'afinidade', v0: v0.afinidade, v2: v2.afinidade });
  }
  if ((v0.patente ?? 'Recruta') !== v2.patente) {
    divergencias.push({ campo: 'patente', v0: v0.patente, v2: v2.patente });
  }

  const listaV0 = (v0.poderes ?? []).map((p) => p.nome);
  const listaV2 = v2.poderes.map((p) => p.nome);
  const nomesV0 = new Set(listaV0);
  const nomesV2 = new Set(listaV2);

  const faltando = listaV0.filter((n, i) => !nomesV2.has(n) && listaV0.indexOf(n) === i);
  const extra = listaV2.filter((n, i) => !nomesV0.has(n) && listaV2.indexOf(n) === i);

  if (faltando.length > 0) divergencias.push({ campo: 'poderes.faltando', v0: faltando, v2: null });
  if (extra.length > 0) divergencias.push({ campo: 'poderes.extra', v0: null, v2: extra });

  return {
    personagem: v0.nome,
    divergencias,
    problemas: [...inferencia.problemas, ...v2.problemas],
    inferenciasIncertas: inferencia.inferidas
      .filter((e) => e.confianca !== 'alta')
      .map((e) => ({ id: e.id, confianca: e.confianca, nota: e.nota })),
    ok: divergencias.length === 0,
  };
}

export function sombraAtiva(): boolean {
  try {
    return process.env.NEXT_PUBLIC_FICHA_SOMBRA === '1';
  } catch {
    return false;
  }
}

export function observar(
  personagem: Personagem,
  registrar: (relatorio: RelatorioSombra) => void = registroPadrao,
): void {
  if (!sombraAtiva()) return;
  try {
    registrar(comparar(personagem));
  } catch (erro) {
    registrar({
      personagem: personagem?.nome ?? '(sem nome)',
      divergencias: [{ campo: '(exceção)', v0: null, v2: String(erro) }],
      problemas: [],
      inferenciasIncertas: [],
      ok: false,
    });
  }
}

let anunciado = false;
let comparadas = 0;

function registroPadrao(relatorio: RelatorioSombra): void {
  if (!anunciado) {
    anunciado = true;
    console.info('[ficha-sombra] ativo. Uma linha por ficha comparada; divergências saem como warning.');
  }
  comparadas += 1;

  if (relatorio.ok && relatorio.problemas.length === 0) {
    console.info(`[ficha-sombra] #${comparadas} ${relatorio.personagem}: OK, sem divergência.`);
    return;
  }

  const soGanhos = relatorio.problemas.length === 0
    && relatorio.divergencias.length > 0
    && relatorio.divergencias.every((d) => d.campo === 'poderes.extra');

  if (soGanhos) {
    console.info(
      `[ficha-sombra] #${comparadas} ${relatorio.personagem}: sem perda; ` +
      'o motor novo concede poderes que o antigo omitia.',
      relatorio.divergencias,
    );
    return;
  }

  console.warn(
    `[ficha-sombra] #${comparadas} ${relatorio.personagem}: ` +
    `${relatorio.divergencias.length} divergência(s), ${relatorio.problemas.length} problema(s)`,
    relatorio,
  );
}
