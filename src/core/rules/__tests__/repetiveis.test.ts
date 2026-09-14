import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Personagem } from '@/core/types';
import {
  PODERES,
  getPoderesElegiveis,
  getPoderesParanormaisElegiveis,
} from '@/data/character/powers';
import { buildFicha, definirNivel } from '@/core/ficha/buildFicha';
import { registrarEscolha } from '@/core/ficha/registrarEscolha';
import { chaveNex, montarId } from '@/core/ficha/ids';
import type { FichaPersistida } from '@/core/ficha/tipos';
import { criarFicha } from '@/testUtils/fixtures';

const poder = (nome: string) => {
  const achado = PODERES.find((p) => p.nome === nome);
  if (!achado) throw new Error(`poder inexistente: ${nome}`);
  return achado;
};

const REPETIVEIS = [
  'Transcender',
  'Treinamento em Perícia',
  'Foco em Perícia',
  'Aprender Ritual',
  'Aumento de Atributo',
];

const NAO_REPETIVEIS_NO_LIVRO = ['Ritual Predileto', 'Especialista em Elemento'];

describe('a flag repetivel vive no dado', () => {
  it.each(REPETIVEIS)('%s é marcado repetível', (nome) => {
    expect(poder(nome).repetivel, `${nome} deveria ser repetível`).toBe(true);
  });

  it('todo poder cujo texto diz "várias vezes" está marcado', () => {
    const promete = PODERES.filter((p) => /v[áa]rias vezes|outras vezes|quantas vezes/i.test(p.descricao));
    const naoMarcados = promete.filter((p) => !p.repetivel).map((p) => p.nome);
    expect(naoMarcados, 'texto diz repetível mas a flag está ausente').toEqual([]);
  });

  it.each(NAO_REPETIVEIS_NO_LIVRO)('%s não é repetível, nem no dado nem no texto', (nome) => {
    const p = poder(nome);
    expect(p.repetivel ?? false, `${nome}: o livro não concede repetição`).toBe(false);
    expect(p.descricao, `${nome} voltou a alegar repetição`).not.toMatch(
      /v[áa]rias vezes|outras vezes|quantas vezes/i,
    );
  });

  it.each(NAO_REPETIVEIS_NO_LIVRO)('%s deixa de ser oferecido depois de tomado', (nome) => {
    const base = criarFicha({ classe: 'Ocultista', nex: 45 });
    const antes = getPoderesElegiveis(base).map((p) => p.nome);
    expect(antes, `${nome} nem aparece na lista do Ocultista`).toContain(nome);

    const depois = getPoderesElegiveis({
      ...base,
      poderes: [...base.poderes, poder(nome)],
    }).map((p) => p.nome);
    expect(depois, `${nome} continua sendo oferecido após ser tomado`).not.toContain(nome);
  });

  it('Ritual Predileto declara o que o livro realmente concede: acúmulo', () => {
    expect(poder('Ritual Predileto').descricao).toContain(
      'se acumula com reduções fornecidas por outras fontes',
    );
  });

  it('as repetições restritas carregam a restrição do livro', () => {
    expect(poder('Foco em Perícia').descricao).toContain('perícias diferentes');
    expect(poder('Aprender Ritual').descricao).toContain('limite de rituais conhecidos');
  });

  it('nenhum poder é marcado repetível sem o texto dizer', () => {
    const EXCECOES = new Set(['Aumento de Atributo']);
    const marcados = PODERES.filter((p) => p.repetivel && !EXCECOES.has(p.nome));
    const semTexto = marcados
      .filter((p) => !/v[áa]rias vezes|outras vezes|quantas vezes/i.test(p.descricao))
      .map((p) => p.nome);
    expect(semTexto, 'flag sem apoio no texto').toEqual([]);
  });
});

describe('as quatro portas de repetição concordam', () => {
  const comPoder = (nome: string): Personagem => {
    const base = criarFicha({ classe: 'Ocultista', nex: 45 });
    return { ...base, poderes: [...base.poderes, poder(nome)] };
  };

  it('getPoderesElegiveis mantém um repetível já possuído na lista', () => {
    const ficha = comPoder('Treinamento em Perícia');
    const nomes = getPoderesElegiveis(ficha).map((p) => p.nome);
    expect(nomes).toContain('Treinamento em Perícia');
  });

  it('getPoderesElegiveis remove um NÃO repetível já possuído', () => {
    const ficha = comPoder('Reflexos Defensivos');
    const nomes = getPoderesElegiveis(ficha).map((p) => p.nome);
    expect(nomes).not.toContain('Reflexos Defensivos');
  });

  it('getPoderesParanormaisElegiveis libera qualquer repetível, não só Aprender Ritual', () => {
    const ficha = comPoder('Aprender Ritual');
    const entrada = getPoderesParanormaisElegiveis(ficha).find((p) => p.nome === 'Aprender Ritual');
    expect(entrada?.motivo).not.toBe('Você já possui este poder');
  });

  it('getPoderesParanormaisElegiveis segue bloqueando um paranormal não repetível', () => {
    const ficha = comPoder('Sangue Vivo');
    const entrada = getPoderesParanormaisElegiveis(ficha).find((p) => p.nome === 'Sangue Vivo');
    expect(entrada?.elegivel).toBe(false);
  });

  const combatenteV2 = (nex: number): FichaPersistida => ({
    versao: 2,
    identidade: {
      nome: 'Repetidor',
      classe: 'Combatente',
      origem: 'Policial',
      atributosBase: { AGI: 2, FOR: 3, INT: 1, PRE: 1, VIG: 2 },
      periciasLivres: ['Luta', 'Fortitude'],
    },
    progressao: { nex },
    escolhas: [],
    sessao: { pvDano: 0, peGasto: 0, sanPerdida: 0 },
    ajustes: {},
  });
  const escolherPoder = (ficha: FichaPersistida, nex: number, nome: string) =>
    registrarEscolha(ficha, montarId('poderClasse', chaveNex(nex)), { tipo: 'poder', poder: nome });

  it('o motor novo aceita repetir um repetível em marcos diferentes', () => {
    const em15 = escolherPoder(combatenteV2(30), 15, 'Treinamento em Perícia');
    expect(em15.aplicada).toBe(true);
    const em30 = escolherPoder(em15.ficha, 30, 'Treinamento em Perícia');
    expect(em30.aplicada, em30.problemas.map((p) => p.mensagem).join('; ')).toBe(true);
    expect(buildFicha({ ficha: em30.ficha }).poderes.filter((p) => p.nome === 'Treinamento em Perícia')).toHaveLength(2);
  });

  it('o motor novo recusa repetir um não repetível', () => {
    const em15 = escolherPoder(combatenteV2(30), 15, 'Reflexos Defensivos');
    expect(em15.aplicada).toBe(true);
    const em30 = escolherPoder(em15.ficha, 30, 'Reflexos Defensivos');
    expect(em30.aplicada).toBe(false);
    expect(em30.problemas.map((p) => p.mensagem).join(' ')).toMatch(/já possui/i);
  });
});

describe('rebaixar NEX guarda uma cópia por marco, não apaga todas', () => {
  const combatenteV2 = (nex: number): FichaPersistida => ({
    versao: 2,
    identidade: {
      nome: 'Repetidor',
      classe: 'Combatente',
      origem: 'Policial',
      atributosBase: { AGI: 2, FOR: 3, INT: 1, PRE: 1, VIG: 2 },
      periciasLivres: ['Luta', 'Fortitude'],
    },
    progressao: { nex },
    escolhas: [],
    sessao: { pvDano: 0, peGasto: 0, sanPerdida: 0 },
    ajustes: {},
  });
  const contar = (ficha: FichaPersistida) => buildFicha({ ficha }).poderes.filter((p) => p.nome === 'Treinamento em Perícia').length;

  it('três cópias em três marcos: descer um marco tira só a dele, subir devolve', () => {
    let ficha = combatenteV2(45);
    for (const nex of [15, 30, 45]) {
      const r = registrarEscolha(ficha, montarId('poderClasse', chaveNex(nex)), { tipo: 'poder', poder: 'Treinamento em Perícia' });
      expect(r.aplicada, r.problemas.map((p) => p.mensagem).join('; ')).toBe(true);
      ficha = r.ficha;
    }
    expect(contar(ficha)).toBe(3);

    const rebaixada = definirNivel(ficha, 40);
    expect(contar(rebaixada), 'o rebaixamento apagou todas as cópias').toBe(2);
    expect(rebaixada.escolhas, 'a escolha do marco acima fica guardada, não apagada').toHaveLength(3);

    expect(contar(definirNivel(rebaixada, 45))).toBe(3);
  });
});

describe('não há mais lista de nomes repetíveis no código', () => {
  it('nenhuma linha decide repetição comparando nome de poder', () => {
    const raiz = join(process.cwd(), 'src');
    const suspeitos: string[] = [];
    const NOME_REPETIVEL = /nome === '(Transcender|Treinamento em Perícia|Aprender Ritual|Aumento de Atributo|Foco em Perícia|Ritual Predileto|Especialista em Elemento)'/;
    const DECIDE_REPETICAO = /return true|podeRepetir|jaPossui|nomesPossuidos/;

    const varrer = (dir: string) => {
      for (const entrada of readdirSync(dir)) {
        const caminho = join(dir, entrada);
        if (statSync(caminho).isDirectory()) {
          if (entrada !== '__tests__' && entrada !== 'node_modules') varrer(caminho);
          continue;
        }
        if (!/\.tsx?$/.test(entrada)) continue;

        readFileSync(caminho, 'utf8').split('\n').forEach((linha, i) => {
          if (NOME_REPETIVEL.test(linha) && DECIDE_REPETICAO.test(linha)) {
            suspeitos.push(`${caminho.slice(raiz.length + 1)}:${i + 1}`);
          }
        });
      }
    };
    varrer(raiz);

    expect(suspeitos, 'use a flag repetivel em vez de comparar nomes').toEqual([]);
  });
});

describe('escolhas declaradas nos poderes (becos sem saída do plano)', () => {
  it.each([
    ['Treinamento em Perícia', 'pericia', 2],
    ['Aumento de Atributo', 'atributo', 1],
    ['Especialista em Elemento', 'elemento', 1],
    ['Foco em Perícia', 'pericia', 1],
    ['Ritual Predileto', 'ritual', 1],
  ] as const)('%s declara escolha de %s (quantidade %i)', (nome, tipo, quantidade) => {
    const p = poder(nome);
    expect(p.escolha, `${nome} sem escolha declarada`).toBeDefined();
    expect(p.escolha!.tipo).toBe(tipo);
    expect(p.escolha!.quantidade).toBe(quantidade);
  });

  it('Treinado em Armas restringe a escolha a Luta ou Pontaria', () => {
    expect(poder('Treinado em Armas').escolha?.opcoes).toEqual(['Luta', 'Pontaria']);
  });

  it('todo poder com escolha declarada e repetível tem as duas flags coerentes', () => {
    for (const nome of ['Treinamento em Perícia', 'Foco em Perícia']) {
      const p = poder(nome);
      expect(p.repetivel, `${nome}.repetivel`).toBe(true);
      expect(p.escolha, `${nome}.escolha`).toBeDefined();
    }
  });

  it('escolha declarada NÃO implica repetível', () => {
    for (const nome of NAO_REPETIVEIS_NO_LIVRO) {
      expect(poder(nome).escolha, `${nome}.escolha`).toBeDefined();
      expect(poder(nome).repetivel ?? false, `${nome}.repetivel`).toBe(false);
    }
  });
});
