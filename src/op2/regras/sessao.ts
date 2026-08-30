import { habilidadePorId, type CustoOp2 } from './habilidades';
import { pdAtual, pvAtual } from './ficha';
import {
  MAXIMO_AVALIACAO,
  MAXIMO_IMPETO,
  type AtributoOp2,
  type FichaOp2,
  type RecursoDePerfil,
} from './tipos';

function comSessao(ficha: FichaOp2, mudanca: Partial<FichaOp2['sessao']>): FichaOp2 {
  return { ...ficha, sessao: { ...ficha.sessao, ...mudanca } };
}

function comPerfil(ficha: FichaOp2, perfil: RecursoDePerfil): FichaOp2 {
  return { ...ficha, perfil };
}

function limitar(valor: number, minimo: number, maximo: number): number {
  return Math.min(Math.max(valor, minimo), maximo);
}

export function sofrerDano(ficha: FichaOp2, quantidade: number): FichaOp2 {
  const dano = Math.max(0, Math.trunc(quantidade));
  return comSessao(ficha, { pvDano: limitar(ficha.sessao.pvDano + dano, 0, ficha.pvMax) });
}

export function curar(ficha: FichaOp2, quantidade: number): FichaOp2 {
  const cura = Math.max(0, Math.trunc(quantidade));
  return comSessao(ficha, { pvDano: limitar(ficha.sessao.pvDano - cura, 0, ficha.pvMax) });
}

export function gastarPd(ficha: FichaOp2, quantidade: number): FichaOp2 {
  const gasto = Math.max(0, Math.trunc(quantidade));
  return comSessao(ficha, { pdGasto: limitar(ficha.sessao.pdGasto + gasto, 0, ficha.pdMax) });
}

export function recuperarPd(ficha: FichaOp2, quantidade: number): FichaOp2 {
  const recuperado = Math.max(0, Math.trunc(quantidade));
  return comSessao(ficha, { pdGasto: limitar(ficha.sessao.pdGasto - recuperado, 0, ficha.pdMax) });
}

export function definirPv(ficha: FichaOp2, valor: number): FichaOp2 {
  return comSessao(ficha, { pvDano: limitar(ficha.pvMax - Math.trunc(valor), 0, ficha.pvMax) });
}

export function definirPd(ficha: FichaOp2, valor: number): FichaOp2 {
  return comSessao(ficha, { pdGasto: limitar(ficha.pdMax - Math.trunc(valor), 0, ficha.pdMax) });
}

export function encherImpeto(ficha: FichaOp2, espacos = 1): FichaOp2 {
  if (ficha.perfil.tipo !== 'EXECUTOR') return ficha;
  return comPerfil(ficha, {
    tipo: 'EXECUTOR',
    impetoPreenchido: limitar(ficha.perfil.impetoPreenchido + espacos, 0, MAXIMO_IMPETO),
  });
}

export function gastarImpeto(ficha: FichaOp2, espacos: 1 | 3): FichaOp2 {
  if (ficha.perfil.tipo !== 'EXECUTOR') {
    throw new Error('Ímpeto é exclusivo do perfil EXECUTOR.');
  }
  if (ficha.perfil.impetoPreenchido < espacos) {
    throw new Error(
      `Ímpeto insuficiente: ${ficha.perfil.impetoPreenchido} de ${espacos} espaços necessários.`,
    );
  }
  return comPerfil(ficha, {
    tipo: 'EXECUTOR',
    impetoPreenchido: ficha.perfil.impetoPreenchido - espacos,
  });
}

export function ganharDadosDeAvaliacao(ficha: FichaOp2, dados = MAXIMO_AVALIACAO): FichaOp2 {
  if (ficha.perfil.tipo !== 'ANALISTA') return ficha;
  return comPerfil(ficha, {
    tipo: 'ANALISTA',
    avaliacaoDisponivel: limitar(ficha.perfil.avaliacaoDisponivel + dados, 0, MAXIMO_AVALIACAO),
  });
}

export function gastarDadosDeAvaliacao(ficha: FichaOp2, dados: 1 | 2): FichaOp2 {
  if (ficha.perfil.tipo !== 'ANALISTA') {
    throw new Error('Dados de Avaliação são exclusivos do perfil ANALISTA.');
  }
  if (ficha.perfil.avaliacaoDisponivel < dados) {
    throw new Error(
      `Dados de Avaliação insuficientes: ${ficha.perfil.avaliacaoDisponivel} de ${dados} necessários.`,
    );
  }
  return comPerfil(ficha, {
    tipo: 'ANALISTA',
    avaliacaoDisponivel: ficha.perfil.avaliacaoDisponivel - dados,
  });
}

export function adicionarPassoDeCena(
  ficha: FichaOp2,
  alvo: AtributoOp2,
  motivo: string,
  delta = 1,
): FichaOp2 {
  return comSessao(ficha, {
    passosDeCena: [...ficha.sessao.passosDeCena, { alvo, delta, motivo }],
  });
}

export function encerrarCena(ficha: FichaOp2): FichaOp2 {
  return comSessao(ficha, { passosDeCena: [] });
}

export function registrarTesteDeFerimento(ficha: FichaOp2): FichaOp2 {
  return comSessao(ficha, { testesDeFerimentoFeitos: ficha.sessao.testesDeFerimentoFeitos + 1 });
}

export function registrarTesteDeTrauma(ficha: FichaOp2): FichaOp2 {
  return comSessao(ficha, { testesDeTraumaFeitos: ficha.sessao.testesDeTraumaFeitos + 1 });
}

export function descansar(ficha: FichaOp2): FichaOp2 {
  return {
    ...ficha,
    perfil: ficha.perfil.tipo === 'ANALISTA' ? { tipo: 'ANALISTA', avaliacaoDisponivel: 0 } : ficha.perfil,
    sessao: {
      ...ficha.sessao,
      passosDeCena: [],
      testesDeFerimentoFeitos: 0,
      testesDeTraumaFeitos: 0,
    },
  };
}

export function alternarCondicao(ficha: FichaOp2, condicao: string): FichaOp2 {
  const presente = ficha.sessao.condicoes.includes(condicao);
  return comSessao(ficha, {
    condicoes: presente
      ? ficha.sessao.condicoes.filter((atual) => atual !== condicao)
      : [...ficha.sessao.condicoes, condicao],
  });
}

export function pagarCusto(ficha: FichaOp2, custo: CustoOp2): FichaOp2 {
  switch (custo.tipo) {
    case 'nenhum':
      return ficha;
    case 'pd': {
      if (pdAtual(ficha) < custo.quantidade) {
        throw new Error(`PD insuficiente: ${pdAtual(ficha)} de ${custo.quantidade} necessários.`);
      }
      return gastarPd(ficha, custo.quantidade);
    }
    case 'pv': {
      if (pvAtual(ficha) < custo.quantidade) {
        throw new Error(`PV insuficiente: ${pvAtual(ficha)} de ${custo.quantidade} necessários.`);
      }
      return sofrerDano(ficha, custo.quantidade);
    }
    case 'impeto':
      return gastarImpeto(ficha, custo.espacos);
    case 'avaliacao':
      return gastarDadosDeAvaliacao(ficha, custo.dados);
  }
}

export function custoDaHabilidade(id: string): CustoOp2 {
  const habilidade = habilidadePorId(id);
  if (!habilidade) throw new Error(`Habilidade desconhecida: ${id}`);
  const gatilho = habilidade.gatilho;
  return 'custo' in gatilho ? gatilho.custo : { tipo: 'nenhum' };
}

export function ativarHabilidade(ficha: FichaOp2, id: string): FichaOp2 {
  const habilidade = habilidadePorId(id);
  if (!habilidade) throw new Error(`Habilidade desconhecida: ${id}`);
  if (!ficha.habilidades.includes(id)) {
    throw new Error(`A ficha de ${ficha.nome} não possui a habilidade "${habilidade.nome}".`);
  }

  const paga = pagarCusto(ficha, custoDaHabilidade(id));
  const gatilho = habilidade.gatilho;

  if (gatilho.quando === 'acao' && gatilho.efeito.tipo === 'concederDadosDeAvaliacao') {
    return ganharDadosDeAvaliacao(paga, gatilho.efeito.quantidade);
  }

  return paga;
}

export function aplicarResultadoDeTeste(
  ficha: FichaOp2,
  resultado: { contaComoFalhaParaImpeto: boolean },
): FichaOp2 {
  return resultado.contaComoFalhaParaImpeto ? encherImpeto(ficha, 1) : ficha;
}
