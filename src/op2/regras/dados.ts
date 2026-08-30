import { ESCALA_PASSOS, type DiceStep, type PassoNaEscala } from './tipos';

const FACES: Record<DiceStep, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
};

const MENOR_PASSO: PassoNaEscala = ESCALA_PASSOS[0];
const MAIOR_PASSO: PassoNaEscala = ESCALA_PASSOS[ESCALA_PASSOS.length - 1];

export function facesDe(dado: DiceStep): number {
  return FACES[dado];
}

export function ehDiceStep(valor: unknown): valor is DiceStep {
  return typeof valor === 'string' && valor in FACES;
}

export function ehPassoNaEscala(dado: DiceStep): dado is PassoNaEscala {
  return (ESCALA_PASSOS as readonly string[]).includes(dado);
}

export function subirPasso(dado: DiceStep, permitirD20 = false): DiceStep {
  if (dado === 'd20') return 'd20';
  if (dado === MAIOR_PASSO) return permitirD20 ? 'd20' : MAIOR_PASSO;
  const indice = ESCALA_PASSOS.indexOf(dado as PassoNaEscala);
  return ESCALA_PASSOS[indice + 1];
}

export function descerPasso(dado: DiceStep): DiceStep {
  if (dado === 'd20') return MAIOR_PASSO;
  const indice = ESCALA_PASSOS.indexOf(dado as PassoNaEscala);
  if (indice <= 0) return MENOR_PASSO;
  return ESCALA_PASSOS[indice - 1];
}

export function aplicarPassos(dado: DiceStep, quantidade: number, permitirD20 = false): DiceStep {
  const passos = Math.trunc(quantidade);
  let atual = dado;
  for (let i = 0; i < Math.abs(passos); i += 1) {
    atual = passos > 0 ? subirPasso(atual, permitirD20) : descerPasso(atual);
  }
  return atual;
}

export function compararPassos(a: DiceStep, b: DiceStep): number {
  return facesDe(a) - facesDe(b);
}

export function maiorPasso(a: DiceStep, b: DiceStep): DiceStep {
  return compararPassos(a, b) >= 0 ? a : b;
}
