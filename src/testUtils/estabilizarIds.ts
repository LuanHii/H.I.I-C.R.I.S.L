import type { Personagem } from '@/core/types';

const RE_ID_PENDENCIA = /^pend_\d+_[a-z0-9]+$/;

export function ehIdPendenciaVolatil(valor: unknown): boolean {
  return typeof valor === 'string' && RE_ID_PENDENCIA.test(valor);
}

export function estabilizarIds<T>(valor: T): T {
  const mapa = new Map<string, string>();
  return percorrer(valor, mapa) as T;
}

function percorrer(valor: unknown, mapa: Map<string, string>): unknown {
  if (Array.isArray(valor)) {
    return valor.map((item) => percorrer(item, mapa));
  }

  if (valor !== null && typeof valor === 'object') {
    const saida: Record<string, unknown> = {};
    for (const [chave, item] of Object.entries(valor as Record<string, unknown>)) {
      saida[chave] = percorrer(item, mapa);
    }
    return saida;
  }

  if (ehIdPendenciaVolatil(valor)) {
    const original = valor as string;
    if (!mapa.has(original)) {
      mapa.set(original, `pend_${mapa.size}`);
    }
    return mapa.get(original)!;
  }

  return valor;
}

export function clonarProfundo<T>(valor: T): T {
  return structuredClone(valor);
}

export function idsDePendencia(personagem: Personagem): string[] {
  return (personagem.pendenciasNex ?? []).map((p) => p.id);
}

export interface DiffCampo {
  campo: string;
  antes: unknown;
  depois: unknown;
}

export function diffPersonagem(
  antes: Personagem,
  depois: Personagem,
  camposIgnorados: string[] = [],
): DiffCampo[] {
  const a = estabilizarIds(antes) as unknown as Record<string, unknown>;
  const b = estabilizarIds(depois) as unknown as Record<string, unknown>;
  const ignorar = new Set(camposIgnorados);
  const chaves = new Set([...Object.keys(a), ...Object.keys(b)]);
  const diffs: DiffCampo[] = [];

  for (const chave of Array.from(chaves).sort()) {
    if (ignorar.has(chave)) continue;
    const antesJson = JSON.stringify(a[chave] ?? null);
    const depoisJson = JSON.stringify(b[chave] ?? null);
    if (antesJson !== depoisJson) {
      diffs.push({ campo: chave, antes: a[chave] ?? null, depois: b[chave] ?? null });
    }
  }

  return diffs;
}

export function camposAlterados(
  antes: Personagem,
  depois: Personagem,
  camposIgnorados: string[] = [],
): string[] {
  return diffPersonagem(antes, depois, camposIgnorados).map((d) => d.campo);
}
