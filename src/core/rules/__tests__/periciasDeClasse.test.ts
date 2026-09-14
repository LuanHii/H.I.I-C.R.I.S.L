import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ClasseName } from '@/core/types';
import { CLASSES } from '@/data/character/classes';
import { ORIGENS } from '@/data/character/origins';
import { CLASS_ABILITIES } from '@/data/character/classAbilities';
import { calcularPericiasDisponiveis, gerarFicha } from '@/logic/rulesEngine';
import { HABILIDADES_DE_CLASSE, descricaoAutomatica } from '../habilidadesDeClasse';
import { periciasFixasDaClasse } from '../periciasDeClasse';
import { periciasIniciaisPorClasse } from '../progressao';

const TODAS: ClasseName[] = ['Combatente', 'Especialista', 'Ocultista', 'Sobrevivente'];
const policial = ORIGENS.find((o) => o.nome === 'Policial')!;

const semComentarios = (caminho: string) =>
  readFileSync(join(process.cwd(), 'src', ...caminho.split('/')), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

describe('perícias fixas da classe vêm dos dados, não de um switch por nome', () => {
  it('Combatente: sem preferência, o primeiro de cada par (Luta, Fortitude — Ordem:705)', () => {
    expect(periciasFixasDaClasse('Combatente')).toEqual(['Luta', 'Fortitude']);
  });

  it('Combatente: a preferência escolhe o membro do par', () => {
    expect(periciasFixasDaClasse('Combatente', { ofensiva: 'Pontaria', defensiva: 'Reflexos' })).toEqual(['Pontaria', 'Reflexos']);
    expect(periciasFixasDaClasse('Combatente', { ofensiva: 'Pontaria' })).toEqual(['Pontaria', 'Fortitude']);
  });

  it('Ocultista: Ocultismo e Vontade, lidas de CLASSES; Especialista e Sobrevivente não fixam nada', () => {
    expect(periciasFixasDaClasse('Ocultista')).toEqual(CLASSES.Ocultista.periciasObrigatorias);
    expect(periciasFixasDaClasse('Especialista')).toEqual([]);
    expect(periciasFixasDaClasse('Sobrevivente')).toEqual([]);
  });

  it('a quantidade de perícias iniciais também sai de CLASSES (Ordem:705, 973, 1214; SOH:760)', () => {
    for (const classe of TODAS) {
      for (const int of [0, 1, 2, 3]) {
        expect(periciasIniciaisPorClasse(classe, int), `${classe} INT ${int}`)
          .toBe(Math.max(1, CLASSES[classe].periciasIniciais + int));
      }
    }
    expect(semComentarios('core/rules/progressao.ts')).not.toMatch(/return Math\.max\(1, [137] \+ intelecto\)/);
  });

  it('calcularPericiasDisponiveis honra a preferência do par e as obrigatórias da classe', () => {
    const c = calcularPericiasDisponiveis('Combatente', 1, policial, { ofensiva: 'Pontaria' });
    expect(c.obrigatorias).toEqual(expect.arrayContaining(['Pontaria', 'Fortitude', ...policial.pericias]));
    expect(c.obrigatorias).not.toContain('Luta');
    expect(c.qtdEscolhaLivre).toBe(periciasIniciaisPorClasse('Combatente', 1));

    const o = calcularPericiasDisponiveis('Ocultista', 2, policial);
    expect(o.obrigatorias).toEqual(expect.arrayContaining(['Ocultismo', 'Vontade']));
  });

  it('gerarFicha treina os membros escolhidos dos pares', () => {
    const p = gerarFicha({
      nome: 'Atiradora', classe: 'Combatente', origem: policial,
      atributos: { AGI: 3, FOR: 1, INT: 1, PRE: 2, VIG: 2 },
      periciasLivres: [], nex: 5,
      preferenciasClasse: { ofensiva: 'Pontaria', defensiva: 'Reflexos' },
    });
    expect(p.pericias.Pontaria).toBe('Treinado');
    expect(p.pericias.Reflexos).toBe('Treinado');
    expect(p.pericias.Luta).toBe('Destreinado');
    expect(p.pericias.Fortitude).toBe('Destreinado');
  });

  it('o rulesEngine não carrega mais literais de classe para perícias nem para habilidades iniciais', () => {
    const fonte = semComentarios('logic/rulesEngine.ts');
    expect(fonte).not.toMatch(/\?\?\s*'Luta'/);
    expect(fonte).not.toMatch(/\?\?\s*'Fortitude'/);
    expect(fonte).not.toMatch(/adicionaPericia\('Ocultismo'/);
    expect(fonte).not.toMatch(/nome:\s*'Ataque Especial'/);
    expect(fonte).not.toMatch(/nome:\s*'Eclético'/);
    expect(fonte).not.toMatch(/nome:\s*'Escolhido pelo Outro Lado'/);
    expect(fonte).not.toMatch(/nome:\s*'Empenho'/);
  });
});

describe('habilidades automáticas de classe: uma lista só, com descrição', () => {
  it('gerarFicha concede exatamente as automáticas do nível inicial, além do poder de origem', () => {
    for (const classe of TODAS) {
      const p = gerarFicha({
        nome: 'X', classe, origem: policial,
        atributos: classe === 'Sobrevivente' ? { AGI: 2, FOR: 2, INT: 1, PRE: 2, VIG: 1 } : { AGI: 2, FOR: 2, INT: 1, PRE: 2, VIG: 2 },
        periciasLivres: [],
        ...(classe === 'Sobrevivente' ? { nex: 0, estagio: 1 } : { nex: 5 }),
      });
      const nivel = classe === 'Sobrevivente' ? 1 : 5;
      const esperadas = HABILIDADES_DE_CLASSE[classe].filter((h) => h.nivel <= nivel).map((h) => h.nome);
      const daClasse = p.poderes.filter((x) => x.tipo === 'Classe').map((x) => x.nome);
      expect(daClasse, classe).toEqual(esperadas);
      for (const poder of p.poderes) expect(poder.descricao, `${classe}: ${poder.nome}`).not.toBe('');
    }
  });

  it('toda habilidade automática tem descrição no catálogo (CLASS_ABILITIES ou PODERES)', () => {
    for (const classe of TODAS) {
      for (const h of HABILIDADES_DE_CLASSE[classe]) {
        const d = descricaoAutomatica(h.nome);
        expect(d, `${classe}: ${h.nome}`).toBeDefined();
        expect(d!.descricao.length).toBeGreaterThan(10);
        expect(d!.livro).toBe(classe === 'Sobrevivente' ? 'Sobrevivendo ao Horror' : 'Regras Básicas');
      }
    }
    expect(descricaoAutomatica('Ataque Especial')?.descricao).toBe(CLASS_ABILITIES.Combatente.find((a) => a.nome === 'Ataque Especial')!.descricao);
  });
});
