import { describe, expect, it } from 'vitest';
import type { Elemento, Personagem, Poder } from '@/core/types';
import { RITUAIS } from '@/data/magic/rituals';
import {
  PODERES,
  contarPoderesElemento,
  getPoderesParanormaisElegiveis,
} from '@/data/character/powers';
import { criarFicha } from '@/testUtils/fixtures';

/**
 * Ordem:4156, última frase de Aprender Ritual:
 *   "Este poder conta como um poder do elemento do ritual escolhido."
 *
 * É a frase que liga o poder ao resto do sistema de elementos. Sem ela, um
 * ocultista que gasta seus poderes paranormais em Aprender Ritual não progride
 * em nenhum elemento: os requisitos "<Elemento> 1"/"<Elemento> 2" dos outros
 * poderes paranormais nunca são satisfeitos, e a afinidade de NEX 50% não abre.
 */

const catalogo = (nome: string): Poder => {
  const p = PODERES.find((x) => x.nome === nome);
  if (!p) throw new Error(`poder inexistente: ${nome}`);
  return p;
};

/** Um ritual real de cada elemento, tirado do catálogo em vez de inventado. */
const ritualDe = (elemento: Elemento) => {
  const r = RITUAIS.find((x) => x.elemento === elemento && x.circulo === 1);
  if (!r) throw new Error(`sem ritual de 1º círculo de ${elemento}`);
  return r;
};

const comAprenderRitual = (...rituais: string[]): Personagem => {
  const base = criarFicha({ classe: 'Ocultista', nex: 45 });
  return {
    ...base,
    poderes: [
      ...base.poderes,
      ...rituais.map((escolhaInterna) => ({ ...catalogo('Aprender Ritual'), escolhaInterna })),
    ],
  };
};

describe('Aprender Ritual conta como poder do elemento do ritual', () => {
  it('o catálogo declara a regra na descrição', () => {
    expect(catalogo('Aprender Ritual').descricao).toContain(
      'Conta como um poder do elemento do ritual escolhido',
    );
  });

  it('uma cópia com ritual de Sangue conta 1 poder de Sangue', () => {
    const sangue = ritualDe('Sangue');
    expect(contarPoderesElemento(comAprenderRitual(sangue.nome), 'Sangue')).toBe(1);
  });

  it('duas cópias com rituais do mesmo elemento contam 2', () => {
    const doisDeSangue = RITUAIS.filter((r) => r.elemento === 'Sangue').slice(0, 2);
    expect(doisDeSangue.length, 'fixture precisa de dois rituais de Sangue').toBe(2);
    const ficha = comAprenderRitual(doisDeSangue[0].nome, doisDeSangue[1].nome);
    expect(contarPoderesElemento(ficha, 'Sangue')).toBe(2);
  });

  it('NÃO conta para o elemento errado', () => {
    // A parte que um `return true` preguiçoso quebraria: o poder conta para UM
    // elemento, o do ritual escolhido, não para todos.
    const ficha = comAprenderRitual(ritualDe('Sangue').nome);
    expect(contarPoderesElemento(ficha, 'Morte')).toBe(0);
    expect(contarPoderesElemento(ficha, 'Conhecimento')).toBe(0);
    expect(contarPoderesElemento(ficha, 'Energia')).toBe(0);
  });

  it('soma com poderes que já têm elemento próprio', () => {
    const comElemento = PODERES.find((p) => p.tipo === 'Paranormal' && p.elemento === 'Morte')!;
    const base = comAprenderRitual(ritualDe('Morte').nome);
    const ficha = { ...base, poderes: [...base.poderes, comElemento] };
    expect(contarPoderesElemento(ficha, 'Morte')).toBe(2);
  });

  it('sem escolha registrada, não conta para elemento nenhum', () => {
    // Ficha antiga em que a escolha do ritual nunca foi gravada. O certo é não
    // contar — inventar um elemento aqui liberaria requisito que o jogador não
    // cumpriu. A lacuna é do dado, e fica visível como lacuna.
    const base = criarFicha({ classe: 'Ocultista', nex: 45 });
    const ficha = { ...base, poderes: [...base.poderes, catalogo('Aprender Ritual')] };
    for (const e of ['Sangue', 'Morte', 'Conhecimento', 'Energia'] as const) {
      expect(contarPoderesElemento(ficha, e)).toBe(0);
    }
  });

  it('escolha que não corresponde a nenhum ritual do catálogo não conta', () => {
    const ficha = comAprenderRitual('Ritual Que Não Existe');
    for (const e of ['Sangue', 'Morte', 'Conhecimento', 'Energia'] as const) {
      expect(contarPoderesElemento(ficha, e)).toBe(0);
    }
  });
});

describe('elemento só conta em poder paranormal', () => {
  it('um poder de classe com campo elemento não conta como poder do elemento', () => {
    // `elemento` é opcional em `Poder`, então nada impede uma entrada de classe
    // de carregá-lo. A contagem antiga em powers.ts nem checava `tipo`, e a de
    // requisitos.ts também não — as duas contariam este poder.
    const base = criarFicha({ classe: 'Ocultista', nex: 45 });
    const intruso: Poder = {
      nome: 'Poder de Classe Com Elemento',
      descricao: '',
      tipo: 'Classe',
      elemento: 'Sangue',
      livro: 'Regras Básicas',
    };
    const ficha = { ...base, poderes: [...base.poderes, intruso] };
    expect(contarPoderesElemento(ficha, 'Sangue')).toBe(0);
  });
});

describe('a regra de elemento não é duplicada', () => {
  it('nenhuma outra linha decide elemento comparando o campo direto', async () => {
    /*
     * Havia DUAS contagens: `powers.contarPoderesElemento` e
     * `requisitos.contarPoderesDeElemento`, com regras diferentes. É assim que um
     * poder fica elegível numa tela e bloqueado na outra. Agora só
     * `elementoEfetivo` responde — e este teste impede a terceira cópia.
     */
    const { readFileSync, readdirSync, statSync } = await import('node:fs');
    const { join } = await import('node:path');
    const raiz = join(process.cwd(), 'src');
    const suspeitos: string[] = [];
    const COMPARA_ELEMENTO = /\.elemento === (elemento|requisito\.elemento)\b/;
    /*
     * `getPoderesParanormaisPorElemento` responde a outra pergunta — quais
     * poderes OFERECER para um elemento, não quantos o personagem TEM — e por
     * isso inclui deliberadamente os sem elemento (`|| !p.elemento`), que servem
     * para qualquer um. É essa cláusula que a distingue de uma contagem, então é
     * ela que isenta a linha, não uma lista de nomes permitidos.
     */
    const EH_FILTRO_DE_OFERTA = /\|\|\s*!p\.elemento/;

    const varrer = (dir: string) => {
      for (const entrada of readdirSync(dir)) {
        const caminho = join(dir, entrada);
        if (statSync(caminho).isDirectory()) {
          if (entrada !== '__tests__' && entrada !== 'node_modules') varrer(caminho);
          continue;
        }
        if (!/\.tsx?$/.test(entrada)) continue;
        readFileSync(caminho, 'utf8').split('\n').forEach((linha, i) => {
          if (!COMPARA_ELEMENTO.test(linha)) return;
          if (EH_FILTRO_DE_OFERTA.test(linha)) return;
          // a definição de elementoEfetivo é a única contagem legítima
          if (caminho.endsWith('requisitos.ts')) return;
          suspeitos.push(`${caminho.slice(raiz.length + 1)}:${i + 1}`);
        });
      }
    };
    varrer(raiz);
    expect(suspeitos, 'use elementoEfetivo em vez de comparar .elemento').toEqual([]);
  });
});

describe('a consequência: requisito de elemento passa a ser satisfeito', () => {
  it('um poder que exige "Sangue 1" fica elegível via Aprender Ritual', () => {
    /*
     * Este é o teste que importa — contar certo e não destravar nada seria
     * contabilidade inútil. Antes da correção, o ocultista tinha de tomar um
     * poder paranormal *com elemento* só para abrir a lista de Sangue.
     */
    const exigeSangue = PODERES.find(
      (p) => p.tipo === 'Paranormal' && /^Sangue 1$/.test(p.requisitos ?? ''),
    );
    expect(exigeSangue, 'catálogo sem poder que exige "Sangue 1"').toBeDefined();

    const semNada = criarFicha({ classe: 'Ocultista', nex: 45 });
    const antes = getPoderesParanormaisElegiveis(semNada).find(
      (p) => p.nome === exigeSangue!.nome,
    );
    expect(antes?.elegivel, 'deveria estar bloqueado sem nenhum poder de Sangue').toBe(false);

    const depois = getPoderesParanormaisElegiveis(
      comAprenderRitual(ritualDe('Sangue').nome),
    ).find((p) => p.nome === exigeSangue!.nome);
    expect(depois?.elegivel, `${exigeSangue!.nome} segue bloqueado: ${depois?.motivo}`).toBe(true);
  });
});
