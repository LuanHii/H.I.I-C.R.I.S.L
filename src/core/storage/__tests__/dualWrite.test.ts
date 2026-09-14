import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Personagem } from '@/core/types';
import type { FichaPersistida } from '@/core/ficha/tipos';
import { paraNuvem, type FichaRegistroCloudType } from '../useCloudFichas';

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
  const fonte = readFileSync(
    join(process.cwd(), 'src', 'core', 'storage', 'useCloudFichas.ts'),
    'utf8',
  ).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  it('toda chamada a saveFichaToCloud passa por paraNuvem ou é a duplicação', () => {
    const chamadas = fonte.match(/saveFichaToCloud\(\s*userId,\s*([^)]*)/g) ?? [];
    expect(chamadas.length, 'esperava encontrar as chamadas de escrita').toBeGreaterThan(0);

    for (const chamada of chamadas) {
      const ok = chamada.includes('paraNuvem')
        || /id:\s*novoId/.test(chamada);
      expect(ok, `escrita sem paraNuvem: ${chamada.slice(0, 120)}`).toBe(true);
    }
  });

  it('não sobrou nenhum literal `FichaRegistroCloud = {` no arquivo', () => {
    expect(/:\s*FichaRegistroCloud\s*=\s*\{/.test(fonte)).toBe(false);
  });
});

describe('salvar grava a projeção do motor, não o personagem que a tela mandou', () => {
  const fonte = readFileSync(
    join(process.cwd(), 'src', 'core', 'storage', 'useCloudFichas.ts'),
    'utf8',
  ).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  it('a sessão é absorvida por prepararGravacao — o store não chama atualizarSessao direto', () => {
    expect(fonte).toMatch(/prepararGravacao\(/);
    expect(fonte).not.toMatch(/atualizarSessao\(/);
  });

  it('o documento do jogador (agents/{id}) recebe o personagem preparado, nunca o argumento cru', () => {
    const inicio = fonte.indexOf('const salvar = useCallback');
    const fim = fonte.indexOf('const sincronizarFicha');
    expect(inicio).toBeGreaterThan(-1);
    const corpo = fonte.slice(inicio, fim);
    const chamadas = corpo.match(/saveAgentToCloud\(\s*fichaId,\s*([^)]*)\)/g) ?? [];
    expect(chamadas.length).toBeGreaterThan(0);
    for (const chamada of chamadas) {
      expect(chamada, chamada).toMatch(/saveAgentToCloud\(\s*fichaId,\s*gravacao\.personagem\s*\)/);
    }
    expect(corpo).not.toMatch(/^\s*personagem,\s*$/m);
  });
});

describe('a fonte de leitura é decisão, não estado gravado', () => {
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
