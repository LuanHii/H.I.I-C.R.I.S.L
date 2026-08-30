import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Personagem } from '@/core/types';
import {
  PODERES,
  getPoderesElegiveis,
  getPoderesParanormaisElegiveis,
} from '@/data/character/powers';
import { choosePower } from '@/logic/progression';
import { rebaixarNex, subirNex } from '@/logic/levelUp';
import { criarFicha } from '@/testUtils/fixtures';

const poder = (nome: string) => {
  const achado = PODERES.find((p) => p.nome === nome);
  if (!achado) throw new Error(`poder inexistente: ${nome}`);
  return achado;
};

/**
 * Poderes que o livro diz explicitamente serem repetíveis.
 *
 * A frase exata varia e as três variantes têm consequências diferentes:
 *  - Transcender / Treinamento em Perícia: "Você pode escolher este poder
 *    várias vezes." (Ordem:817, 821) — sem restrição.
 *  - Foco em Perícia: "outras vezes para perícias diferentes" (SOH:849) — a
 *    repetição existe, mas não pode recair na mesma perícia.
 *  - Aprender Ritual: "quantas vezes quiser, mas está sujeito ao limite de
 *    rituais conhecidos" (Ordem:4156, limite = Intelecto em Ordem:4380).
 */
const REPETIVEIS = [
  'Transcender',
  'Treinamento em Perícia',
  'Foco em Perícia',
  'Aprender Ritual',
  'Aumento de Atributo',
];

/**
 * O CONTRÁRIO: poderes que o catálogo alegava repetíveis e o livro não concede.
 *
 * A auditoria contra o PyMuPDF encontrou duas entradas cuja descrição *afirmava*
 * "Pode ser escolhido várias vezes" sem nada disso no livro. Decisão: seguir o
 * livro. A frase saiu da descrição e a flag saiu do dado.
 *
 *  - Ritual Predileto (Ordem:1220-1221): "Escolha um ritual que você conhece.
 *    Você reduz em –1 PE o custo do ritual. Essa redução se acumula com
 *    reduções fornecidas por outras fontes." — o que o livro concede é ACÚMULO
 *    com outras fontes, não repetição do poder. Fácil de ler como repetição:
 *    acumular com "outras fontes" inclui um segundo desconto, mas de outra
 *    fonte, não de uma segunda cópia deste poder.
 *  - Especialista em Elemento (Ordem:1130-1133): "Escolha um elemento. A DT
 *    para resistir aos seus rituais desse elemento aumenta em +2." — duas
 *    frases, nenhuma sobre repetir.
 *
 * O contraste que fecha o argumento: Transcender (Ordem:818) diz a frase
 * explicitamente. Em Ordem Paranormal um poder não é repetível por omissão.
 */
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
    // A consequência prática da flag: sem ela o poder sai da lista de elegíveis.
    // Se isto passar mas a lista continuar oferecendo, a correção foi cosmética.
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
    // Sem a cláusula, "repetível" lido de fora autoriza mais do que o livro.
    expect(poder('Foco em Perícia').descricao).toContain('perícias diferentes');
    expect(poder('Aprender Ritual').descricao).toContain('limite de rituais conhecidos');
  });

  it('nenhum poder é marcado repetível sem o texto dizer', () => {
    // Aumento de Atributo é a única exceção deliberada: é concedido em NEX
    // 20/50/80/95, então aparece várias vezes na ficha sem a frase padrão na
    // descrição — o próprio livro escreve o marco em vez da frase.
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

  it('choosePower aceita repetir um repetível', () => {
    const base = criarFicha({ classe: 'Combatente', nex: 30 });
    const comUm = { ...base, poderes: [...base.poderes, poder('Treinamento em Perícia')], poderesClassePendentes: 1 };
    expect(() => choosePower(comUm, 'Treinamento em Perícia')).not.toThrow();
  });

  it('choosePower continua recusando repetir um não repetível', () => {
    const base = criarFicha({ classe: 'Combatente', nex: 30 });
    const comUm = { ...base, poderes: [...base.poderes, poder('Reflexos Defensivos')], poderesClassePendentes: 1 };
    expect(() => choosePower(comUm, 'Reflexos Defensivos')).toThrow(/já possui/i);
  });
});

describe('rebaixar NEX remove uma cópia, não todas', () => {
  it('três cópias de um repetível não desaparecem juntas', () => {
    const base = criarFicha({ classe: 'Combatente', nex: 30 });
    const tres = {
      ...base,
      poderes: [...base.poderes, poder('Transcender'), poder('Transcender'), poder('Transcender')],
    };

    const contar = (p: Personagem) => p.poderes.filter((x) => x.nome === 'Transcender').length;
    expect(contar(tres)).toBe(3);

    const rebaixado = rebaixarNex(tres, 25);
    expect(contar(rebaixado), 'o rebaixamento apagou todas as cópias').toBeGreaterThan(0);
  });

  it('subir e rebaixar de volta não zera um repetível pré-existente', () => {
    const base = criarFicha({ classe: 'Combatente', nex: 15 });
    const com = { ...base, poderes: [...base.poderes, poder('Transcender'), poder('Transcender')] };
    const subido = subirNex(com, 30).personagem;
    const voltou = rebaixarNex(subido, 15);
    expect(voltou.poderes.filter((p) => p.nome === 'Transcender').length).toBeGreaterThan(0);
  });
});

describe('não há mais lista de nomes repetíveis no código', () => {
  it('nenhuma linha decide repetição comparando nome de poder', () => {
    /*
     * A verificação é por LINHA, não por arquivo: o PowerChoiceModal
     * legitimamente compara `=== 'Transcender'` para abrir o seletor de poder
     * paranormal. O que não pode voltar é usar o nome para decidir REPETIÇÃO,
     * que é o formato `if (p.nome === 'X') return true;` dentro do filtro de
     * poderes já possuídos.
     */
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
    // Um poder que exige escolha e é repetível precisa das duas: sem `repetivel`
    // o jogador escolhe uma vez só; sem `escolha` a repetição não tem efeito.
    for (const nome of ['Treinamento em Perícia', 'Foco em Perícia']) {
      const p = poder(nome);
      expect(p.repetivel, `${nome}.repetivel`).toBe(true);
      expect(p.escolha, `${nome}.escolha`).toBeDefined();
    }
  });

  it('escolha declarada NÃO implica repetível', () => {
    // Ritual Predileto e Especialista em Elemento exigem uma escolha e valem
    // uma vez só. A inversa era a suposição que produziu as duas flags erradas.
    for (const nome of NAO_REPETIVEIS_NO_LIVRO) {
      expect(poder(nome).escolha, `${nome}.escolha`).toBeDefined();
      expect(poder(nome).repetivel ?? false, `${nome}.repetivel`).toBe(false);
    }
  });
});
