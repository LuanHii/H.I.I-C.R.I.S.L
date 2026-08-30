import { describe, expect, it } from 'vitest';
import { calculateDerivedStats } from '@/core/rules/derivedStats';
import { CLASSES } from '@/data/character/classes';
import type { Atributos, ClasseName } from '@/core/types';
import { ATRIBUTOS_POR_CLASSE, NEX_LADDER } from '@/testUtils/fixtures';

interface LinhaGolden {
  nex: number;
  pvMax: number;
  peMax: number;
  sanMax: number;
  pdMax: number;
  peRodada: number;
}

const GOLDEN_AGENTE: Record<'Combatente' | 'Especialista' | 'Ocultista', LinhaGolden[]> = {
  Combatente: [
    { nex: 5, pvMax: 22, peMax: 3, sanMax: 12, pdMax: 7, peRodada: 1 },
    { nex: 10, pvMax: 28, peMax: 6, sanMax: 15, pdMax: 11, peRodada: 2 },
    { nex: 20, pvMax: 40, peMax: 12, sanMax: 21, pdMax: 19, peRodada: 4 },
    { nex: 50, pvMax: 76, peMax: 30, sanMax: 39, pdMax: 43, peRodada: 10 },
    { nex: 95, pvMax: 130, peMax: 57, sanMax: 66, pdMax: 79, peRodada: 19 },
    { nex: 99, pvMax: 136, peMax: 60, sanMax: 69, pdMax: 83, peRodada: 20 },
  ],
  Especialista: [
    { nex: 5, pvMax: 18, peMax: 4, sanMax: 16, pdMax: 9, peRodada: 1 },
    { nex: 10, pvMax: 23, peMax: 8, sanMax: 20, pdMax: 14, peRodada: 2 },
    { nex: 20, pvMax: 33, peMax: 16, sanMax: 28, pdMax: 24, peRodada: 4 },
    { nex: 50, pvMax: 63, peMax: 40, sanMax: 52, pdMax: 54, peRodada: 10 },
    { nex: 95, pvMax: 108, peMax: 76, sanMax: 88, pdMax: 99, peRodada: 19 },
    { nex: 99, pvMax: 113, peMax: 80, sanMax: 92, pdMax: 104, peRodada: 20 },
  ],
  Ocultista: [
    { nex: 5, pvMax: 14, peMax: 7, sanMax: 20, pdMax: 13, peRodada: 1 },
    { nex: 10, pvMax: 18, peMax: 14, sanMax: 25, pdMax: 21, peRodada: 2 },
    { nex: 20, pvMax: 26, peMax: 28, sanMax: 35, pdMax: 37, peRodada: 4 },
    { nex: 50, pvMax: 50, peMax: 70, sanMax: 65, pdMax: 85, peRodada: 10 },
    { nex: 95, pvMax: 86, peMax: 133, sanMax: 110, pdMax: 157, peRodada: 19 },
    { nex: 99, pvMax: 90, peMax: 140, sanMax: 115, pdMax: 165, peRodada: 20 },
  ],
};

const GOLDEN_SOBREVIVENTE: { estagio: number; pvMax: number; peMax: number; sanMax: number; pdMax: number }[] = [
  { estagio: 1, pvMax: 9, peMax: 3, sanMax: 8, pdMax: 5 },
  { estagio: 2, pvMax: 11, peMax: 4, sanMax: 10, pdMax: 7 },
  { estagio: 3, pvMax: 13, peMax: 5, sanMax: 12, pdMax: 9 },
  { estagio: 4, pvMax: 15, peMax: 6, sanMax: 14, pdMax: 11 },
  { estagio: 5, pvMax: 17, peMax: 7, sanMax: 16, pdMax: 13 },
];

const TODOS_UM: Atributos = { AGI: 1, FOR: 1, INT: 1, PRE: 1, VIG: 1 };

describe('calculateDerivedStats — tabela golden calculada a mao a partir do livro', () => {
  for (const classe of ['Combatente', 'Especialista', 'Ocultista'] as const) {
    describe(classe, () => {
      const atributos = ATRIBUTOS_POR_CLASSE[classe];

      for (const linha of GOLDEN_AGENTE[classe]) {
        it(`NEX ${linha.nex}% com atributos tipicos da classe`, () => {
          const d = calculateDerivedStats({ classe, atributos, nex: linha.nex });
          expect({
            pvMax: d.pvMax,
            peMax: d.peMax,
            sanMax: d.sanMax,
            pdMax: d.pdMax,
            peRodada: d.peRodada,
          }).toEqual({
            pvMax: linha.pvMax,
            peMax: linha.peMax,
            sanMax: linha.sanMax,
            pdMax: linha.pdMax,
            peRodada: linha.peRodada,
          });
        });
      }
    });
  }

  describe('Sobrevivente cresce por estagio, nao por NEX', () => {
    const atributos = ATRIBUTOS_POR_CLASSE.Sobrevivente;

    for (const linha of GOLDEN_SOBREVIVENTE) {
      it(`estagio ${linha.estagio}`, () => {
        const d = calculateDerivedStats({ classe: 'Sobrevivente', atributos, nex: 0, estagio: linha.estagio });
        expect({ pvMax: d.pvMax, peMax: d.peMax, sanMax: d.sanMax, pdMax: d.pdMax }).toEqual({
          pvMax: linha.pvMax,
          peMax: linha.peMax,
          sanMax: linha.sanMax,
          pdMax: linha.pdMax,
        });
      });
    }

    it('limite de PE do Sobrevivente e sempre 1', () => {
      for (const estagio of [1, 2, 3, 4, 5]) {
        const d = calculateDerivedStats({ classe: 'Sobrevivente', atributos, nex: 0, estagio });
        expect(d.peRodada).toBe(1);
      }
    });

    it('o NEX nao afeta os recursos de um Sobrevivente', () => {
      const comNexZero = calculateDerivedStats({ classe: 'Sobrevivente', atributos, nex: 0, estagio: 3 });
      const comNexAlto = calculateDerivedStats({ classe: 'Sobrevivente', atributos, nex: 99, estagio: 3 });
      expect(comNexAlto).toEqual(comNexZero);
    });
  });

  describe('formula de progressao por NEX', () => {
    for (const classe of ['Combatente', 'Especialista', 'Ocultista'] as const) {
      it(`${classe}: pvMax = inicial + VIG + (nivel-1) * (porNivel + VIG)`, () => {
        const stats = CLASSES[classe];
        const atributos = ATRIBUTOS_POR_CLASSE[classe];

        for (const nex of NEX_LADDER) {
          const nivel = Math.min(20, Math.max(1, Math.ceil(nex / 5)));
          const esperado = stats.pvInicial + atributos.VIG + (nivel - 1) * (stats.pvPorNivel + atributos.VIG);
          expect(calculateDerivedStats({ classe, atributos, nex }).pvMax).toBe(esperado);
        }
      });

      it(`${classe}: sanMax nao depende de nenhum atributo`, () => {
        const base = calculateDerivedStats({ classe, atributos: TODOS_UM, nex: 50 }).sanMax;
        for (const chave of ['AGI', 'FOR', 'INT', 'PRE', 'VIG'] as const) {
          const variado = { ...TODOS_UM, [chave]: 3 };
          expect(calculateDerivedStats({ classe, atributos: variado, nex: 50 }).sanMax).toBe(base);
        }
      });
    }

    it('limite de PE por turno = NEX / 5, saturando em 20', () => {
      for (const nex of NEX_LADDER) {
        const d = calculateDerivedStats({ classe: 'Combatente', atributos: TODOS_UM, nex });
        expect(d.peRodada).toBe(Math.min(20, Math.ceil(nex / 5)));
      }
      expect(calculateDerivedStats({ classe: 'Combatente', atributos: TODOS_UM, nex: 99 }).peRodada).toBe(20);
    });

    it('defesa = 10 + AGI quando nao ha origem nem trilha', () => {
      for (const agi of [0, 1, 2, 3, 4, 5]) {
        const d = calculateDerivedStats({ classe: 'Combatente', atributos: { ...TODOS_UM, AGI: agi }, nex: 50 });
        expect(d.defesa).toBe(10 + agi);
      }
    });

    it('deslocamento e sempre 9', () => {
      for (const classe of ['Combatente', 'Especialista', 'Ocultista', 'Sobrevivente'] as ClasseName[]) {
        expect(calculateDerivedStats({ classe, atributos: TODOS_UM, nex: 50, estagio: 3 }).deslocamento).toBe(9);
      }
    });
  });

  describe('Transcender desconta a Sanidade daquele aumento de NEX', () => {
    for (const classe of ['Combatente', 'Especialista', 'Ocultista'] as const) {
      it(`${classe}: cada Transcender custa sanPorNivel`, () => {
        const atributos = ATRIBUTOS_POR_CLASSE[classe];
        const sanPorNivel = CLASSES[classe].sanPorNivel;
        const base = calculateDerivedStats({ classe, atributos, nex: 50, qtdTranscender: 0 }).sanMax;

        for (const qtd of [1, 2, 3]) {
          const comTranscender = calculateDerivedStats({ classe, atributos, nex: 50, qtdTranscender: qtd }).sanMax;
          expect(comTranscender).toBe(base - qtd * sanPorNivel);
        }
      });
    }

    it('Transcender nao afeta PV nem PE', () => {
      const atributos = ATRIBUTOS_POR_CLASSE.Ocultista;
      const semTranscender = calculateDerivedStats({ classe: 'Ocultista', atributos, nex: 50, qtdTranscender: 0 });
      const comTranscender = calculateDerivedStats({ classe: 'Ocultista', atributos, nex: 50, qtdTranscender: 2 });
      expect(comTranscender.pvMax).toBe(semTranscender.pvMax);
      expect(comTranscender.peMax).toBe(semTranscender.peMax);
    });
  });

  describe('a assinatura posicional legada concorda com a de objeto', () => {
    it('mesmos recursos por ambas as formas de chamada', () => {
      for (const classe of ['Combatente', 'Especialista', 'Ocultista'] as ClasseName[]) {
        const atributos = ATRIBUTOS_POR_CLASSE[classe];
        for (const nex of NEX_LADDER) {
          expect(calculateDerivedStats(classe, atributos, nex)).toEqual(
            calculateDerivedStats({ classe, atributos, nex }),
          );
        }
      }
    });
  });
});
