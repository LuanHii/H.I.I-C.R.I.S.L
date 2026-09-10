import type { FichaOp2 } from '../regras/tipos';
import { assinaturaDaFicha } from './sincronizacao';

export interface RegistroOp2 {
  id: string;
  ficha: FichaOp2;
  atualizadoEm: string;
}

export interface PrimeiraCarga {
  fichas: FichaOp2[];
  aSubir: FichaOp2[];
}

export function maisRecente(umIso: string | undefined, outroIso: string | undefined): boolean {
  if (!umIso) return false;
  if (!outroIso) return true;
  return Date.parse(umIso) > Date.parse(outroIso);
}

export function mesclarPrimeiraCarga(
  locais: FichaOp2[],
  carimbosLocais: Record<string, string>,
  remotas: RegistroOp2[],
): PrimeiraCarga {
  const porId = new Map<string, RegistroOp2>();
  for (const registro of remotas) porId.set(registro.id, registro);

  const aSubir: FichaOp2[] = [];
  const fichas: FichaOp2[] = [];

  for (const local of locais) {
    const remota = porId.get(local.id);
    if (!remota) {
      fichas.push(local);
      aSubir.push(local);
      continue;
    }
    porId.delete(local.id);
    if (maisRecente(carimbosLocais[local.id], remota.atualizadoEm)) {
      fichas.push(local);
      aSubir.push(local);
    } else {
      fichas.push(remota.ficha);
    }
  }

  for (const restante of remotas) {
    if (porId.has(restante.id)) fichas.push(restante.ficha);
  }

  return { fichas, aSubir };
}

export interface DiferencaParaNuvem {
  aSalvar: FichaOp2[];
  aRemover: string[];
}

export function diferencaParaNuvem(
  fichas: FichaOp2[],
  enviadas: ReadonlyMap<string, string>,
): DiferencaParaNuvem {
  const presentes = new Set(fichas.map((ficha) => ficha.id));
  return {
    aSalvar: fichas.filter((ficha) => enviadas.get(ficha.id) !== assinaturaDaFicha(ficha)),
    aRemover: Array.from(enviadas.keys()).filter((id) => !presentes.has(id)),
  };
}
