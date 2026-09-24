import { describe, expect, it } from 'vitest';
import {
  GRUPO_ACOMPANHADAS,
  codigoDePareamentoValido,
  mesmasFichas,
  montarFichasDaMesa,
  normalizarCodigo,
  type CampanhaDaMesa,
  type FichaPropria,
} from '../mesa';

const campanhas: CampanhaDaMesa[] = [
  { id: 'c2', nome: 'Calamidade', ordem: 1 },
  { id: 'c1', nome: 'Desconjuração', ordem: 0 },
];

function ficha(id: string, nome: string, campanha?: string): FichaPropria {
  return { id, personagem: { nome, classe: 'Combatente', nex: 20 }, campanha };
}

const fichas = [
  ficha('a', 'Zara', 'c2'),
  ficha('b', 'Arthur', 'c1'),
  ficha('c', 'Bruno'),
  ficha('d', 'Carla', 'apagada'),
];

describe('montarFichasDaMesa', () => {
  it('com todas as campanhas, ordena por campanha do mestre e deixa sem campanha por ultimo', () => {
    const resultado = montarFichasDaMesa(
      { todasAsCampanhas: true, campanhas: [], incluirAcompanhadas: false },
      fichas,
      campanhas,
      [],
    );

    expect(resultado.map((f) => f.nome)).toEqual(['Arthur', 'Zara', 'Bruno', 'Carla']);
    expect(resultado[0]).toMatchObject({ agentId: 'b', campanhaNome: 'Desconjuração', origem: 'propria' });
    expect(resultado[3]).toMatchObject({ campanhaId: null, campanhaNome: null });
  });

  it('com campanhas escolhidas, publica so as fichas delas', () => {
    const resultado = montarFichasDaMesa(
      { todasAsCampanhas: false, campanhas: ['c2'], incluirAcompanhadas: false },
      fichas,
      campanhas,
      [],
    );

    expect(resultado.map((f) => f.agentId)).toEqual(['a']);
  });

  it('acompanhadas entram num grupo proprio, depois das campanhas', () => {
    const resultado = montarFichasDaMesa(
      { todasAsCampanhas: false, campanhas: ['c1'], incluirAcompanhadas: true },
      fichas,
      campanhas,
      [{ agentId: 'j1', nome: 'Jogadora', classe: 'Ocultista', nex: 35 }],
    );

    expect(resultado.map((f) => f.agentId)).toEqual(['b', 'j1']);
    expect(resultado[1]).toMatchObject({ campanhaNome: GRUPO_ACOMPANHADAS, origem: 'acompanhada' });
  });

  it('acompanhadas ficam de fora quando a opcao esta desligada', () => {
    const resultado = montarFichasDaMesa(
      { todasAsCampanhas: true, campanhas: [], incluirAcompanhadas: false },
      [],
      campanhas,
      [{ agentId: 'j1', nome: 'Jogadora', classe: 'Ocultista', nex: 35 }],
    );

    expect(resultado).toEqual([]);
  });

  it('ficha propria que o mestre tambem acompanha aparece uma vez so', () => {
    const resultado = montarFichasDaMesa(
      { todasAsCampanhas: true, campanhas: [], incluirAcompanhadas: true },
      [ficha('a', 'Zara', 'c2')],
      campanhas,
      [{ agentId: 'a', nome: 'Zara', classe: 'Combatente', nex: 20 }],
    );

    expect(resultado).toHaveLength(1);
    expect(resultado[0].origem).toBe('propria');
  });
});

describe('mesmasFichas', () => {
  const base = montarFichasDaMesa(
    { todasAsCampanhas: true, campanhas: [], incluirAcompanhadas: false },
    fichas,
    campanhas,
    [],
  );

  it('ignora a ordem das chaves, que o Firestore nao preserva', () => {
    const relida = base.map((f) => Object.fromEntries(Object.entries(f).reverse())) as typeof base;

    expect(JSON.stringify(relida)).not.toBe(JSON.stringify(base));
    expect(mesmasFichas(relida, base)).toBe(true);
  });

  it('detecta mudanca de NEX', () => {
    const mudada = base.map((f, i) => (i === 0 ? { ...f, nex: 25 } : f));

    expect(mesmasFichas(mudada, base)).toBe(false);
  });
});

describe('codigo de pareamento', () => {
  it('aceita 10 caracteres do alfabeto sem ambiguidade', () => {
    expect(codigoDePareamentoValido('ABCDEFGH23')).toBe(true);
  });

  it('recusa letras ambiguas, tamanho errado e nao-strings', () => {
    expect(codigoDePareamentoValido('ABCDEFGH10')).toBe(false);
    expect(codigoDePareamentoValido('ABCDEFGH2')).toBe(false);
    expect(codigoDePareamentoValido(undefined)).toBe(false);
  });

  it('normaliza o que o usuario digitar', () => {
    expect(normalizarCodigo('abcde-fgh 23')).toBe('ABCDEFGH23');
  });
});
