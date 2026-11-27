import type { Item } from '@/core/types';
import { ehArmaDeEquipamento } from '@/core/rules/catalogo';
import { WEAPONS } from '@/data/combat/weapons';
import { ITENS } from './items';

export function descricaoDoEquipamento(item: Item): string {
  if (item.descricao?.trim()) return item.descricao;
  const catalogo = ehArmaDeEquipamento(item) ? WEAPONS : ITENS;
  const original = catalogo.find(entrada => entrada.nome === item.nome && (!item.livro || entrada.livro === item.livro));
  return original?.descricao || 'Descrição não cadastrada.';
}
