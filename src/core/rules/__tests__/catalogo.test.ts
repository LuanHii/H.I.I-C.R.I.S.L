import { describe, expect, it } from 'vitest';
import type { Item, Poder } from '@/core/types';
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
import { ITENS } from '@/data/equipment/items';
import { WEAPONS } from '@/data/combat/weapons';
import { RITUAIS } from '@/data/magic/rituals';
import { calcularStatsModificados, getModificacoesParaArma } from '@/data/equipment/modifications';
import { armaComoItem, comModificacoes } from '@/logic/rascunhoDeCriacao';
import { CLASSES_AGENTE, criarFicha } from '@/testUtils/fixtures';

describe('itens amaldiçoados especiais do Livro de Regras', () => {
  it.each([
    ['Coração Pulsante', 'Amaldiçoado (Sangue)', 'Fortitude'],
    ['Amarras Mortais', 'Amaldiçoado (Morte)', '2 PE'],
  ])('cadastra %s com categoria II, 1 espaço e regra de uso', (nome, tipo, regra) => {
    const itens = ITENS.filter((item) => item.nome === nome);
    expect(itens).toHaveLength(1);
    expect(itens[0]).toMatchObject({ categoria: 2, espaco: 1, tipo, livro: 'Regras Básicas' });
    expect(itens[0].descricao).toContain(regra);
  });
});

describe('equipamentos que aplicam ou removem condições', () => {
  it('explica como Algemas imobilizam e como escapar (OP1, Acrobacia e Algemas)', () => {
    const algemas = ITENS.find((item) => item.nome === 'Algemas');
    expect(algemas?.descricao).toContain('impede o deslocamento');
    expect(algemas?.descricao).toContain('ação completa');
    expect(algemas?.descricao).toContain('Acrobacia DT 30');
  });

  it('limita Ofuscado e Surdo a uma rodada na resistência à Granada de Atordoamento', () => {
    const granada = ITENS.find((item) => item.nome === 'Granada de Atordoamento');
    expect(granada?.descricao).toContain('Ofuscado e Surdo por 1 rodada');
  });
});

describe('rituais de OP1 que aplicam ou removem condições', () => {
  it('Milagre Ionizante cura uma condição elegível e só depois exige Fortitude DT 30', () => {
    const ritual = RITUAIS.find(r => r.nome === 'Milagre Ionizante');
    expect(ritual?.resistencia).toBe('Nenhuma');
    expect(ritual?.efeito.padrao).toMatch(/uma condição.*Energia.*permanentes.*Após.*Fortitude \(DT 30\).*infecticídio/);
    expect(ritual?.descricao).not.toMatch(/cura.*PV/i);
  });

  it('Medo Tangível lista imunidades e restringe o piso de 1 PV aos quatro tipos de dano', () => {
    const ritual = RITUAIS.find(r => r.nome === 'Medo Tangível');
    expect(ritual?.efeito.padrao).toContain('doenças e venenos');
    expect(ritual?.efeito.padrao).toContain('acertos críticos e ataques furtivos');
    expect(ritual?.efeito.padrao).toMatch(/balístico, corte, impacto e perfuração.*1 PV/);
  });

  it('Definhar verdadeiro mantém Exausto em falha e Fatigado em sucesso', () => {
    const ritual = RITUAIS.find(r => r.nome === 'Definhar');
    expect(ritual?.efeito.verdadeiro).toMatch(/Exausto.*Fatigado.*5 seres.*Morte/);
  });
});

describe('armas e proteções conferidas nas tabelas de OP1', () => {
  it('explica a recarga da Espingarda de Cano Duplo após os dois cartuchos', () => {
    const espingarda = WEAPONS.find(w => w.nome === 'Espingarda de Cano Duplo');
    expect(espingarda?.stats).toMatchObject({ Dano_Base: '4d6', Critico: 'x3', Alcance: 'Curto' });
    expect(espingarda?.descricao).toMatch(/após disparar os dois cartuchos/i);
  });

  it('limita o ataque extra de Shuriken a uma vez por rodada contra o mesmo alvo', () => {
    const shuriken = WEAPONS.find(w => w.nome === 'Shuriken');
    expect(shuriken?.descricao).toMatch(/uma vez por rodada/i);
    expect(shuriken?.descricao).toMatch(/mesmo alvo/i);
  });

  it('diferencia os testes de conjuração com proteção leve ou pesada', () => {
    expect(ITENS.find(i => i.nome === 'Proteção Leve')?.descricao).toContain('Vontade DT 15');
    expect(ITENS.find(i => i.nome === 'Proteção Pesada')?.descricao).toContain('Vontade DT 20');
  });
});

describe('consumíveis e explosivos conferidos no Livro de Regras e em Sobrevivendo ao Horror v1.3', () => {
  it.each([
    ['Granada de Atordoamento', '6m'],
    ['Granada de Fragmentação', '6m'],
    ['Granada Incendiária', '6m'],
    ['Granada de Fumaça', '6m'],
    ['Granada de Gás Sonífero', '6m'],
    ['Granada de PEM', '18m'],
  ])('%s informa a ação, o alcance e o raio %s', (nome, raio) => {
    const descricao = ITENS.find(i => i.nome === nome)?.descricao;
    expect(descricao).toContain('alcance médio');
    expect(descricao).toContain('ação padrão');
    expect(descricao).toContain(raio);
  });

  it('separa os resultados de resistência de Incendiária, Gás Sonífero e PEM', () => {
    const incendiaria = ITENS.find(i => i.nome === 'Granada Incendiária')?.descricao;
    const gas = ITENS.find(i => i.nome === 'Granada de Gás Sonífero')?.descricao;
    const pem = ITENS.find(i => i.nome === 'Granada de PEM')?.descricao;
    expect(incendiaria).toContain('metade do dano e evita Em Chamas');
    expect(gas).toMatch(/Inconsciente e Caído.*Exausto por 1 rodada.*Fatigado.*Fatigado por 1d4 rodadas/);
    expect(pem).toMatch(/Criaturas de Energia.*uma vez por cena/);
    expect(pem).toContain('metade do dano e evita Paralisado');
  });

  it.each(['Spray de Pimenta', 'Taser'])('%s tem um único cadastro, operacional, de categoria I e um espaço', (nome) => {
    expect(WEAPONS.some(w => w.nome === nome)).toBe(false);
    expect(ITENS.filter(i => i.nome === nome)).toEqual([
      expect.objectContaining({ tipo: 'Geral (Operacional)', categoria: 1, espaco: 1 }),
    ]);
  });

  it.each([
    ['Dardos para Pistola (Caixa)', 'Pistola de Dardos'],
    ['Cargas para Pistola Sinalizadora (Caixa)', 'Pistola Sinalizadora'],
  ])('inclui %s como reposição de categoria 0', (nome, pistola) => {
    expect(ITENS.find(i => i.nome === nome)).toMatchObject({
      categoria: 0, espaco: 1, descricao: expect.stringContaining(pistola),
    });
  });

  it('informa custo de uso dos medicamentos e prazo do Coagulante', () => {
    const medicamentos = ITENS.filter(i => i.tipo === 'Geral (Medicamento)');
    expect(medicamentos).toHaveLength(8);
    for (const item of medicamentos) {
      expect(item.descricao).toMatch(/ação padrão.*consuma.*ser adjacente/i);
    }
    expect(medicamentos.find(i => i.nome === 'Coagulante')?.descricao).toContain('até o fim do dia');
    expect(ITENS.find(i => i.nome === 'Cicatrizante')?.descricao).toContain('consuma este item');
  });
});

describe('modificações das armas de OP1', () => {
  const armaDoLivro = (nome: string): Item => armaComoItem(WEAPONS.find(w => w.nome === nome)!);
  const opcoes = (item: Item) => getModificacoesParaArma(item).map(mod => mod.nome);

  it('oferece Perigosa para arco e evita tratar arremesso e arco como arma de fogo', () => {
    expect(opcoes(armaDoLivro('Faca'))).not.toContain('Calibre Grosso');
    expect(opcoes(armaDoLivro('Arco'))).toContain('Perigosa');
    expect(opcoes(armaDoLivro('Arco'))).not.toContain('Calibre Grosso');
  });

  it('oferece Carregador Rápido à Besta e à Pistola com o aviso sobre a regra opcional', () => {
    const besta = getModificacoesParaArma(armaDoLivro('Besta')).find(mod => mod.nome === 'Carregador Rápido');
    expect(besta?.efeito).toMatch(/contagem de munição.*cinco recargas/i);
    expect(opcoes(armaDoLivro('Pistola'))).toContain('Carregador Rápido');
    expect(opcoes(armaDoLivro('Arco'))).not.toContain('Carregador Rápido');
    expect(opcoes(armaDoLivro('Pistola'))).not.toContain('Cano Longo');
  });

  it('Compensador exige arma automática de fábrica ou com Ferrolho Automático', () => {
    const pistola = armaDoLivro('Pistola');
    expect(opcoes(pistola)).not.toContain('Compensador');
    expect(opcoes({ ...pistola, modificacoes: ['Ferrolho Automático'] })).toContain('Compensador');
    expect(opcoes(armaDoLivro('Fuzil de Assalto'))).toContain('Compensador');
  });

  it('não acumula o mesmo modificador em fichas antigas nem cobra duas categorias em novos registros', () => {
    const espada = armaDoLivro('Espada');
    const modificada = comModificacoes(espada, ['Certeira', 'Certeira']);
    expect(modificada).toMatchObject({ categoria: 2, modificacoes: ['Certeira'] });
    expect(calcularStatsModificados({ ...espada, modificacoes: ['Certeira', 'Certeira'] }).ataqueBonus).toBe(2);
  });

  it('preserva os dados para uma e duas mãos ao modificar uma Espada', () => {
    const espada = armaDoLivro('Espada');
    expect(calcularStatsModificados({ ...espada, modificacoes: ['Tática'] }).dano).toBe('1d8/1d10');
    expect(calcularStatsModificados({ ...espada, modificacoes: ['Cruel'] }).dano).toBe('1d8+2/1d10+2');
  });
});

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
