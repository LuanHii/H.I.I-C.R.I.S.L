import { describe, expect, it } from 'vitest';
import {
  adicionarPericiaLivre,
  adicionarPoderManual,
  ajustarAtributoBase,
  definirBonusPericia,
  definirDelta,
  definirIdentidade,
  definirNota,
  removerPericiaLivre,
  removerPoderManual,
  temAjustes,
} from '../ajustes';
import { buildFicha } from '../buildFicha';
import { chaveNex, montarId } from '../ids';
import { registrarEscolha } from '../registrarEscolha';
import type { FichaPersistida } from '../tipos';

function fichaBase(over: Partial<FichaPersistida> = {}): FichaPersistida {
  return {
    versao: 2,
    identidade: {
      nome: 'Teste',
      classe: 'Combatente',
      origem: 'Policial',
      atributosBase: { AGI: 2, FOR: 3, INT: 1, PRE: 1, VIG: 2 },
      periciasLivres: ['Luta', 'Fortitude'],
    },
    progressao: { nex: 15 },
    escolhas: [],
    sessao: { pvDano: 0, peGasto: 0, sanPerdida: 0 },
    ajustes: {},
    ...over,
  };
}

describe('ajustes do mestre entram pelo documento v2, nunca pelo personagem', () => {
  it('delta de recurso soma ao derivado e some quando volta a zero', () => {
    const base = buildFicha({ ficha: fichaBase() }).derivados;
    const mais = definirDelta(fichaBase(), 'pvMaxDelta', 7);
    expect(buildFicha({ ficha: mais }).derivados.pv.max).toBe(base.pv.max + 7);

    const zerado = definirDelta(mais, 'pvMaxDelta', 0);
    expect(zerado.ajustes).toEqual({});
    expect(buildFicha({ ficha: zerado }).derivados.pv.max).toBe(base.pv.max);
  });

  it('defesa e PD também são deltas, e cada um só mexe no seu recurso', () => {
    const base = buildFicha({ ficha: fichaBase() }).derivados;
    const ficha = definirDelta(definirDelta(fichaBase(), 'defesaDelta', 2), 'sanMaxDelta', -3);
    const d = buildFicha({ ficha }).derivados;
    expect(d.defesa).toBe(base.defesa + 2);
    expect(d.san.max).toBe(base.san.max - 3);
    expect(d.pv.max).toBe(base.pv.max);
    expect(d.pe.max).toBe(base.pe.max);
  });

  it('nota é guardada aparada e apagada quando vazia', () => {
    expect(definirNota(fichaBase(), '  item amaldiçoado: -2 SAN  ').ajustes.nota).toBe('item amaldiçoado: -2 SAN');
    expect(definirNota(fichaBase(), '   ').ajustes).toEqual({});
  });

  it('bônus fixo de perícia vai para periciaFixos e aparece no detalhe da perícia', () => {
    const sem = buildFicha({ ficha: fichaBase() }).derivados.periciasDetalhadas.Atletismo.bonusFixo;
    const ficha = definirBonusPericia(fichaBase(), 'Atletismo', 2);
    expect(ficha.ajustes.periciaFixos).toEqual({ Atletismo: 2 });
    expect(buildFicha({ ficha }).derivados.periciasDetalhadas.Atletismo.bonusFixo).toBe(sem + 2);
    expect(definirBonusPericia(ficha, 'Atletismo', 0).ajustes).toEqual({});
  });

  it('poder manual entra sem duplicar e sai sem tocar nos derivados', () => {
    const ficha = adicionarPoderManual(adicionarPoderManual(fichaBase(), 'Tolerância'), 'Tolerância');
    expect(ficha.ajustes.poderesManuais).toEqual(['Tolerância']);
    expect(buildFicha({ ficha }).poderes.some((p) => p.nome === 'Tolerância' && p.provenancia.kind === 'manual')).toBe(true);

    const sem = removerPoderManual(ficha, 'Tolerância');
    expect(sem.ajustes).toEqual({});
    expect(buildFicha({ ficha: sem }).poderes.some((p) => p.nome === 'Tolerância')).toBe(false);
  });

  it('um poder que a ficha já deriva de um marco não vira manual', () => {
    const comEscolha = registrarEscolha(
      fichaBase(),
      montarId('poderClasse', chaveNex(15)),
      { tipo: 'poder', poder: 'Reflexos Defensivos' },
    ).ficha;
    const ficha = adicionarPoderManual(comEscolha, 'Reflexos Defensivos');
    expect(ficha.ajustes.poderesManuais).toBeUndefined();
    expect(ficha).toBe(comEscolha);
  });

  it('remover pelo nome um poder que veio de um marco não tira o poder — só escolhas fazem isso', () => {
    const comEscolha = registrarEscolha(
      fichaBase(),
      montarId('poderClasse', chaveNex(15)),
      { tipo: 'poder', poder: 'Reflexos Defensivos' },
    ).ficha;
    const tentativa = removerPoderManual(comEscolha, 'Reflexos Defensivos');
    expect(buildFicha({ ficha: tentativa }).poderes.some((p) => p.nome === 'Reflexos Defensivos')).toBe(true);
    expect(tentativa.escolhas).toEqual(comEscolha.escolhas);
  });

  it('ajustar atributo base mexe na identidade e o motor recalcula recursos', () => {
    const antes = buildFicha({ ficha: fichaBase() });
    const ficha = ajustarAtributoBase(fichaBase(), 'VIG', +1);
    const depois = buildFicha({ ficha });
    expect(ficha.identidade.atributosBase.VIG).toBe(3);
    expect(depois.atributos.VIG).toBe(antes.atributos.VIG + 1);
    expect(depois.derivados.pv.max).toBeGreaterThan(antes.derivados.pv.max);
  });

  it('atributo base não desce abaixo de zero nem gera documento novo à toa', () => {
    const zero = ajustarAtributoBase(ajustarAtributoBase(fichaBase(), 'INT', -1), 'INT', -1);
    expect(zero.identidade.atributosBase.INT).toBe(0);
    const mesmo = ajustarAtributoBase(zero, 'INT', -1);
    expect(mesmo).toBe(zero);
  });

  it('treinar uma perícia em ficha v2 é registrar perícia de criação, e o motor a deriva', () => {
    const ficha = adicionarPericiaLivre(fichaBase(), 'Percepção');
    expect(ficha.identidade.periciasLivres).toContain('Percepção');
    expect(buildFicha({ ficha }).derivados.graus['Percepção']).toBe('Treinado');
    expect(adicionarPericiaLivre(ficha, 'Percepção')).toBe(ficha);
  });

  it('destreinar só tira o que era perícia de criação — o que vem da classe fica', () => {
    const ocultista: FichaPersistida = {
      ...fichaBase(),
      identidade: { ...fichaBase().identidade, classe: 'Ocultista', periciasLivres: ['Percepção'] },
    };
    const semPercepcao = removerPericiaLivre(ocultista, 'Percepção');
    expect(buildFicha({ ficha: semPercepcao }).derivados.graus['Percepção']).toBe('Destreinado');

    const tentativa = removerPericiaLivre(ocultista, 'Ocultismo');
    expect(tentativa).toBe(ocultista);
    expect(buildFicha({ ficha: tentativa }).derivados.graus['Ocultismo']).toBe('Treinado');
  });

  it('nome e conceito são identidade: aparados, conceito vazio some, nome vazio é ignorado', () => {
    const ficha = definirIdentidade(fichaBase(), { nome: '  Ana Meirelles ', conceito: ' médica do turno da noite ' });
    expect(ficha.identidade.nome).toBe('Ana Meirelles');
    expect(ficha.identidade.conceito).toBe('médica do turno da noite');
    expect(buildFicha({ ficha }).derivados.pv.max).toBe(buildFicha({ ficha: fichaBase() }).derivados.pv.max);

    const semConceito = definirIdentidade(ficha, { conceito: '   ' });
    expect('conceito' in semConceito.identidade).toBe(false);

    expect(definirIdentidade(ficha, { nome: '  ' })).toBe(ficha);
    expect(definirIdentidade(ficha, { nome: 'Ana Meirelles' })).toBe(ficha);
  });

  it('temAjustes ignora ruído (zeros, listas vazias, nota em branco)', () => {
    expect(temAjustes({})).toBe(false);
    expect(temAjustes({ pvMaxDelta: 0, poderesManuais: [], nota: ' ', periciaFixos: { Luta: 0 } })).toBe(false);
    expect(temAjustes({ defesaDelta: 1 })).toBe(true);
  });
});
