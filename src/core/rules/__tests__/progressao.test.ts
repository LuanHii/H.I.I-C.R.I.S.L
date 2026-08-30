import { describe, expect, it } from 'vitest';
import type { ClasseName } from '@/core/types';
import {
  NEX_CIRCULO_RITUAL,
  NEX_ESCADA,
  NEX_MARCOS_ATRIBUTO,
  NEX_MARCOS_PERICIA,
  NEX_MARCOS_PODER,
  NEX_MARCOS_TRILHA,
  NIVEL_MAXIMO,
  circuloMaximoPorNex,
  ehNexValido,
  estaPerturbado,
  grauAlvoPromocao,
  grauRequeridoParaAlvo,
  grauRequeridoPromocao,
  limiarMachucado,
  limitePeRodada,
  marcosAtingidos,
  nexAnteriorDe,
  nexParaNivel,
  periciasIniciaisPorClasse,
  proximoNexDe,
} from '@/core/rules/progressao';

describe('NEX_ESCADA', () => {
  it('tem os 20 degraus da Tabela 1.2', () => {
    expect(NEX_ESCADA).toEqual([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99]);
    expect(NEX_ESCADA.length).toBe(NIVEL_MAXIMO);
  });

  it('cada degrau vira um nivel distinto e sequencial', () => {
    expect(NEX_ESCADA.map(nexParaNivel)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it('ehNexValido aceita so os degraus', () => {
    for (const nex of NEX_ESCADA) expect(ehNexValido(nex)).toBe(true);
    for (const nex of [0, 1, 4, 6, 96, 98, 100]) expect(ehNexValido(nex)).toBe(false);
  });
});

describe('marcos por tipo de evento', () => {
  it('conferem com as Tabelas 1.3, 1.4 e 1.5', () => {
    expect(NEX_MARCOS_TRILHA).toEqual([10, 40, 65, 99]);
    expect(NEX_MARCOS_PODER).toEqual([15, 30, 45, 60, 75, 90]);
    expect(NEX_MARCOS_ATRIBUTO).toEqual([20, 50, 80, 95]);
    expect(NEX_MARCOS_PERICIA).toEqual([35, 70]);
  });

  it('todo marco e um degrau valido de NEX', () => {
    const todos = [...NEX_MARCOS_TRILHA, ...NEX_MARCOS_PODER, ...NEX_MARCOS_ATRIBUTO, ...NEX_MARCOS_PERICIA];
    for (const marco of todos) expect(ehNexValido(marco)).toBe(true);
  });

  it('marcosAtingidos e monotonico e cresce ate o total', () => {
    expect(marcosAtingidos(NEX_MARCOS_ATRIBUTO, 5)).toEqual([]);
    expect(marcosAtingidos(NEX_MARCOS_ATRIBUTO, 20)).toEqual([20]);
    expect(marcosAtingidos(NEX_MARCOS_ATRIBUTO, 50)).toEqual([20, 50]);
    expect(marcosAtingidos(NEX_MARCOS_ATRIBUTO, 99)).toEqual([20, 50, 80, 95]);

    let anterior = 0;
    for (const nex of NEX_ESCADA) {
      const atual = marcosAtingidos(NEX_MARCOS_PODER, nex).length;
      expect(atual).toBeGreaterThanOrEqual(anterior);
      anterior = atual;
    }
    expect(anterior).toBe(NEX_MARCOS_PODER.length);
  });
});

describe('nexParaNivel', () => {
  it('satura em 1 e em 20', () => {
    for (const nex of [-100, -1, 0, 1, 5]) expect(nexParaNivel(nex)).toBe(1);
    expect(nexParaNivel(99)).toBe(20);
    expect(nexParaNivel(100)).toBe(20);
    expect(nexParaNivel(1000)).toBe(20);
  });

  it('concorda com a formula anterior para todo NEX de 0 a 120', () => {
    const anterior = (nex: number) => Math.min(20, Math.max(1, Math.ceil(nex / 5)));
    for (let nex = 0; nex <= 120; nex += 1) expect(nexParaNivel(nex)).toBe(anterior(nex));
  });
});

describe('limitePeRodada', () => {
  it('e o nivel para as classes de agente', () => {
    for (const classe of ['Combatente', 'Especialista', 'Ocultista'] as ClasseName[]) {
      for (const nex of NEX_ESCADA) expect(limitePeRodada(classe, nex)).toBe(nexParaNivel(nex));
    }
  });

  it('e sempre 1 para o Sobrevivente, qualquer que seja o NEX', () => {
    for (const nex of [0, 5, 50, 99]) expect(limitePeRodada('Sobrevivente', nex)).toBe(1);
  });
});

describe('limiares de PV e SAN', () => {
  it('machucado e a metade arredondada para baixo', () => {
    expect(limiarMachucado(22)).toBe(11);
    expect(limiarMachucado(23)).toBe(11);
    expect(limiarMachucado(1)).toBe(0);
    expect(limiarMachucado(0)).toBe(0);
  });

  it('perturbado quando a Sanidade atual e metade ou menos', () => {
    expect(estaPerturbado(10, 20)).toBe(true);
    expect(estaPerturbado(11, 20)).toBe(false);
    expect(estaPerturbado(0, 20)).toBe(true);
    expect(estaPerturbado(2, 5)).toBe(true);
    expect(estaPerturbado(3, 5)).toBe(false);
  });
});

describe('navegacao pela escada de NEX', () => {
  it('proximoNexDe segue a escada e satura em 99', () => {
    expect(proximoNexDe(5)).toBe(10);
    expect(proximoNexDe(90)).toBe(95);
    expect(proximoNexDe(95)).toBe(99);
    expect(proximoNexDe(99)).toBe(99);
  });

  it('nexAnteriorDe volta pela escada e satura em 5', () => {
    expect(nexAnteriorDe(99)).toBe(95);
    expect(nexAnteriorDe(10)).toBe(5);
    expect(nexAnteriorDe(5)).toBe(5);
  });

  it('subir e voltar e identidade no interior da escada', () => {
    for (const nex of NEX_ESCADA) {
      if (nex === 99) continue;
      expect(nexAnteriorDe(proximoNexDe(nex))).toBe(nex);
    }
  });

  it('reproduz o passo de 4 entre 95 e 99 que o codigo antigo tratava a mao', () => {
    expect(proximoNexDe(95) - 95).toBe(4);
    expect(99 - nexAnteriorDe(99)).toBe(4);
    for (const nex of NEX_ESCADA) {
      if (nex >= 95) continue;
      expect(proximoNexDe(nex) - nex).toBe(5);
    }
  });
});

describe('circuloMaximoPorNex', () => {
  it('desbloqueia nos NEX 5 / 25 / 55 / 85', () => {
    expect(NEX_CIRCULO_RITUAL.map((f) => f.nex)).toEqual([5, 25, 55, 85]);
    expect(circuloMaximoPorNex(5)).toBe(1);
    expect(circuloMaximoPorNex(20)).toBe(1);
    expect(circuloMaximoPorNex(25)).toBe(2);
    expect(circuloMaximoPorNex(54)).toBe(2);
    expect(circuloMaximoPorNex(55)).toBe(3);
    expect(circuloMaximoPorNex(84)).toBe(3);
    expect(circuloMaximoPorNex(85)).toBe(4);
    expect(circuloMaximoPorNex(99)).toBe(4);
  });

  it('e monotonico ao longo da escada', () => {
    let anterior = 0;
    for (const nex of NEX_ESCADA) {
      const atual = circuloMaximoPorNex(nex);
      expect(atual).toBeGreaterThanOrEqual(anterior);
      anterior = atual;
    }
    expect(anterior).toBe(4);
  });

  it('concorda com o lookup exato que existia em levelUp.ts', () => {
    const lookup: Record<number, 1 | 2 | 3 | 4> = { 5: 1, 25: 2, 55: 3, 85: 4 };
    for (const nex of [5, 25, 55, 85]) expect(circuloMaximoPorNex(nex)).toBe(lookup[nex]);
  });
});

describe('graus de treinamento na promocao', () => {
  it('NEX 35% promove para Veterano e NEX 70% para Expert', () => {
    expect(grauAlvoPromocao(35)).toBe('Veterano');
    expect(grauAlvoPromocao(70)).toBe('Expert');
  });

  it('o grau exigido e o imediatamente anterior ao alvo', () => {
    expect(grauRequeridoPromocao(35)).toBe('Treinado');
    expect(grauRequeridoPromocao(70)).toBe('Veterano');
    expect(grauRequeridoParaAlvo('Veterano')).toBe('Treinado');
    expect(grauRequeridoParaAlvo('Expert')).toBe('Veterano');
  });

  it('as duas formas concordam nos marcos', () => {
    for (const nex of NEX_MARCOS_PERICIA) {
      expect(grauRequeridoParaAlvo(grauAlvoPromocao(nex))).toBe(grauRequeridoPromocao(nex));
    }
  });

  it('concorda com as expressoes inline que existiam antes', () => {
    for (const nex of NEX_MARCOS_PERICIA) {
      expect(grauAlvoPromocao(nex)).toBe(nex === 35 ? 'Veterano' : 'Expert');
      expect(grauRequeridoPromocao(nex)).toBe(nex === 35 ? 'Treinado' : 'Veterano');
    }
  });
});

describe('periciasIniciaisPorClasse', () => {
  it('confere com o livro: 1+Int, 7+Int, 3+Int, 1+Int', () => {
    for (const intelecto of [0, 1, 2, 3, 4, 5]) {
      expect(periciasIniciaisPorClasse('Combatente', intelecto)).toBe(Math.max(1, 1 + intelecto));
      expect(periciasIniciaisPorClasse('Especialista', intelecto)).toBe(Math.max(1, 7 + intelecto));
      expect(periciasIniciaisPorClasse('Ocultista', intelecto)).toBe(Math.max(1, 3 + intelecto));
      expect(periciasIniciaisPorClasse('Sobrevivente', intelecto)).toBe(Math.max(1, 1 + intelecto));
    }
  });

  it('nunca devolve menos de 1', () => {
    for (const classe of ['Combatente', 'Especialista', 'Ocultista', 'Sobrevivente'] as ClasseName[]) {
      expect(periciasIniciaisPorClasse(classe, -5)).toBeGreaterThanOrEqual(1);
    }
  });
});
