import type { ClasseName, PericiaName } from '../types';
import { CLASSES } from '../../data/character/classes';

export interface PreferenciaDePar {
  ofensiva?: PericiaName;
  defensiva?: PericiaName;
}

export function periciasFixasDaClasse(classe: ClasseName, preferencia?: PreferenciaDePar): PericiaName[] {
  const { periciasObrigatorias, periciasEmPar = [] } = CLASSES[classe];
  const preferidas = new Set<PericiaName>(
    [preferencia?.ofensiva, preferencia?.defensiva].filter((p): p is PericiaName => Boolean(p)),
  );
  const dosPares = periciasEmPar.map((par) => par.find((p) => preferidas.has(p)) ?? par[0]);
  return [...periciasObrigatorias, ...dosPares];
}
