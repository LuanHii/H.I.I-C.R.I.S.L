import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { aplicarPassos, descerPasso, facesDe, subirPasso } from '../regras/dados';
import {
  MAXIMO_DADOS_ROLADOS,
  MAXIMO_DADOS_SOMADOS,
  rolarTeste,
  type EntradaTeste,
} from '../regras/rolagem';
import { ESCALA_PASSOS, type DiceStep } from '../regras/tipos';

const passoArb = fc.constantFrom<DiceStep>(...ESCALA_PASSOS);
const rngArb = fc.array(fc.double({ min: 0, max: 0.9999, noNaN: true }), { minLength: 1, maxLength: 24 });

function rngDe(valores: number[]): () => number {
  let indice = 0;
  return () => {
    const valor = valores[indice % valores.length];
    indice += 1;
    return valor;
  };
}

const entradaArb: fc.Arbitrary<Omit<EntradaTeste, 'rng'>> = fc.record({
  atributo: passoArb,
  pericia: passoArb,
  extras: fc.array(fc.record({ dado: passoArb, motivo: fc.constant('extra') }), { maxLength: 5 }),
  dt: fc.integer({ min: 0, max: 30 }),
});

describe('invariantes da rolagem (p.19, p.20)', () => {
  it('nunca rola mais de quatro dados, quaisquer que sejam os extras', () => {
    fc.assert(
      fc.property(entradaArb, rngArb, (entrada, valores) => {
        const resultado = rolarTeste({ ...entrada, rng: rngDe(valores) });
        return resultado.dados.length <= MAXIMO_DADOS_ROLADOS;
      }),
    );
  });

  it('nunca soma mais de tres dados', () => {
    fc.assert(
      fc.property(entradaArb, rngArb, (entrada, valores) => {
        const resultado = rolarTeste({ ...entrada, rng: rngDe(valores) });
        return resultado.somados.length <= MAXIMO_DADOS_SOMADOS;
      }),
    );
  });

  it('somados e descartados particionam os dados rolados, sem perder nem duplicar', () => {
    fc.assert(
      fc.property(entradaArb, rngArb, (entrada, valores) => {
        const resultado = rolarTeste({ ...entrada, rng: rngDe(valores) });
        return resultado.somados.length + resultado.descartados.length === resultado.dados.length;
      }),
    );
  });

  it('a soma e exatamente a dos dados marcados como somados', () => {
    fc.assert(
      fc.property(entradaArb, rngArb, (entrada, valores) => {
        const resultado = rolarTeste({ ...entrada, rng: rngDe(valores) });
        const esperado = resultado.somados.reduce((total, dado) => total + dado.valor, 0);
        return resultado.soma === esperado;
      }),
    );
  });

  it('nenhum descartado supera o menor dos somados', () => {
    fc.assert(
      fc.property(entradaArb, rngArb, (entrada, valores) => {
        const resultado = rolarTeste({ ...entrada, rng: rngDe(valores) });
        if (resultado.descartados.length === 0) return true;
        const menorSomado = Math.min(...resultado.somados.map((dado) => dado.valor));
        return resultado.descartados.every((dado) => dado.valor <= menorSomado);
      }),
    );
  });

  it('a rolagem alta nunca e menor que a rolagem baixa', () => {
    fc.assert(
      fc.property(entradaArb, rngArb, (entrada, valores) => {
        const resultado = rolarTeste({ ...entrada, rng: rngDe(valores) });
        return resultado.ra >= resultado.rb;
      }),
    );
  });

  it('todo dado cai entre 1 e o numero de faces que tem', () => {
    fc.assert(
      fc.property(entradaArb, rngArb, (entrada, valores) => {
        const resultado = rolarTeste({ ...entrada, rng: rngDe(valores) });
        return resultado.dados.every((dado) => dado.valor >= 1 && dado.valor <= dado.faces);
      }),
    );
  });

  it('sucesso critico implica sucesso, seja qual for a DT', () => {
    fc.assert(
      fc.property(entradaArb, rngArb, (entrada, valores) => {
        const resultado = rolarTeste({ ...entrada, rng: rngDe(valores) });
        return resultado.critico !== 'sucesso' || resultado.sucesso;
      }),
    );
  });

  it('falha critica implica fracasso, seja qual for a DT', () => {
    fc.assert(
      fc.property(entradaArb, rngArb, (entrada, valores) => {
        const resultado = rolarTeste({ ...entrada, rng: rngDe(valores) });
        return resultado.critico !== 'falha' || !resultado.sucesso;
      }),
    );
  });

  it('o impeto enche exatamente quando o teste falha', () => {
    fc.assert(
      fc.property(entradaArb, rngArb, (entrada, valores) => {
        const resultado = rolarTeste({ ...entrada, rng: rngDe(valores) });
        return resultado.contaComoFalhaParaImpeto === !resultado.sucesso;
      }),
    );
  });

  it('o mesmo rng produz o mesmo resultado: a rolagem e deterministica', () => {
    fc.assert(
      fc.property(entradaArb, rngArb, (entrada, valores) => {
        const primeira = rolarTeste({ ...entrada, rng: rngDe(valores) });
        const segunda = rolarTeste({ ...entrada, rng: rngDe(valores) });
        return JSON.stringify(primeira) === JSON.stringify(segunda);
      }),
    );
  });

  it('os extras ignorados sao exatamente os que passaram do teto de quatro dados', () => {
    fc.assert(
      fc.property(entradaArb, rngArb, (entrada, valores) => {
        const resultado = rolarTeste({ ...entrada, rng: rngDe(valores) });
        const total = (entrada.extras ?? []).length;
        const usados = resultado.dados.filter((dado) => dado.origem === 'extra').length;
        return resultado.extrasIgnorados.length === total - usados;
      }),
    );
  });
});

describe('invariantes da escala de passos (p.20)', () => {
  it('subir nunca produz um dado menor e descer nunca produz um maior', () => {
    fc.assert(
      fc.property(passoArb, (passo) => {
        return (
          facesDe(subirPasso(passo)) >= facesDe(passo) &&
          facesDe(descerPasso(passo)) <= facesDe(passo)
        );
      }),
    );
  });

  it('o resultado fica sempre entre d4 e d12 quando d20 nao e permitido', () => {
    fc.assert(
      fc.property(passoArb, fc.integer({ min: -20, max: 20 }), (passo, quantidade) => {
        const faces = facesDe(aplicarPassos(passo, quantidade));
        return faces >= 4 && faces <= 12;
      }),
    );
  });

  it('aplicar n passos e o mesmo que aplicar um passo n vezes', () => {
    fc.assert(
      fc.property(passoArb, fc.integer({ min: 0, max: 6 }), (passo, quantidade) => {
        let umPorVez: DiceStep = passo;
        for (let i = 0; i < quantidade; i += 1) umPorVez = subirPasso(umPorVez);
        return aplicarPassos(passo, quantidade) === umPorVez;
      }),
    );
  });
});
