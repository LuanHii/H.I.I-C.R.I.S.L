import { describe, expect, it } from 'vitest';
import type { Poder } from '@/core/types';
import {
  CATALOGO_PADRAO,
  CATALOGO_SO_BASICO,
  LIVROS,
  RENOMEACOES_DE_PODER,
  apelidosDe,
  correspondeAoNome,
  ehHomebrew,
  filtrarPorCatalogo,
  migrarNomesDePoder,
  nomeCanonicoDePoder,
  origemDeRegra,
  permitidoNoCatalogo,
  selo,
} from '@/core/rules/catalogo';
import { PODERES, getPoderesElegiveis, getPoderesGerais } from '@/data/character/powers';
import { parseRequisitos } from '@/core/rules/requisitos';
import { CLASSES_AGENTE, criarFicha } from '@/testUtils/fixtures';

const TABELA_2_3: [string, string | null][] = [
  ['Acrobático', 'Agi 2'],
  ['Ás do Volante', 'Agi 2'],
  ['Atlético', 'For 2'],
  ['Atraente', 'Pre 2'],
  ['Dedos Ágeis', 'Agi 2'],
  ['Detector de Mentiras', 'Pre 2'],
  ['Especialista em Emergências', 'Int 2'],
  ['Estigmado', null],
  ['Foco em Perícia', 'Treinado na perícia escolhida'],
  ['Inventário Organizado', 'Int 2'],
  ['Informado', 'Int 2'],
  ['Interrogador', 'For 2'],
  ['Mentiroso Nato', 'Pre 2'],
  ['Observador', 'Int 2'],
  ['Pai de Pet', 'Pre 2'],
  ['Palavras de Devoção', 'Pre 2'],
  ['Parceiro', 'Treinado em Diplomacia, NEX 30%'],
  ['Pensamento Tático', 'Int 2'],
  ['Personalidade Esotérica', 'Int 2'],
  ['Persuasivo', 'Pre 2'],
  ['Pesquisador Científico', 'Int 2'],
  ['Proativo', 'Agi 2'],
  ['Provisões de Emergência', null],
  ['Racionalidade Inflexível', 'Int 3'],
  ['Rato de Computador', 'Int 2'],
  ['Resposta Rápida', 'Agi 2'],
  ['Talentoso', 'Pre 2'],
  ['Teimosia Obstinada', 'Pre 2'],
  ['Tenacidade', 'Vig 2'],
  ['Sentidos Aguçados', 'Pre 2'],
  ['Sobrevivencialista', 'Int 2'],
  ['Sorrateiro', 'Agi 2'],
  ['Vitalidade Reforçada', 'Vig 2'],
  ['Vontade Inabalável', 'Pre 2'],
];

const CONVERTIDOS_EM_GERAIS = ['Artista Marcial', 'Combater com Duas Armas', 'Saque Rápido', 'Tiro Certeiro'];

function porNome(nome: string): Poder | undefined {
  return PODERES.find((p) => p.nome === nome);
}

describe('Tabela 2.3: Poderes Gerais (Sobrevivendo ao Horror)', () => {
  it('tem 34 entradas transcritas do livro', () => {
    expect(TABELA_2_3).toHaveLength(34);
    expect(new Set(TABELA_2_3.map(([n]) => n)).size).toBe(34);
  });

  for (const [nome, requisito] of TABELA_2_3) {
    it(`${nome} existe no catalogo como poder geral oficial`, () => {
      const poder = porNome(nome);
      expect(poder, `"${nome}" ausente do catalogo`).toBeDefined();
      expect(poder!.tipo).toBe('Geral');
      expect(origemDeRegra(poder!)).toBe('oficial');
      expect(poder!.livro).toBe('Sobrevivendo ao Horror');
    });
  }

  for (const [nome, requisito] of TABELA_2_3) {
    if (requisito === null) {
      it(`${nome} nao tem pre-requisito`, () => {
        expect(porNome(nome)!.requisitos).toBeUndefined();
      });
      continue;
    }

    it(`${nome} exige "${requisito}"`, () => {
      const poder = porNome(nome)!;
      expect(poder.requisitos).toBeDefined();
      expect(parseRequisitos(poder.requisitos).requisitos)
        .toEqual(parseRequisitos(requisito).requisitos);
    });
  }
});

describe('os 4 poderes de classe convertidos em gerais pelo suplemento', () => {
  for (const nome of CONVERTIDOS_EM_GERAIS) {
    it(`${nome} e poder geral oficial do Livro de Regras`, () => {
      const poder = porNome(nome);
      expect(poder).toBeDefined();
      expect(poder!.tipo).toBe('Geral');
      expect(origemDeRegra(poder!)).toBe('oficial');
      expect(poder!.livro).toBe('Regras Básicas');
    });
  }
});

describe('nada de oficial ficou marcado como homebrew', () => {
  it('so os poderes sem correspondencia nos livros sao homebrew', () => {
    const homebrew = PODERES.filter(ehHomebrew).map((p) => p.nome).sort();
    expect(homebrew).toEqual(['Investigador Aplicado', 'Treinado em Armas']);
  });

  it('todo poder geral oficial esta na Tabela 2.3 ou na lista de convertidos', () => {
    const conhecidos = new Set([...TABELA_2_3.map(([n]) => n), ...CONVERTIDOS_EM_GERAIS]);
    const oficiaisGerais = getPoderesGerais().filter((p) => !ehHomebrew(p)).map((p) => p.nome);
    expect(oficiaisGerais.filter((n) => !conhecidos.has(n))).toEqual([]);
  });

  it('o total de poderes gerais fecha: 34 da tabela + 4 convertidos + 2 homebrew', () => {
    expect(getPoderesGerais()).toHaveLength(34 + 4 + 2);
  });
});

describe('regra de substituicao: poder geral no lugar de poder de classe', () => {
  for (const classe of CLASSES_AGENTE) {
    it(`${classe} pode escolher poder geral cumprindo os pre-requisitos`, () => {
      const ficha = criarFicha({ classe, nex: 50, atributos: { AGI: 2, FOR: 2, INT: 2, PRE: 2, VIG: 1 } });
      const elegiveis = getPoderesElegiveis(ficha).map((p) => p.nome);
      const geraisElegiveis = getPoderesGerais()
        .filter((p) => !ehHomebrew(p))
        .filter((p) => elegiveis.includes(p.nome));

      expect(geraisElegiveis.length).toBeGreaterThan(0);
    });
  }

  it('poder geral com pre-requisito nao cumprido nao aparece', () => {
    const ficha = criarFicha({ classe: 'Ocultista', nex: 50, atributos: { AGI: 1, FOR: 1, INT: 2, PRE: 3, VIG: 2 } });
    const elegiveis = getPoderesElegiveis(ficha).map((p) => p.nome);

    expect(elegiveis).not.toContain('Atlético');
    expect(elegiveis).not.toContain('Racionalidade Inflexível');
    expect(elegiveis).toContain('Atraente');
  });
});

describe('gate por livro de regras', () => {
  it('so Regras Basicas remove todo poder do suplemento', () => {
    const doSuplemento = PODERES.filter((p) => p.livro === 'Sobrevivendo ao Horror' && !ehHomebrew(p));
    expect(doSuplemento.length).toBeGreaterThan(0);
    expect(filtrarPorCatalogo(doSuplemento, CATALOGO_SO_BASICO)).toEqual([]);
  });

  it('sem o suplemento, a Tabela 2.3 desaparece por inteiro', () => {
    const daTabela = TABELA_2_3.map(([nome]) => porNome(nome)!);
    expect(filtrarPorCatalogo(daTabela, CATALOGO_SO_BASICO)).toEqual([]);
  });

  it('os 4 convertidos continuam disponiveis so com o livro base', () => {
    const convertidos = CONVERTIDOS_EM_GERAIS.map((nome) => porNome(nome)!);
    expect(filtrarPorCatalogo(convertidos, CATALOGO_SO_BASICO)).toEqual(convertidos);
  });

  it('por padrao os dois livros estao ligados', () => {
    expect([...CATALOGO_PADRAO.livrosHabilitados].sort()).toEqual([...LIVROS].sort());
  });

  it('selo identifica a fonte', () => {
    expect(selo(porNome('Saque Rápido')!)).toBeUndefined();
    expect(selo(porNome('Persuasivo')!)).toBe('SaH');
    expect(selo(porNome('Treinado em Armas')!)).toBe('Não oficial');
  });
});

describe('gate de homebrew', () => {
  it('por padrao homebrew fica fora', () => {
    expect(CATALOGO_PADRAO.homebrewHabilitado).toBe(false);

    const ficha = criarFicha({ classe: 'Especialista', nex: 50, atributos: { AGI: 3, FOR: 1, INT: 3, PRE: 1, VIG: 1 } });
    const nomes = getPoderesElegiveis(ficha).map((p) => p.nome);
    expect(nomes).not.toContain('Treinado em Armas');
  });

  it('habilitado, homebrew entra', () => {
    const ficha = criarFicha({ classe: 'Especialista', nex: 50, atributos: { AGI: 3, FOR: 1, INT: 3, PRE: 1, VIG: 1 } });
    const nomes = getPoderesElegiveis(ficha, { ...CATALOGO_PADRAO, homebrewHabilitado: true }).map((p) => p.nome);
    expect(nomes).toContain('Treinado em Armas');
  });

  it('filtrarPorCatalogo respeita a opcao', () => {
    const homebrew = PODERES.filter(ehHomebrew);
    expect(filtrarPorCatalogo(homebrew)).toEqual([]);
    expect(filtrarPorCatalogo(homebrew, { ...CATALOGO_PADRAO, homebrewHabilitado: true })).toEqual(homebrew);
    expect(permitidoNoCatalogo(homebrew[0])).toBe(false);
  });

});

describe('migracao de nomes nao canonicos', () => {
  it('mapeia os 4 nomes antigos para os do livro', () => {
    expect(RENOMEACOES_DE_PODER).toEqual({
      'Lábia': 'Persuasivo',
      'Prevenção': 'Provisões de Emergência',
      'Projeção Mental': 'Racionalidade Inflexível',
      'Lutador Violento': 'Interrogador',
    });
  });

  it('cada renomeado guarda o nome antigo como apelido', () => {
    for (const [antigo, novo] of Object.entries(RENOMEACOES_DE_PODER)) {
      expect(apelidosDe(porNome(novo)!)).toContain(antigo);
      expect(porNome(antigo)).toBeUndefined();
    }
  });

  it('a busca acha pelo nome antigo e pelo novo', () => {
    for (const [antigo, novo] of Object.entries(RENOMEACOES_DE_PODER)) {
      const poder = porNome(novo)!;
      expect(correspondeAoNome(poder, antigo)).toBe(true);
      expect(correspondeAoNome(poder, novo)).toBe(true);
      expect(correspondeAoNome(poder, 'xyz-inexistente')).toBe(false);
    }
  });

  it('a busca ignora acento e caixa', () => {
    const poder = porNome('Racionalidade Inflexível')!;
    expect(correspondeAoNome(poder, 'racionalidade inflexivel')).toBe(true);
    expect(correspondeAoNome(poder, 'PROJECAO MENTAL')).toBe(true);
  });

  it('nomeCanonicoDePoder e idempotente', () => {
    for (const [antigo, novo] of Object.entries(RENOMEACOES_DE_PODER)) {
      expect(nomeCanonicoDePoder(antigo)).toBe(novo);
      expect(nomeCanonicoDePoder(novo)).toBe(novo);
    }
    expect(nomeCanonicoDePoder('Ataque Especial')).toBe('Ataque Especial');
  });

  it('migrarNomesDePoder converte ficha antiga e preserva o resto', () => {
    const antigos = [
      { nome: 'Lábia', descricao: 'x', tipo: 'Geral', livro: 'Sobrevivendo ao Horror' },
      { nome: 'Ataque Especial', descricao: 'y', tipo: 'Classe', livro: 'Regras Básicas' },
    ] as Poder[];

    const migrados = migrarNomesDePoder(antigos);
    expect(migrados.map((p) => p.nome)).toEqual(['Persuasivo', 'Ataque Especial']);
    expect(migrados[1]).toBe(antigos[1]);
  });
});
