import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { SlotKind } from '@/core/ficha/tipos';
import { pendenciasResolviveis, resumoDePendencias } from '@/core/ficha/pendencias';
import { registrarEscolha } from '@/core/ficha/registrarEscolha';
import { migrarFicha } from '@/core/ficha/migracao/migrarFicha';
import { normalizePersonagem } from '@/core/personagemUtils';
import { criarFicha } from '@/testUtils/fixtures';

/**
 * Toda `SlotKind` precisa de rótulo nas DUAS superfícies que mostram pendência:
 * o painel (`TITULO`) e o resumo de uma linha do card (`nomes`).
 *
 * Sem isto, adicionar um kind novo — como as cascatas `poderParanormal` e
 * `escolhaInterna` — faz o painel renderizar o identificador cru
 * ("escolhaInterna") no lugar do título, e o resumo dizer "1 escolhaInternas".
 * É o tipo de defeito que nenhum teste de motor pega, porque o motor está certo.
 *
 * Lido do FONTE em vez de renderizado de propósito: o projeto não tem
 * testing-library instalado, e a pergunta aqui é de completude de mapa, não de
 * comportamento de componente.
 */

const KINDS: readonly SlotKind[] = [
  'trilha',
  'trilhaHabilidade',
  'poderClasse',
  'atributo',
  'pericia',
  'afinidade',
  'versatilidade',
  'ritual',
  'poderParanormal',
  'escolhaInterna',
];

const fonte = (rel: string) => readFileSync(join(process.cwd(), 'src', rel), 'utf8');

describe('todo SlotKind tem rótulo nas duas superfícies', () => {
  const painel = fonte('components/master/PendenciasPanel.tsx');
  const mapaPainel = /const TITULO: Record<string, string> = \{([\s\S]*?)\};/.exec(painel)?.[1] ?? '';
  const nucleo = fonte('core/ficha/pendencias.ts');
  const mapaResumo = /const nomes: Record<string, string> = \{([\s\S]*?)\};/.exec(nucleo)?.[1] ?? '';

  it('os dois mapas foram encontrados no fonte', () => {
    // Se um refactor renomear os mapas, este teste tem de falhar em vez de
    // passar vazio — um regex que não casa nada acharia todo kind ausente… ou,
    // pior, se o `includes` fosse invertido, acharia todos presentes.
    expect(mapaPainel.length, 'mapa TITULO não localizado').toBeGreaterThan(50);
    expect(mapaResumo.length, 'mapa nomes não localizado').toBeGreaterThan(50);
  });

  it.each(KINDS)('%s tem título no painel', (kind) => {
    expect(mapaPainel, `TITULO sem entrada para "${kind}"`).toContain(`${kind}:`);
  });

  it.each(KINDS)('%s tem nome no resumo', (kind) => {
    expect(mapaResumo, `nomes sem entrada para "${kind}"`).toContain(`${kind}:`);
  });

  it('o resumo nunca vaza um identificador cru de kind', () => {
    // A prova de comportamento, complementando a de completude: qualquer kind
    // sem entrada apareceria literalmente no texto do resumo.
    const nomeados = Array.from(mapaResumo.matchAll(/(\w+):\s*'([^']*)'/g));
    expect(nomeados.length).toBe(KINDS.length);
    for (const [, kind, rotulo] of nomeados) {
      expect(rotulo, `${kind} tem rótulo vazio`).not.toBe('');
      /*
       * `trilha: 'trilha'` e `ritual: 'ritual'` são legítimos — o identificador
       * já É a palavra em português. O que denuncia identificador vazando é
       * camelCase, que nenhum rótulo humano tem: "escolhaInterna",
       * "poderParanormal", "trilhaHabilidade".
       */
      expect(rotulo, `${kind} vazou o identificador camelCase como rótulo`).not.toMatch(/[a-z][A-Z]/);
    }
  });

  it('o resumo de uma ficha COM cascata pendente é legível', () => {
    /*
     * Comportamento de verdade, não asserção sobre o tipo da função. A ficha
     * abaixo tem uma cascata de Transcender aberta e não respondida, então o
     * resumo tem obrigatoriamente de mencionar o kind novo — e em português.
     */
    let ficha = migrarFicha(
      normalizePersonagem(criarFicha({ classe: 'Combatente', nex: 30, trilha: 'Aniquilador' }), false),
    ).ficha!;

    const pai = pendenciasResolviveis(ficha).find((p) => p.slot.kind === 'poderClasse')!.slot;
    const r = registrarEscolha(ficha, pai.id, { tipo: 'poder', poder: 'Transcender' });
    expect(r.aplicada).toBe(true);
    ficha = r.ficha;

    const resumo = resumoDePendencias(ficha);
    expect(resumo, 'a cascata aberta não gerou pendência').not.toBeNull();
    expect(resumo!).toContain('poder paranormal');
    expect(resumo!, 'identificador cru no resumo').not.toMatch(/[a-z][A-Z]/);
  });
});
