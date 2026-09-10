import { describe, expect, it } from 'vitest';
import type { PericiaName } from '@/core/types';
import { ORIGENS } from '@/data/character/origins';
import { normalizePersonagem } from '@/core/personagemUtils';
import { calcularBonusOrigem } from '@/core/rules/derivedStats';
import { temEfeitoMecanico } from '@/core/rules/efeitos';
import { criarFicha } from '@/testUtils/fixtures';
import { migrarFicha } from '@/core/ficha/migracao/migrarFicha';
import { buildFicha } from '@/core/ficha/buildFicha';

const salvar = (p: Parameters<typeof normalizePersonagem>[0]) => normalizePersonagem(p, false);

describe('o bônus da origem sobrevive ao save (split-brain)', () => {
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

const CITA_NUMERO =
  /[+\-–−]\s?\d|\b\d+\s?(PV|PE|SAN|espaços)\b|\b\d?d20\b|\bmetade\b|\bdobro\b/;

describe('cobertura: texto mecânico exige efeito estruturado', () => {
  const MARCA_PASSIVA = /voc[êe] recebe \+\d|\+\d+ em Defesa|\+\d+ PV\b|\+\d+ PE\b|para cada \d+% de NEX|resist[êe]ncia a dano/i;

  const comMarca = ORIGENS.filter((o) => MARCA_PASSIVA.test(o.poder.descricao));

  it('a varredura encontra origens de fato (senão o teste é vazio)', () => {
    expect(comMarca.length).toBeGreaterThan(10);
  });

  it.each(comMarca.map((o) => [o.nome] as const))(
    '%s: texto promete número, então precisa ter sido analisado',
    (nome) => {
      const origem = ORIGENS.find((o) => o.nome === nome)!;
      expect(
        (origem.poder.efeitos ?? []).length,
        `"${nome}" tem texto mecânico mas nenhum efeito declarado`,
      ).toBeGreaterThan(0);
    },
  );

  it('só as origens com efeito estruturado alimentam valor de ficha', () => {
    const estruturadas = ORIGENS.filter((o) => temEfeitoMecanico(o.poder.efeitos));
    expect(estruturadas.map((o) => o.nome).sort()).toEqual([
      'Cultista Arrependido', 'Desgarrado', 'Diplomata', 'Experimento', 'Lutador',
      'Mergulhador', 'Militar', 'Policial', 'Profetizado', 'Teórico da Conspiração',
      'Universitário', 'Vítima',
    ]);
  });

  it('origem sem veredito nenhum é origem que não cita número', () => {
    const semVeredito = ORIGENS.filter((o) => !(o.poder.efeitos ?? []).length);
    expect(semVeredito.length, 'se zerar, este teste vira vácuo').toBeGreaterThan(0);

    const citandoNumero = semVeredito.filter((o) => CITA_NUMERO.test(o.poder.descricao));
    expect(
      citandoNumero.map((o) => o.nome),
      'origem com número na descrição e nenhum veredito',
    ).toEqual([]);
  });
});

const origensComNumero = ORIGENS.filter((o) => CITA_NUMERO.test(o.poder.descricao));

describe('triagem de efeitos das origens: número na descrição exige veredito', () => {
  it('o detector encontra alguma coisa, senão o teste é vácuo', () => {
    expect(origensComNumero.length).toBeGreaterThan(30);
  });

  it('toda origem que cita número tem efeitos[] — estruturado ou narrativo', () => {
    const naoTriadas = origensComNumero
      .filter((o) => !o.poder.efeitos?.length)
      .map((o) => o.nome);

    expect(
      naoTriadas,
      `origens citando número sem nenhum veredito em efeitos[]:\n  ${naoTriadas.join('\n  ')}`,
    ).toEqual([]);
  });

  it('nenhuma nota narrativa é rótulo vazio', () => {
    const vagas = ORIGENS.flatMap((o) =>
      (o.poder.efeitos ?? [])
        .filter((e): e is { tipo: 'narrativo'; nota: string } => e.tipo === 'narrativo')
        .filter((e) => e.nota.trim().length < 25 || /^(ver|vide)\b/i.test(e.nota.trim()))
        .map(() => o.nome),
    );
    expect(vagas, `notas narrativas curtas ou vazias: ${vagas.join(', ')}`).toEqual([]);
  });

  it('Cultista Arrependido declara o fator de meia Sanidade com a citação', () => {
    const cultista = ORIGENS.find((o) => o.nome === 'Cultista Arrependido');
    const efeitos = cultista?.poder.efeitos ?? [];

    const fator = efeitos.find(
      (e): e is { tipo: 'sanInicialFator'; fator: number } => e.tipo === 'sanInicialFator',
    );
    expect(fator, 'o fator de SAN inicial sumiu do catálogo').toBeDefined();
    expect(fator!.fator).toBe(0.5);

    const nota = efeitos
      .filter((e): e is { tipo: 'narrativo'; nota: string } => e.tipo === 'narrativo')
      .map((e) => e.nota)
      .join(' ');
    expect(nota, 'a citação Ordem:371 saiu da nota').toMatch(/Ordem:371/);
  });

  it('nenhuma outra origem mexe na Sanidade inicial', () => {
    const comFator = ORIGENS.filter((o) =>
      (o.poder.efeitos ?? []).some((e) => e.tipo === 'sanInicialFator'),
    );
    expect(comFator.map((o) => o.nome)).toEqual(['Cultista Arrependido']);
  });
});

describe('Cultista Arrependido: metade da Sanidade inicial (Ordem:371)', () => {
  const sanDe = (classe: 'Combatente' | 'Especialista' | 'Ocultista', nex: number, origemNome: string) => {
    const v0 = normalizePersonagem(criarFicha({ classe, nex, origemNome }), false);
    return buildFicha({ ficha: migrarFicha(v0).ficha }).derivados.san.max;
  };

  it.each([
    ['Combatente', 12, 6],
    ['Especialista', 16, 8],
    ['Ocultista', 20, 10],
  ] as const)('%s começa com %i de SAN e o cultista com %i', (classe, normal, metade) => {
    expect(sanDe(classe, 5, 'Desgarrado')).toBe(normal);
    expect(sanDe(classe, 5, 'Cultista Arrependido')).toBe(metade);
  });

  it('o corte é só na SAN inicial — o ganho por NEX continua inteiro', () => {
    const diferencaNoInicio = sanDe('Combatente', 5, 'Desgarrado') - sanDe('Combatente', 5, 'Cultista Arrependido');
    const diferencaNoFim = sanDe('Combatente', 50, 'Desgarrado') - sanDe('Combatente', 50, 'Cultista Arrependido');

    expect(
      diferencaNoFim,
      'a diferença cresceu com o NEX, então o fator vazou para o ganho por nível',
    ).toBe(diferencaNoInicio);
  });

  it('quem levou só as perícias da origem não paga a Sanidade', () => {
    const v0 = normalizePersonagem(criarFicha({ classe: 'Ocultista', nex: 5, origemNome: 'Cultista Arrependido' }), false);
    const base = migrarFicha(v0).ficha;
    const soPericias = {
      ...base,
      identidade: { ...base.identidade, beneficioOrigem: 'pericias' as const },
    };

    expect(
      buildFicha({ ficha: soPericias }).derivados.san.max,
      'a metade veio junto sem o poder que a impõe',
    ).toBe(20);
  });
});
