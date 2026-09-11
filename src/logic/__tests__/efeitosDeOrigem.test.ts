import { describe, expect, it } from 'vitest';
import { gerarFicha } from '../rulesEngine';
import { ORIGENS } from '../../data/character/origins';
import { desduplicarEfeitosDeOrigem } from '../../core/rules/efeitosDeOrigem';
import { normalizePersonagem } from '../../core/personagemUtils';

const criar = (origemNome: string) => gerarFicha({
  nome: 'Teste',
  classe: 'Combatente',
  origem: ORIGENS.find((o) => o.nome === origemNome)!,
  atributos: { AGI: 1, FOR: 3, INT: 1, PRE: 1, VIG: 3 },
  periciasLivres: ['Furtividade'],
  nex: 5,
});

describe('o poder de origem aparece uma vez nas condições ativas', () => {
  it.each(['Policial', 'Militar', 'Acadêmico', 'Amnésico'])('%s', (origem) => {
    const poder = ORIGENS.find((o) => o.nome === origem)!.poder.nome;
    const doPoder = (criar(origem).efeitosAtivos ?? []).filter((e) => e.startsWith(`${poder}:`));
    expect(doPoder, 'descrição e resumo do mesmo poder viravam duas condições').toHaveLength(1);
    expect(doPoder[0]).toContain(ORIGENS.find((o) => o.nome === origem)!.poder.descricao);
  });

  it('a lista continua trazendo os efeitos de trilha quando existem', () => {
    const p = gerarFicha({
      nome: 'Teste',
      classe: 'Combatente',
      origem: ORIGENS.find((o) => o.nome === 'Policial')!,
      atributos: { AGI: 1, FOR: 3, INT: 1, PRE: 1, VIG: 3 },
      periciasLivres: ['Furtividade'],
      nex: 10,
      trilha: 'Aniquilador',
    });
    expect(p.efeitosAtivos?.some((e) => e.startsWith('Patrulha:'))).toBe(true);
  });
});

describe('fichas antigas com a duplicata são limpas ao passar pelo app', () => {
  const descricao = `Patrulha: ${ORIGENS.find((o) => o.nome === 'Policial')!.poder.descricao}`;

  it('o resumo do bônus some quando a descrição do mesmo poder está presente', () => {
    expect(desduplicarEfeitosDeOrigem([descricao, 'Patrulha: +2 Defesa', 'Caído']))
      .toEqual([descricao, 'Caído']);
  });

  it('sem a descrição, nada é apagado — não se remove o que não se explica', () => {
    expect(desduplicarEfeitosDeOrigem(['Patrulha: +2 Defesa', 'Caído'])).toEqual(['Patrulha: +2 Defesa', 'Caído']);
    expect(desduplicarEfeitosDeOrigem(['Caído: pela segunda vez'])).toEqual(['Caído: pela segunda vez']);
    expect(desduplicarEfeitosDeOrigem(undefined)).toEqual([]);
  });

  it('normalizePersonagem aplica a limpeza no save da ficha antiga', () => {
    const p = criar('Policial');
    const sujo = { ...p, efeitosAtivos: [descricao, 'Patrulha: +2 Defesa', 'Atordoado'] };
    expect(normalizePersonagem(sujo, true).efeitosAtivos).toEqual([descricao, 'Atordoado']);
  });
});
