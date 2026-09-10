import type { FichaPersistida } from '../ficha/tipos';

export interface RegistroCarimbavel {
  atualizadoEm: string;
  ficha?: FichaPersistida;
  fichaMigradaDe?: string;
}

export function carimbarSincronizacao<T extends RegistroCarimbavel>(
  registro: T,
  agora: string,
): T & { atualizadoEm: string; sincronizadaNaNuvem: true } {
  const aindaValia = Boolean(registro.ficha) && registro.fichaMigradaDe === registro.atualizadoEm;

  return {
    ...registro,
    atualizadoEm: agora,
    ...(aindaValia ? { fichaMigradaDe: agora } : {}),
    sincronizadaNaNuvem: true as const,
  };
}
