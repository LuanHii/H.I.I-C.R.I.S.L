import { describe, expect, it } from 'vitest';
import type { PericiaName, Personagem } from '@/core/types';
import { PODERES } from '@/data/character/powers';
import { normalizePersonagem } from '@/core/personagemUtils';
import { temEfeitoMecanico } from '@/core/rules/efeitos';
import { criarFicha } from '@/testUtils/fixtures';

const poder = (nome: string) => {
  const achado = PODERES.find((p) => p.nome === nome);
  if (!achado) throw new Error(`poder inexistente no catálogo: ${nome}`);
  return achado;
};

function ficha(
  nomes: string[],
  opcoes: { nex?: number; treinadas?: PericiaName[]; destreinadas?: PericiaName[] } = {},
): Personagem {
  const base = criarFicha({ classe: 'Combatente', nex: opcoes.nex ?? 10, origemNome: 'Policial' });
  const pericias = { ...base.pericias };
  for (const p of opcoes.treinadas ?? []) pericias[p] = 'Treinado';
  for (const p of opcoes.destreinadas ?? []) pericias[p] = 'Destreinado';
  return normalizePersonagem(
    { ...base, pericias, poderes: nomes.map((nome) => poder(nome)) },
    false,
  );
}

const semPoder = (opcoes: { nex?: number; treinadas?: PericiaName[]; destreinadas?: PericiaName[] } = {}) => ficha([], opcoes);

describe('poderes passivos agora produzem número', () => {
  it('Vitalidade Reforçada dá +1 PV a cada 5% de NEX', () => {
    expect(ficha(['Vitalidade Reforçada'], { nex: 40 }).pv.max
      - semPoder({ nex: 40 }).pv.max).toBe(8);
  });

  it('Vontade Inabalável dá +1 PE a cada 10% de NEX', () => {
    expect(ficha(['Vontade Inabalável'], { nex: 40 }).pe.max
      - semPoder({ nex: 40 }).pe.max).toBe(4);
  });

  it('Personalidade Esotérica dá +3 PE fixos', () => {
    expect(ficha(['Personalidade Esotérica']).pe.max - semPoder().pe.max).toBe(3);
  });

  it('Sangue de Ferro dá +2 PV por NEX', () => {
    expect(ficha(['Sangue de Ferro'], { nex: 50 }).pv.max
      - semPoder({ nex: 50 }).pv.max).toBe(20);
  });

  it('dois poderes de PV somam em vez de um sobrescrever o outro', () => {
    const base = semPoder({ nex: 40 }).pv.max;
    const so1 = ficha(['Vitalidade Reforçada'], { nex: 40 }).pv.max - base;
    const so2 = ficha(['Sangue de Ferro'], { nex: 40 }).pv.max - base;
    expect(ficha(['Vitalidade Reforçada', 'Sangue de Ferro'], { nex: 40 }).pv.max - base)
      .toBe(so1 + so2);
  });
});

describe('o padrão "+2 se já treinado" do livro', () => {
  it.each([
    ['Atlético', 'Atletismo' as PericiaName],
    ['Sorrateiro', 'Furtividade' as PericiaName],
    ['Teimosia Obstinada', 'Vontade' as PericiaName],
    ['Persuasivo', 'Diplomacia' as PericiaName],
    ['Sentidos Aguçados', 'Percepção' as PericiaName],
  ])('%s dá +2 em %s quando a perícia já é treinada', (nome, pericia) => {
    const com = ficha([nome], { treinadas: [pericia] });
    const sem = semPoder({ treinadas: [pericia] });
    expect(com.periciasDetalhadas[pericia].bonusFixo - sem.periciasDetalhadas[pericia].bonusFixo)
      .toBe(2);
  });

  it('sem treinamento prévio, o poder não vira +2 (ele concede o treinamento)', () => {
    const com = ficha(['Atlético'], { destreinadas: ['Atletismo'] });
    const sem = semPoder({ destreinadas: ['Atletismo'] });
    expect(com.periciasDetalhadas.Atletismo.bonusFixo)
      .toBe(sem.periciasDetalhadas.Atletismo.bonusFixo);
  });
});

describe('outros efeitos de poder', () => {
  it('Vitalidade Reforçada também dá +2 em Fortitude', () => {
    const com = ficha(['Vitalidade Reforçada']);
    const sem = semPoder();
    expect(com.periciasDetalhadas.Fortitude.bonusFixo
      - sem.periciasDetalhadas.Fortitude.bonusFixo).toBe(2);
  });

  it('Reflexos Defensivos dá +2 de Defesa', () => {
    expect(poder('Reflexos Defensivos').efeitos).toContainEqual({ tipo: 'defesa', valor: 2 });
  });

  it.each(['Sangue', 'Morte', 'Conhecimento', 'Energia'])(
    'Resistir a %s declara resistência 10 ao elemento',
    (elemento) => {
      expect(poder(`Resistir a ${elemento}`).efeitos).toContainEqual({
        tipo: 'resistenciaDano', contra: elemento, valor: 10,
      });
    },
  );

  it('Atlético declara +3m de deslocamento', () => {
    expect(poder('Atlético').efeitos).toContainEqual({ tipo: 'deslocamento', valor: 3 });
  });

  it('normalizar várias vezes não acumula bônus de poder', () => {
    let f = ficha(['Vitalidade Reforçada'], { nex: 40 });
    const primeiro = f.pv.max;
    for (let i = 0; i < 5; i += 1) f = normalizePersonagem(f, false);
    expect(f.pv.max).toBe(primeiro);
  });

  it('poder fora do catálogo é ignorado sem quebrar', () => {
    const base = criarFicha({ classe: 'Combatente', nex: 10 });
    const comLixo = normalizePersonagem(
      { ...base, poderes: [{ nome: 'Poder Inventado', descricao: '', tipo: 'Geral', livro: 'Regras Básicas' }] },
      false,
    );
    expect(comLixo.pv.max).toBe(normalizePersonagem(base, false).pv.max);
  });
});

describe('cobertura de efeitos nos poderes', () => {
  it('os 37 poderes migrados declaram efeitos', () => {
    const comEfeitos = PODERES.filter((p) => (p.efeitos ?? []).length > 0);
    expect(comEfeitos.length).toBeGreaterThanOrEqual(37);
  });

  it('nenhum poder declara efeitos vazios', () => {
    const vazios = PODERES.filter((p) => p.efeitos !== undefined && p.efeitos.length === 0);
    expect(vazios.map((p) => p.nome)).toEqual([]);
  });

  it('todo poder geral com "recebe treinamento em" declara o treinamento', () => {
    const COM_ESCOLHA = new Set(['Treinado em Armas']);
    const faltando = PODERES
      .filter((p) => p.tipo === 'Geral' && /recebe treinamento em/i.test(p.descricao))
      .filter((p) => !COM_ESCOLHA.has(p.nome))
      .filter((p) => !(p.efeitos ?? []).some((e) => e.tipo === 'treinamento'))
      .map((p) => p.nome);
    expect(faltando, 'poder promete treinamento mas não declara').toEqual([]);
  });

  it('os Resistir a <Elemento> todos rendem número', () => {
    for (const elemento of ['Sangue', 'Morte', 'Conhecimento', 'Energia']) {
      expect(temEfeitoMecanico(poder(`Resistir a ${elemento}`).efeitos)).toBe(true);
    }
  });
});
