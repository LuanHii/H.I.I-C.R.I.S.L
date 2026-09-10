import { describe, expect, it } from 'vitest';
import {
  apenasAsQueMudaram,
  moverNaOrdem,
  ordenadas,
  priorizarNaOrdem,
  renumerar,
} from '../ordemCampanhas';

const campanhas = (...nomes: string[]) => nomes.map((id, ordem) => ({ id, ordem }));

const nomes = (lista: { id: string }[] | null) => (lista ?? []).map((c) => c.id);

describe('reordenar campanhas', () => {
  it('subir troca com a de cima', () => {
    const lista = campanhas('ativa', 'encerrada', 'antiga');
    expect(nomes(moverNaOrdem(lista, 'encerrada', -1))).toEqual(['encerrada', 'ativa', 'antiga']);
  });

  it('descer troca com a de baixo', () => {
    const lista = campanhas('ativa', 'encerrada', 'antiga');
    expect(nomes(moverNaOrdem(lista, 'ativa', 1))).toEqual(['encerrada', 'ativa', 'antiga']);
  });

  it('subir a primeira ou descer a última não faz nada', () => {
    const lista = campanhas('a', 'b', 'c');
    expect(moverNaOrdem(lista, 'a', -1)).toBeNull();
    expect(moverNaOrdem(lista, 'c', 1)).toBeNull();
  });

  it('id inexistente não mexe na lista', () => {
    expect(moverNaOrdem(campanhas('a', 'b'), 'fantasma', 1)).toBeNull();
  });

  it('priorizar leva a campanha para o topo sem embaralhar o resto', () => {
    const lista = campanhas('encerrada', 'antiga', 'ativa', 'velha');
    expect(nomes(priorizarNaOrdem(lista, 'ativa'))).toEqual([
      'ativa',
      'encerrada',
      'antiga',
      'velha',
    ]);
  });

  it('priorizar quem já está no topo não faz nada', () => {
    expect(priorizarNaOrdem(campanhas('ativa', 'outra'), 'ativa')).toBeNull();
  });

  it('a ordem devolvida é sempre 0..n-1 sem buracos', () => {
    const lista = [
      { id: 'a', ordem: 7 },
      { id: 'b', ordem: 2 },
      { id: 'c', ordem: 90 },
    ];
    const depois = priorizarNaOrdem(lista, 'c');
    expect(depois?.map((c) => c.ordem)).toEqual([0, 1, 2]);
    expect(nomes(depois)).toEqual(['c', 'b', 'a']);
  });

  it('a entrada não é mutada', () => {
    const lista = campanhas('a', 'b', 'c');
    const copia = JSON.stringify(lista);
    moverNaOrdem(lista, 'b', -1);
    priorizarNaOrdem(lista, 'c');
    expect(JSON.stringify(lista)).toBe(copia);
  });

  it('só as campanhas que mudaram de posição são gravadas', () => {
    const antes = campanhas('a', 'b', 'c', 'd');
    const depois = moverNaOrdem(antes, 'c', -1)!;

    expect(nomes(apenasAsQueMudaram(antes, depois)).sort()).toEqual(['b', 'c']);
    expect(apenasAsQueMudaram(antes, depois).length, 'gravaria campanha intacta').toBe(2);
  });

  it('ordenadas respeita o campo ordem, não a posição do array', () => {
    const bagunca = [
      { id: 'terceira', ordem: 2 },
      { id: 'primeira', ordem: 0 },
      { id: 'segunda', ordem: 1 },
    ];
    expect(nomes(ordenadas(bagunca))).toEqual(['primeira', 'segunda', 'terceira']);
  });

  it('renumerar não perde nem duplica campanha', () => {
    const lista = campanhas('a', 'b', 'c', 'd', 'e');
    const depois = renumerar([...lista].reverse());
    expect(depois.length).toBe(lista.length);
    expect(new Set(depois.map((c) => c.id)).size).toBe(lista.length);
  });
});
