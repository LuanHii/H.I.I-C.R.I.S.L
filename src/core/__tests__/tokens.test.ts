import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import config from '../../../tailwind.config';

const paleta = (config.theme?.extend?.colors as { ordem: Record<string, string> }).ordem;

function luminancia(hex: string): number {
  const canais = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const linear = canais.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contraste(a: string, b: string): number {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (escuro + 0.05);
}

describe('todo token de cor usado no código existe na paleta', () => {
  it('nenhuma classe `-ordem-*` aponta para token inexistente', () => {
    const raiz = join(process.cwd(), 'src');
    const usados = new Set<string>();

    const varrer = (dir: string) => {
      for (const entrada of readdirSync(dir)) {
        const caminho = join(dir, entrada);
        if (statSync(caminho).isDirectory()) {
          if (entrada !== '__tests__' && entrada !== 'node_modules') varrer(caminho);
          continue;
        }
        if (!/\.tsx?$/.test(entrada)) continue;
        const texto = readFileSync(caminho, 'utf8');
        for (const m of Array.from(texto.matchAll(/(?:text|bg|border|ring|from|to|divide)-ordem-([a-z-]+?)(?=[^a-z-]|$)/g))) {
          usados.add(m[1]);
        }
      }
    };
    varrer(raiz);

    const inexistentes = Array.from(usados)
      .filter((t) => !(t in paleta))
      .sort();

    expect(inexistentes, 'classes que não emitem CSS nenhum').toEqual([]);
  });
});

describe('contraste medido, não afirmado', () => {
  const FUNDOS = ['black', 'black-deep', 'ooze', 'bg'] as const;

  it.each(FUNDOS)('text-primary passa AA sobre %s', (fundo) => {
    expect(contraste(paleta['text-primary'], paleta[fundo])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(FUNDOS)('text-secondary passa AA sobre %s', (fundo) => {
    expect(contraste(paleta['text-secondary'], paleta[fundo])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(FUNDOS)('text-muted passa AA sobre %s', (fundo) => {
    const razao = contraste(paleta['text-muted'], paleta[fundo]);
    expect(razao, `${paleta['text-muted']} sobre ${paleta[fundo]} = ${razao.toFixed(2)}:1`)
      .toBeGreaterThanOrEqual(4.5);
  });

  it('ooze é o fundo mais claro em uso — é ele que aperta o limite', () => {
    const luminancias = FUNDOS.map((f) => [f, luminancia(paleta[f])] as const);
    const maisClaro = luminancias.sort((a, b) => b[1] - a[1])[0][0];
    expect(maisClaro).toBe('ooze');
  });
});
