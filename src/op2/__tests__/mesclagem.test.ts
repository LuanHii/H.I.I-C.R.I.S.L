import { describe, expect, it } from 'vitest';
import { fichaDoPreset } from '../presets/sobreviventes';
import { assinaturaDaFicha } from '../nuvem/sincronizacao';
import { diferencaParaNuvem, mesclarPrimeiraCarga, type RegistroOp2 } from '../nuvem/mesclagem';
import { definirPv } from '../regras/sessao';
import { pvAtual } from '../regras/ficha';
import type { FichaOp2 } from '../regras/tipos';

const ANTES = '2026-01-01T10:00:00.000Z';
const DEPOIS = '2026-01-01T12:00:00.000Z';

function registro(ficha: FichaOp2, atualizadoEm: string): RegistroOp2 {
  return { id: ficha.id, ficha, atualizadoEm };
}

describe('primeira carga depois do login', () => {
  it('a ficha que so existia neste navegador sobe, em vez de sumir', () => {
    const alan = fichaDoPreset('alan');
    const { fichas, aSubir } = mesclarPrimeiraCarga([alan], {}, []);
    expect(fichas).toEqual([alan]);
    expect(aSubir).toEqual([alan]);
  });

  it('a ficha que so existia na nuvem desce, sem precisar reimportar', () => {
    const eloisa = fichaDoPreset('eloisa');
    const { fichas, aSubir } = mesclarPrimeiraCarga([], {}, [registro(eloisa, ANTES)]);
    expect(fichas).toEqual([eloisa]);
    expect(aSubir).toEqual([]);
  });

  it('as duas se juntam: entrar na conta nao apaga o que ja estava aqui', () => {
    const alan = fichaDoPreset('alan');
    const eloisa = fichaDoPreset('eloisa');
    const { fichas } = mesclarPrimeiraCarga([alan], {}, [registro(eloisa, ANTES)]);
    expect(fichas.map((ficha) => ficha.nome).sort()).toEqual(['Alan', 'Eloísa']);
  });

  it('na mesma ficha, a edicao mais nova vence — mesmo sendo a local', () => {
    const naNuvem = fichaDoPreset('alan');
    const local = definirPv(naNuvem, 3);
    const { fichas, aSubir } = mesclarPrimeiraCarga(
      [local],
      { [local.id]: DEPOIS },
      [registro(naNuvem, ANTES)],
    );
    expect(pvAtual(fichas[0])).toBe(3);
    expect(aSubir).toEqual([local]);
  });

  it('na mesma ficha, a da nuvem vence quando a local e mais velha', () => {
    const base = fichaDoPreset('alan');
    const naNuvem = definirPv(base, 8);
    const local = definirPv(base, 2);
    const { fichas, aSubir } = mesclarPrimeiraCarga(
      [local],
      { [local.id]: ANTES },
      [registro(naNuvem, DEPOIS)],
    );
    expect(pvAtual(fichas[0])).toBe(8);
    expect(aSubir).toEqual([]);
  });

  it('sem carimbo local, a nuvem vence: nao da para alegar que a local e mais nova', () => {
    const base = fichaDoPreset('alan');
    const naNuvem = definirPv(base, 8);
    const local = definirPv(base, 2);
    const { fichas } = mesclarPrimeiraCarga([local], {}, [registro(naNuvem, ANTES)]);
    expect(pvAtual(fichas[0])).toBe(8);
  });

  it('nenhuma ficha aparece duas vezes depois da mesclagem', () => {
    const alan = fichaDoPreset('alan');
    const { fichas } = mesclarPrimeiraCarga([alan], { [alan.id]: DEPOIS }, [
      registro(alan, ANTES),
    ]);
    expect(fichas).toHaveLength(1);
  });
});

describe('o que sobe para o perfil depois da primeira carga', () => {
  it('so sobe a ficha cuja assinatura mudou', () => {
    const alan = fichaDoPreset('alan');
    const eloisa = fichaDoPreset('eloisa');
    const enviadas = new Map([
      [alan.id, assinaturaDaFicha(alan)],
      [eloisa.id, assinaturaDaFicha(eloisa)],
    ]);
    const alanFerido = definirPv(alan, 4);

    const { aSalvar, aRemover } = diferencaParaNuvem([alanFerido, eloisa], enviadas);
    expect(aSalvar).toEqual([alanFerido]);
    expect(aRemover).toEqual([]);
  });

  it('nada sobe quando nada mudou: o snapshot que volta nao vira eco de escrita', () => {
    const alan = fichaDoPreset('alan');
    const enviadas = new Map([[alan.id, assinaturaDaFicha(alan)]]);
    expect(diferencaParaNuvem([alan], enviadas)).toEqual({ aSalvar: [], aRemover: [] });
  });

  it('a ficha removida aqui e apagada la, em vez de voltar no proximo snapshot', () => {
    const alan = fichaDoPreset('alan');
    const enviadas = new Map([[alan.id, assinaturaDaFicha(alan)]]);
    expect(diferencaParaNuvem([], enviadas)).toEqual({ aSalvar: [], aRemover: [alan.id] });
  });

  it('a ficha nova sobe mesmo sem nunca ter sido enviada', () => {
    const alan = fichaDoPreset('alan');
    const { aSalvar } = diferencaParaNuvem([alan], new Map());
    expect(aSalvar).toEqual([alan]);
  });
});
