import { describe, expect, it } from 'vitest';
import {
  DT_PADRAO,
  aplicarMentoria,
  classificarCritico,
  resolverTesteOposto,
  rolarTeste,
  type EntradaTeste,
} from '../regras/rolagem';

function rngDeSequencia(valores: number[]): () => number {
  let indice = 0;
  return () => {
    const valor = valores[indice % valores.length];
    indice += 1;
    return valor;
  };
}

function rngQueEntrega(faces: number[], resultados: number[]): () => number {
  let indice = 0;
  return () => {
    const alvo = resultados[indice];
    const totalFaces = faces[indice];
    indice += 1;
    return (alvo - 1) / totalFaces;
  };
}

function teste(parcial: Partial<EntradaTeste> & Pick<EntradaTeste, 'rng'>): EntradaTeste {
  return { atributo: 'd6', pericia: 'd6', ...parcial };
}

describe('composicao do teste (p.18)', () => {
  it('rola um dado de atributo e um de pericia e soma os dois', () => {
    const resultado = rolarTeste(
      teste({ atributo: 'd8', pericia: 'd6', rng: rngQueEntrega([8, 6], [5, 4]) }),
    );
    expect(resultado.dados.map((dado) => dado.valor)).toEqual([5, 4]);
    expect(resultado.soma).toBe(9);
  });

  it('a DT padrao do playtest e 7 quando o texto nao especifica outra', () => {
    const resultado = rolarTeste(teste({ rng: rngQueEntrega([6, 6], [4, 3]) }));
    expect(resultado.dt).toBe(DT_PADRAO);
    expect(DT_PADRAO).toBe(7);
    expect(resultado.sucesso).toBe(true);
  });

  it('soma igual a DT passa no teste; um ponto abaixo falha', () => {
    const passou = rolarTeste(teste({ dt: 7, rng: rngQueEntrega([6, 6], [4, 3]) }));
    const falhou = rolarTeste(teste({ dt: 7, rng: rngQueEntrega([6, 6], [4, 2]) }));
    expect(passou.sucesso).toBe(true);
    expect(falhou.sucesso).toBe(false);
  });

  it('os passos sobem o dado ANTES de rolar, nao somam ao resultado', () => {
    const resultado = rolarTeste(
      teste({
        atributo: 'd6',
        pericia: 'd6',
        passos: [{ alvo: 'atributo', quantidade: 1, motivo: 'Foco Mental' }],
        rng: rngQueEntrega([8, 6], [8, 1]),
      }),
    );
    expect(resultado.dadosDoTeste.atributo).toBe('d8');
    expect(resultado.dados[0].faces).toBe(8);
  });
});

describe('A3 — alvo do passo e escolha de quem rola (p.19, decisao de mesa)', () => {
  it('passo declarado no atributo sobe o dado de atributo e deixa a pericia intacta', () => {
    const resultado = rolarTeste(
      teste({
        atributo: 'd6',
        pericia: 'd8',
        passos: [{ alvo: 'atributo', quantidade: 1, motivo: 'Impeto' }],
        rng: rngDeSequencia([0.5]),
      }),
    );
    expect(resultado.dadosDoTeste).toEqual({ atributo: 'd8', pericia: 'd8' });
  });

  it('passo declarado na pericia sobe o dado de pericia e deixa o atributo intacto', () => {
    const resultado = rolarTeste(
      teste({
        atributo: 'd6',
        pericia: 'd8',
        passos: [{ alvo: 'pericia', quantidade: 1, motivo: 'Ajuda' }],
        rng: rngDeSequencia([0.5]),
      }),
    );
    expect(resultado.dadosDoTeste).toEqual({ atributo: 'd6', pericia: 'd10' });
  });

  it('dois passos no mesmo alvo acumulam; alvos diferentes nao se misturam', () => {
    const resultado = rolarTeste(
      teste({
        atributo: 'd4',
        pericia: 'd4',
        passos: [
          { alvo: 'atributo', quantidade: 1, motivo: 'Impeto' },
          { alvo: 'atributo', quantidade: 1, motivo: 'Foco Mental' },
          { alvo: 'pericia', quantidade: 1, motivo: 'Ajuda' },
        ],
        rng: rngDeSequencia([0.5]),
      }),
    );
    expect(resultado.dadosDoTeste).toEqual({ atributo: 'd8', pericia: 'd6' });
  });

  it('o passo respeita o teto d12 mesmo quando varios efeitos se somam', () => {
    const resultado = rolarTeste(
      teste({
        atributo: 'd10',
        pericia: 'd6',
        passos: [{ alvo: 'atributo', quantidade: 5, motivo: 'muitos efeitos' }],
        rng: rngDeSequencia([0.5]),
      }),
    );
    expect(resultado.dadosDoTeste.atributo).toBe('d12');
  });
});

describe('teto de dados (p.20)', () => {
  it('rola no maximo quatro dados por teste, mesmo com mais extras oferecidos', () => {
    const resultado = rolarTeste(
      teste({
        extras: [
          { dado: 'd4', motivo: 'Avaliacao 1' },
          { dado: 'd4', motivo: 'Avaliacao 2' },
          { dado: 'd4', motivo: 'terceiro extra' },
        ],
        rng: rngDeSequencia([0.5]),
      }),
    );
    expect(resultado.dados).toHaveLength(4);
  });

  it('os extras que nao couberam sao devolvidos, nao descartados em silencio', () => {
    const resultado = rolarTeste(
      teste({
        extras: [
          { dado: 'd4', motivo: 'Avaliacao 1' },
          { dado: 'd4', motivo: 'Avaliacao 2' },
          { dado: 'd4', motivo: 'terceiro extra' },
        ],
        rng: rngDeSequencia([0.5]),
      }),
    );
    expect(resultado.extrasIgnorados).toEqual([{ dado: 'd4', motivo: 'terceiro extra' }]);
  });

  it('soma no maximo tres dados, escolhendo os tres MAIORES', () => {
    const resultado = rolarTeste(
      teste({
        atributo: 'd12',
        pericia: 'd12',
        extras: [
          { dado: 'd12', motivo: 'extra A' },
          { dado: 'd12', motivo: 'extra B' },
        ],
        rng: rngQueEntrega([12, 12, 12, 12], [2, 9, 5, 7]),
      }),
    );
    expect(resultado.somados.map((dado) => dado.valor).sort((a, b) => a - b)).toEqual([5, 7, 9]);
    expect(resultado.descartados.map((dado) => dado.valor)).toEqual([2]);
    expect(resultado.soma).toBe(21);
  });

  it('a soma ignora os dados descartados', () => {
    const resultado = rolarTeste(
      teste({
        atributo: 'd12',
        pericia: 'd12',
        extras: [
          { dado: 'd12', motivo: 'extra A' },
          { dado: 'd12', motivo: 'extra B' },
        ],
        rng: rngQueEntrega([12, 12, 12, 12], [12, 12, 12, 12]),
      }),
    );
    expect(resultado.soma).toBe(36);
    expect(resultado.dados).toHaveLength(4);
  });

  it('com dois dados nao ha descarte', () => {
    const resultado = rolarTeste(teste({ rng: rngQueEntrega([6, 6], [1, 2]) }));
    expect(resultado.descartados).toHaveLength(0);
    expect(resultado.soma).toBe(3);
  });
});

describe('A1 — rolagem alta e baixa cobrem TODOS os dados rolados (p.19)', () => {
  it('a RA e o maior VALOR entregue, nao o valor do maior dado', () => {
    const resultado = rolarTeste(
      teste({ atributo: 'd6', pericia: 'd8', rng: rngQueEntrega([6, 8], [6, 3]) }),
    );
    expect(resultado.ra).toBe(6);
    expect(resultado.rb).toBe(3);
  });

  it('um dado descartado da soma continua contando para a RB', () => {
    const resultado = rolarTeste(
      teste({
        atributo: 'd12',
        pericia: 'd12',
        extras: [
          { dado: 'd12', motivo: 'extra A' },
          { dado: 'd12', motivo: 'extra B' },
        ],
        rng: rngQueEntrega([12, 12, 12, 12], [10, 9, 8, 1]),
      }),
    );
    expect(resultado.descartados.map((dado) => dado.valor)).toEqual([1]);
    expect(resultado.rb).toBe(1);
    expect(resultado.ra).toBe(10);
  });

  it('a RA nunca distingue as duas leituras: o descartado e sempre o MENOR, logo nunca e o maximo', () => {
    const resultado = rolarTeste(
      teste({
        atributo: 'd12',
        pericia: 'd12',
        extras: [
          { dado: 'd12', motivo: 'extra A' },
          { dado: 'd12', motivo: 'extra B' },
        ],
        rng: rngQueEntrega([12, 12, 12, 12], [10, 9, 8, 1]),
      }),
    );
    expect(resultado.ra).toBe(Math.max(...resultado.somados.map((dado) => dado.valor)));
    expect(resultado.ra).toBe(Math.max(...resultado.dados.map((dado) => dado.valor)));
  });

  it('a RB e o unico ponto onde as duas leituras divergem, e vale a poca inteira', () => {
    const resultado = rolarTeste(
      teste({
        atributo: 'd12',
        pericia: 'd12',
        extras: [
          { dado: 'd12', motivo: 'extra A' },
          { dado: 'd12', motivo: 'extra B' },
        ],
        rng: rngQueEntrega([12, 12, 12, 12], [10, 9, 8, 2]),
      }),
    );
    const menorSomado = Math.min(...resultado.somados.map((dado) => dado.valor));
    expect(menorSomado).toBe(8);
    expect(resultado.rb).toBe(2);
  });
});

describe('A2 — criticos avaliam a poca inteira de dados rolados (p.19)', () => {
  it('dois dados com o mesmo valor >= 6 sao sucesso critico', () => {
    const resultado = rolarTeste(
      teste({ atributo: 'd8', pericia: 'd8', dt: 99, rng: rngQueEntrega([8, 8], [6, 6]) }),
    );
    expect(resultado.critico).toBe('sucesso');
  });

  it('o sucesso critico passa no teste independentemente da DT', () => {
    const resultado = rolarTeste(
      teste({ atributo: 'd8', pericia: 'd8', dt: 999, rng: rngQueEntrega([8, 8], [7, 7]) }),
    );
    expect(resultado.sucesso).toBe(true);
    expect(resultado.soma).toBeLessThan(resultado.dt);
  });

  it('dois dados iguais abaixo de 6 NAO sao critico', () => {
    const resultado = rolarTeste(
      teste({ atributo: 'd8', pericia: 'd8', rng: rngQueEntrega([8, 8], [5, 5]) }),
    );
    expect(resultado.critico).toBeNull();
  });

  it('o par critico vale mesmo quando o descarte SEPARA os dois dados iguais', () => {
    const resultado = rolarTeste(
      teste({
        atributo: 'd12',
        pericia: 'd12',
        dt: 99,
        extras: [
          { dado: 'd12', motivo: 'extra A' },
          { dado: 'd12', motivo: 'extra B' },
        ],
        rng: rngQueEntrega([12, 12, 12, 12], [9, 8, 6, 6]),
      }),
    );
    expect(resultado.somados.map((dado) => dado.valor)).toEqual([9, 8, 6]);
    expect(resultado.descartados.map((dado) => dado.valor)).toEqual([6]);
    expect(resultado.critico).toBe('sucesso');
    expect(resultado.sucesso).toBe(true);
  });

  it('a falha critica nao distingue as duas leituras: todos rolados iguais a 1 implica todos somados iguais a 1', () => {
    const resultado = rolarTeste(
      teste({
        atributo: 'd4',
        pericia: 'd4',
        extras: [
          { dado: 'd4', motivo: 'extra A' },
          { dado: 'd4', motivo: 'extra B' },
        ],
        rng: rngQueEntrega([4, 4, 4, 4], [1, 1, 1, 1]),
      }),
    );
    expect(resultado.critico).toBe('falha');
    expect(resultado.somados.every((dado) => dado.valor === 1)).toBe(true);
  });

  it('[6, 6, 2, 1] e sucesso critico mesmo com o 1 fora da soma', () => {
    const resultado = rolarTeste(
      teste({
        atributo: 'd8',
        pericia: 'd8',
        dt: 99,
        extras: [
          { dado: 'd8', motivo: 'extra A' },
          { dado: 'd8', motivo: 'extra B' },
        ],
        rng: rngQueEntrega([8, 8, 8, 8], [6, 6, 2, 1]),
      }),
    );
    expect(resultado.descartados.map((dado) => dado.valor)).toEqual([1]);
    expect(resultado.critico).toBe('sucesso');
    expect(resultado.sucesso).toBe(true);
  });

  it('[1, 1, 1] e falha critica', () => {
    const resultado = rolarTeste(
      teste({
        atributo: 'd4',
        pericia: 'd4',
        extras: [{ dado: 'd4', motivo: 'extra' }],
        rng: rngQueEntrega([4, 4, 4], [1, 1, 1]),
      }),
    );
    expect(resultado.critico).toBe('falha');
  });

  it('[1, 1, 2] NAO e falha critica, porque nem todos os dados sao 1', () => {
    const resultado = rolarTeste(
      teste({
        atributo: 'd4',
        pericia: 'd4',
        extras: [{ dado: 'd4', motivo: 'extra' }],
        rng: rngQueEntrega([4, 4, 4], [1, 1, 2]),
      }),
    );
    expect(resultado.critico).toBeNull();
  });

  it('a falha critica falha o teste mesmo se a DT for 0', () => {
    const resultado = rolarTeste(
      teste({ atributo: 'd4', pericia: 'd4', dt: 0, rng: rngQueEntrega([4, 4], [1, 1]) }),
    );
    expect(resultado.critico).toBe('falha');
    expect(resultado.sucesso).toBe(false);
  });

  it('um par de 1 nao vira sucesso critico, porque o valor precisa ser >= 6', () => {
    expect(classificarCritico([1, 1])).toBe('falha');
  });
});

describe('impeto — o que conta como falha (cartao de personagem)', () => {
  it('qualquer teste falhado marca falha para o impeto', () => {
    const resultado = rolarTeste(teste({ dt: 12, rng: rngQueEntrega([6, 6], [2, 3]) }));
    expect(resultado.contaComoFalhaParaImpeto).toBe(true);
  });

  it('a falha critica tambem enche o impeto: o cartao diz "sempre que falha"', () => {
    const resultado = rolarTeste(teste({ atributo: 'd4', pericia: 'd4', rng: rngQueEntrega([4, 4], [1, 1]) }));
    expect(resultado.critico).toBe('falha');
    expect(resultado.contaComoFalhaParaImpeto).toBe(true);
  });

  it('um teste bem-sucedido nao enche o impeto', () => {
    const resultado = rolarTeste(teste({ dt: 5, rng: rngQueEntrega([6, 6], [3, 3]) }));
    expect(resultado.sucesso).toBe(true);
    expect(resultado.contaComoFalhaParaImpeto).toBe(false);
  });
});

describe('Mentoria — substitui um dado pela ROLAGEM ALTA DO PROFESSOR (cartao do Victor)', () => {
  it('substituir um dado recalcula a soma', () => {
    const original = rolarTeste(
      teste({ atributo: 'd8', pericia: 'd8', rng: rngQueEntrega([8, 8], [2, 3]) }),
    );
    const comMentoria = aplicarMentoria(original, 0, 8);
    expect(original.soma).toBe(5);
    expect(comMentoria.soma).toBe(11);
  });

  it('substituir um dado pode transformar falha em sucesso critico', () => {
    const original = rolarTeste(
      teste({ atributo: 'd8', pericia: 'd8', dt: 99, rng: rngQueEntrega([8, 8], [2, 7]) }),
    );
    expect(original.critico).toBeNull();
    expect(original.sucesso).toBe(false);

    const comMentoria = aplicarMentoria(original, 0, 7);
    expect(comMentoria.critico).toBe('sucesso');
    expect(comMentoria.sucesso).toBe(true);
  });

  it('substituir um dado recalcula a RA e a RB', () => {
    const original = rolarTeste(
      teste({ atributo: 'd8', pericia: 'd8', rng: rngQueEntrega([8, 8], [2, 3]) }),
    );
    expect(original.ra).toBe(3);
    expect(original.rb).toBe(2);

    const comMentoria = aplicarMentoria(original, 0, 8);
    expect(comMentoria.ra).toBe(8);
    expect(comMentoria.rb).toBe(3);
  });

  it('substituir um dado refaz a escolha dos tres somados', () => {
    const original = rolarTeste(
      teste({
        atributo: 'd12',
        pericia: 'd12',
        extras: [
          { dado: 'd12', motivo: 'extra A' },
          { dado: 'd12', motivo: 'extra B' },
        ],
        rng: rngQueEntrega([12, 12, 12, 12], [1, 9, 8, 7]),
      }),
    );
    expect(original.descartados.map((dado) => dado.valor)).toEqual([1]);
    expect(original.soma).toBe(24);

    const comMentoria = aplicarMentoria(original, 0, 12);
    expect(comMentoria.descartados.map((dado) => dado.valor)).toEqual([7]);
    expect(comMentoria.soma).toBe(29);
  });

  it('o dado substituido fica marcado, para a UI e para os invariantes de rolagem', () => {
    const original = rolarTeste(teste({ rng: rngQueEntrega([6, 6], [2, 3]) }));
    const comMentoria = aplicarMentoria(original, 0, 12);
    expect(comMentoria.dados[0].substituido).toBe(true);
    expect(comMentoria.dados[1].substituido).toBe(false);
  });

  it('a RA do professor NAO e limitada pelas faces do dado substituido', () => {
    const original = rolarTeste(teste({ atributo: 'd4', pericia: 'd4', rng: rngQueEntrega([4, 4], [1, 1]) }));
    const comMentoria = aplicarMentoria(original, 0, 11);
    expect(comMentoria.dados[0].valor).toBe(11);
    expect(comMentoria.dados[0].faces).toBe(4);
  });

  it('indice fora do teste e erro, nao substituicao silenciosa', () => {
    const original = rolarTeste(teste({ rng: rngDeSequencia([0.5]) }));
    expect(() => aplicarMentoria(original, 7, 6)).toThrow();
  });

  it('nao muta o resultado original', () => {
    const original = rolarTeste(teste({ rng: rngQueEntrega([6, 6], [2, 3]) }));
    aplicarMentoria(original, 0, 6);
    expect(original.dados[0].valor).toBe(2);
    expect(original.soma).toBe(5);
  });
});

describe('testes opostos (p.19)', () => {
  it('vence quem tirar o maior valor', () => {
    const resultado = resolverTesteOposto({
      ataque: { atributo: 'd8', pericia: 'd8', rng: rngQueEntrega([8, 8], [6, 5]) },
      defesa: { atributo: 'd6', pericia: 'd6', rng: rngQueEntrega([6, 6], [2, 2]) },
    });
    expect(resultado.vencedor).toBe('ataque');
  });

  it('somas iguais dao empate, sem desempate inventado', () => {
    const resultado = resolverTesteOposto({
      ataque: { atributo: 'd8', pericia: 'd8', rng: rngQueEntrega([8, 8], [4, 4]) },
      defesa: { atributo: 'd6', pericia: 'd6', rng: rngQueEntrega([6, 6], [5, 3]) },
    });
    expect(resultado.vencedor).toBe('empate');
  });
});
