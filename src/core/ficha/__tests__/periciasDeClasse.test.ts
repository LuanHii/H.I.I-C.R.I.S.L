import { describe, expect, it } from 'vitest';
import { CLASSES } from '@/data/character/classes';
import type { PericiaName, Personagem } from '@/core/types';
import { gerarFicha } from '@/logic/rulesEngine';
import { ORIGENS } from '@/data/character/origins';
import { buildFicha } from '../buildFicha';
import { inferirFicha } from '../inferirFicha';
import { conversaoDesatualizada, resolverPersonagem } from '../leitura';
import type { FichaPersistida } from '../tipos';

const treinadas = (ficha: FichaPersistida): PericiaName[] =>
  (Object.entries(buildFicha({ ficha }).derivados.graus) as [PericiaName, string][])
    .filter(([, g]) => g !== 'Destreinado')
    .map(([nome]) => nome)
    .sort();

function combatente(periciasLivres: PericiaName[]): FichaPersistida {
  return {
    versao: 2,
    identidade: {
      nome: 'Sentinela',
      classe: 'Combatente',
      origem: 'Policial',
      atributosBase: { AGI: 2, FOR: 3, INT: 1, PRE: 1, VIG: 2 },
      periciasLivres,
    },
    progressao: { nex: 5 },
    escolhas: [],
    sessao: { pvDano: 0, peGasto: 0, sanPerdida: 0 },
    ajustes: {},
  };
}

describe('Combatente: Luta OU Pontaria, Fortitude OU Reflexos (Ordem:705)', () => {
  it('a classe não impõe as quatro — os pares são escolha registrada em periciasLivres', () => {
    expect(CLASSES.Combatente.periciasObrigatorias, 'a classe fixa as quatro e o livro fixa duas').toEqual([]);
    expect(CLASSES.Combatente.periciasEmPar).toEqual([['Luta', 'Pontaria'], ['Fortitude', 'Reflexos']]);
  });

  it('só as escolhidas dos pares ficam treinadas', () => {
    expect(treinadas(combatente(['Pontaria', 'Reflexos', 'Percepção', 'Atletismo'])))
      .toEqual(['Atletismo', 'Percepção', 'Pontaria', 'Reflexos'].sort());
  });

  it('Ocultista continua com Ocultismo e Vontade fixas (Ordem:1147)', () => {
    const ficha: FichaPersistida = {
      ...combatente([]),
      identidade: { ...combatente([]).identidade, classe: 'Ocultista', periciasLivres: ['Percepção'] },
    };
    expect(treinadas(ficha)).toEqual(['Ocultismo', 'Percepção', 'Vontade']);
  });

  it('a inferência de uma ficha antiga guarda qual lado de cada par foi escolhido', () => {
    const v0 = gerarFicha({
      nome: 'Sentinela',
      classe: 'Combatente',
      origem: ORIGENS.find((o) => o.nome === 'Policial')!,
      atributos: { AGI: 2, FOR: 3, INT: 1, PRE: 1, VIG: 2 },
      periciasLivres: ['Atletismo'],
      preferenciasClasse: { ofensiva: 'Pontaria', defensiva: 'Reflexos' },
      nex: 5,
    });
    const { ficha } = inferirFicha(v0);

    expect(ficha.identidade.periciasLivres).toContain('Pontaria');
    expect(ficha.identidade.periciasLivres).toContain('Reflexos');
    expect(ficha.identidade.periciasLivres).not.toContain('Luta');
    expect(treinadas(ficha)).toEqual(
      (Object.entries(v0.pericias) as [PericiaName, string][])
        .filter(([, g]) => g !== 'Destreinado').map(([n]) => n).sort(),
    );
  });
});

describe('conversões feitas antes da correção não passam por v2 em silêncio', () => {
  const v0 = (): Personagem => gerarFicha({
    nome: 'Sentinela',
    classe: 'Combatente',
    origem: ORIGENS.find((o) => o.nome === 'Policial')!,
    atributos: { AGI: 2, FOR: 3, INT: 1, PRE: 1, VIG: 2 },
    periciasLivres: ['Atletismo'],
    nex: 5,
  });

  it('um Combatente cujas periciasLivres não citam nenhum dos pares é conversão antiga', () => {
    expect(conversaoDesatualizada(combatente(['Atletismo']))).toMatch(/Ordem:705/);
    expect(conversaoDesatualizada(combatente(['Luta', 'Fortitude', 'Atletismo']))).toBeNull();
    expect(conversaoDesatualizada({
      ...combatente([]),
      identidade: { ...combatente([]).identidade, classe: 'Especialista', periciasLivres: [] },
    })).toBeNull();
  });

  it('a leitura cai para a ficha antiga e diz o porquê, em vez de mostrar Luta destreinada', () => {
    const antiga = combatente(['Atletismo']);
    const resolucao = resolverPersonagem({
      personagem: v0(),
      atualizadoEm: '2026-01-01T00:00:00.000Z',
      ficha: antiga,
      fichaMigradaDe: '2026-01-01T00:00:00.000Z',
      fichaConfirmada: true,
    });

    expect(resolucao.fonte).toBe('v0');
    expect(resolucao.motivo).toMatch(/Combatente/);
    expect(resolucao.motivo).toMatch(/[Cc]onverta/);
    expect(resolucao.personagem.pericias.Luta).toBe('Treinado');
  });
});
