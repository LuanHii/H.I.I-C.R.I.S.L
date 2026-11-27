import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { ItemManager } from '../ItemManager';

const descricao = 'Primeiro parágrafo.\n\nÚltima linha da descrição personalizada.';
vi.mock('../../../core/storage', () => ({
  useCloudItems: () => ({
    customItems: [{ nome: 'Item de teste', categoria: 1, tipo: 'Geral', espaco: 1, descricao }],
    customWeapons: [],
  }),
}));

it('oferece um controle de expansão e a descrição integral para cada item', () => {
  const html = renderToStaticMarkup(<ItemManager />);
  const cards = Array.from(html.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g), m => m[1]);
  expect(cards.length).toBeGreaterThan(1);
  for (const card of cards) expect(card).toContain('<summary');
  const personalizado = cards.find(card => card.includes('Item de teste'));
  expect(personalizado?.split('</summary>')[1]).toContain(descricao);
});
