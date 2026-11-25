import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ActionsTab } from '@/components/ActionsTab';
import type { Item } from '@/core/types';
import { WEAPONS } from '@/data/combat/weapons';
import { prepararAtaquesDaFicha } from '@/logic/combatUtils';
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

function renderAtaque(
  alteracoes: Partial<ReturnType<typeof criarFicha>['periciasDetalhadas']['Pontaria']>,
  item = arma,
  efeitosAtivos: string[] = [],
) {
  const ficha = criarFicha({ classe: 'Combatente' });
  ficha.equipamentos = [item];
  ficha.efeitosAtivos = efeitosAtivos;
  ficha.periciasDetalhadas.Luta = {
    ...ficha.periciasDetalhadas.Luta,
    dados: 1,
    criterio: 'melhor',
    bonusFixo: 10,
    bonusO: 0,
  };
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

  it.each(['Faca', 'Lança', 'Machadinha', 'Faca Tática', 'Bastão Policial'])(
    '%s com alcance Curto mostra Luta e Pontaria; Caído penaliza só Luta',
    (nome) => {
      const entrada = WEAPONS.find(w => w.nome === nome)!;
      const item: Item = { ...arma, nome, descricao: entrada.descricao, stats: { dano: entrada.stats.Dano_Base, alcance: 'Curto' } };
      const html = renderAtaque({}, item, ['Caído']);
      expect(html).toContain('Luta 3d20 +10 · pior');
      expect(html).toMatch(/Pontaria 2d20 \+5<\/span>/);
    },
  );

  it('explicita o multiplicador x2 da margem 18 da Pistola (OP1, tabela 3.3 e Acertos Críticos)', () => {
    const pistola = { ...arma, nome: 'Pistola', stats: { ...arma.stats, critico: '18' } };
    expect(renderAtaque({}, pistola)).toContain('Crítico: 18/x2');
  });

  it('lê Taser e Spray de Pimenta antigos como equipamentos de resistência, fora da lista de testes de ataque', () => {
    const ficha = criarFicha({ classe: 'Combatente' });
    ficha.equipamentos = [arma, { ...arma, nome: 'Taser' }, { ...arma, nome: 'Spray de Pimenta' }];
    expect(prepararAtaquesDaFicha(ficha).map(ataque => ataque.item.nome)).toEqual([arma.nome]);
  });
});
