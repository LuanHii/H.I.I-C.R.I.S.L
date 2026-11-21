import type { FichaPersistida } from '../ficha/tipos';

export interface RegistroCarimbavel {
  atualizadoEm: string;
  ficha?: FichaPersistida;
  fichaMigradaDe?: string;
}

export function carimbarAtualizacao<T extends RegistroCarimbavel>(registro: T, agora: string): T {
  const aindaValia = Boolean(registro.ficha) && registro.fichaMigradaDe === registro.atualizadoEm;
  return {
    ...registro,
    atualizadoEm: agora,
    ...(aindaValia ? { fichaMigradaDe: agora } : {}),
  };
}

export function carimbarSincronizacao<T extends RegistroCarimbavel>(
  registro: T,
  agora: string,
): T & { atualizadoEm: string; sincronizadaNaNuvem: true } {
  return { ...carimbarAtualizacao(registro, agora), sincronizadaNaNuvem: true };
}
