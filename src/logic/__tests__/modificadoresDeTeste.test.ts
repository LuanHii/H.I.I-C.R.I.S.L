import { describe, expect, it } from 'vitest';
import type { PericiaName } from '@/core/types';
import { prepararTesteDaFicha } from '@/logic/combatUtils';
import { criarFicha } from '@/testUtils/fixtures';

function modificador(condicao: string, pericia: PericiaName, ataque = false) {
  const ficha = criarFicha({ classe: 'Combatente' });
  ficha.efeitosAtivos = [condicao];
  const base = ficha.periciasDetalhadas[pericia].bonusO;
  const preparado = prepararTesteDaFicha(ficha, pericia, { ataque });
  if (!preparado) throw new Error('Perícia ausente na ficha de teste');
  return preparado.bonusO - base;
}

describe('escopo das condições de OP1', () => {
  it('Desprevenido só reduz dados de Reflexos', () => {
    expect(modificador('Desprevenido', 'Reflexos')).toBe(-1);
    expect(modificador('Desprevenido', 'Pontaria', true)).toBe(0);
  });

  it('Caído só reduz dados de ataques corpo a corpo', () => {
    expect(modificador('Caído', 'Luta', true)).toBe(-2);
    expect(modificador('Caído', 'Luta')).toBe(0);
    expect(modificador('Caído', 'Pontaria', true)).toBe(0);
  });

  it('Agarrado penaliza Pontaria apenas em ataques', () => {
    expect(modificador('Agarrado', 'Pontaria', true)).toBe(-1);
    expect(modificador('Agarrado', 'Pontaria')).toBe(0);
  });

  it('Fascinado aplica a penalidade de dados somente em Percepção', () => {
    expect(modificador('Fascinado', 'Percepção')).toBe(-2);
    expect(modificador('Fascinado', 'Investigação')).toBe(0);
  });
});
