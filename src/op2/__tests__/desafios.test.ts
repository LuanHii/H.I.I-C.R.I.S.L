import { describe, expect, it } from 'vitest';
import {
  ACOES_PARA_ALCANCAR_SEGURO,
  PONTOS_POR_CHANCE_EXTRA,
  PV_POR_TENTATIVA_DE_ARROMBAR,
  SEGUNDOS_PARA_RESPONDER_HACK_TECNICO,
  chancesExtras,
  compararComSenha,
  criarDesafioAlcancar,
  criarDesafioArrombar,
  criarDesafioDestrancar,
  criarDesafioHackSocial,
  criarDesafioSustentar,
  dadoCansadoDeSustentar,
  descreverDesafio,
  equacaoParaResultado,
  responderPergunta,
  sustentarMaisUmaRodada,
  tentarAlcancar,
  tentarArrombar,
  tentarSenha,
  tentativasPorRodada,
} from '../regras/desafios';
import type { ResultadoTeste } from '../regras/rolagem';

function rolagem(parcial: Partial<ResultadoTeste>): ResultadoTeste {
  return {
    dados: [],
    somados: [],
    descartados: [],
    soma: 0,
    dt: 7,
    sucesso: false,
    ra: 0,
    rb: 0,
    critico: null,
    contaComoFalhaParaImpeto: true,
    dadosDoTeste: { atributo: 'd6', pericia: 'd6' },
    extrasIgnorados: [],
    ...parcial,
  };
}

describe('Destrancar — o retorno segue o exemplo do livro (p.24)', () => {
  it('senha 3-5-2 com palpite 4-5-1 responde baixo, exato, alto', () => {
    expect(compararComSenha([3, 5, 2], [4, 5, 1])).toEqual(['baixo', 'exato', 'alto']);
  });

  it('"baixo" significa que a SENHA e menor que o palpite, nao o contrario', () => {
    expect(compararComSenha([2], [5])).toEqual(['baixo']);
    expect(compararComSenha([5], [2])).toEqual(['alto']);
  });

  it('acertar todos os digitos abre a fechadura', () => {
    const fechadura = criarDesafioDestrancar({
      quantidade: 3,
      faces: 6,
      tentativasMax: 3,
      senha: [3, 5, 2],
    });
    expect(tentarSenha(fechadura, [3, 5, 2]).aberta).toBe(true);
  });

  it('cada tentativa entra no historico com o retorno, para o jogador deduzir', () => {
    let fechadura = criarDesafioDestrancar({
      quantidade: 3,
      faces: 6,
      tentativasMax: 5,
      senha: [3, 5, 2],
    });
    fechadura = tentarSenha(fechadura, [4, 5, 1]);
    fechadura = tentarSenha(fechadura, [3, 5, 1]);
    expect(fechadura.historico).toHaveLength(2);
    expect(fechadura.historico[0].retorno).toEqual(['baixo', 'exato', 'alto']);
    expect(fechadura.historico[1].retorno).toEqual(['exato', 'exato', 'alto']);
  });

  it('exceder o maximo de tentativas DANIFICA a fechadura: so resta arrombar ou a chave', () => {
    let fechadura = criarDesafioDestrancar({
      quantidade: 2,
      faces: 6,
      tentativasMax: 2,
      senha: [1, 1],
    });
    fechadura = tentarSenha(fechadura, [6, 6]);
    expect(fechadura.danificada).toBe(false);
    fechadura = tentarSenha(fechadura, [5, 5]);
    expect(fechadura.danificada).toBe(true);
    expect(fechadura.aberta).toBe(false);
  });

  it('uma fechadura danificada nao aceita mais tentativas, nem a correta', () => {
    let fechadura = criarDesafioDestrancar({
      quantidade: 1,
      faces: 6,
      tentativasMax: 1,
      senha: [4],
    });
    fechadura = tentarSenha(fechadura, [1]);
    expect(fechadura.danificada).toBe(true);
    expect(tentarSenha(fechadura, [4]).aberta).toBe(false);
  });

  it('acertar na ultima tentativa abre em vez de danificar', () => {
    let fechadura = criarDesafioDestrancar({
      quantidade: 1,
      faces: 6,
      tentativasMax: 1,
      senha: [4],
    });
    fechadura = tentarSenha(fechadura, [4]);
    expect(fechadura.aberta).toBe(true);
    expect(fechadura.danificada).toBe(false);
  });

  it('palpite com numero errado de digitos e erro, nao comparacao parcial', () => {
    const fechadura = criarDesafioDestrancar({ quantidade: 3, faces: 6, tentativasMax: 3 });
    expect(() => tentarSenha(fechadura, [1, 2])).toThrow();
  });

  it('o valor de Crime define quantas tentativas cabem por rodada (p.24)', () => {
    expect(tentativasPorRodada('d4')).toBe(1);
    expect(tentativasPorRodada('d6')).toBe(2);
    expect(tentativasPorRodada('d8')).toBe(3);
    expect(tentativasPorRodada('d10')).toBe(4);
    expect(tentativasPorRodada('d12')).toBe(5);
  });

  it('a senha sorteada respeita a quantidade e as faces pedidas', () => {
    const fechadura = criarDesafioDestrancar({
      quantidade: 4,
      faces: 4,
      tentativasMax: 2,
      rng: () => 0.99,
    });
    expect(fechadura.senha).toHaveLength(4);
    expect(fechadura.senha.every((digito) => digito >= 1 && digito <= 4)).toBe(true);
  });
});

describe('Arrombar — pontuacao acumulada pela RA (p.24)', () => {
  it('passar no teste acumula pontuacao igual a RA', () => {
    const cofre = criarDesafioArrombar(7, 10);
    const depois = tentarArrombar(cofre, rolagem({ sucesso: true, ra: 6 }));
    expect(depois.pontuacaoAcumulada).toBe(6);
    expect(depois.aberto).toBe(false);
  });

  it('falhar nao acumula nada, mas gasta o PV do esforco assim mesmo', () => {
    const cofre = criarDesafioArrombar(7, 10);
    const depois = tentarArrombar(cofre, rolagem({ sucesso: false, ra: 6 }));
    expect(depois.pontuacaoAcumulada).toBe(0);
    expect(depois.pvGasto).toBe(PV_POR_TENTATIVA_DE_ARROMBAR);
  });

  it('a pontuacao acumula entre rodadas ate atingir o alvo', () => {
    let cofre = criarDesafioArrombar(7, 10);
    cofre = tentarArrombar(cofre, rolagem({ sucesso: true, ra: 6 }));
    cofre = tentarArrombar(cofre, rolagem({ sucesso: true, ra: 5 }));
    expect(cofre.pontuacaoAcumulada).toBe(11);
    expect(cofre.aberto).toBe(true);
    expect(cofre.pvGasto).toBe(2);
  });

  it('cada tentativa custa 1 PV, tenha passado ou nao', () => {
    let cofre = criarDesafioArrombar(7, 99);
    cofre = tentarArrombar(cofre, rolagem({ sucesso: true, ra: 1 }));
    cofre = tentarArrombar(cofre, rolagem({ sucesso: false }));
    cofre = tentarArrombar(cofre, rolagem({ sucesso: true, ra: 1 }));
    expect(cofre.pvGasto).toBe(3);
    expect(cofre.tentativas).toBe(3);
  });
});

describe('Hack tecnico — o resultado escolhe a equacao (p.25, p.39)', () => {
  const tabela = [
    { resultadoMinimo: 10, enunciado: '16 x 5', resposta: 80 },
    { resultadoMinimo: 7, enunciado: '192 ÷ 8', resposta: 24 },
    { resultadoMinimo: 5, enunciado: '13²', resposta: 169 },
    { resultadoMinimo: 1, enunciado: '√2209', resposta: 47 },
  ];

  it('quanto MAIOR o resultado, mais facil o problema', () => {
    expect(equacaoParaResultado(tabela, 12)?.resposta).toBe(80);
    expect(equacaoParaResultado(tabela, 8)?.resposta).toBe(24);
    expect(equacaoParaResultado(tabela, 5)?.resposta).toBe(169);
    expect(equacaoParaResultado(tabela, 2)?.resposta).toBe(47);
  });

  it('o limite de cada faixa e inclusivo', () => {
    expect(equacaoParaResultado(tabela, 10)?.resposta).toBe(80);
    expect(equacaoParaResultado(tabela, 7)?.resposta).toBe(24);
  });

  it('o tempo para responder e de 10 segundos', () => {
    expect(SEGUNDOS_PARA_RESPONDER_HACK_TECNICO).toBe(10);
  });
});

describe('Hack social — chances extras por margem (p.25)', () => {
  it('cada 3 pontos acima da DT dao uma chance a mais de errar', () => {
    expect(chancesExtras(7, 7)).toBe(0);
    expect(chancesExtras(9, 7)).toBe(0);
    expect(chancesExtras(10, 7)).toBe(1);
    expect(chancesExtras(13, 7)).toBe(2);
    expect(PONTOS_POR_CHANCE_EXTRA).toBe(3);
  });

  it('resultado abaixo da DT nao produz chance negativa', () => {
    expect(chancesExtras(3, 7)).toBe(0);
  });

  it('sem chance extra, o primeiro erro bloqueia', () => {
    let hack = criarDesafioHackSocial(4, 7, 7);
    hack = responderPergunta(hack, false);
    expect(hack.bloqueado).toBe(true);
  });

  it('com uma chance extra, o primeiro erro nao bloqueia e o segundo sim', () => {
    let hack = criarDesafioHackSocial(4, 10, 7);
    hack = responderPergunta(hack, false);
    expect(hack.bloqueado).toBe(false);
    hack = responderPergunta(hack, false);
    expect(hack.bloqueado).toBe(true);
  });

  it('acertar o numero exigido de respostas conclui o hack', () => {
    let hack = criarDesafioHackSocial(4, 7, 7);
    for (let i = 0; i < 4; i += 1) hack = responderPergunta(hack, true);
    expect(hack.concluido).toBe(true);
    expect(hack.acertos).toBe(4);
  });

  it('um hack ja concluido nao muda com novas respostas', () => {
    let hack = criarDesafioHackSocial(1, 7, 7);
    hack = responderPergunta(hack, true);
    expect(responderPergunta(hack, false)).toEqual(hack);
  });
});

describe('Alcancar — seguro exige duas acoes, arriscado uma (p.25)', () => {
  it('o modo seguro so alcanca depois de duas acoes bem-sucedidas', () => {
    let alcance = criarDesafioAlcancar(7, 'seguro');
    alcance = tentarAlcancar(alcance, rolagem({ sucesso: true }));
    expect(alcance.alcancado).toBe(false);
    alcance = tentarAlcancar(alcance, rolagem({ sucesso: true }));
    expect(alcance.alcancado).toBe(true);
    expect(ACOES_PARA_ALCANCAR_SEGURO).toBe(2);
  });

  it('falhar no modo seguro causa dano igual a RB e obriga a comecar de novo', () => {
    let alcance = criarDesafioAlcancar(7, 'seguro');
    alcance = tentarAlcancar(alcance, rolagem({ sucesso: true }));
    alcance = tentarAlcancar(alcance, rolagem({ sucesso: false, ra: 9, rb: 2 }));
    expect(alcance.danoSofrido).toBe(2);
    expect(alcance.acoesConcluidas).toBe(0);
  });

  it('o modo arriscado alcanca numa acao so', () => {
    const alcance = tentarAlcancar(criarDesafioAlcancar(7, 'arriscado'), rolagem({ sucesso: true }));
    expect(alcance.alcancado).toBe(true);
  });

  it('falhar no modo arriscado causa dano igual a RA, que doi mais que a RB', () => {
    const alcance = tentarAlcancar(
      criarDesafioAlcancar(7, 'arriscado'),
      rolagem({ sucesso: false, ra: 9, rb: 2 }),
    );
    expect(alcance.danoSofrido).toBe(9);
  });
});

describe('Sustentar — cansaco desce um passo por rodada (p.25)', () => {
  it('comecar a sustentar custa 1 PV', () => {
    expect(criarDesafioSustentar(7).pvGasto).toBe(1);
  });

  it('cada rodada sustentando desce um passo do dado', () => {
    expect(dadoCansadoDeSustentar('d12', 0)).toBe('d12');
    expect(dadoCansadoDeSustentar('d12', 1)).toBe('d10');
    expect(dadoCansadoDeSustentar('d12', 3)).toBe('d6');
  });

  it('o cansaco nao desce abaixo de d4, por mais rodadas que passem', () => {
    expect(dadoCansadoDeSustentar('d8', 99)).toBe('d4');
  });

  it('falhar no teste derruba o objeto', () => {
    let sustento = criarDesafioSustentar(7);
    sustento = sustentarMaisUmaRodada(sustento, rolagem({ sucesso: true }));
    expect(sustento.sustentando).toBe(true);
    sustento = sustentarMaisUmaRodada(sustento, rolagem({ sucesso: false }));
    expect(sustento.sustentando).toBe(false);
  });
});

describe('descricao dos desafios para a UI', () => {
  it('todo tipo de desafio tem descricao, senao o painel mostra o identificador cru', () => {
    const desafios = [
      { tipo: 'destrancar' as const, quantidade: 3, faces: 6, tentativasMax: 3 },
      { tipo: 'arrombar' as const, dt: 7, pontuacaoAlvo: 10 },
      { tipo: 'hackTecnico' as const, tabela: [] },
      { tipo: 'hackSocial' as const, respostasNecessarias: 4, dt: 7 },
      { tipo: 'alcancar' as const, dt: 7 },
      { tipo: 'sustentar' as const, dt: 7 },
      { tipo: 'item' as const, chave: 'molho de chaves 1' },
    ];
    for (const desafio of desafios) {
      const descricao = descreverDesafio(desafio);
      expect(descricao).toBeTruthy();
      expect(descricao).not.toContain('undefined');
    }
  });
});
