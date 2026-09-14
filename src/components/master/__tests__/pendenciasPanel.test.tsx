import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { SlotKind } from '@/core/ficha/tipos';
import { pendenciasResolviveis, resumoDePendencias } from '@/core/ficha/pendencias';
import { registrarEscolha } from '@/core/ficha/registrarEscolha';
import { migrarFicha } from '@/core/ficha/migracao/migrarFicha';
import { normalizePersonagem } from '@/core/personagemUtils';
import { criarFicha } from '@/testUtils/fixtures';

const fonte = (rel: string) => readFileSync(join(process.cwd(), 'src', rel), 'utf8');

const UNIAO_SLOT_KIND = /export type SlotKind =([\s\S]*?);\r?\n/.exec(
  fonte('core/ficha/tipos.ts'),
)?.[1] ?? '';

const KINDS: readonly SlotKind[] = Array.from(
  UNIAO_SLOT_KIND.matchAll(/\|\s*'([a-zA-Z]+)'/g),
).map((m) => m[1] as SlotKind);

describe('todo SlotKind tem rótulo nas duas superfícies', () => {
  const painel = fonte('components/master/PendenciasPanel.tsx');
  const mapaPainel = /const TITULO: Record<string, string> = \{([\s\S]*?)\};/.exec(painel)?.[1] ?? '';
  const nucleo = fonte('core/ficha/pendencias.ts');
  const mapaResumo = /const nomes: Record<string, \[string, string\]> = \{([\s\S]*?)\};/.exec(nucleo)?.[1] ?? '';

  it('a uniao SlotKind foi lida do fonte', () => {
    expect(UNIAO_SLOT_KIND.length, 'uniao SlotKind nao localizada em tipos.ts').toBeGreaterThan(50);
    expect(KINDS.length, 'nenhum kind extraido da uniao').toBeGreaterThan(9);
    expect(new Set(KINDS).size, 'kind repetido na extracao').toBe(KINDS.length);
    expect(KINDS).toContain('trilha');
    expect(KINDS).toContain('escolhaInterna');
  });

  it('os dois mapas foram encontrados no fonte', () => {
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
    const nomeados = Array.from(mapaResumo.matchAll(/(\w+):\s*\['([^']*)',\s*'([^']*)'\]/g));
    expect(nomeados.length).toBe(KINDS.length);
    for (const [, kind, singular, plural] of nomeados) {
      for (const rotulo of [singular, plural]) {
        expect(rotulo, `${kind} tem rótulo vazio`).not.toBe('');
        expect(rotulo, `${kind} vazou o identificador camelCase como rótulo`).not.toMatch(/[a-z][A-Z]/);
      }
      expect(plural, `${kind}: o plural não pode ser o singular com "s" colado em "l"`).not.toMatch(/ls$/);
    }
  });

  it('o resumo de uma ficha COM cascata pendente é legível', () => {
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
