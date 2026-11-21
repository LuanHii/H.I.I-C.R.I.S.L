import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ActionsTab } from '@/components/ActionsTab';
import type { Item } from '@/core/types';
import { criarFicha } from '@/testUtils/fixtures';

const arma: Item = {
  nome: 'Pistola de teste',
  tipo: 'Arma',
  categoria: 1,
  espaco: 1,
  descricao: 'Equipamento fictício',
  stats: { dano: '1d12', alcance: 'Curto', ataqueBonus: 2 },
  livro: 'Regras Básicas',
};

function renderAtaque(alteracoes: Partial<ReturnType<typeof criarFicha>['periciasDetalhadas']['Pontaria']>) {
  const ficha = criarFicha({ classe: 'Combatente' });
  ficha.equipamentos = [arma];
  ficha.periciasDetalhadas.Pontaria = {
    ...ficha.periciasDetalhadas.Pontaria,
    dados: 2,
    criterio: 'melhor',
    bonusFixo: 5,
    bonusO: 0,
    ...alteracoes,
  };
  return renderToStaticMarkup(createElement(ActionsTab, { character: ficha, useSanity: true }));
}

describe('resumo de ataques de OP1', () => {
  it('mostra bônus em dados separado do modificador numérico', () => {
    expect(renderAtaque({ bonusO: 1 })).toContain('3d20 +7');
  });

  it('mostra o pior entre dois dados quando a Agilidade é zero', () => {
    expect(renderAtaque({ criterio: 'pior' })).toContain('2d20 +7 · pior');
  });

  it('mostra o pior resultado quando a penalidade levaria a zero dados', () => {
    expect(renderAtaque({ dados: 1, bonusO: -1 })).toContain('2d20 +7 · pior');
  });

  it('oferece um botão expansível para abrir os detalhes do ataque', () => {
    expect(renderAtaque({})).toMatch(/<button[^>]*aria-expanded="false"[^>]*>.*?Pistola de teste.*?<\/button>/);
  });
});
