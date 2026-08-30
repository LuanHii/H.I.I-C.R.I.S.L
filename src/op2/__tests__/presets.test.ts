import { describe, expect, it } from 'vitest';
import {
  DADO_DESTREINADO,
  avaliacaoDe,
  dadoDaPericia,
  estadoDeRisco,
  impetoDe,
  montarTeste,
  pdAtual,
  perfilDe,
  pvAtual,
  validarFicha,
} from '../regras/ficha';
import { CAMPOS_APTIDAO, PERICIAS_SIMPLES, aptidao, pericia } from '../regras/pericias';
import {
  COMPOSICOES_DE_MESA,
  PRESETS_SOBREVIVENTES,
  fichaDoPreset,
  fichasDaComposicao,
} from '../presets/sobreviventes';

describe('as cinco fichas prontas do playtest', () => {
  it('os cinco sobreviventes estao cadastrados', () => {
    expect(PRESETS_SOBREVIVENTES.map((preset) => preset.id).sort()).toEqual([
      'alan',
      'edgar',
      'eloisa',
      'kenia',
      'victor',
    ]);
  });

  it('toda ficha pronta passa na validacao, sem nenhum problema', () => {
    for (const preset of PRESETS_SOBREVIVENTES) {
      expect(validarFicha(fichaDoPreset(preset.id))).toEqual([]);
    }
  });

  it('todos os sobreviventes sao de nivel 2 (p.28)', () => {
    for (const preset of PRESETS_SOBREVIVENTES) {
      expect(fichaDoPreset(preset.id).nivel).toBe(2);
    }
  });

  it('toda pericia nao listada no cartao fica em d4, o grau Destreinado (p.16)', () => {
    const alan = fichaDoPreset('alan');
    expect(dadoDaPericia(alan, pericia('Luta'))).toBe(DADO_DESTREINADO);
    expect(dadoDaPericia(alan, pericia('Pontaria'))).toBe(DADO_DESTREINADO);
    expect(dadoDaPericia(alan, aptidao('Exatas'))).toBe(DADO_DESTREINADO);
  });

  it('toda ficha traz as 19 pericias simples e os 6 campos de Aptidao, sem buracos', () => {
    for (const preset of PRESETS_SOBREVIVENTES) {
      const ficha = fichaDoPreset(preset.id);
      expect(Object.keys(ficha.pericias).sort()).toEqual([...PERICIAS_SIMPLES].sort());
      expect(Object.keys(ficha.aptidoes).sort()).toEqual([...CAMPOS_APTIDAO].sort());
    }
  });
});

describe('valores dos cartoes de personagem', () => {
  it('Alan: Executor cientista, PV 10 e PD 16, Percepcao d8', () => {
    const alan = fichaDoPreset('alan');
    expect(perfilDe(alan)).toBe('EXECUTOR');
    expect(alan.ocupacao).toBe('Cientista');
    expect([alan.pvMax, alan.pdMax]).toEqual([10, 16]);
    expect(alan.atributos).toEqual({ FISICO: 'd6', MENTE: 'd8', EMOCAO: 'd8' });
    expect(dadoDaPericia(alan, pericia('Percepção'))).toBe('d8');
    expect(dadoDaPericia(alan, aptidao('Humanas'))).toBe('d6');
  });

  it('Victor: Vigilante professor, PV 14 e PD 14, Pesquisar d8', () => {
    const victor = fichaDoPreset('victor');
    expect(perfilDe(victor)).toBe('VIGILANTE');
    expect(victor.ocupacao).toBe('Professor');
    expect([victor.pvMax, victor.pdMax]).toEqual([14, 14]);
    expect(victor.atributos).toEqual({ FISICO: 'd8', MENTE: 'd6', EMOCAO: 'd8' });
    expect(dadoDaPericia(victor, pericia('Pesquisar'))).toBe('d8');
  });

  it('Eloisa: Analista artista, PV 12 e PD 14, Intuicao d8', () => {
    const eloisa = fichaDoPreset('eloisa');
    expect(perfilDe(eloisa)).toBe('ANALISTA');
    expect(eloisa.ocupacao).toBe('Artista');
    expect([eloisa.pvMax, eloisa.pdMax]).toEqual([12, 14]);
    expect(eloisa.atributos).toEqual({ FISICO: 'd8', MENTE: 'd8', EMOCAO: 'd6' });
    expect(dadoDaPericia(eloisa, pericia('Intuição'))).toBe('d8');
  });

  it('Edgar: Executor operario, PV 18 e PD 10, Fisico d10 e Atletismo d8', () => {
    const edgar = fichaDoPreset('edgar');
    expect(perfilDe(edgar)).toBe('EXECUTOR');
    expect(edgar.ocupacao).toBe('Operário');
    expect([edgar.pvMax, edgar.pdMax]).toEqual([18, 10]);
    expect(edgar.atributos).toEqual({ FISICO: 'd10', MENTE: 'd6', EMOCAO: 'd6' });
    expect(dadoDaPericia(edgar, pericia('Atletismo'))).toBe('d8');
  });

  it('Kenia: Analista de escritorio, PV 12 e PD 12, Mente d10 e Tecnologia d8', () => {
    const kenia = fichaDoPreset('kenia');
    expect(perfilDe(kenia)).toBe('ANALISTA');
    expect(kenia.ocupacao).toBe('Profissional de Escritório');
    expect([kenia.pvMax, kenia.pdMax]).toEqual([12, 12]);
    expect(kenia.atributos).toEqual({ FISICO: 'd6', MENTE: 'd10', EMOCAO: 'd6' });
    expect(dadoDaPericia(kenia, pericia('Tecnologia'))).toBe('d8');
    expect(dadoDaPericia(kenia, aptidao('Atualidades'))).toBe('d6');
  });

  it('Edgar tem o maior PV e Alan o maior PD da mesa', () => {
    const fichas = PRESETS_SOBREVIVENTES.map((preset) => fichaDoPreset(preset.id));
    const maiorPv = fichas.reduce((a, b) => (a.pvMax >= b.pvMax ? a : b));
    const maiorPd = fichas.reduce((a, b) => (a.pdMax >= b.pdMax ? a : b));
    expect(maiorPv.nome).toBe('Edgar');
    expect(maiorPd.nome).toBe('Alan');
  });
});

describe('recurso de perfil e exclusivo, pelo tipo', () => {
  it('so Alan e Edgar tem barra de impeto', () => {
    expect(fichaDoPreset('alan').perfil.tipo).toBe('EXECUTOR');
    expect(fichaDoPreset('edgar').perfil.tipo).toBe('EXECUTOR');
    expect(impetoDe(fichaDoPreset('alan'))).toBe(0);
    expect(impetoDe(fichaDoPreset('victor'))).toBe(0);
    expect(fichaDoPreset('victor').perfil).toEqual({ tipo: 'VIGILANTE' });
  });

  it('so Eloisa e Kenia tem dados de avaliacao', () => {
    expect(fichaDoPreset('eloisa').perfil).toEqual({ tipo: 'ANALISTA', avaliacaoDisponivel: 0 });
    expect(fichaDoPreset('kenia').perfil).toEqual({ tipo: 'ANALISTA', avaliacaoDisponivel: 0 });
    expect(avaliacaoDe(fichaDoPreset('edgar'))).toBe(0);
  });

  it('o Vigilante nao carrega contador nenhum: Prontidao gasta PD direto', () => {
    expect(Object.keys(fichaDoPreset('victor').perfil)).toEqual(['tipo']);
  });

  it('as habilidades do cartao batem com o perfil e a ocupacao', () => {
    expect(fichaDoPreset('alan').habilidades).toContain('foco.mente');
    expect(fichaDoPreset('victor').habilidades).toEqual(['prontidao', 'mentoria']);
    expect(fichaDoPreset('eloisa').habilidades).toContain('foco.emocao');
    expect(fichaDoPreset('edgar').habilidades).toContain('esforcoESuor');
    expect(fichaDoPreset('kenia').habilidades).toContain('conhecimentoTecnico');
  });
});

describe('PV e PD sao derivados do dano, nao guardados como valor atual', () => {
  it('uma ficha nova esta com os recursos cheios', () => {
    const alan = fichaDoPreset('alan');
    expect(pvAtual(alan)).toBe(10);
    expect(pdAtual(alan)).toBe(16);
  });

  it('o dano desce o valor atual sem mexer no maximo', () => {
    const alan = fichaDoPreset('alan');
    const ferido = { ...alan, sessao: { ...alan.sessao, pvDano: 4 } };
    expect(pvAtual(ferido)).toBe(6);
    expect(ferido.pvMax).toBe(10);
  });

  it('dano acima do maximo nao produz PV negativo', () => {
    const alan = fichaDoPreset('alan');
    const arrasado = { ...alan, sessao: { ...alan.sessao, pvDano: 999 } };
    expect(pvAtual(arrasado)).toBe(0);
  });

  it('chegar a 0 PV exige teste de ferimento; chegar a 0 PD exige teste de trauma', () => {
    const alan = fichaDoPreset('alan');
    const morrendo = { ...alan, sessao: { ...alan.sessao, pvDano: 10, pdGasto: 16 } };
    const risco = estadoDeRisco(morrendo);
    expect(risco.precisaFerimento).toBe(true);
    expect(risco.precisaTrauma).toBe(true);
    expect(risco.dtFerimento).toBe(7);
  });

  it('a DT do teste de risco sobe conforme os testes ja feitos', () => {
    const alan = fichaDoPreset('alan');
    const segundoTeste = {
      ...alan,
      sessao: { ...alan.sessao, pvDano: 10, testesDeFerimentoFeitos: 1 },
    };
    expect(estadoDeRisco(segundoTeste).dtFerimento).toBe(10);
  });
});

describe('montar um teste a partir da ficha', () => {
  it('o teste combina o dado do atributo-base com o dado da pericia', () => {
    const alan = fichaDoPreset('alan');
    const entrada = montarTeste(alan, pericia('Percepção'));
    expect(entrada.atributo).toBe('d8');
    expect(entrada.pericia).toBe('d8');
  });

  it('uma pericia de Emocao puxa o dado de Emocao, nao o de Mente', () => {
    const alan = fichaDoPreset('alan');
    const entrada = montarTeste(alan, pericia('Enganação'));
    expect(entrada.atributo).toBe(alan.atributos.EMOCAO);
    expect(entrada.pericia).toBe('d6');
  });

  it('Aptidao puxa o dado do campo escolhido e o atributo Mente', () => {
    const alan = fichaDoPreset('alan');
    expect(montarTeste(alan, aptidao('Humanas')).pericia).toBe('d6');
    expect(montarTeste(alan, aptidao('Exatas')).pericia).toBe('d4');
    expect(montarTeste(alan, aptidao('Humanas')).atributo).toBe(alan.atributos.MENTE);
  });

  it('um passo de cena ativo entra no teste sem ser pedido de novo', () => {
    const alan = fichaDoPreset('alan');
    const comImpeto = {
      ...alan,
      sessao: {
        ...alan.sessao,
        passosDeCena: [{ alvo: 'MENTE' as const, delta: 1, motivo: 'Ímpeto — superação' }],
      },
    };
    const entrada = montarTeste(comImpeto, pericia('Percepção'));
    expect(entrada.passos).toEqual([
      { alvo: 'atributo', quantidade: 1, motivo: 'Efeito de cena' },
    ]);
  });

  it('o passo de cena de um atributo NAO vaza para o teste de outro atributo', () => {
    const alan = fichaDoPreset('alan');
    const comImpeto = {
      ...alan,
      sessao: {
        ...alan.sessao,
        passosDeCena: [{ alvo: 'FISICO' as const, delta: 1, motivo: 'Ímpeto — superação' }],
      },
    };
    expect(montarTeste(comImpeto, pericia('Percepção')).passos).toEqual([]);
    expect(montarTeste(comImpeto, pericia('Vigor')).passos).toHaveLength(1);
  });
});

describe('composicoes de mesa da missao (p.29)', () => {
  it('com 5 jogadores a mesa tem os cinco sobreviventes', () => {
    expect(fichasDaComposicao(5).map((ficha) => ficha.nome)).toEqual([
      'Alan',
      'Victor',
      'Eloísa',
      'Edgar',
      'Kênia',
    ]);
  });

  it('com 4 jogadores a Kenia sai da historia', () => {
    expect(COMPOSICOES_DE_MESA[4]).not.toContain('kenia');
    expect(fichasDaComposicao(4)).toHaveLength(4);
  });

  it('com 3 jogadores saem Kenia e Edgar', () => {
    expect(fichasDaComposicao(3).map((ficha) => ficha.nome)).toEqual(['Alan', 'Victor', 'Eloísa']);
  });

  it('Alan, Victor e Eloisa estao em todas as composicoes: a missao depende deles', () => {
    for (const jogadores of [3, 4, 5] as const) {
      expect(COMPOSICOES_DE_MESA[jogadores]).toEqual(
        expect.arrayContaining(['alan', 'victor', 'eloisa']),
      );
    }
  });
});
