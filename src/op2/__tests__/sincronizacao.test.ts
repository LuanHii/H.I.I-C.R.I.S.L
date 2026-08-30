import { describe, expect, it } from 'vitest';
import { fichaDoPreset } from '../presets/sobreviventes';
import { assinaturaDaFicha, precisaSincronizar } from '../nuvem/sincronizacao';
import {
  alternarCondicao,
  encherImpeto,
  gastarPd,
  sofrerDano,
} from '../regras/sessao';

describe('assinatura da ficha — o que dispara o reenvio ao jogador', () => {
  it('perder PV muda a assinatura: foi esse o bug do compartilhado nao atualizar', () => {
    const alan = fichaDoPreset('alan');
    expect(assinaturaDaFicha(sofrerDano(alan, 3))).not.toBe(assinaturaDaFicha(alan));
  });

  it('gastar PD muda a assinatura', () => {
    const alan = fichaDoPreset('alan');
    expect(assinaturaDaFicha(gastarPd(alan, 2))).not.toBe(assinaturaDaFicha(alan));
  });

  it('encher o impeto muda a assinatura', () => {
    const alan = fichaDoPreset('alan');
    expect(assinaturaDaFicha(encherImpeto(alan))).not.toBe(assinaturaDaFicha(alan));
  });

  it('ganhar uma condicao muda a assinatura', () => {
    const alan = fichaDoPreset('alan');
    expect(assinaturaDaFicha(alternarCondicao(alan, 'Machucado'))).not.toBe(
      assinaturaDaFicha(alan),
    );
  });

  it('a mesma ficha da sempre a mesma assinatura, sem reenvio a toa', () => {
    const alan = fichaDoPreset('alan');
    expect(assinaturaDaFicha(alan)).toBe(assinaturaDaFicha(alan));
  });

  it('a assinatura nao depende da ordem das chaves do objeto', () => {
    const alan = fichaDoPreset('alan');
    const reordenada = {
      ...alan,
      atributos: { EMOCAO: alan.atributos.EMOCAO, MENTE: alan.atributos.MENTE, FISICO: alan.atributos.FISICO },
    };
    expect(assinaturaDaFicha(reordenada)).toBe(assinaturaDaFicha(alan));
  });

  it('curar de volta ao estado original devolve a assinatura original', () => {
    const alan = fichaDoPreset('alan');
    const ferido = sofrerDano(alan, 4);
    const curado = sofrerDano(ferido, -0);
    expect(assinaturaDaFicha(curado)).not.toBe(assinaturaDaFicha(alan));
    expect(assinaturaDaFicha({ ...ferido, sessao: { ...ferido.sessao, pvDano: 0 } })).toBe(
      assinaturaDaFicha(alan),
    );
  });
});

describe('decisao de reenviar', () => {
  it('ficha fora do ar nunca e enviada sozinha: publicar e escolha do mestre', () => {
    expect(precisaSincronizar(false, 'antiga', 'nova')).toBe(false);
  });

  it('sem envio anterior registrado, nao reenvia: evita gravar no primeiro render', () => {
    expect(precisaSincronizar(true, null, 'nova')).toBe(false);
  });

  it('publicada e com mudanca desde o ultimo envio, reenvia', () => {
    expect(precisaSincronizar(true, 'antiga', 'nova')).toBe(true);
  });

  it('publicada e sem mudanca, nao reenvia', () => {
    expect(precisaSincronizar(true, 'igual', 'igual')).toBe(false);
  });

  it('o ciclo completo: publica, muda o PV, reenvia, e para de reenviar', () => {
    const alan = fichaDoPreset('alan');
    let enviada = assinaturaDaFicha(alan);
    expect(precisaSincronizar(true, enviada, assinaturaDaFicha(alan))).toBe(false);

    const ferido = sofrerDano(alan, 3);
    expect(precisaSincronizar(true, enviada, assinaturaDaFicha(ferido))).toBe(true);

    enviada = assinaturaDaFicha(ferido);
    expect(precisaSincronizar(true, enviada, assinaturaDaFicha(ferido))).toBe(false);
  });
});
