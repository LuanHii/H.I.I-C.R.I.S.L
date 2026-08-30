import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Personagem } from '@/core/types';
import type { FichaPersistida } from '@/core/ficha/tipos';
import { paraNuvem, type FichaRegistroCloudType } from '../useCloudFichas';

/**
 * DUAL-WRITE — a leitura continua v0; a escrita passa a carregar o v2.
 *
 * O risco aqui não é conceitual, é mecânico: `saveFichaToCloud` é `setDoc` SEM
 * merge e `removeUndefinedFields` tira `undefined` do payload. Somando os dois,
 * qualquer escrita que monte o payload à mão e esqueça `ficha` APAGA a conversão
 * — e mover uma ficha de campanha é uma escrita.
 */

const fichaV2: FichaPersistida = {
  versao: 2,
  identidade: {
    nome: 'X', classe: 'Combatente', origem: 'Policial',
    atributosBase: { AGI: 1, FOR: 1, INT: 1, PRE: 1, VIG: 1 },
    periciasLivres: [],
  },
  progressao: { nex: 5 },
  escolhas: [],
  sessao: { pvDano: 0, peGasto: 0, sanPerdida: 0 },
  ajustes: {},
};

const registro = (over: Partial<FichaRegistroCloudType> = {}): FichaRegistroCloudType => ({
  id: 'f1',
  personagem: { nome: 'X' } as Personagem,
  atualizadoEm: '2026-01-01T00:00:00.000Z',
  ...over,
});

describe('paraNuvem carrega o documento v2 adiante', () => {
  it('propaga ficha, carimbo e confirmação', () => {
    const saida = paraNuvem(registro({
      ficha: fichaV2, fichaMigradaDe: '2025-12-01T00:00:00.000Z', fichaConfirmada: true,
    }));
    expect(saida.ficha).toEqual(fichaV2);
    expect(saida.fichaMigradaDe).toBe('2025-12-01T00:00:00.000Z');
    expect(saida.fichaConfirmada).toBe(true);
  });

  it('ficha não migrada continua sem o campo — ausência não é erro', () => {
    expect(paraNuvem(registro()).ficha).toBeUndefined();
  });

  it('não carrega `sincronizadaNaNuvem`, que é derivado do cliente', () => {
    const saida = paraNuvem(registro({ sincronizadaNaNuvem: true }));
    expect('sincronizadaNaNuvem' in saida).toBe(false);
  });
});

describe('nenhum caminho de escrita monta o payload à mão', () => {
  /**
   * Este é o guard que impede a regressão de verdade.
   *
   * Os quatro caminhos de escrita montavam `{ id, personagem, atualizadoEm,
   * campanha }` cada um por conta própria. Um quinto caminho escrito daqui a
   * seis meses repetiria o padrão e apagaria conversões em silêncio — sem
   * exceção, sem teste vermelho, sem nada no console. Um grep é o único
   * detector barato para "alguém esqueceu".
   */
  const fonte = readFileSync(
    join(process.cwd(), 'src', 'core', 'storage', 'useCloudFichas.ts'),
    'utf8',
  ).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  it('toda chamada a saveFichaToCloud passa por paraNuvem ou é a duplicação', () => {
    const chamadas = fonte.match(/saveFichaToCloud\(\s*userId,\s*([^)]*)/g) ?? [];
    expect(chamadas.length, 'esperava encontrar as chamadas de escrita').toBeGreaterThan(0);

    for (const chamada of chamadas) {
      const ok = chamada.includes('paraNuvem')
        // `duplicar` é a única exceção legítima: a cópia NÃO herda a conversão
        // do original, porque o round trip foi verificado sobre outro v0.
        || /id:\s*novoId/.test(chamada);
      expect(ok, `escrita sem paraNuvem: ${chamada.slice(0, 120)}`).toBe(true);
    }
  });

  it('não sobrou nenhum literal `FichaRegistroCloud = {` no arquivo', () => {
    expect(/:\s*FichaRegistroCloud\s*=\s*\{/.test(fonte)).toBe(false);
  });
});

describe('a fonte de leitura é decisão, não estado gravado', () => {
  /**
   * `fonte` e `motivoDaFonte` são recalculados a cada render. Persisti-los
   * congelaria uma decisão que precisa poder mudar sozinha: o catálogo muda entre
   * versões do app, e uma ficha que era legível pelo motor novo em março pode
   * deixar de ser em julho. Gravado, o app confiaria no carimbo velho.
   */
  it('nem `fonte` nem `motivoDaFonte` chegam ao payload da nuvem', () => {
    const saida = paraNuvem(registro({
      ficha: fichaV2,
      fonte: 'v2',
      motivoDaFonte: 'Lendo do motor novo',
    }) as never);
    expect('fonte' in saida).toBe(false);
    expect('motivoDaFonte' in saida).toBe(false);
  });

  it('`personagemOriginal` é propagado — é o que torna o rollback exato', () => {
    const original = { nome: 'Antes da conversão' } as Personagem;
    expect(paraNuvem(registro({ ficha: fichaV2, personagemOriginal: original })).personagemOriginal)
      .toBe(original);
  });
});
