import { describe, expect, it, vi } from 'vitest';
import { fichaDoPreset } from '../presets/sobreviventes';
import {
  SUBCOLECAO_OP2,
  caminhoDaBiblioteca,
  ehRegistroOp2,
  envelopeDaFicha,
} from '../nuvem/biblioteca';

vi.mock('@/core/firebase/config', () => ({ db: {}, auth: { currentUser: null } }));

vi.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => ({ caminho: args }),
  doc: (...args: unknown[]) => ({ caminho: args }),
  onSnapshot: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
}));

describe('onde a biblioteca de Ordem 2 mora no perfil', () => {
  it('NAO usa a subcolecao "fichas": ela guarda as fichas reais de Ordem 1', () => {
    expect(SUBCOLECAO_OP2).not.toBe('fichas');
    expect(caminhoDaBiblioteca('u1')).not.toContain('fichas');
  });

  it('mora sob o usuario, entao a regra de perfil ja existente cobre a leitura', () => {
    expect(caminhoDaBiblioteca('u1')).toEqual(['users', 'u1', SUBCOLECAO_OP2]);
  });

  it('o caminho carrega o uid recebido, nunca um fixo', () => {
    expect(caminhoDaBiblioteca('outro')[1]).toBe('outro');
  });
});

describe('o envelope guardado no perfil', () => {
  it('separa a ficha do carimbo, para o carimbo nao virar campo de regra', () => {
    const registro = envelopeDaFicha(fichaDoPreset('alan'), '2026-01-01T00:00:00.000Z');
    expect(registro.id).toBe(registro.ficha.id);
    expect(registro.atualizadoEm).toBe('2026-01-01T00:00:00.000Z');
    expect('atualizadoEm' in registro.ficha).toBe(false);
  });

  it('reconhece so o que for ficha de Ordem 2', () => {
    expect(ehRegistroOp2(envelopeDaFicha(fichaDoPreset('alan')))).toBe(true);
    expect(ehRegistroOp2({ ficha: { nome: 'Personagem de Ordem 1' } })).toBe(false);
    expect(ehRegistroOp2({ personagem: { classe: 'Combatente' } })).toBe(false);
    expect(ehRegistroOp2(null)).toBe(false);
  });
});
