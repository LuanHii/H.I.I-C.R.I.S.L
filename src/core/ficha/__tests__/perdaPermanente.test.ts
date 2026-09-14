import { describe, expect, it } from 'vitest';
import type { ClasseName, MarcaTipo } from '@/core/types';
import { definirPerdaManual } from '@/core/rules/marcas';
import { criarFicha as fichaV0DeTeste } from '@/testUtils/fixtures';
import { buildFicha, definirNivel } from '../buildFicha';
import { atualizarSessao } from '../sessao';
import { paraPersonagem } from '../paraPersonagem';
import type { FichaPersistida } from '../tipos';

const CLASSES: ClasseName[] = ['Combatente', 'Especialista', 'Ocultista'];

function ficha(classe: ClasseName, nex = 20): FichaPersistida {
  return {
    versao: 2,
    identidade: {
      nome: 'Marcado',
      classe,
      origem: 'Policial',
      atributosBase: { AGI: 2, FOR: 2, INT: 2, PRE: 2, VIG: 1 },
      periciasLivres: classe === 'Combatente' ? ['Luta', 'Fortitude'] : [],
    },
    progressao: { nex },
    escolhas: [],
    sessao: { pvDano: 0, peGasto: 0, sanPerdida: 0 },
    ajustes: {},
  };
}

const comPerda = (f: FichaPersistida, tipo: MarcaTipo, pontos: number): FichaPersistida => ({
  ...f,
  sessao: { ...f.sessao, marcas: definirPerdaManual(f.sessao.marcas, tipo, pontos, '2026-01-01T00:00:00.000Z') },
});

const derivados = (f: FichaPersistida) => buildFicha({ ficha: f }).derivados;

describe('O Custo do Paranormal — a perda permanente entra na fórmula do motor novo', () => {
  it.each(CLASSES)('%s: cada ponto de Sanidade perdido reduz o máximo em exatamente 1', (classe) => {
    const base = derivados(ficha(classe)).san.max;
    for (const pontos of [1, 3, 7]) {
      expect(derivados(comPerda(ficha(classe), 'sanMaxPerdida', pontos)).san.max).toBe(base - pontos);
    }
  });

  it('a perda de SAN não afeta PV, PE, Defesa nem limite de PE por rodada', () => {
    const antes = derivados(ficha('Ocultista'));
    const depois = derivados(comPerda(ficha('Ocultista'), 'sanMaxPerdida', 5));
    expect(depois.pv.max).toBe(antes.pv.max);
    expect(depois.pe.max).toBe(antes.pe.max);
    expect(depois.defesa).toBe(antes.defesa);
    expect(depois.peRodada).toBe(antes.peRodada);
  });

  it('perdas de PV e PE seguem o mesmo caminho', () => {
    const antes = derivados(ficha('Combatente'));
    const f = comPerda(comPerda(ficha('Combatente'), 'pvMaxPerdido', 4), 'peMaxPerdido', 2);
    const depois = derivados(f);
    expect(depois.pv.max).toBe(antes.pv.max - 4);
    expect(depois.pe.max).toBe(antes.pe.max - 2);
    expect(depois.san.max).toBe(antes.san.max);
  });

  it('nunca deixa um máximo negativo', () => {
    const d = derivados(comPerda(ficha('Combatente'), 'sanMaxPerdida', 999));
    expect(d.san.max).toBeGreaterThanOrEqual(0);
    expect(d.san.atual).toBeGreaterThanOrEqual(0);
  });
});

describe('a perda sobrevive a tudo que muda a ficha', () => {
  it.each(CLASSES)('%s: sobrevive a subir e descer de nível', (classe) => {
    const marcada = comPerda(ficha(classe, 20), 'sanMaxPerdida', 3);
    const semMarca = ficha(classe, 20);

    for (const nex of [35, 50, 99, 20, 5]) {
      expect(derivados(definirNivel(marcada, nex)).san.max).toBe(derivados(definirNivel(semMarca, nex)).san.max - 3);
    }
  });

  it.each(CLASSES)('%s: a Sanidade continua crescendo com o NEX apesar da perda', (classe) => {
    const marcada = comPerda(ficha(classe, 5), 'sanMaxPerdida', 3);
    const em5 = derivados(marcada).san.max;
    const em50 = derivados(definirNivel(marcada, 50)).san.max;
    expect(em50).toBeGreaterThan(em5);
  });

  it.each(CLASSES)('%s: sobrevive a um save de sessão (dano, PE gasto) — a marca fica na sessão', (classe) => {
    const marcada = comPerda(ficha(classe, 20), 'sanMaxPerdida', 3);
    const view = paraPersonagem({ ficha: marcada, carregarDe: fichaV0DeTeste({ classe, nex: 20 }) });
    const ferida = { ...view, pv: { ...view.pv, atual: view.pv.max - 6 } };

    const r = atualizarSessao(marcada, ferida);
    expect(r.estrutural, r.divergiu.join(', ')).toBe(false);
    expect(r.ficha.sessao.marcas?.length ?? 0, 'o save de sessão apagou a marca').toBeGreaterThan(0);
    expect(derivados(r.ficha).san.max).toBe(derivados(ficha(classe, 20)).san.max - 3);
    expect(derivados(r.ficha).pv.atual).toBe(view.pv.max - 6);
  });
});
