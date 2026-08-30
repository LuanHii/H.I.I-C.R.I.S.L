import { habilidadePorId } from './habilidades';
import { CAMPOS_APTIDAO, PERICIAS_SIMPLES, atributoBaseDe } from './pericias';
import { dtDeFerimento, dtDeTrauma, precisaTesteDeFerimento, precisaTesteDeTrauma } from './resolucao';
import type { EntradaTeste, PassoAplicado } from './rolagem';
import {
  MAXIMO_AVALIACAO,
  MAXIMO_IMPETO,
  NIVEL_MAXIMO,
  NIVEL_MINIMO,
  type AtributoOp2,
  type CampoAptidao,
  type DiceStep,
  type EstadoSessaoOp2,
  type FichaOp2,
  type Ocupacao,
  type PericiaOp2,
  type Perfil,
  type RecursoDePerfil,
  type RefPericia,
} from './tipos';

export const DADO_DESTREINADO: DiceStep = 'd4';

export function recursoInicialDePerfil(perfil: Perfil): RecursoDePerfil {
  if (perfil === 'EXECUTOR') return { tipo: 'EXECUTOR', impetoPreenchido: 0 };
  if (perfil === 'ANALISTA') return { tipo: 'ANALISTA', avaliacaoDisponivel: 0 };
  return { tipo: 'VIGILANTE' };
}

export function sessaoInicial(): EstadoSessaoOp2 {
  return {
    pvDano: 0,
    pdGasto: 0,
    passosDeCena: [],
    testesDeFerimentoFeitos: 0,
    testesDeTraumaFeitos: 0,
    condicoes: [],
  };
}

export function periciasDestreinadas(): Record<PericiaOp2, DiceStep> {
  return Object.fromEntries(
    PERICIAS_SIMPLES.map((nome) => [nome, DADO_DESTREINADO]),
  ) as Record<PericiaOp2, DiceStep>;
}

export function aptidoesDestreinadas(): Record<CampoAptidao, DiceStep> {
  return Object.fromEntries(
    CAMPOS_APTIDAO.map((campo) => [campo, DADO_DESTREINADO]),
  ) as Record<CampoAptidao, DiceStep>;
}

export interface EntradaDeCriacao {
  id: string;
  nome: string;
  nivel: number;
  perfil: Perfil;
  ocupacao: Ocupacao;
  atributos: Record<AtributoOp2, DiceStep>;
  pericias?: Partial<Record<PericiaOp2, DiceStep>>;
  aptidoes?: Partial<Record<CampoAptidao, DiceStep>>;
  pvMax: number;
  pdMax: number;
  habilidades: string[];
  anotacoes?: string;
}

export function criarFichaOp2(entrada: EntradaDeCriacao): FichaOp2 {
  return {
    versaoDocumento: 1,
    sistema: 'op2',
    revisaoRegras: 'playtest-alpha',
    id: entrada.id,
    nome: entrada.nome,
    nivel: entrada.nivel,
    ocupacao: entrada.ocupacao,
    perfil: recursoInicialDePerfil(entrada.perfil),
    atributos: { ...entrada.atributos },
    pericias: { ...periciasDestreinadas(), ...entrada.pericias },
    aptidoes: { ...aptidoesDestreinadas(), ...entrada.aptidoes },
    pvMax: entrada.pvMax,
    pdMax: entrada.pdMax,
    habilidades: [...entrada.habilidades],
    sessao: sessaoInicial(),
    anotacoes: entrada.anotacoes,
  };
}

export function perfilDe(ficha: FichaOp2): Perfil {
  return ficha.perfil.tipo;
}

export function pvAtual(ficha: FichaOp2): number {
  return Math.min(Math.max(ficha.pvMax - ficha.sessao.pvDano, 0), ficha.pvMax);
}

export function pdAtual(ficha: FichaOp2): number {
  return Math.min(Math.max(ficha.pdMax - ficha.sessao.pdGasto, 0), ficha.pdMax);
}

export function impetoDe(ficha: FichaOp2): number {
  return ficha.perfil.tipo === 'EXECUTOR' ? ficha.perfil.impetoPreenchido : 0;
}

export function avaliacaoDe(ficha: FichaOp2): number {
  return ficha.perfil.tipo === 'ANALISTA' ? ficha.perfil.avaliacaoDisponivel : 0;
}

export function dadoDaPericia(ficha: FichaOp2, ref: RefPericia): DiceStep {
  return ref.tipo === 'aptidao' ? ficha.aptidoes[ref.campo] : ficha.pericias[ref.nome];
}

export function passosDeCenaDoAtributo(ficha: FichaOp2, atributo: AtributoOp2): number {
  return ficha.sessao.passosDeCena
    .filter((passo) => passo.alvo === atributo)
    .reduce((total, passo) => total + passo.delta, 0);
}

export function dadoDoAtributo(ficha: FichaOp2, atributo: AtributoOp2): DiceStep {
  return ficha.atributos[atributo];
}

export function montarTeste(
  ficha: FichaOp2,
  ref: RefPericia,
  extras?: Partial<Pick<EntradaTeste, 'dt' | 'extras' | 'permitirD20' | 'rng'>> & {
    passos?: PassoAplicado[];
  },
): EntradaTeste {
  const atributo = atributoBaseDe(ref);
  const passosDaCena = passosDeCenaDoAtributo(ficha, atributo);
  const passosDeCena: PassoAplicado[] = passosDaCena === 0
    ? []
    : [{ alvo: 'atributo', quantidade: passosDaCena, motivo: 'Efeito de cena' }];

  return {
    atributo: dadoDoAtributo(ficha, atributo),
    pericia: dadoDaPericia(ficha, ref),
    passos: [...passosDeCena, ...(extras?.passos ?? [])],
    extras: extras?.extras,
    dt: extras?.dt,
    permitirD20: extras?.permitirD20,
    rng: extras?.rng,
  };
}

export function estadoDeRisco(ficha: FichaOp2): {
  precisaFerimento: boolean;
  dtFerimento: number;
  precisaTrauma: boolean;
  dtTrauma: number;
} {
  return {
    precisaFerimento: precisaTesteDeFerimento(pvAtual(ficha)),
    dtFerimento: dtDeFerimento(ficha.sessao.testesDeFerimentoFeitos),
    precisaTrauma: precisaTesteDeTrauma(pdAtual(ficha)),
    dtTrauma: dtDeTrauma(ficha.sessao.testesDeTraumaFeitos),
  };
}

export type ProblemaDaFicha = { codigo: string; mensagem: string };

export function validarFicha(ficha: FichaOp2): ProblemaDaFicha[] {
  const problemas: ProblemaDaFicha[] = [];

  if (ficha.nivel < NIVEL_MINIMO || ficha.nivel > NIVEL_MAXIMO) {
    problemas.push({
      codigo: 'nivel-fora-da-escala',
      mensagem: `Nível ${ficha.nivel} fora da escala de ${NIVEL_MINIMO} a ${NIVEL_MAXIMO}.`,
    });
  }

  if (ficha.pvMax <= 0) {
    problemas.push({ codigo: 'pv-invalido', mensagem: 'PV máximo precisa ser maior que zero.' });
  }

  if (ficha.pdMax <= 0) {
    problemas.push({ codigo: 'pd-invalido', mensagem: 'PD máximo precisa ser maior que zero.' });
  }

  if (ficha.perfil.tipo === 'EXECUTOR') {
    const { impetoPreenchido } = ficha.perfil;
    if (impetoPreenchido < 0 || impetoPreenchido > MAXIMO_IMPETO) {
      problemas.push({
        codigo: 'impeto-fora-da-barra',
        mensagem: `Ímpeto ${impetoPreenchido} fora da barra de 0 a ${MAXIMO_IMPETO}.`,
      });
    }
  }

  if (ficha.perfil.tipo === 'ANALISTA') {
    const { avaliacaoDisponivel } = ficha.perfil;
    if (avaliacaoDisponivel < 0 || avaliacaoDisponivel > MAXIMO_AVALIACAO) {
      problemas.push({
        codigo: 'avaliacao-acima-do-teto',
        mensagem: `Avaliação ${avaliacaoDisponivel} fora do intervalo de 0 a ${MAXIMO_AVALIACAO}.`,
      });
    }
  }

  for (const id of ficha.habilidades) {
    if (!habilidadePorId(id)) {
      problemas.push({ codigo: 'habilidade-desconhecida', mensagem: `Habilidade "${id}" não existe no catálogo.` });
    }
  }

  for (const nome of PERICIAS_SIMPLES) {
    if (!ficha.pericias[nome]) {
      problemas.push({ codigo: 'pericia-ausente', mensagem: `Perícia "${nome}" não está na ficha.` });
    }
  }

  for (const campo of CAMPOS_APTIDAO) {
    if (!ficha.aptidoes[campo]) {
      problemas.push({ codigo: 'aptidao-ausente', mensagem: `Campo de Aptidão "${campo}" não está na ficha.` });
    }
  }

  return problemas;
}
