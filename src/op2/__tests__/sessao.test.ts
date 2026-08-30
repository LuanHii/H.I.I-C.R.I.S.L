import { describe, expect, it } from 'vitest';
import { avaliacaoDe, impetoDe, pdAtual, pvAtual } from '../regras/ficha';
import { fichaDoPreset } from '../presets/sobreviventes';
import {
  adicionarPassoDeCena,
  alternarCondicao,
  aplicarResultadoDeTeste,
  ativarHabilidade,
  curar,
  definirPv,
  descansar,
  encerrarCena,
  encherImpeto,
  ganharDadosDeAvaliacao,
  gastarDadosDeAvaliacao,
  gastarImpeto,
  gastarPd,
  pagarCusto,
  registrarTesteDeFerimento,
  sofrerDano,
} from '../regras/sessao';

describe('PV e PD nunca saem do intervalo', () => {
  it('o dano nunca passa do PV maximo, entao curar depois nao ressuscita pontos fantasma', () => {
    const alan = fichaDoPreset('alan');
    const arrasado = sofrerDano(alan, 999);
    expect(pvAtual(arrasado)).toBe(0);
    expect(pvAtual(curar(arrasado, 3))).toBe(3);
  });

  it('curar acima do maximo para no maximo', () => {
    const alan = sofrerDano(fichaDoPreset('alan'), 4);
    expect(pvAtual(curar(alan, 999))).toBe(10);
  });

  it('gastar PD alem do disponivel para em zero', () => {
    const alan = fichaDoPreset('alan');
    expect(pdAtual(gastarPd(alan, 999))).toBe(0);
  });

  it('definir o PV grava dano equivalente, sem criar um segundo campo de verdade', () => {
    const alan = definirPv(fichaDoPreset('alan'), 6);
    expect(pvAtual(alan)).toBe(6);
    expect(alan.sessao.pvDano).toBe(4);
    expect(alan.pvMax).toBe(10);
  });

  it('nenhuma transicao muta a ficha original', () => {
    const alan = fichaDoPreset('alan');
    sofrerDano(alan, 5);
    gastarPd(alan, 5);
    expect(pvAtual(alan)).toBe(10);
    expect(pdAtual(alan)).toBe(16);
  });
});

describe('barra de impeto (cartao do Alan e do Edgar)', () => {
  it('a barra satura em tres espacos', () => {
    let alan = fichaDoPreset('alan');
    for (let i = 0; i < 10; i += 1) alan = encherImpeto(alan);
    expect(impetoDe(alan)).toBe(3);
  });

  it('falhar num teste enche exatamente um espaco', () => {
    const alan = aplicarResultadoDeTeste(fichaDoPreset('alan'), { contaComoFalhaParaImpeto: true });
    expect(impetoDe(alan)).toBe(1);
  });

  it('passar num teste nao enche a barra', () => {
    const alan = aplicarResultadoDeTeste(fichaDoPreset('alan'), { contaComoFalhaParaImpeto: false });
    expect(impetoDe(alan)).toBe(0);
  });

  it('gastar um espaco sem ter nenhum preenchido e erro, nao um no-op silencioso', () => {
    expect(() => gastarImpeto(fichaDoPreset('alan'), 1)).toThrow();
  });

  it('gastar tres espacos tendo dois e erro', () => {
    let alan = fichaDoPreset('alan');
    alan = encherImpeto(alan, 2);
    expect(() => gastarImpeto(alan, 3)).toThrow();
  });

  it('gastar tres espacos tendo tres esvazia a barra', () => {
    let alan = fichaDoPreset('alan');
    alan = encherImpeto(alan, 3);
    expect(impetoDe(gastarImpeto(alan, 3))).toBe(0);
  });

  it('um Vigilante nunca ganha impeto, mesmo falhando em testes', () => {
    const victor = aplicarResultadoDeTeste(fichaDoPreset('victor'), {
      contaComoFalhaParaImpeto: true,
    });
    expect(victor.perfil).toEqual({ tipo: 'VIGILANTE' });
    expect(impetoDe(victor)).toBe(0);
  });

  it('gastar impeto de quem nao e Executor e erro', () => {
    expect(() => gastarImpeto(fichaDoPreset('victor'), 1)).toThrow();
  });
});

describe('dados de Avaliacao (cartao da Eloisa e da Kenia)', () => {
  it('nunca acumula mais de dois dados, ainda que a habilidade seja usada de novo', () => {
    let eloisa = fichaDoPreset('eloisa');
    eloisa = ganharDadosDeAvaliacao(eloisa);
    eloisa = ganharDadosDeAvaliacao(eloisa);
    expect(avaliacaoDe(eloisa)).toBe(2);
  });

  it('gastar mais dados do que tem e erro', () => {
    const eloisa = ganharDadosDeAvaliacao(fichaDoPreset('eloisa'), 1);
    expect(() => gastarDadosDeAvaliacao(eloisa, 2)).toThrow();
  });

  it('os dois dados podem sair de uma vez ou um de cada vez', () => {
    const cheia = ganharDadosDeAvaliacao(fichaDoPreset('eloisa'));
    expect(avaliacaoDe(gastarDadosDeAvaliacao(cheia, 2))).toBe(0);
    expect(avaliacaoDe(gastarDadosDeAvaliacao(gastarDadosDeAvaliacao(cheia, 1), 1))).toBe(0);
  });

  it('um Executor nao ganha dados de avaliacao', () => {
    expect(avaliacaoDe(ganharDadosDeAvaliacao(fichaDoPreset('edgar')))).toBe(0);
  });
});

describe('ativar habilidade debita o recurso automaticamente', () => {
  it('Foco Mental custa 2 PD', () => {
    const alan = ativarHabilidade(fichaDoPreset('alan'), 'foco.mente');
    expect(pdAtual(alan)).toBe(14);
  });

  it('Avaliacao custa 2 PD e entrega os dois dados de uma vez', () => {
    const eloisa = ativarHabilidade(fichaDoPreset('eloisa'), 'avaliacao');
    expect(pdAtual(eloisa)).toBe(12);
    expect(avaliacaoDe(eloisa)).toBe(2);
  });

  it('Prontidao custa 3 PD', () => {
    const victor = ativarHabilidade(fichaDoPreset('victor'), 'prontidao');
    expect(pdAtual(victor)).toBe(11);
  });

  it('Impeto — impulso debita um espaco da barra, nao PD', () => {
    const alan = encherImpeto(fichaDoPreset('alan'), 2);
    const usado = ativarHabilidade(alan, 'impeto.passo');
    expect(impetoDe(usado)).toBe(1);
    expect(pdAtual(usado)).toBe(16);
  });

  it('ativar uma habilidade que a ficha nao tem e erro', () => {
    expect(() => ativarHabilidade(fichaDoPreset('victor'), 'foco.mente')).toThrow();
  });

  it('ativar sem recurso suficiente e erro, e a ficha nao fica meio alterada', () => {
    const semPd = gastarPd(fichaDoPreset('alan'), 15);
    expect(pdAtual(semPd)).toBe(1);
    expect(() => ativarHabilidade(semPd, 'foco.mente')).toThrow();
    expect(pdAtual(semPd)).toBe(1);
  });

  it('uma habilidade narrativa nao debita nada', () => {
    const edgar = ativarHabilidade(fichaDoPreset('edgar'), 'esforcoESuor');
    expect(pdAtual(edgar)).toBe(10);
    expect(impetoDe(edgar)).toBe(0);
  });

  it('pagar custo com PV insuficiente e erro', () => {
    const quaseMorto = definirPv(fichaDoPreset('alan'), 0);
    expect(() => pagarCusto(quaseMorto, { tipo: 'pv', quantidade: 1 })).toThrow();
  });
});

describe('passos de cena duram ate o fim da cena (cartao: Impeto de 3 espacos)', () => {
  it('o passo fica registrado com alvo e motivo, nao como um numero solto', () => {
    const alan = adicionarPassoDeCena(fichaDoPreset('alan'), 'MENTE', 'Ímpeto — superação');
    expect(alan.sessao.passosDeCena).toEqual([
      { alvo: 'MENTE', delta: 1, motivo: 'Ímpeto — superação' },
    ]);
  });

  it('encerrar a cena limpa os passos temporarios', () => {
    const alan = adicionarPassoDeCena(fichaDoPreset('alan'), 'MENTE', 'Ímpeto — superação');
    expect(encerrarCena(alan).sessao.passosDeCena).toEqual([]);
  });

  it('encerrar a cena NAO cura PV nem devolve PD: cena nao e descanso', () => {
    let alan = sofrerDano(fichaDoPreset('alan'), 4);
    alan = gastarPd(alan, 6);
    const depois = encerrarCena(alan);
    expect(pvAtual(depois)).toBe(6);
    expect(pdAtual(depois)).toBe(10);
  });

  it('descansar zera os contadores de teste de risco e os dados de avaliacao', () => {
    let eloisa = ganharDadosDeAvaliacao(fichaDoPreset('eloisa'));
    eloisa = registrarTesteDeFerimento(eloisa);
    const descansada = descansar(eloisa);
    expect(avaliacaoDe(descansada)).toBe(0);
    expect(descansada.sessao.testesDeFerimentoFeitos).toBe(0);
  });
});

describe('condicoes', () => {
  it('alternar adiciona e depois remove a mesma condicao', () => {
    const comCondicao = alternarCondicao(fichaDoPreset('alan'), 'Machucado');
    expect(comCondicao.sessao.condicoes).toEqual(['Machucado']);
    expect(alternarCondicao(comCondicao, 'Machucado').sessao.condicoes).toEqual([]);
  });
});
