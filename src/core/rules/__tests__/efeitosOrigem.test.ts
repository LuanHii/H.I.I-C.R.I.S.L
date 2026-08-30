import { describe, expect, it } from 'vitest';
import type { PericiaName } from '@/core/types';
import { ORIGENS } from '@/data/character/origins';
import { normalizePersonagem } from '@/core/personagemUtils';
import { calcularBonusOrigem } from '@/core/rules/derivedStats';
import { temEfeitoMecanico } from '@/core/rules/efeitos';
import { criarFicha } from '@/testUtils/fixtures';

const salvar = (p: Parameters<typeof normalizePersonagem>[0]) => normalizePersonagem(p, false);

describe('o bônus da origem sobrevive ao save (split-brain)', () => {
  /**
   * Antes, quatro origens só existiam no switch da criação. O bônus aparecia
   * na ficha nova e sumia no primeiro save, porque o recálculo lia apenas
   * `overrides.periciaFixos`. Cada caso abaixo é uma dessas.
   */
  it.each([
    ['Diplomata', 'Diplomacia' as PericiaName, 2],
    ['Profetizado', 'Vontade' as PericiaName, 2],
  ])('%s mantém +%i em %s depois de normalizar duas vezes', (origem, pericia, bonus) => {
    const ficha = criarFicha({ classe: 'Especialista', nex: 10, origemNome: origem });

    const umSave = salvar(ficha);
    const doisSaves = salvar(umSave);

    expect(umSave.periciasDetalhadas[pericia].bonusFixo).toBeGreaterThanOrEqual(bonus);
    expect(
      doisSaves.periciasDetalhadas[pericia].bonusFixo,
      'o bônus encolheu no segundo save',
    ).toBe(umSave.periciasDetalhadas[pericia].bonusFixo);
  });

  it('Experimento mantém o –1d20 em Diplomacia depois do save', () => {
    // A penalidade de dado é registrada em `bonusO`, não em `dados`.
    const experimento = salvar(criarFicha({ classe: 'Combatente', nex: 10, origemNome: 'Experimento' }));
    const controle = salvar(criarFicha({ classe: 'Combatente', nex: 10, origemNome: 'Policial' }));
    expect(experimento.periciasDetalhadas.Diplomacia.bonusO).toBe(-1);
    expect(controle.periciasDetalhadas.Diplomacia.bonusO).toBe(0);
  });

  it('normalizar N vezes não acumula o bônus da origem', () => {
    let ficha = criarFicha({ classe: 'Especialista', nex: 10, origemNome: 'Diplomata' });
    const primeiro = salvar(ficha).periciasDetalhadas.Diplomacia.bonusFixo;
    for (let i = 0; i < 5; i += 1) ficha = salvar(ficha);
    expect(ficha.periciasDetalhadas.Diplomacia.bonusFixo).toBe(primeiro);
  });
});

describe('efeitos numéricos das origens migradas', () => {
  const bonus = (origem: string, nex: number, atributos = { AGI: 1, FOR: 1, INT: 3, PRE: 1, VIG: 1 }) =>
    calcularBonusOrigem(origem, nex, atributos, true);

  it.each([
    ['Desgarrado', 40, 'pvBonus', 8],
    ['Mergulhador', 5, 'pvBonus', 5],
    ['Vítima', 40, 'sanBonus', 8],
    ['Policial', 5, 'defesaBonus', 2],
    ['Lutador', 5, 'danoCorpoACorpoBonus', 2],
    ['Militar', 5, 'danoArmaFogoBonus', 2],
  ] as const)('%s em NEX %i dá %s = %i', (origem, nex, campo, esperado) => {
    expect(bonus(origem, nex)[campo]).toBe(esperado);
  });

  it('Universitário: +1 base e +1 por NEX ímpar', () => {
    expect(bonus('Universitário', 5).peBonus).toBe(2);
    expect(bonus('Universitário', 15).peBonus).toBe(3);
    expect(bonus('Universitário', 99).peBonus).toBe(12);
  });

  it('Teórico da Conspiração: RD mental igual ao Intelecto', () => {
    expect(bonus('Teórico da Conspiração', 5).resistenciaDanoMental).toBe(3);
    expect(
      calcularBonusOrigem('Teórico da Conspiração', 5, { AGI: 1, FOR: 1, INT: 5, PRE: 1, VIG: 1 }, true)
        .resistenciaDanoMental,
    ).toBe(5);
  });

  it('Experimento: RD 2 geral, que antes não era aplicada em lugar nenhum', () => {
    expect(bonus('Experimento', 5).resistencias.geral).toBe(2);
  });

  it('origem desconhecida não quebra', () => {
    expect(bonus('Origem Que Não Existe', 50).pvBonus).toBe(0);
  });
});

describe('cobertura: texto mecânico exige efeito estruturado', () => {
  /**
   * Origens cujo poder ainda não foi transcrito para `efeitos`. A lista tem de
   * ENCOLHER. Adicionar nome aqui é dívida consciente; remover é progresso.
   *
   * Só entram aqui poderes cujo efeito depende de escolha do jogador, de gasto
   * de recurso em uso, ou de arbitragem do mestre — nunca bônus passivo.
   */
  const AINDA_NAO_ESTRUTURADAS = new Set<string>([
    'Astronauta', 'Colegial', 'Cosplayer', 'Fanático por Criaturas',
    'Jovem Místico', 'Motorista', 'Artista',
  ]);

  /** Marcas de efeito passivo permanente na prosa. */
  const MARCA_PASSIVA = /voc[êe] recebe \+\d|\+\d+ em Defesa|\+\d+ PV\b|\+\d+ PE\b|para cada \d+% de NEX|resist[êe]ncia a dano/i;

  const comMarca = ORIGENS.filter((o) => MARCA_PASSIVA.test(o.poder.descricao));

  it('a varredura encontra origens de fato (senão o teste é vazio)', () => {
    expect(comMarca.length).toBeGreaterThan(10);
  });

  /*
   * O critério é "foi analisado", não "tem número".
   *
   * Uma origem pode legitimamente terminar só com `narrativo` — o Religioso é o
   * caso: o +5 em Religião do livro vale APENAS para acalmar, e aplicá-lo liso
   * inflaria todo teste da perícia. Declarar isso como narrativo é a resposta
   * certa, e é diferente de ninguém ter olhado.
   */
  it.each(comMarca.map((o) => [o.nome] as const))(
    '%s: texto promete número, então precisa ter sido analisado',
    (nome) => {
      if (AINDA_NAO_ESTRUTURADAS.has(nome)) return;
      const origem = ORIGENS.find((o) => o.nome === nome)!;
      expect(
        (origem.poder.efeitos ?? []).length,
        `"${nome}" tem texto mecânico mas nenhum efeito declarado`,
      ).toBeGreaterThan(0);
    },
  );

  it('a allowlist não tem nome morto', () => {
    const nomes = new Set(ORIGENS.map((o) => o.nome));
    const fantasmas = Array.from(AINDA_NAO_ESTRUTURADAS).filter((n) => !nomes.has(n));
    expect(fantasmas, 'origem na allowlist que não existe mais').toEqual([]);
  });

  it('nenhuma origem da allowlist já foi estruturada sem sair da lista', () => {
    const jaFeitas = Array.from(AINDA_NAO_ESTRUTURADAS).filter((nome) => {
      const origem = ORIGENS.find((o) => o.nome === nome);
      return origem ? (origem.poder.efeitos ?? []).length > 0 : false;
    });
    expect(jaFeitas, 'já tem efeitos: remova da allowlist').toEqual([]);
  });

  it('as 12 origens migradas de fato produzem número, fora o Religioso', () => {
    const comEfeito = ORIGENS.filter((o) => (o.poder.efeitos ?? []).length > 0);
    expect(comEfeito).toHaveLength(12);
    const soNarrativas = comEfeito.filter((o) => !temEfeitoMecanico(o.poder.efeitos));
    expect(soNarrativas.map((o) => o.nome)).toEqual(['Religioso']);
  });
});
