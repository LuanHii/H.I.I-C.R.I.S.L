import type { AtributoKey, PericiaName } from '../types';
import { buildFicha } from './buildFicha';
import type { AjustesGm, FichaPersistida } from './tipos';

export type DeltaDeRecurso = 'pvMaxDelta' | 'peMaxDelta' | 'sanMaxDelta' | 'pdMaxDelta' | 'defesaDelta';

export const DELTAS_DE_RECURSO: readonly DeltaDeRecurso[] = [
  'pvMaxDelta',
  'peMaxDelta',
  'sanMaxDelta',
  'pdMaxDelta',
  'defesaDelta',
];

function enxugar(ajustes: AjustesGm): AjustesGm {
  const saida: AjustesGm = {};

  for (const campo of DELTAS_DE_RECURSO) {
    const valor = ajustes[campo];
    if (valor !== undefined && valor !== 0 && Number.isFinite(valor)) saida[campo] = valor;
  }

  const fixos = Object.entries(ajustes.periciaFixos ?? {})
    .filter(([, bonus]) => bonus !== undefined && bonus !== 0 && Number.isFinite(bonus));
  if (fixos.length > 0) {
    saida.periciaFixos = Object.fromEntries(fixos) as Partial<Record<PericiaName, number>>;
  }

  const manuais = Array.from(new Set((ajustes.poderesManuais ?? []).map((n) => n.trim()).filter(Boolean)));
  if (manuais.length > 0) saida.poderesManuais = manuais;

  const nota = ajustes.nota?.trim();
  if (nota) saida.nota = nota;

  return saida;
}

function comAjustes(ficha: FichaPersistida, ajustes: AjustesGm): FichaPersistida {
  return { ...ficha, ajustes: enxugar(ajustes) };
}

export function definirDelta(ficha: FichaPersistida, campo: DeltaDeRecurso, valor: number): FichaPersistida {
  return comAjustes(ficha, { ...ficha.ajustes, [campo]: Math.trunc(valor) });
}

export function definirNota(ficha: FichaPersistida, nota: string): FichaPersistida {
  return comAjustes(ficha, { ...ficha.ajustes, nota });
}

export function definirBonusPericia(ficha: FichaPersistida, pericia: PericiaName, bonus: number): FichaPersistida {
  return comAjustes(ficha, {
    ...ficha.ajustes,
    periciaFixos: { ...(ficha.ajustes.periciaFixos ?? {}), [pericia]: Math.trunc(bonus) },
  });
}

export function adicionarPoderManual(ficha: FichaPersistida, nome: string): FichaPersistida {
  const jaDerivado = buildFicha({ ficha }).poderes.some((p) => p.nome === nome);
  if (jaDerivado) return ficha;
  return comAjustes(ficha, {
    ...ficha.ajustes,
    poderesManuais: [...(ficha.ajustes.poderesManuais ?? []), nome],
  });
}

export function removerPoderManual(ficha: FichaPersistida, nome: string): FichaPersistida {
  return comAjustes(ficha, {
    ...ficha.ajustes,
    poderesManuais: (ficha.ajustes.poderesManuais ?? []).filter((n) => n !== nome),
  });
}

export function ajustarAtributoBase(ficha: FichaPersistida, atributo: AtributoKey, delta: number): FichaPersistida {
  const atual = ficha.identidade.atributosBase[atributo];
  const novo = Math.max(0, atual + Math.trunc(delta));
  if (novo === atual) return ficha;
  return {
    ...ficha,
    identidade: {
      ...ficha.identidade,
      atributosBase: { ...ficha.identidade.atributosBase, [atributo]: novo },
    },
  };
}

export function adicionarPericiaLivre(ficha: FichaPersistida, pericia: PericiaName): FichaPersistida {
  if (ficha.identidade.periciasLivres.includes(pericia)) return ficha;
  return {
    ...ficha,
    identidade: { ...ficha.identidade, periciasLivres: [...ficha.identidade.periciasLivres, pericia] },
  };
}

export function removerPericiaLivre(ficha: FichaPersistida, pericia: PericiaName): FichaPersistida {
  if (!ficha.identidade.periciasLivres.includes(pericia)) return ficha;
  return {
    ...ficha,
    identidade: { ...ficha.identidade, periciasLivres: ficha.identidade.periciasLivres.filter((p) => p !== pericia) },
  };
}

export function temAjustes(ajustes: AjustesGm): boolean {
  return Object.keys(enxugar(ajustes)).length > 0;
}
