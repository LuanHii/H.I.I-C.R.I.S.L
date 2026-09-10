import type { FichaOp2 } from '../regras/tipos';

export const ATRASO_DE_SINCRONIZACAO_MS = 500;

function serializarEstavel(valor: unknown): string {
  if (Array.isArray(valor)) {
    return `[${valor.map(serializarEstavel).join(',')}]`;
  }
  if (valor && typeof valor === 'object') {
    const objeto = valor as Record<string, unknown>;
    return `{${Object.keys(objeto)
      .sort()
      .map((chave) => `${JSON.stringify(chave)}:${serializarEstavel(objeto[chave])}`)
      .join(',')}}`;
  }
  return JSON.stringify(valor);
}

export function assinaturaDaFicha(ficha: FichaOp2): string {
  return serializarEstavel(ficha);
}

export function precisaSincronizar(
  publicada: boolean,
  assinaturaEnviada: string | null,
  assinaturaAtual: string,
): boolean {
  if (!publicada) return false;
  if (assinaturaEnviada === null) return false;
  return assinaturaEnviada !== assinaturaAtual;
}
