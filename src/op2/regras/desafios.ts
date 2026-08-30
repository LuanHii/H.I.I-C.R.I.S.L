import { descerPasso } from './dados';
import { rngSeguro, type ResultadoTeste, type Rng } from './rolagem';
import type { DiceStep } from './tipos';

export type RetornoPosicao = 'baixo' | 'exato' | 'alto';

export interface TentativaDeSenha {
  palpite: number[];
  retorno: RetornoPosicao[];
}

export interface EstadoDestrancar {
  senha: number[];
  faces: number;
  tentativasMax: number;
  tentativasFeitas: number;
  historico: TentativaDeSenha[];
  aberta: boolean;
  danificada: boolean;
}

export const TENTATIVAS_POR_RODADA: Record<Exclude<DiceStep, 'd20'>, 1 | 2 | 3 | 4 | 5> = {
  d4: 1,
  d6: 2,
  d8: 3,
  d10: 4,
  d12: 5,
};

export function tentativasPorRodada(crime: DiceStep): 1 | 2 | 3 | 4 | 5 {
  return crime === 'd20' ? 5 : TENTATIVAS_POR_RODADA[crime];
}

export function sortearSenha(quantidade: number, faces: number, rng: Rng = rngSeguro): number[] {
  return Array.from({ length: quantidade }, () => Math.min(Math.floor(rng() * faces) + 1, faces));
}

export function criarDesafioDestrancar(parametros: {
  quantidade: number;
  faces: number;
  tentativasMax: number;
  rng?: Rng;
  senha?: number[];
}): EstadoDestrancar {
  const senha =
    parametros.senha ?? sortearSenha(parametros.quantidade, parametros.faces, parametros.rng);
  return {
    senha,
    faces: parametros.faces,
    tentativasMax: parametros.tentativasMax,
    tentativasFeitas: 0,
    historico: [],
    aberta: false,
    danificada: false,
  };
}

export function compararComSenha(senha: readonly number[], palpite: readonly number[]): RetornoPosicao[] {
  return senha.map((valor, indice) => {
    const tentado = palpite[indice];
    if (valor === tentado) return 'exato';
    return valor < tentado ? 'baixo' : 'alto';
  });
}

export function tentarSenha(estado: EstadoDestrancar, palpite: number[]): EstadoDestrancar {
  if (estado.aberta || estado.danificada) return estado;
  if (palpite.length !== estado.senha.length) {
    throw new Error(
      `A senha tem ${estado.senha.length} dígitos; o palpite trouxe ${palpite.length}.`,
    );
  }

  const retorno = compararComSenha(estado.senha, palpite);
  const acertou = retorno.every((posicao) => posicao === 'exato');
  const tentativasFeitas = estado.tentativasFeitas + 1;

  return {
    ...estado,
    tentativasFeitas,
    historico: [...estado.historico, { palpite: [...palpite], retorno }],
    aberta: acertou,
    danificada: !acertou && tentativasFeitas >= estado.tentativasMax,
  };
}

export interface EstadoArrombar {
  dt: number;
  pontuacaoAlvo: number;
  pontuacaoAcumulada: number;
  tentativas: number;
  pvGasto: number;
  aberto: boolean;
}

export const PV_POR_TENTATIVA_DE_ARROMBAR = 1;

export function criarDesafioArrombar(dt: number, pontuacaoAlvo: number): EstadoArrombar {
  return { dt, pontuacaoAlvo, pontuacaoAcumulada: 0, tentativas: 0, pvGasto: 0, aberto: false };
}

export function tentarArrombar(estado: EstadoArrombar, resultado: ResultadoTeste): EstadoArrombar {
  if (estado.aberto) return estado;

  const ganho = resultado.sucesso ? resultado.ra : 0;
  const pontuacaoAcumulada = estado.pontuacaoAcumulada + ganho;

  return {
    ...estado,
    pontuacaoAcumulada,
    tentativas: estado.tentativas + 1,
    pvGasto: estado.pvGasto + PV_POR_TENTATIVA_DE_ARROMBAR,
    aberto: pontuacaoAcumulada >= estado.pontuacaoAlvo,
  };
}

export const SEGUNDOS_PARA_RESPONDER_HACK_TECNICO = 10;

export interface FaixaDeEquacao {
  resultadoMinimo: number;
  enunciado: string;
  resposta: number;
}

export function equacaoParaResultado(
  tabela: readonly FaixaDeEquacao[],
  resultado: number,
): FaixaDeEquacao | undefined {
  return [...tabela]
    .sort((a, b) => b.resultadoMinimo - a.resultadoMinimo)
    .find((faixa) => resultado >= faixa.resultadoMinimo);
}

export const PONTOS_POR_CHANCE_EXTRA = 3;

export function chancesExtras(resultado: number, dt: number): number {
  return Math.max(0, Math.floor((resultado - dt) / PONTOS_POR_CHANCE_EXTRA));
}

export interface EstadoHackSocial {
  respostasNecessarias: number;
  acertos: number;
  errosPermitidos: number;
  errosCometidos: number;
  concluido: boolean;
  bloqueado: boolean;
}

export function criarDesafioHackSocial(
  respostasNecessarias: number,
  resultadoDoTeste: number,
  dt: number,
): EstadoHackSocial {
  return {
    respostasNecessarias,
    acertos: 0,
    errosPermitidos: chancesExtras(resultadoDoTeste, dt),
    errosCometidos: 0,
    concluido: false,
    bloqueado: false,
  };
}

export function responderPergunta(estado: EstadoHackSocial, correta: boolean): EstadoHackSocial {
  if (estado.concluido || estado.bloqueado) return estado;

  const acertos = correta ? estado.acertos + 1 : estado.acertos;
  const errosCometidos = correta ? estado.errosCometidos : estado.errosCometidos + 1;

  return {
    ...estado,
    acertos,
    errosCometidos,
    concluido: acertos >= estado.respostasNecessarias,
    bloqueado: errosCometidos > estado.errosPermitidos,
  };
}

export interface EstadoAlcancar {
  dt: number;
  modo: 'seguro' | 'arriscado';
  acoesConcluidas: number;
  alcancado: boolean;
  danoSofrido: number;
}

export const ACOES_PARA_ALCANCAR_SEGURO = 2;
export const ACOES_PARA_ALCANCAR_ARRISCADO = 1;

export function criarDesafioAlcancar(dt: number, modo: 'seguro' | 'arriscado'): EstadoAlcancar {
  return { dt, modo, acoesConcluidas: 0, alcancado: false, danoSofrido: 0 };
}

export function acoesNecessariasParaAlcancar(modo: 'seguro' | 'arriscado'): number {
  return modo === 'seguro' ? ACOES_PARA_ALCANCAR_SEGURO : ACOES_PARA_ALCANCAR_ARRISCADO;
}

export function tentarAlcancar(estado: EstadoAlcancar, resultado: ResultadoTeste): EstadoAlcancar {
  if (estado.alcancado) return estado;

  if (!resultado.sucesso) {
    const dano = estado.modo === 'arriscado' ? resultado.ra : resultado.rb;
    return { ...estado, acoesConcluidas: 0, danoSofrido: estado.danoSofrido + dano };
  }

  const acoesConcluidas = estado.acoesConcluidas + 1;
  return {
    ...estado,
    acoesConcluidas,
    alcancado: acoesConcluidas >= acoesNecessariasParaAlcancar(estado.modo),
  };
}

export interface EstadoSustentar {
  dt: number;
  rodadasSustentando: number;
  pvGasto: number;
  sustentando: boolean;
}

export const PV_PARA_COMECAR_A_SUSTENTAR = 1;

export function criarDesafioSustentar(dt: number): EstadoSustentar {
  return { dt, rodadasSustentando: 0, pvGasto: PV_PARA_COMECAR_A_SUSTENTAR, sustentando: true };
}

export function dadoCansadoDeSustentar(dado: DiceStep, rodadasSustentando: number): DiceStep {
  let atual = dado;
  for (let i = 0; i < rodadasSustentando; i += 1) atual = descerPasso(atual);
  return atual;
}

export function sustentarMaisUmaRodada(
  estado: EstadoSustentar,
  resultado: ResultadoTeste,
): EstadoSustentar {
  if (!estado.sustentando) return estado;
  return {
    ...estado,
    rodadasSustentando: estado.rodadasSustentando + 1,
    sustentando: resultado.sucesso,
  };
}

export const DANO_DE_ESMAGAMENTO = '1d4';

export type DesafioDeAcesso =
  | { tipo: 'destrancar'; quantidade: number; faces: number; tentativasMax: number }
  | { tipo: 'arrombar'; dt: number; pontuacaoAlvo: number }
  | { tipo: 'hackTecnico'; tabela: FaixaDeEquacao[] }
  | { tipo: 'hackSocial'; respostasNecessarias: number; dt: number }
  | { tipo: 'alcancar'; dt: number }
  | { tipo: 'sustentar'; dt: number }
  | { tipo: 'item'; chave: string };

export function descreverDesafio(desafio: DesafioDeAcesso): string {
  switch (desafio.tipo) {
    case 'destrancar':
      return `Destrancar (senha ${desafio.quantidade}d${desafio.faces}, ${desafio.tentativasMax} tentativas)`;
    case 'arrombar':
      return `Arrombar (DT ${desafio.dt}, pontuação alvo ${desafio.pontuacaoAlvo})`;
    case 'hackTecnico':
      return 'Hack técnico (Tecnologia + problema matemático em 10 segundos)';
    case 'hackSocial':
      return `Hack social (Intuição DT ${desafio.dt}, ${desafio.respostasNecessarias} respostas corretas)`;
    case 'alcancar':
      return `Alcançar (DT ${desafio.dt} no modo seguro, DT ${desafio.dt + 3} no arriscado)`;
    case 'sustentar':
      return `Sustentar (Atletismo DT ${desafio.dt}, −1 passo por rodada)`;
    case 'item':
      return `Item: ${desafio.chave}`;
  }
}
