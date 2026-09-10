import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Patente } from '@/core/types';
import {
  getPatenteConfig,
  getPatentePorPP,
  listarPatentes,
  ppParaProximaPatente,
} from '@/logic/rulesEngine';
import { normalizePersonagem } from '@/core/personagemUtils';
import { subirNex } from '@/logic/levelUp';
import { criarFicha } from '@/testUtils/fixtures';

const TABELA_3_1: ReadonlyArray<{
  pp: number;
  patente: Patente;
  credito: string;
  I: number;
  II: number;
  III: number;
  IV: number;
}> = [
  { pp: 0,   patente: 'Recruta',              credito: 'Baixo',     I: 2, II: 0, III: 0, IV: 0 },
  { pp: 20,  patente: 'Operador',             credito: 'Médio',     I: 3, II: 1, III: 0, IV: 0 },
  { pp: 50,  patente: 'Agente Especial',      credito: 'Médio',     I: 3, II: 2, III: 1, IV: 0 },
  { pp: 100, patente: 'Oficial de Operações', credito: 'Alto',      I: 3, II: 3, III: 2, IV: 1 },
  { pp: 200, patente: 'Agente de Elite',      credito: 'Ilimitado', I: 3, II: 3, III: 3, IV: 2 },
];

describe('Tabela 3.1: patentes e limites de item', () => {
  it('o motor tem exatamente as cinco patentes do livro, em ordem', () => {
    expect(listarPatentes().map((c) => c.nome)).toEqual(TABELA_3_1.map((l) => l.patente));
  });

  it.each(TABELA_3_1)('$patente: $pp PP, crédito $credito, itens $I/$II/$III/$IV', (linha) => {
    const cfg = getPatenteConfig(linha.patente);
    expect(cfg.ppMin, 'PP mínimo').toBe(linha.pp);
    expect(cfg.credito, 'limite de crédito').toBe(linha.credito);
    expect(cfg.limiteItens, 'limite de itens por categoria').toEqual({
      I: linha.I, II: linha.II, III: linha.III, IV: linha.IV,
    });
  });

  it('nenhuma patente passa de 3 itens de categoria I', () => {
    for (const cfg of listarPatentes()) {
      expect(cfg.limiteItens.I, `${cfg.nome} libera itens de mais`).toBeLessThanOrEqual(3);
    }
  });
});

describe('derivação de patente a partir de PP', () => {
  it.each([
    [0, 'Recruta'], [19, 'Recruta'],
    [20, 'Operador'], [49, 'Operador'],
    [50, 'Agente Especial'], [99, 'Agente Especial'],
    [100, 'Oficial de Operações'], [199, 'Oficial de Operações'],
    [200, 'Agente de Elite'], [9999, 'Agente de Elite'],
  ] as const)('%i PP → %s', (pp, esperado) => {
    expect(getPatentePorPP(pp)).toBe(esperado);
  });

  it('PP negativo não quebra: cai em Recruta', () => {
    expect(getPatentePorPP(-5)).toBe('Recruta');
  });

  it('perder PP rebaixa — o livro manda devolver os itens perdidos', () => {
    expect(getPatentePorPP(58)).toBe('Agente Especial');
    expect(getPatentePorPP(58 - 20)).toBe('Operador');
  });

  it.each([
    [0, 'Operador', 20],
    [44, 'Agente Especial', 6],
    [100, 'Agente de Elite', 100],
  ] as const)('com %i PP a próxima é %s, faltando %i', (pp, proxima, faltam) => {
    expect(ppParaProximaPatente(pp)).toEqual({ proxima, faltam });
  });

  it('no topo não há próxima patente', () => {
    expect(ppParaProximaPatente(200)).toBeNull();
  });
});

describe('patente é independente do NEX', () => {
  it('subir de NEX não promove nem altera o limite de itens', () => {
    const inicial = normalizePersonagem(
      { ...criarFicha({ classe: 'Combatente', nex: 5 }), patente: 'Recruta', pp: 0 },
      false,
    );
    expect(inicial.patente).toBe('Recruta');

    let atual = inicial;
    for (const nex of [10, 20, 35, 50, 70, 99]) atual = subirNex(atual, nex).personagem;

    expect(atual.nex, 'o NEX precisa ter subido para o teste valer').toBeGreaterThan(5);
    expect(atual.patente, 'NEX promoveu indevidamente').toBe('Recruta');
    expect(atual.limiteItens).toEqual(getPatenteConfig('Recruta').limiteItens);
  });

  it('um recruta de NEX alto continua recruta', () => {
    const ficha = normalizePersonagem(
      { ...criarFicha({ classe: 'Ocultista', nex: 70 }), patente: 'Recruta', pp: 0 },
      true,
    );
    expect(ficha.patente).toBe('Recruta');
  });
});

describe('migração de fichas anteriores ao campo PP', () => {
  it('ficha sem pp conserva a patente que o mestre via', () => {
    const antiga = { ...criarFicha({ classe: 'Especialista', nex: 50 }), patente: 'Oficial de Operações' as Patente };
    delete (antiga as { pp?: number }).pp;

    const migrada = normalizePersonagem(antiga, true);
    expect(migrada.patente, 'a ficha foi rebaixada na migração').toBe('Oficial de Operações');
  });

  it('ficha sem pp e sem patente vira Recruta', () => {
    const antiga = { ...criarFicha({ classe: 'Combatente', nex: 5 }) };
    delete (antiga as { pp?: number }).pp;
    delete (antiga as { patente?: Patente }).patente;

    expect(normalizePersonagem(antiga, true).patente).toBe('Recruta');
  });
});

describe('os limites de item têm uma fonte só', () => {
  it('nenhum componente escreve limites de item à mão', () => {
    const raiz = join(process.cwd(), 'src');
    const suspeitos: string[] = [];

    const varrer = (dir: string) => {
      for (const entrada of readdirSync(dir)) {
        const caminho = join(dir, entrada);
        if (statSync(caminho).isDirectory()) {
          if (entrada !== '__tests__' && entrada !== 'node_modules') varrer(caminho);
          continue;
        }
        if (!/\.tsx?$/.test(entrada)) continue;
        if (caminho.endsWith(join('logic', 'rulesEngine.ts'))) continue;

        const texto = readFileSync(caminho, 'utf8');
        if (/Cat\s+I[-:]/.test(texto) || /limiteItens\s*:\s*\{\s*I\s*:/.test(texto)) {
          suspeitos.push(caminho.slice(raiz.length + 1));
        }
      }
    };
    varrer(raiz);

    expect(suspeitos, 'derive de getPatenteConfig em vez de escrever a tabela').toEqual([]);
  });
});
