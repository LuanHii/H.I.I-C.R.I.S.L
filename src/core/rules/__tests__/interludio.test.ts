import { describe, expect, it } from 'vitest';
import type { Personagem } from '@/core/types';
import { criarFicha } from '@/testUtils/fixtures';
import {
  CONDICOES_DE_DESCANSO,
  aplicarInterludio,
  recuperacaoDeDescanso,
} from '../interludio';

const ferido = (over: Partial<Personagem> = {}): Personagem => {
  const p = criarFicha({ classe: 'Especialista', nex: 35 });
  return {
    ...p,
    pv: { ...p.pv, atual: 1 },
    pe: { ...p.pe, atual: 0 },
    san: { ...p.san, atual: 2 },
    ...over,
  };
};

describe('dormir recupera PV e PE iguais ao limite de PE, conforme a condição de descanso (Ordem:3694-3713)', () => {
  it('normal: NEX 35% tem limite de PE 7 e recupera 7 PV e 7 PE — o exemplo do livro (Ordem:3699)', () => {
    const p = ferido();
    expect(p.pe.rodada).toBe(7);

    const { personagem, relato } = aplicarInterludio(p, { acao: 'dormir', condicao: 'normal' });

    expect(personagem.pv.atual).toBe(1 + 7);
    expect(personagem.pe.atual).toBe(0 + 7);
    expect(personagem.san.atual, 'dormir não mexe em Sanidade').toBe(2);
    expect(relato).toContain('7 PV');
    expect(relato).toContain('7 PE');
  });

  it('precária reduz à metade, arredondando para baixo (Ordem:3702, Ordem:12175); confortável dobra; luxuosa triplica', () => {
    expect(recuperacaoDeDescanso(7, 'precaria')).toBe(3);
    expect(recuperacaoDeDescanso(7, 'normal')).toBe(7);
    expect(recuperacaoDeDescanso(7, 'confortavel')).toBe(14);
    expect(recuperacaoDeDescanso(7, 'luxuosa')).toBe(21);
  });

  it('nunca ultrapassa o máximo (Ordem:1321)', () => {
    const p = ferido({ pv: { ...ferido().pv, atual: ferido().pv.max - 2 } });
    const { personagem } = aplicarInterludio(p, { acao: 'dormir', condicao: 'luxuosa' });
    expect(personagem.pv.atual).toBe(p.pv.max);
    expect(personagem.pe.atual).toBe(Math.min(p.pe.max, 21));
  });

  it('com a regra de PD, dormir recupera só PV (SOH:3006)', () => {
    const p = ferido({ usarPd: true, pd: { atual: 1, max: 12 } });
    const { personagem } = aplicarInterludio(p, { acao: 'dormir', condicao: 'normal' });
    expect(personagem.pv.atual).toBe(1 + 7);
    expect(personagem.pe.atual).toBe(0);
    expect(personagem.pd?.atual).toBe(1);
  });
});

describe('relaxar funciona como dormir, mas em Sanidade, +1 por personagem que relaxou junto (Ordem:3726-3728)', () => {
  it('sozinho: limite de PE em SAN, mais 1 por ele mesmo ter relaxado', () => {
    const { personagem, relato } = aplicarInterludio(ferido(), { acao: 'relaxar', condicao: 'normal', quantosRelaxaram: 1 });
    expect(personagem.san.atual).toBe(2 + 7 + 1);
    expect(personagem.pv.atual, 'relaxar não mexe em PV').toBe(1);
    expect(personagem.pe.atual, 'relaxar não mexe em PE').toBe(0);
    expect(relato).toContain('8 SAN');
  });

  it('três relaxando juntos: cada um recebe +3 além da recuperação base', () => {
    const { personagem } = aplicarInterludio(ferido(), { acao: 'relaxar', condicao: 'precaria', quantosRelaxaram: 3 });
    expect(personagem.san.atual).toBe(2 + 3 + 3);
  });

  it('com a regra de PD, relaxar recupera PD em vez de Sanidade (SOH:3006)', () => {
    const p = ferido({ usarPd: true, pd: { atual: 1, max: 12 } });
    const { personagem } = aplicarInterludio(p, { acao: 'relaxar', condicao: 'normal', quantosRelaxaram: 1 });
    expect(personagem.pd?.atual).toBe(1 + 7 + 1);
    expect(personagem.san.atual).toBe(2);
  });

  it('Sobrevivente tem limite de PE 1 em qualquer estágio (SOH:765)', () => {
    const s = criarFicha({ classe: 'Sobrevivente', estagio: 3 });
    const p = { ...s, pv: { ...s.pv, atual: 1 }, san: { ...s.san, atual: 1 } };
    expect(p.pe.rodada).toBe(1);
    expect(aplicarInterludio(p, { acao: 'dormir', condicao: 'normal' }).personagem.pv.atual).toBe(2);
    expect(aplicarInterludio(p, { acao: 'relaxar', condicao: 'confortavel', quantosRelaxaram: 2 }).personagem.san.atual).toBe(1 + 2 + 2);
  });
});

describe('manutenção e catálogo', () => {
  it('manutenção conserta itens, não mexe em recursos (Ordem:3722) — o personagem volta intacto', () => {
    const p = ferido();
    const { personagem, relato } = aplicarInterludio(p, { acao: 'manutencao', condicao: 'normal' });
    expect(personagem).toBe(p);
    expect(relato).toMatch(/item/i);
  });

  it('as quatro condições do livro, com o multiplicador de cada uma', () => {
    expect(CONDICOES_DE_DESCANSO.map((c) => [c.id, c.multiplicador])).toEqual([
      ['precaria', 0.5],
      ['normal', 1],
      ['confortavel', 2],
      ['luxuosa', 3],
    ]);
  });
});
