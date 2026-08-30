import type { ClasseName, GrauTreinamento } from '../types';

export const NIVEL_MINIMO = 1;
export const NIVEL_MAXIMO = 20;

export const NEX_ESCADA: readonly number[] = [
  5, 10, 15, 20, 25, 30, 35, 40, 45, 50,
  55, 60, 65, 70, 75, 80, 85, 90, 95, 99,
];

export const NEX_MARCOS_TRILHA: readonly number[] = [10, 40, 65, 99];
export const NEX_MARCOS_PODER: readonly number[] = [15, 30, 45, 60, 75, 90];
export const NEX_MARCOS_ATRIBUTO: readonly number[] = [20, 50, 80, 95];
export const NEX_MARCOS_PERICIA: readonly number[] = [35, 70];
export const NEX_MARCO_VERSATILIDADE = 50;
export const NEX_MARCO_AFINIDADE = 50;

export const NEX_CIRCULO_RITUAL: readonly { nex: number; circulo: 1 | 2 | 3 | 4 }[] = [
  { nex: 5, circulo: 1 },
  { nex: 25, circulo: 2 },
  { nex: 55, circulo: 3 },
  { nex: 85, circulo: 4 },
];

export const NEX_MINIMO = NEX_ESCADA[0];
export const NEX_MAXIMO = NEX_ESCADA[NEX_ESCADA.length - 1];

export function nexParaNivel(nex: number): number {
  const nivel = Math.ceil(Math.max(nex, 0) / 5);
  return Math.min(NIVEL_MAXIMO, Math.max(NIVEL_MINIMO, nivel));
}

export function limitePeRodada(classe: ClasseName, nex: number): number {
  return classe === 'Sobrevivente' ? 1 : nexParaNivel(nex);
}

export function limiarMachucado(pvMaximo: number): number {
  return Math.floor(pvMaximo / 2);
}

export function estaPerturbado(sanAtual: number, sanMaxima: number): boolean {
  return sanAtual <= sanMaxima / 2;
}

export function ehNexValido(nex: number): boolean {
  return NEX_ESCADA.includes(nex);
}

export function proximoNexDe(nex: number): number {
  const proximo = NEX_ESCADA.find((valor) => valor > nex);
  return proximo ?? NEX_MAXIMO;
}

export function nexAnteriorDe(nex: number): number {
  const anteriores = NEX_ESCADA.filter((valor) => valor < nex);
  return anteriores.length > 0 ? anteriores[anteriores.length - 1] : NEX_MINIMO;
}

export function marcosAtingidos(marcos: readonly number[], nex: number): number[] {
  return marcos.filter((marco) => nex >= marco);
}

export function circuloMaximoPorNex(nex: number): 1 | 2 | 3 | 4 {
  let circulo: 1 | 2 | 3 | 4 = 1;
  for (const faixa of NEX_CIRCULO_RITUAL) {
    if (nex >= faixa.nex) circulo = faixa.circulo;
  }
  return circulo;
}

export function grauAlvoPromocao(nex: number): Extract<GrauTreinamento, 'Veterano' | 'Expert'> {
  return nex <= NEX_MARCOS_PERICIA[0] ? 'Veterano' : 'Expert';
}

export function grauRequeridoPromocao(nex: number): Extract<GrauTreinamento, 'Treinado' | 'Veterano'> {
  return nex <= NEX_MARCOS_PERICIA[0] ? 'Treinado' : 'Veterano';
}

export function grauRequeridoParaAlvo(
  alvo: 'Veterano' | 'Expert',
): Extract<GrauTreinamento, 'Treinado' | 'Veterano'> {
  return alvo === 'Veterano' ? 'Treinado' : 'Veterano';
}

export function periciasIniciaisPorClasse(classe: ClasseName, intelecto: number): number {
  switch (classe) {
    case 'Combatente':
      return Math.max(1, 1 + intelecto);
    case 'Especialista':
      return Math.max(1, 7 + intelecto);
    case 'Ocultista':
      return Math.max(1, 3 + intelecto);
    case 'Sobrevivente':
      return Math.max(1, 1 + intelecto);
    default:
      return 1;
  }
}
