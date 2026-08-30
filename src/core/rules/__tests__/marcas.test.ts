import { describe, expect, it } from 'vitest';
import type { Marca } from '@/core/types';
import {
  MOTIVO_AJUSTE_MANUAL,
  PERDAS_ZERADAS,
  definirPerdaManual,
  descreverMarca,
  desvioDeNexRegistrado,
  idDaMarcaManual,
  perdasDeAtributoRegistradas,
  registrarMarca,
  removerMarca,
  somarPerdasDeRecurso,
  temDesvioDeNexRegistrado,
} from '@/core/rules/marcas';

const EM = '2026-01-01T00:00:00.000Z';

function marca(parcial: Partial<Marca> & Pick<Marca, 'tipo'>): Marca {
  return {
    id: parcial.id ?? `m-${parcial.tipo}-${parcial.pontos ?? 1}`,
    tipo: parcial.tipo,
    pontos: parcial.pontos ?? 1,
    motivo: parcial.motivo ?? 'Teste',
    registradaEm: parcial.registradaEm ?? EM,
    atributo: parcial.atributo,
  };
}

describe('somarPerdasDeRecurso', () => {
  it('devolve zeros para lista ausente ou vazia', () => {
    expect(somarPerdasDeRecurso(undefined)).toEqual(PERDAS_ZERADAS);
    expect(somarPerdasDeRecurso([])).toEqual(PERDAS_ZERADAS);
  });

  it('acumula varias marcas do mesmo tipo', () => {
    const marcas = [
      marca({ id: 'a', tipo: 'sanMaxPerdida', pontos: 1, motivo: 'O Custo do Paranormal' }),
      marca({ id: 'b', tipo: 'sanMaxPerdida', pontos: 1, motivo: 'O Custo do Paranormal' }),
      marca({ id: 'c', tipo: 'sanMaxPerdida', pontos: 10, motivo: 'Companheiro Animal morreu' }),
    ];
    expect(somarPerdasDeRecurso(marcas).sanMaxPerdida).toBe(12);
  });

  it('separa PV, PE e SAN', () => {
    const marcas = [
      marca({ id: 'a', tipo: 'sanMaxPerdida', pontos: 3 }),
      marca({ id: 'b', tipo: 'pvMaxPerdido', pontos: 2 }),
      marca({ id: 'c', tipo: 'peMaxPerdido', pontos: 1 }),
    ];
    expect(somarPerdasDeRecurso(marcas)).toEqual({ sanMaxPerdida: 3, pvMaxPerdido: 2, peMaxPerdido: 1 });
  });

  it('ignora marcas que nao sao de recurso', () => {
    const marcas = [
      marca({ id: 'a', tipo: 'atributoPerdido', pontos: 1, atributo: 'PRE' }),
      marca({ id: 'b', tipo: 'nexForaDaEscada', pontos: 3 }),
    ];
    expect(somarPerdasDeRecurso(marcas)).toEqual(PERDAS_ZERADAS);
  });

  it('trata pontos negativos como zero', () => {
    expect(somarPerdasDeRecurso([marca({ tipo: 'sanMaxPerdida', pontos: -5 })]).sanMaxPerdida).toBe(0);
  });
});

describe('marcas que nao entram na formula', () => {
  it('perda de atributo e trilha de auditoria, agrupada por atributo', () => {
    const marcas = [
      marca({ id: 'a', tipo: 'atributoPerdido', pontos: 1, atributo: 'PRE' }),
      marca({ id: 'b', tipo: 'atributoPerdido', pontos: 1, atributo: 'PRE' }),
      marca({ id: 'c', tipo: 'atributoPerdido', pontos: 1, atributo: 'INT' }),
    ];
    expect(perdasDeAtributoRegistradas(marcas)).toEqual({ PRE: 2, INT: 1 });
  });

  it('desvio de NEX soma e pode ser detectado', () => {
    expect(temDesvioDeNexRegistrado([])).toBe(false);
    const marcas = [
      marca({ id: 'a', tipo: 'nexForaDaEscada', pontos: 3, motivo: 'Fome do Outro Lado' }),
      marca({ id: 'b', tipo: 'nexForaDaEscada', pontos: 3, motivo: 'Fome do Outro Lado' }),
    ];
    expect(desvioDeNexRegistrado(marcas)).toBe(6);
    expect(temDesvioDeNexRegistrado(marcas)).toBe(true);
  });
});

describe('definirPerdaManual', () => {
  it('cria uma marca com id estavel', () => {
    const marcas = definirPerdaManual(undefined, 'sanMaxPerdida', 2, EM);
    expect(marcas).toHaveLength(1);
    expect(marcas[0].id).toBe(idDaMarcaManual('sanMaxPerdida'));
    expect(marcas[0].motivo).toBe(MOTIVO_AJUSTE_MANUAL);
    expect(marcas[0].pontos).toBe(2);
  });

  it('substitui em vez de acumular quando chamada de novo', () => {
    let marcas = definirPerdaManual(undefined, 'sanMaxPerdida', 2, EM);
    marcas = definirPerdaManual(marcas, 'sanMaxPerdida', 5, EM);
    expect(marcas).toHaveLength(1);
    expect(somarPerdasDeRecurso(marcas).sanMaxPerdida).toBe(5);
  });

  it('remove a marca quando a perda volta a zero ou fica negativa', () => {
    let marcas = definirPerdaManual(undefined, 'sanMaxPerdida', 4, EM);
    expect(definirPerdaManual(marcas, 'sanMaxPerdida', 0, EM)).toEqual([]);
    expect(definirPerdaManual(marcas, 'sanMaxPerdida', -3, EM)).toEqual([]);
  });

  it('nao mexe em marcas de regra nem de outro recurso', () => {
    const daRegra = marca({ id: 'ritual-1', tipo: 'sanMaxPerdida', pontos: 1, motivo: 'O Custo do Paranormal' });
    const dePv = marca({ id: idDaMarcaManual('pvMaxPerdido'), tipo: 'pvMaxPerdido', pontos: 3 });

    const marcas = definirPerdaManual([daRegra, dePv], 'sanMaxPerdida', 7, EM);

    expect(marcas).toContainEqual(daRegra);
    expect(marcas).toContainEqual(dePv);
    expect(somarPerdasDeRecurso(marcas)).toEqual({ sanMaxPerdida: 8, pvMaxPerdido: 3, peMaxPerdido: 0 });
  });

  it('nao muta a lista original', () => {
    const original: Marca[] = [marca({ id: 'x', tipo: 'sanMaxPerdida', pontos: 1 })];
    const copia = [...original];
    definirPerdaManual(original, 'sanMaxPerdida', 9, EM);
    expect(original).toEqual(copia);
  });
});

describe('registrarMarca e removerMarca', () => {
  it('registrar e idempotente por id', () => {
    const m = marca({ id: 'ritual-1', tipo: 'sanMaxPerdida', pontos: 1 });
    const uma = registrarMarca(undefined, m);
    const duas = registrarMarca(uma, m);
    expect(duas).toEqual(uma);
    expect(somarPerdasDeRecurso(duas).sanMaxPerdida).toBe(1);
  });

  it('remover tira exatamente uma marca', () => {
    const marcas = [
      marca({ id: 'a', tipo: 'sanMaxPerdida', pontos: 1 }),
      marca({ id: 'b', tipo: 'sanMaxPerdida', pontos: 1 }),
    ];
    expect(somarPerdasDeRecurso(removerMarca(marcas, 'a')).sanMaxPerdida).toBe(1);
    expect(removerMarca(marcas, 'inexistente')).toEqual(marcas);
  });
});

describe('descreverMarca', () => {
  it('rotula cada tipo de forma legivel', () => {
    expect(descreverMarca(marca({ tipo: 'sanMaxPerdida', pontos: 1, motivo: 'O Custo do Paranormal' })))
      .toBe('Sanidade máxima perdida: -1 — O Custo do Paranormal');
    expect(descreverMarca(marca({ tipo: 'atributoPerdido', pontos: 1, atributo: 'PRE', motivo: 'Ser Macabro' })))
      .toBe('Atributo perdido (PRE): -1 — Ser Macabro');
    expect(descreverMarca(marca({ tipo: 'nexForaDaEscada', pontos: 3, motivo: 'Fome do Outro Lado' })))
      .toBe('NEX fora dos degraus padrão: -3 — Fome do Outro Lado');
  });
});
