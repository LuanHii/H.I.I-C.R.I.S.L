import { pericia } from './pericias';
import { DT_PADRAO } from './rolagem';
import type { DiceStep, RefPericia } from './tipos';

export const DT_RECAPITULAR = 10;
export const DT_COMPARTILHAR = 10;
export const DT_MENTORIA = 7;

export const PERICIA_RECAPITULAR: RefPericia = pericia('Intuição');
export const PERICIA_COMPARTILHAR: RefPericia = pericia('Pesquisar');

export const PERICIA_FERIMENTO: RefPericia = pericia('Vigor');
export const PERICIA_TRAUMA: RefPericia = pericia('Disciplina');

export const ACRESCIMO_POR_TESTE_REPETIDO = 3;

export { DT_PADRAO };

export function dtEscalante(testesJaFeitos: number): number {
  return DT_PADRAO + ACRESCIMO_POR_TESTE_REPETIDO * Math.max(0, Math.trunc(testesJaFeitos));
}

export function dtDeFerimento(testesJaFeitos: number): number {
  return dtEscalante(testesJaFeitos);
}

export function dtDeTrauma(testesJaFeitos: number): number {
  return dtEscalante(testesJaFeitos);
}

export function precisaTesteDeFerimento(pvAtual: number): boolean {
  return pvAtual <= 0;
}

export function precisaTesteDeTrauma(pdAtual: number): boolean {
  return pdAtual <= 0;
}

export function passosDeAjuda(dado: DiceStep): 0 | 1 | 2 {
  if (dado === 'd4') return 0;
  if (dado === 'd6' || dado === 'd8') return 1;
  return 2;
}

export function podeAjudarCom(dado: DiceStep): boolean {
  return passosDeAjuda(dado) > 0;
}

export const DT_ALCANCAR_ARRISCADO_ACRESCIMO = 3;

export function dtDeAlcancar(dtDoAmbiente: number, modo: 'seguro' | 'arriscado'): number {
  return modo === 'arriscado' ? dtDoAmbiente + DT_ALCANCAR_ARRISCADO_ACRESCIMO : dtDoAmbiente;
}

export function danoDeAlcancarFalho(
  modo: 'seguro' | 'arriscado',
  resultado: { ra: number; rb: number },
): number {
  return modo === 'arriscado' ? resultado.ra : resultado.rb;
}

export function danoDeCombate(
  resultado: { ra: number; rb: number },
  armado: boolean,
): number {
  return armado ? resultado.ra : resultado.rb;
}

export const BONUS_DE_ESQUIVA: DiceStep = 'd6';
export const DT_ATAQUE_DE_AGRESSOR_EXTRA = 7;
