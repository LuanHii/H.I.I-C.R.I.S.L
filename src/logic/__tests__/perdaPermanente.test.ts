import { describe, expect, it } from 'vitest';
import type { Marca, Personagem } from '@/core/types';
import { calculateDerivedStats } from '@/core/rules/derivedStats';
import { somarPerdasDeRecurso } from '@/core/rules/marcas';
import { normalizePersonagem } from '@/core/personagemUtils';
import { recalcularRecursosPersonagem } from '@/logic/progression';
import { rebaixarNex, subirNex } from '@/logic/levelUp';
import { auditPersonagem } from '@/core/validation/auditPersonagem';
import { CLASSES } from '@/data/character/classes';
import { CLASSES_AGENTE, NEX_LADDER, criarFicha, fichaNex5 } from '@/testUtils/fixtures';

const EM = '2026-01-01T00:00:00.000Z';

function marcaSan(pontos: number, id = 'ritual-1'): Marca {
  return { id, tipo: 'sanMaxPerdida', pontos, motivo: 'O Custo do Paranormal', registradaEm: EM };
}

function comMarcas(personagem: Personagem, marcas: Marca[]): Personagem {
  const semMarcas = calculateDerivedStats({
    classe: personagem.classe,
    atributos: personagem.atributos,
    nex: personagem.nex,
    estagio: personagem.estagio,
    origemNome: personagem.origem,
    trilhaNome: personagem.trilha,
    qtdTranscender: personagem.qtdTranscender,
  });
  const perdas = somarPerdasDeRecurso(marcas);

  return {
    ...personagem,
    marcas,
    pv: { ...personagem.pv, max: semMarcas.pvMax - perdas.pvMaxPerdido, atual: Math.min(personagem.pv.atual, semMarcas.pvMax - perdas.pvMaxPerdido) },
    pe: { ...personagem.pe, max: semMarcas.peMax - perdas.peMaxPerdido, atual: Math.min(personagem.pe.atual, semMarcas.peMax - perdas.peMaxPerdido) },
    san: { ...personagem.san, max: semMarcas.sanMax - perdas.sanMaxPerdida, atual: Math.min(personagem.san.atual, semMarcas.sanMax - perdas.sanMaxPerdida) },
  };
}

describe('O Custo do Paranormal — a perda entra na formula', () => {
  it('cada ponto perdido reduz o sanMax em exatamente 1', () => {
    for (const classe of CLASSES_AGENTE) {
      const base = calculateDerivedStats({ classe, atributos: { AGI: 2, FOR: 2, INT: 2, PRE: 2, VIG: 1 }, nex: 50 });
      for (const pontos of [1, 2, 7]) {
        const comPerda = calculateDerivedStats({
          classe,
          atributos: { AGI: 2, FOR: 2, INT: 2, PRE: 2, VIG: 1 },
          nex: 50,
          marcas: [marcaSan(pontos)],
        });
        expect(comPerda.sanMax).toBe(base.sanMax - pontos);
      }
    }
  });

  it('a perda nao afeta PV, PE, Defesa nem limite de PE', () => {
    const entrada = { classe: 'Ocultista' as const, atributos: { AGI: 2, FOR: 2, INT: 2, PRE: 2, VIG: 1 }, nex: 50 };
    const base = calculateDerivedStats(entrada);
    const comPerda = calculateDerivedStats({ ...entrada, marcas: [marcaSan(4)] });

    expect(comPerda.pvMax).toBe(base.pvMax);
    expect(comPerda.peMax).toBe(base.peMax);
    expect(comPerda.defesa).toBe(base.defesa);
    expect(comPerda.peRodada).toBe(base.peRodada);
  });

  it('a Sanidade continua crescendo com o NEX apesar da perda', () => {
    const atributos = { AGI: 2, FOR: 2, INT: 2, PRE: 2, VIG: 1 };
    const marcas = [marcaSan(3)];
    let anterior = -Infinity;

    for (const nex of NEX_LADDER) {
      const atual = calculateDerivedStats({ classe: 'Ocultista', atributos, nex, marcas }).sanMax;
      expect(atual).toBeGreaterThan(anterior);
      anterior = atual;
    }
  });

  it('nunca deixa um maximo negativo', () => {
    const d = calculateDerivedStats({
      classe: 'Combatente',
      atributos: { AGI: 2, FOR: 2, INT: 2, PRE: 2, VIG: 1 },
      nex: 5,
      marcas: [marcaSan(9999)],
    });
    expect(d.sanMax).toBe(0);
  });

  it('perdas de PV e PE funcionam pelo mesmo caminho', () => {
    const entrada = { classe: 'Combatente' as const, atributos: { AGI: 2, FOR: 2, INT: 2, PRE: 2, VIG: 1 }, nex: 50 };
    const base = calculateDerivedStats(entrada);
    const comPerda = calculateDerivedStats({
      ...entrada,
      marcas: [
        { id: 'p1', tipo: 'pvMaxPerdido', pontos: 2, motivo: 'Sacrifício', registradaEm: EM },
        { id: 'p2', tipo: 'peMaxPerdido', pontos: 1, motivo: 'Convocar Recipiente', registradaEm: EM },
      ],
    });

    expect(comPerda.pvMax).toBe(base.pvMax - 2);
    expect(comPerda.peMax).toBe(base.peMax - 1);
    expect(comPerda.sanMax).toBe(base.sanMax);
  });
});

describe('a perda permanente sobrevive a todos os caminhos que antes a destruiam', () => {
  const perda = 3;

  for (const classe of CLASSES_AGENTE) {
    it(`${classe}: sobrevive a subirNex`, () => {
      const ficha = comMarcas(criarFicha({ classe, nex: 20 }), [marcaSan(perda)]);
      const semPerda = criarFicha({ classe, nex: 20 });

      const depois = subirNex(ficha, 25).personagem;
      const referencia = subirNex(semPerda, 25).personagem;

      expect(depois.san.max).toBe(referencia.san.max - perda);
    });

    it(`${classe}: sobrevive a normalizePersonagem (o caminho que apagava)`, () => {
      const ficha = comMarcas(criarFicha({ classe, nex: 20 }), [marcaSan(perda)]);
      const normalizada = normalizePersonagem(ficha, true);
      expect(normalizada.san.max).toBe(ficha.san.max);
    });

    it(`${classe}: sobrevive a recalcularRecursosPersonagem`, () => {
      const ficha = comMarcas(criarFicha({ classe, nex: 20 }), [marcaSan(perda)]);
      expect(recalcularRecursosPersonagem(ficha).san.max).toBe(ficha.san.max);
    });

    it(`${classe}: sobrevive a rebaixarNex`, () => {
      const ficha = comMarcas(criarFicha({ classe, nex: 40 }), [marcaSan(perda)]);
      const semPerda = criarFicha({ classe, nex: 40 });

      const depois = rebaixarNex(ficha, 20);
      const referencia = rebaixarNex(semPerda, 20);

      expect(depois.san.max).toBe(referencia.san.max - perda);
    });

    it(`${classe}: sobrevive a um ciclo completo subir + salvar`, () => {
      let ficha = comMarcas(criarFicha({ classe, nex: 10 }), [marcaSan(perda)]);
      for (const alvo of [15, 20, 25, 30]) {
        ficha = normalizePersonagem(subirNex(ficha, alvo).personagem, true);
      }
      const referencia = normalizePersonagem(criarFicha({ classe, nex: 30 }), true);
      expect(ficha.san.max).toBe(referencia.san.max - perda);
    });
  }

  it('a auditoria para de acusar san_max_mismatch numa ficha regra-correta', () => {
    const ficha = comMarcas(criarFicha({ classe: 'Ocultista', nex: 30 }), [marcaSan(perda)]);
    expect(auditPersonagem(ficha).map((i) => i.code)).not.toContain('san_max_mismatch');
  });

  it('a auditoria ainda acusa quando o sanMax diverge de verdade', () => {
    const ficha = comMarcas(criarFicha({ classe: 'Ocultista', nex: 30 }), [marcaSan(perda)]);
    const adulterada: Personagem = { ...ficha, san: { ...ficha.san, max: ficha.san.max + 5 } };
    expect(auditPersonagem(adulterada).map((i) => i.code)).toContain('san_max_mismatch');
  });

  it('uma marca de NEX fora da escada silencia invalid_nex_step', () => {
    const ficha = criarFicha({ classe: 'Ocultista', nex: 30 });
    const foraDaEscada: Personagem = { ...ficha, nex: 33 };
    expect(auditPersonagem(foraDaEscada).map((i) => i.code)).toContain('invalid_nex_step');

    const explicada: Personagem = {
      ...foraDaEscada,
      marcas: [{ id: 'chef-1', tipo: 'nexForaDaEscada', pontos: 3, motivo: 'Fome do Outro Lado', registradaEm: EM }],
    };
    expect(auditPersonagem(explicada).map((i) => i.code)).not.toContain('invalid_nex_step');
  });
});

describe('ficha sem marcas continua identica', () => {
  it('marcas ausente ou vazia nao muda nenhum recurso derivado', () => {
    for (const classe of CLASSES_AGENTE) {
      for (const nex of NEX_LADDER) {
        const atributos = { AGI: 2, FOR: 2, INT: 2, PRE: 2, VIG: 1 };
        const sem = calculateDerivedStats({ classe, atributos, nex });
        expect(calculateDerivedStats({ classe, atributos, nex, marcas: [] })).toEqual(sem);
        expect(calculateDerivedStats({ classe, atributos, nex, marcas: undefined })).toEqual(sem);
      }
    }
  });
});

describe('correcao adjacente: Transcender passa a valer para o Sobrevivente', () => {
  it('o ramo do Sobrevivente desconta qtdTranscender igual aos demais', () => {
    const atributos = { AGI: 2, FOR: 2, INT: 2, PRE: 1, VIG: 1 };
    const sanPorNivel = CLASSES.Sobrevivente.sanPorNivel;
    const base = calculateDerivedStats({ classe: 'Sobrevivente', atributos, nex: 0, estagio: 3, qtdTranscender: 0 });

    for (const qtd of [1, 2]) {
      const comTranscender = calculateDerivedStats({ classe: 'Sobrevivente', atributos, nex: 0, estagio: 3, qtdTranscender: qtd });
      expect(comTranscender.sanMax).toBe(base.sanMax - qtd * sanPorNivel);
    }
  });

  it('e o Sobrevivente tambem acumula marcas', () => {
    const ficha = comMarcas(criarFicha({ classe: 'Sobrevivente', estagio: 2 }), [marcaSan(2)]);
    expect(normalizePersonagem(ficha, true).san.max).toBe(ficha.san.max);
  });
});

describe('a perda permanente e distinta do dano atual', () => {
  it('perder SAN atual nao mexe no maximo, e perder o maximo nao cura', () => {
    const ficha = fichaNex5('Ocultista');
    const machucado: Personagem = { ...ficha, san: { ...ficha.san, atual: ficha.san.atual - 5 } };
    const comPerda = comMarcas(machucado, [marcaSan(1)]);

    expect(comPerda.san.max).toBe(ficha.san.max - 1);
    expect(comPerda.san.atual).toBeLessThan(ficha.san.atual);
  });
});
