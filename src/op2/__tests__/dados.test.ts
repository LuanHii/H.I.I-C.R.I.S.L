import { describe, expect, it } from 'vitest';
import { aplicarPassos, descerPasso, facesDe, maiorPasso, subirPasso } from '../regras/dados';
import { ESCALA_PASSOS, type DiceStep } from '../regras/tipos';

describe('escala de passos (p.20)', () => {
  it('sobe um degrau na ordem d4 < d6 < d8 < d10 < d12', () => {
    expect(subirPasso('d4')).toBe('d6');
    expect(subirPasso('d6')).toBe('d8');
    expect(subirPasso('d8')).toBe('d10');
    expect(subirPasso('d10')).toBe('d12');
  });

  it('desce um degrau na ordem inversa', () => {
    expect(descerPasso('d12')).toBe('d10');
    expect(descerPasso('d10')).toBe('d8');
    expect(descerPasso('d8')).toBe('d6');
    expect(descerPasso('d6')).toBe('d4');
  });

  it('o teto normal e d12: subir de d12 sem efeito paranormal nao passa de d12', () => {
    expect(subirPasso('d12')).toBe('d12');
  });

  it('so um efeito paranormal explicito leva d12 a d20 (p.16, p.20)', () => {
    expect(subirPasso('d12', true)).toBe('d20');
    expect(subirPasso('d20', true)).toBe('d20');
  });

  it('o piso e d4: descer de d4 nao produz dado menor', () => {
    expect(descerPasso('d4')).toBe('d4');
  });

  it('descer de d20 volta para a escada normal, em d12', () => {
    expect(descerPasso('d20')).toBe('d12');
  });

  it('subir e descer se cancelam fora dos extremos', () => {
    for (const passo of ['d6', 'd8', 'd10'] as DiceStep[]) {
      expect(descerPasso(subirPasso(passo))).toBe(passo);
      expect(subirPasso(descerPasso(passo))).toBe(passo);
    }
  });

  it('aplicarPassos com quantidade negativa desce, positiva sobe e zero nao mexe', () => {
    expect(aplicarPassos('d6', 2)).toBe('d10');
    expect(aplicarPassos('d10', -2)).toBe('d6');
    expect(aplicarPassos('d8', 0)).toBe('d8');
  });

  it('aplicarPassos satura no teto e no piso em vez de estourar a escala', () => {
    expect(aplicarPassos('d8', 99)).toBe('d12');
    expect(aplicarPassos('d8', -99)).toBe('d4');
  });

  it('cada passo da escala tem as faces que o nome anuncia', () => {
    expect(ESCALA_PASSOS.map(facesDe)).toEqual([4, 6, 8, 10, 12]);
    expect(facesDe('d20')).toBe(20);
  });

  it('maiorPasso compara por faces, nao por posicao no argumento', () => {
    expect(maiorPasso('d6', 'd10')).toBe('d10');
    expect(maiorPasso('d12', 'd8')).toBe('d12');
  });
});
