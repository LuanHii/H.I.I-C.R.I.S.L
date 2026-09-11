import { buildFicha } from './buildFicha';
import type { FichaPersistida } from './tipos';

export interface SinalDaFicha {
  pendentes: number;
  erros: string[];
  avisos: string[];
}

export function sinalDaFicha(ficha: FichaPersistida): SinalDaFicha {
  const build = buildFicha({ ficha });
  return {
    pendentes: build.pendencias.length,
    erros: build.problemas.filter((p) => p.gravidade === 'erro').map((p) => p.mensagem),
    avisos: build.problemas.filter((p) => p.gravidade === 'aviso').map((p) => p.mensagem),
  };
}

export function descreverSinal(sinal: SinalDaFicha): string {
  const linhas: string[] = [];
  if (sinal.pendentes > 0) linhas.push(`${sinal.pendentes} escolha(s) pendente(s)`);
  linhas.push(...sinal.erros.map((m) => `[ERRO] ${m}`));
  linhas.push(...sinal.avisos.map((m) => `[AVISO] ${m}`));
  return linhas.join('\n');
}

export function sinalVazio(sinal: SinalDaFicha): boolean {
  return sinal.pendentes === 0 && sinal.erros.length === 0 && sinal.avisos.length === 0;
}
