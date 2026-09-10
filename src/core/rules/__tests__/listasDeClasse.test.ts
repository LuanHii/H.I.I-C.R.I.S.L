import { describe, expect, it } from 'vitest';
import type { ClasseName } from '@/core/types';
import { PODERES, getPoderesClasse, getPoderesGerais } from '@/data/character/powers';

const CLASSES: readonly ClasseName[] = ['Combatente', 'Especialista', 'Ocultista', 'Sobrevivente'];

const nomesDaClasse = (c: ClasseName) => getPoderesClasse(c).map((p) => p.nome);
const poder = (nome: string) => {
  const p = PODERES.find((x) => x.nome === nome);
  if (!p) throw new Error(`poder inexistente: ${nome}`);
  return p;
};

const MARCOS_DE_NEX = ['Aumento de Atributo', 'Grau de Treinamento', 'Versatilidade'];

describe('marcos de NEX ficam fora das listas de poder de classe', () => {
  it.each(CLASSES)('%s não oferece nenhum marco como poder escolhível', (classe) => {
    const oferecidos = nomesDaClasse(classe);
    const marcosOferecidos = MARCOS_DE_NEX.filter((m) => oferecidos.includes(m));
    expect(marcosOferecidos, `${classe} oferece marco de NEX como poder`).toEqual([]);
  });

  it('nem pela porta dos poderes gerais', () => {
    const gerais = getPoderesGerais().map((p) => p.nome);
    expect(MARCOS_DE_NEX.filter((m) => gerais.includes(m))).toEqual([]);
  });

  it('mas Aumento de Atributo segue no catálogo (o motor emite o slot do marco)', () => {
    expect(poder('Aumento de Atributo').escolha?.tipo).toBe('atributo');
  });

  it.each(['Transcender', 'Treinamento em Perícia'])(
    '%s continua na lista das três classes de Ordem — é poder, não marco',
    (nome) => {
      for (const classe of ['Combatente', 'Especialista', 'Ocultista'] as const) {
        expect(nomesDaClasse(classe), `${nome} sumiu de ${classe}`).toContain(nome);
      }
    },
  );
});

const FALTAVAM: ReadonlyArray<readonly [string, ClasseName, string]> = [
  ['Ninja Urbano', 'Especialista', 'Ordem:956'],
  ['Pensamento Ágil', 'Especialista', 'Ordem:1023'],
  ['Perito em Explosivos', 'Especialista', 'Ordem:1026'],
  ['Primeira Impressão', 'Especialista', 'Ordem:1031'],
  ['Disfarce Sutil', 'Especialista', 'SOH:516'],
  ['Camuflar Ocultismo', 'Ocultista', 'Ordem:1121'],
  ['Estalos Macabros', 'Ocultista', 'SOH:612'],
];

describe('poderes do livro que faltavam no catálogo', () => {
  it.each(FALTAVAM)('%s existe e está na lista de %s (%s)', (nome, classe) => {
    expect(PODERES.some((p) => p.nome === nome), `${nome} ausente do catálogo`).toBe(true);
    expect(nomesDaClasse(classe), `${nome} fora da lista de ${classe}`).toContain(nome);
  });

  it.each(FALTAVAM)('%s não vazou para outra classe', (nome, classe) => {
    const outras = CLASSES.filter((c) => c !== classe).filter((c) => nomesDaClasse(c).includes(nome));
    expect(outras, `${nome} aparece também em ${outras.join(', ')}`).toEqual([]);
  });

  it('Ninja Urbano estrutura a metade que o motor sabe modelar', () => {
    const e = poder('Ninja Urbano').efeitos ?? [];
    expect(e).toEqual(
      expect.arrayContaining([expect.objectContaining({ tipo: 'danoCorpoACorpo', valor: 2 })]),
    );
    expect(e.some((x) => x.tipo === 'narrativo'), 'a metade não modelada não foi declarada').toBe(true);
  });
});

const PROMOVIDOS_A_GERAL = ['Artista Marcial', 'Combater com Duas Armas', 'Saque Rápido', 'Tiro Certeiro'];

describe('SOH:813 promove quatro poderes de classe a gerais', () => {
  it.each(PROMOVIDOS_A_GERAL)('%s é geral, não de classe', (nome) => {
    expect(poder(nome).tipo, `${nome} deixou de ser Geral`).toBe('Geral');
  });

  it.each(PROMOVIDOS_A_GERAL)('%s não foi parar em nenhuma lista de classe', (nome) => {
    const listas = CLASSES.filter((c) => nomesDaClasse(c).includes(nome));
    expect(listas, `${nome} voltou a ser restrito a ${listas.join(', ')}`).toEqual([]);
  });

  it.each(PROMOVIDOS_A_GERAL)('%s é oficial, não homebrew', (nome) => {
    expect(poder(nome).origemRegras ?? 'oficial').toBe('oficial');
  });
});
