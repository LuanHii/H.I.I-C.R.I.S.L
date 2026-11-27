import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi, afterEach } from 'vitest';
import { ITENS } from '@/data/equipment/items';
import { criarFicha } from '@/testUtils/fixtures';
import { InventoryTabContent } from '../character/InventoryTabContent';

afterEach(() => vi.unstubAllGlobals());

it('expande cada descrição da ficha, incluindo itens antigos e personalizados', () => {
  vi.stubGlobal('React', React);
  const agent = criarFicha({ classe: 'Combatente' });
  const lanterna = ITENS.find(item => item.nome === 'Lanterna Tática')!;
  const personalizada = 'Descrição da mesa.\n\nEfeito até o fim da cena.';
  agent.equipamentos = [{ ...lanterna, descricao: '' }, { ...lanterna, descricao: personalizada }];
  const html = renderToStaticMarkup(<InventoryTabContent agent={agent} readOnly onAddItem={() => {}} onRemoveItem={() => {}} />);
  const detalhes = Array.from(html.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g), m => m[1].split('</summary>')[1]);
  expect(detalhes).toHaveLength(2);
  expect(detalhes[0]).toContain(lanterna.descricao);
  expect(detalhes[1]).toContain(personalizada);
  expect(html).not.toContain('Remover ');
});
