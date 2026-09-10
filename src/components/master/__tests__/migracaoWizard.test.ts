import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const fonte = readFileSync(
  join(process.cwd(), 'src', 'components', 'master', 'MigracaoWizard.tsx'),
  'utf8',
);

const paineis = new Map(
  Array.from(fonte.matchAll(/<Painel titulo="([^"]+)">([\s\S]*?)<\/Painel>/g)).map(([, titulo, corpo]) => [
    titulo,
    Array.from(corpo.matchAll(/rotulo="([^"]+)"/g)).map((m) => m[1]),
  ]),
);

describe('o wizard compara os dois lados campo a campo', () => {
  const v0 = paineis.get('Ficha atual (v0)');
  const v2 = paineis.get('Ficha reconstruída (v2)');

  it('os dois painéis foram encontrados no fonte', () => {
    expect(v0, 'painel v0 não localizado — o regex parou de casar').toBeDefined();
    expect(v2, 'painel v2 não localizado — o regex parou de casar').toBeDefined();
    expect(v0!.length, 'painel v0 sem campo nenhum').toBeGreaterThan(5);
    expect(v2!.length, 'painel v2 sem campo nenhum').toBeGreaterThan(5);
  });

  it('todo campo do v0 tem o correspondente no v2, na mesma ordem', () => {
    expect(
      v2,
      'as colunas divergiram: um campo que aparece de um lado e não do outro faz '
      + 'conversão correta parecer perda, e foi assim que Origem e Classe sumiram',
    ).toEqual(v0);
  });

  it('e a comparação cobre identidade, recursos e poderes', () => {
    for (const campo of ['Classe', 'Origem', 'Trilha', 'PV máx.', 'SAN máx.', 'Poderes']) {
      expect(v0, `v0 perdeu o campo ${campo}`).toContain(campo);
      expect(v2, `v2 perdeu o campo ${campo}`).toContain(campo);
    }
  });
});
