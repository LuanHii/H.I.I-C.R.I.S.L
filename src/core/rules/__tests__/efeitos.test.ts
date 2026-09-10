import { describe, expect, it } from 'vitest';
import type { PericiaName } from '@/core/types';
import {
  type Efeito,
  aplicarEfeitos,
  aplicarVarios,
  bonusVazio,
  temEfeitoMecanico,
} from '@/core/rules/efeitos';

const ctx = (nex: number, jaTreinadas: PericiaName[] = []) => ({
  nex,
  jaTreinadas: new Set(jaTreinadas),
});

describe('aplicarEfeitos: perícias', () => {
  it('soma bônus fixo', () => {
    const r = aplicarEfeitos([{ tipo: 'periciaBonus', pericia: 'Diplomacia', valor: 2 }], ctx(5));
    expect(r.periciaFixos.Diplomacia).toBe(2);
  });

  it('acumula bônus da mesma perícia vindos de fontes diferentes', () => {
    const r = aplicarVarios(
      [
        [{ tipo: 'periciaBonus', pericia: 'Ocultismo', valor: 2 }],
        [{ tipo: 'periciaBonus', pericia: 'Ocultismo', valor: 5 }],
      ],
      ctx(5),
    );
    expect(r.periciaFixos.Ocultismo).toBe(7);
  });

  it('treinamento numa perícia nova treina, sem dar bônus', () => {
    const r = aplicarEfeitos([{ tipo: 'treinamento', pericia: 'Furtividade' }], ctx(5));
    expect(r.treinamentos).toEqual(['Furtividade']);
    expect(r.periciaFixos.Furtividade).toBeUndefined();
  });

  it('treinamento numa perícia já treinada vira +2, como o livro manda', () => {
    const r = aplicarEfeitos(
      [{ tipo: 'treinamento', pericia: 'Furtividade' }],
      ctx(5, ['Furtividade']),
    );
    expect(r.treinamentos).toEqual([]);
    expect(r.periciaFixos.Furtividade).toBe(2);
  });

  it('respeita bônus alternativo quando o poder foge do padrão +2', () => {
    const r = aplicarEfeitos(
      [{ tipo: 'treinamento', pericia: 'Religião', bonusSeJaTreinado: 5 }],
      ctx(5, ['Religião']),
    );
    expect(r.periciaFixos.Religião).toBe(5);
  });

  it('não duplica o mesmo treinamento declarado duas vezes', () => {
    const r = aplicarEfeitos(
      [
        { tipo: 'treinamento', pericia: 'Atletismo' },
        { tipo: 'treinamento', pericia: 'Atletismo' },
      ],
      ctx(5),
    );
    expect(r.treinamentos).toEqual(['Atletismo']);
  });
});

describe('aplicarEfeitos: escala por NEX', () => {
  it.each([
    [5, 1], [19, 3], [20, 4], [32, 6], [99, 19],
  ])('+1 PV a cada 5%% de NEX: em NEX %i dá %i', (nex, esperado) => {
    const r = aplicarEfeitos([{ tipo: 'pv', valor: 1, porNex: 5 }], ctx(nex));
    expect(r.pvBonus).toBe(esperado);
  });

  it.each([
    [10, 1], [29, 2], [30, 3], [99, 9],
  ])('+1 PE a cada 10%% de NEX: em NEX %i dá %i', (nex, esperado) => {
    const r = aplicarEfeitos([{ tipo: 'pe', valor: 1, porNex: 10 }], ctx(nex));
    expect(r.peBonus).toBe(esperado);
  });

  it('conta degraus completos, nunca arredonda para cima', () => {
    expect(aplicarEfeitos([{ tipo: 'pv', valor: 1, porNex: 5 }], ctx(34)).pvBonus).toBe(6);
  });

  it('sem porNex o valor é fixo e não escala', () => {
    expect(aplicarEfeitos([{ tipo: 'san', valor: 2 }], ctx(99)).sanBonus).toBe(2);
  });
});

describe('aplicarEfeitos: demais tipos', () => {
  it('resistências acumulam por tipo de dano, sem diferenciar caixa', () => {
    const r = aplicarVarios(
      [
        [{ tipo: 'resistenciaDano', contra: 'mental', valor: 5 }],
        [{ tipo: 'resistenciaDano', contra: 'Mental', valor: 5 }],
        [{ tipo: 'resistenciaDano', contra: 'Sangue', valor: 10 }],
      ],
      ctx(5),
    );
    expect(r.resistencias).toEqual({ mental: 10, sangue: 10 });
  });

  it('deslocamento e defesa somam', () => {
    const r = aplicarEfeitos(
      [{ tipo: 'deslocamento', valor: 3 }, { tipo: 'defesa', valor: 2 }],
      ctx(5),
    );
    expect(r.deslocamentoBonus).toBe(3);
    expect(r.defesaBonus).toBe(2);
  });

  it('atributo de carga não duplica', () => {
    const r = aplicarEfeitos(
      [{ tipo: 'cargaAtributo', atributo: 'INT' }, { tipo: 'cargaAtributo', atributo: 'INT' }],
      ctx(5),
    );
    expect(r.cargaAtributos).toEqual(['INT']);
  });

  it('efeito narrativo não gera número, só nota', () => {
    const r = aplicarEfeitos([{ tipo: 'narrativo', nota: 'O mestre decide o aliado.' }], ctx(5));
    expect(r.notas).toEqual(['O mestre decide o aliado.']);
    expect(r).toMatchObject({ pvBonus: 0, peBonus: 0, sanBonus: 0, defesaBonus: 0 });
  });
});

describe('contratos do interpretador', () => {
  it('efeitos undefined devolve o acumulador intacto', () => {
    expect(aplicarEfeitos(undefined, ctx(50))).toEqual(bonusVazio());
  });

  it('aplicar duas vezes o mesmo efeito soma — não é idempotente de propósito', () => {
    const efeito: Efeito[] = [{ tipo: 'periciaBonus', pericia: 'Luta', valor: 2 }];
    const destino = bonusVazio();
    aplicarEfeitos(efeito, ctx(5), destino);
    aplicarEfeitos(efeito, ctx(5), destino);
    expect(destino.periciaFixos.Luta).toBe(4);
  });

  it('temEfeitoMecanico separa narrativo puro de efeito numérico', () => {
    expect(temEfeitoMecanico(undefined)).toBe(false);
    expect(temEfeitoMecanico([])).toBe(false);
    expect(temEfeitoMecanico([{ tipo: 'narrativo', nota: 'x' }])).toBe(false);
    expect(temEfeitoMecanico([{ tipo: 'defesa', valor: 1 }])).toBe(true);
    expect(temEfeitoMecanico([{ tipo: 'narrativo', nota: 'x' }, { tipo: 'defesa', valor: 1 }])).toBe(true);
  });
});
