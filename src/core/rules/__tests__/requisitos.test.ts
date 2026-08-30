import { describe, expect, it } from 'vitest';
import type { GrauTreinamento, PericiaName, Poder } from '@/core/types';
import {
  avaliarPoder,
  avaliarRequisitos,
  parseRequisitos,
  type EstadoParaRequisitos,
  type Requisito,
} from '@/core/rules/requisitos';
import { TODAS_PERICIAS } from '@/core/rules/pericias';
import { PODERES } from '@/data/character/powers';

function estado(parcial: Partial<EstadoParaRequisitos> = {}): EstadoParaRequisitos {
  const pericias = Object.fromEntries(
    TODAS_PERICIAS.map((p) => [p, 'Destreinado' as GrauTreinamento]),
  ) as Record<PericiaName, GrauTreinamento>;

  return {
    nex: 5,
    atributos: { AGI: 1, FOR: 1, INT: 1, PRE: 1, VIG: 1 },
    pericias,
    poderes: [],
    proficiencias: [],
    ...parcial,
  };
}

function treinado(...nomes: PericiaName[]): Record<PericiaName, GrauTreinamento> {
  const base = estado().pericias;
  for (const nome of nomes) base[nome] = 'Treinado';
  return base;
}

const TABELA: [string, Requisito[]][] = [
  ['Int 2', [{ tipo: 'atributo', atributo: 'INT', minimo: 2 }]],
  ['Pre 1', [{ tipo: 'atributo', atributo: 'PRE', minimo: 1 }]],
  ['Pre 2', [{ tipo: 'atributo', atributo: 'PRE', minimo: 2 }]],
  // Tanque de Guerra exige o PODER Proteção Pesada (que concede a proficiência),
  // e não a proficiência em si — conferido no Livro de Regras.
  ['Proteção Pesada', [{ tipo: 'poder', poder: 'Proteção Pesada' }]],
  ['Agi 2', [{ tipo: 'atributo', atributo: 'AGI', minimo: 2 }]],
  ['Vig 2', [{ tipo: 'atributo', atributo: 'VIG', minimo: 2 }]],
  ['For 2', [{ tipo: 'atributo', atributo: 'FOR', minimo: 2 }]],
  ['Int 1', [{ tipo: 'atributo', atributo: 'INT', minimo: 1 }]],
  ['Int 3', [{ tipo: 'atributo', atributo: 'INT', minimo: 3 }]],

  ['NEX 30%', [{ tipo: 'nex', minimo: 30 }]],
  ['NEX 60%', [{ tipo: 'nex', minimo: 60 }]],

  ['Conhecimento 1', [{ tipo: 'elemento', elemento: 'Conhecimento', quantidade: 1 }]],
  ['Energia 1', [{ tipo: 'elemento', elemento: 'Energia', quantidade: 1 }]],
  ['Morte 1', [{ tipo: 'elemento', elemento: 'Morte', quantidade: 1 }]],
  ['Morte 2', [{ tipo: 'elemento', elemento: 'Morte', quantidade: 2 }]],
  ['Sangue 1', [{ tipo: 'elemento', elemento: 'Sangue', quantidade: 1 }]],
  ['Sangue 2', [{ tipo: 'elemento', elemento: 'Sangue', quantidade: 2 }]],

  ['Treinado em Intuição', [{ tipo: 'pericia', pericias: ['Intuição'], modo: 'todas' }]],
  ['Treinado em Crime', [{ tipo: 'pericia', pericias: ['Crime'], modo: 'todas' }]],
  ['Treinado em Investigação', [{ tipo: 'pericia', pericias: ['Investigação'], modo: 'todas' }]],
  ['Treinado em Atletismo', [{ tipo: 'pericia', pericias: ['Atletismo'], modo: 'todas' }]],
  ['Treinado em Iniciativa', [{ tipo: 'pericia', pericias: ['Iniciativa'], modo: 'todas' }]],
  ['Treinado em Pontaria', [{ tipo: 'pericia', pericias: ['Pontaria'], modo: 'todas' }]],
  ['Treinado em Furtividade', [{ tipo: 'pericia', pericias: ['Furtividade'], modo: 'todas' }]],
  ['Treinado em Tecnologia', [{ tipo: 'pericia', pericias: ['Tecnologia'], modo: 'todas' }]],

  ['Treinado em Luta ou Pontaria', [{ tipo: 'pericia', pericias: ['Luta', 'Pontaria'], modo: 'qualquer' }]],
  ['Treinado em Diplomacia, Enganação ou Intimidação', [
    { tipo: 'pericia', pericias: ['Diplomacia', 'Enganação', 'Intimidação'], modo: 'qualquer' },
  ]],

  ['Agi 3, Treinado em Luta ou Pontaria', [
    { tipo: 'pericia', pericias: ['Luta', 'Pontaria'], modo: 'qualquer' },
    { tipo: 'atributo', atributo: 'AGI', minimo: 3 },
  ]],
  ['For 2, Treinado em Luta', [
    { tipo: 'pericia', pericias: ['Luta'], modo: 'todas' },
    { tipo: 'atributo', atributo: 'FOR', minimo: 2 },
  ]],
  ['Pre 2, Treinado em Enganação', [
    { tipo: 'pericia', pericias: ['Enganação'], modo: 'todas' },
    { tipo: 'atributo', atributo: 'PRE', minimo: 2 },
  ]],
  ['Agi 3, Treinado em Crime', [
    { tipo: 'pericia', pericias: ['Crime'], modo: 'todas' },
    { tipo: 'atributo', atributo: 'AGI', minimo: 3 },
  ]],
  ['Int 2, Treinado em Percepção e Tática', [
    { tipo: 'pericia', pericias: ['Percepção', 'Tática'], modo: 'todas' },
    { tipo: 'atributo', atributo: 'INT', minimo: 2 },
  ]],
  ['Treinado em Diplomacia, NEX 30%', [
    { tipo: 'pericia', pericias: ['Diplomacia'], modo: 'todas' },
    { tipo: 'nex', minimo: 30 },
  ]],

  ['Proficiência em Proteção Pesada', [{ tipo: 'proficiencia', proficiencia: 'Proteção Pesada' }]],
  ['Treinado na perícia escolhida', [{ tipo: 'periciaEscolhida' }]],
  ['Especialista em Elemento (no elemento escolhido), NEX 45%', [
    { tipo: 'nex', minimo: 45 },
    { tipo: 'poder', poder: 'Especialista em Elemento' },
  ]],
];

describe('parseRequisitos — as 32 strings reais de powers.ts', () => {
  for (const [texto, esperado] of TABELA) {
    it(`"${texto}"`, () => {
      const { requisitos, naoInterpretado } = parseRequisitos(texto);
      expect(naoInterpretado).toEqual([]);
      expect([...requisitos].sort((a, b) => a.tipo.localeCompare(b.tipo)))
        .toEqual([...esperado].sort((a, b) => a.tipo.localeCompare(b.tipo)));
    });
  }

  it('texto vazio ou ausente nao gera requisito', () => {
    expect(parseRequisitos(undefined).requisitos).toEqual([]);
    expect(parseRequisitos('').requisitos).toEqual([]);
    expect(parseRequisitos('   ').requisitos).toEqual([]);
  });
});

describe('cobertura: todo requisito escrito em powers.ts e interpretado', () => {
  it('nenhum poder tem requisito nao interpretado', () => {
    const falhas: string[] = [];

    for (const poder of PODERES) {
      if (!poder.requisitos) continue;
      const { requisitos, naoInterpretado } = parseRequisitos(poder.requisitos);
      if (naoInterpretado.length > 0) falhas.push(`${poder.nome}: sobrou "${naoInterpretado.join(' | ')}"`);
      if (requisitos.length === 0) falhas.push(`${poder.nome}: "${poder.requisitos}" nao gerou requisito`);
    }

    expect(falhas).toEqual([]);
  });

  it('a tabela deste teste cobre todas as strings distintas do catalogo', () => {
    const noCatalogo = Array.from(new Set(PODERES.map((p) => p.requisitos).filter((r): r is string => !!r)));
    const naTabela = new Set(TABELA.map(([texto]) => texto));
    expect(noCatalogo.filter((r) => !naTabela.has(r))).toEqual([]);
  });
});

describe('DEFEITOS CORRIGIDOS do parser antigo', () => {
  it('requisito de pericia com acento passava sempre; agora bloqueia', () => {
    const poder: Poder = { nome: 'X', descricao: '', tipo: 'Classe', livro: 'Regras Básicas', requisitos: 'Treinado em Intuição' };

    expect(avaliarPoder(poder, estado()).elegivel).toBe(false);
    expect(avaliarPoder(poder, estado({ pericias: treinado('Intuição') })).elegivel).toBe(true);
  });

  it('requisito de pericia SEM acento tambem passava sempre; agora bloqueia', () => {
    const poder: Poder = { nome: 'X', descricao: '', tipo: 'Classe', livro: 'Regras Básicas', requisitos: 'Treinado em Atletismo' };

    expect(avaliarPoder(poder, estado()).elegivel).toBe(false);
    expect(avaliarPoder(poder, estado({ pericias: treinado('Atletismo') })).elegivel).toBe(true);
  });

  it('"Luta ou Pontaria" bloqueava quem so tinha Pontaria; agora aceita qualquer uma', () => {
    const poder: Poder = { nome: 'X', descricao: '', tipo: 'Classe', livro: 'Regras Básicas', requisitos: 'Treinado em Luta ou Pontaria' };

    expect(avaliarPoder(poder, estado({ pericias: treinado('Pontaria') })).elegivel).toBe(true);
    expect(avaliarPoder(poder, estado({ pericias: treinado('Luta') })).elegivel).toBe(true);
    expect(avaliarPoder(poder, estado()).elegivel).toBe(false);
  });

  it('"Percepção e Tática" exige as duas', () => {
    const poder: Poder = {
      nome: 'X', descricao: '', tipo: 'Classe', livro: 'Regras Básicas',
      requisitos: 'Int 2, Treinado em Percepção e Tática',
    };
    const atributos = { AGI: 1, FOR: 1, INT: 2, PRE: 1, VIG: 1 };

    expect(avaliarPoder(poder, estado({ atributos, pericias: treinado('Percepção') })).elegivel).toBe(false);
    expect(avaliarPoder(poder, estado({ atributos, pericias: treinado('Tática') })).elegivel).toBe(false);
    expect(avaliarPoder(poder, estado({ atributos, pericias: treinado('Percepção', 'Tática') })).elegivel).toBe(true);
  });

  it('proficiencia nunca era checada; agora e', () => {
    const poder: Poder = { nome: 'X', descricao: '', tipo: 'Classe', livro: 'Regras Básicas', requisitos: 'Proficiência em Proteção Pesada' };

    expect(avaliarPoder(poder, estado()).elegivel).toBe(false);
    expect(avaliarPoder(poder, estado({ proficiencias: ['Proteção Pesada'] })).elegivel).toBe(true);
    expect(avaliarPoder(poder, estado({ proficiencias: ['protecao pesada'] })).elegivel).toBe(true);
  });

  it('poder pre-requisito nunca era checado; agora e', () => {
    const poder: Poder = {
      nome: 'Mestre em Elemento', descricao: '', tipo: 'Paranormal', livro: 'Regras Básicas',
      requisitos: 'Especialista em Elemento (no elemento escolhido), NEX 45%',
    };
    const especialista: Poder = { nome: 'Especialista em Elemento', descricao: '', tipo: 'Paranormal', livro: 'Regras Básicas' };

    expect(avaliarPoder(poder, estado({ nex: 45 })).elegivel).toBe(false);
    expect(avaliarPoder(poder, estado({ nex: 45, poderes: [especialista] })).elegivel).toBe(true);
    expect(avaliarPoder(poder, estado({ nex: 40, poderes: [especialista] })).elegivel).toBe(false);
  });

  it('todos os motivos sao devolvidos, nao so o primeiro', () => {
    const poder: Poder = {
      nome: 'X', descricao: '', tipo: 'Classe', livro: 'Regras Básicas',
      requisitos: 'Int 2, Treinado em Percepção e Tática',
    };
    const resultado = avaliarPoder(poder, estado());

    expect(resultado.elegivel).toBe(false);
    expect(resultado.motivos.length).toBe(2);
    expect(resultado.motivo).toBe(resultado.motivos[0]);
  });
});

describe('contagem de poderes por elemento', () => {
  const sangue = (nome: string): Poder => ({ nome, descricao: '', tipo: 'Paranormal', elemento: 'Sangue', livro: 'Regras Básicas' });

  it('Sangue 2 exige dois poderes de Sangue ja possuidos', () => {
    const poder: Poder = { nome: 'X', descricao: '', tipo: 'Paranormal', elemento: 'Sangue', livro: 'Regras Básicas', requisitos: 'Sangue 2' };

    expect(avaliarPoder(poder, estado({ poderes: [sangue('a')] })).elegivel).toBe(false);
    expect(avaliarPoder(poder, estado({ poderes: [sangue('a'), sangue('b')] })).elegivel).toBe(true);
  });

  it('poderes de outro elemento nao contam', () => {
    const poder: Poder = { nome: 'X', descricao: '', tipo: 'Paranormal', livro: 'Regras Básicas', requisitos: 'Morte 1' };
    expect(avaliarPoder(poder, estado({ poderes: [sangue('a'), sangue('b')] })).elegivel).toBe(false);
  });
});

describe('requisito indeterminado', () => {
  it('"Treinado na perícia escolhida" nao bloqueia, mas e sinalizado', () => {
    const poder: Poder = { nome: 'X', descricao: '', tipo: 'Classe', livro: 'Regras Básicas', requisitos: 'Treinado na perícia escolhida' };
    const resultado = avaliarPoder(poder, estado());

    expect(resultado.elegivel).toBe(true);
    expect(resultado.indeterminados).toHaveLength(1);
  });
});

describe('preRequisitos estruturados tem precedencia sobre o texto', () => {
  it('quando presentes, o texto em prosa e ignorado', () => {
    const poder: Poder = {
      nome: 'X', descricao: '', tipo: 'Classe', livro: 'Regras Básicas',
      requisitos: 'Int 5',
      preRequisitos: [{ tipo: 'atributo', atributo: 'INT', minimo: 1 }],
    };
    expect(avaliarPoder(poder, estado()).elegivel).toBe(true);
  });
});

describe('avaliarRequisitos aceita qualquer estado parcial', () => {
  it('Personagem satisfaz EstadoParaRequisitos estruturalmente', () => {
    const parcial: EstadoParaRequisitos = estado({ nex: 99 });
    expect(avaliarRequisitos([{ tipo: 'nex', minimo: 45 }], parcial).elegivel).toBe(true);
  });

  it('pericias ausentes contam como Destreinado', () => {
    const semPericias = { ...estado(), pericias: {} as Record<PericiaName, GrauTreinamento> };
    const r = avaliarRequisitos([{ tipo: 'pericia', pericias: ['Luta'], modo: 'todas' }], semPericias);
    expect(r.elegivel).toBe(false);
  });
});
