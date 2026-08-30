import { aplicarPassos, facesDe } from './dados';
import type { DiceStep } from './tipos';

export const DT_PADRAO = 7;
export const MAXIMO_DADOS_ROLADOS = 4;
export const MAXIMO_DADOS_SOMADOS = 3;
export const VALOR_MINIMO_CRITICO = 6;

export type Rng = () => number;

export type AlvoDePasso = 'atributo' | 'pericia';

export type OrigemDoDado = 'atributo' | 'pericia' | 'extra';

export interface PassoAplicado {
  alvo: AlvoDePasso;
  quantidade: number;
  motivo: string;
}

export interface DadoExtra {
  dado: DiceStep;
  motivo: string;
}

export interface EntradaTeste {
  atributo: DiceStep;
  pericia: DiceStep;
  passos?: PassoAplicado[];
  extras?: DadoExtra[];
  dt?: number;
  permitirD20?: boolean;
  rng?: Rng;
}

export interface DadoRolado {
  faces: number;
  valor: number;
  origem: OrigemDoDado;
  motivo: string;
  somado: boolean;
  substituido: boolean;
}

export type Critico = 'sucesso' | 'falha' | null;

export interface ResultadoTeste {
  dados: DadoRolado[];
  somados: DadoRolado[];
  descartados: DadoRolado[];
  soma: number;
  dt: number;
  sucesso: boolean;
  ra: number;
  rb: number;
  critico: Critico;
  contaComoFalhaParaImpeto: boolean;
  dadosDoTeste: { atributo: DiceStep; pericia: DiceStep };
  extrasIgnorados: DadoExtra[];
}

export function rngSeguro(): number {
  const escopo = globalThis as { crypto?: { getRandomValues?: (a: Uint32Array) => Uint32Array } };
  const getRandomValues = escopo.crypto?.getRandomValues;
  if (getRandomValues && escopo.crypto) {
    const buffer = new Uint32Array(1);
    getRandomValues.call(escopo.crypto, buffer);
    return buffer[0] / 4294967296;
  }
  return Math.random();
}

function rolarDado(faces: number, rng: Rng): number {
  const sorteado = Math.floor(rng() * faces) + 1;
  return Math.min(Math.max(sorteado, 1), faces);
}

function somaDePassos(passos: readonly PassoAplicado[], alvo: AlvoDePasso): number {
  return passos
    .filter((passo) => passo.alvo === alvo)
    .reduce((total, passo) => total + passo.quantidade, 0);
}

function temParCritico(valores: readonly number[]): boolean {
  const ordenados = [...valores].sort((a, b) => a - b);
  for (let i = 1; i < ordenados.length; i += 1) {
    if (ordenados[i] === ordenados[i - 1] && ordenados[i] >= VALOR_MINIMO_CRITICO) return true;
  }
  return false;
}

export function classificarCritico(valores: readonly number[]): Critico {
  if (valores.length === 0) return null;
  if (valores.every((valor) => valor === 1)) return 'falha';
  if (temParCritico(valores)) return 'sucesso';
  return null;
}

function marcarSomados(dados: readonly DadoRolado[]): DadoRolado[] {
  const indicesPorValor = dados
    .map((dado, indice) => ({ indice, valor: dado.valor }))
    .sort((a, b) => b.valor - a.valor || a.indice - b.indice)
    .slice(0, MAXIMO_DADOS_SOMADOS)
    .map((item) => item.indice);
  const somados = new Set(indicesPorValor);
  return dados.map((dado, indice) => ({ ...dado, somado: somados.has(indice) }));
}

function recomporResultado(
  dados: readonly DadoRolado[],
  dt: number,
  dadosDoTeste: { atributo: DiceStep; pericia: DiceStep },
  extrasIgnorados: readonly DadoExtra[],
): ResultadoTeste {
  const marcados = marcarSomados(dados);
  const somados = marcados.filter((dado) => dado.somado);
  const descartados = marcados.filter((dado) => !dado.somado);
  const soma = somados.reduce((total, dado) => total + dado.valor, 0);

  const valores = marcados.map((dado) => dado.valor);
  const ra = Math.max(...valores);
  const rb = Math.min(...valores);
  const critico = classificarCritico(valores);

  const sucesso = critico === 'sucesso' ? true : critico === 'falha' ? false : soma >= dt;

  return {
    dados: marcados,
    somados,
    descartados,
    soma,
    dt,
    sucesso,
    ra,
    rb,
    critico,
    contaComoFalhaParaImpeto: !sucesso,
    dadosDoTeste,
    extrasIgnorados: [...extrasIgnorados],
  };
}

export function rolarTeste(entrada: EntradaTeste): ResultadoTeste {
  const rng = entrada.rng ?? rngSeguro;
  const permitirD20 = entrada.permitirD20 === true;
  const passos = entrada.passos ?? [];

  const dadoAtributo = aplicarPassos(entrada.atributo, somaDePassos(passos, 'atributo'), permitirD20);
  const dadoPericia = aplicarPassos(entrada.pericia, somaDePassos(passos, 'pericia'), permitirD20);

  const extras = entrada.extras ?? [];
  const vagas = Math.max(0, MAXIMO_DADOS_ROLADOS - 2);
  const extrasUsados = extras.slice(0, vagas);
  const extrasIgnorados = extras.slice(vagas);

  const aRolar: { faces: number; origem: OrigemDoDado; motivo: string }[] = [
    { faces: facesDe(dadoAtributo), origem: 'atributo', motivo: 'Atributo' },
    { faces: facesDe(dadoPericia), origem: 'pericia', motivo: 'Perícia' },
    ...extrasUsados.map((extra) => ({
      faces: facesDe(extra.dado),
      origem: 'extra' as OrigemDoDado,
      motivo: extra.motivo,
    })),
  ];

  const dados: DadoRolado[] = aRolar.map((molde) => ({
    faces: molde.faces,
    valor: rolarDado(molde.faces, rng),
    origem: molde.origem,
    motivo: molde.motivo,
    somado: false,
    substituido: false,
  }));

  return recomporResultado(
    dados,
    entrada.dt ?? DT_PADRAO,
    { atributo: dadoAtributo, pericia: dadoPericia },
    extrasIgnorados,
  );
}

export function aplicarMentoria(
  resultado: ResultadoTeste,
  indiceDoDado: number,
  rolagemAltaDoProfessor: number,
): ResultadoTeste {
  if (indiceDoDado < 0 || indiceDoDado >= resultado.dados.length) {
    throw new Error(`Mentoria: índice de dado fora do teste (${indiceDoDado}).`);
  }

  const substituidos = resultado.dados.map((dado, indice) =>
    indice === indiceDoDado
      ? { ...dado, valor: rolagemAltaDoProfessor, substituido: true, motivo: `${dado.motivo} · Mentoria` }
      : dado,
  );

  return recomporResultado(
    substituidos,
    resultado.dt,
    resultado.dadosDoTeste,
    resultado.extrasIgnorados,
  );
}

export interface EntradaTesteOposto {
  ataque: EntradaTeste;
  defesa: EntradaTeste;
}

export interface ResultadoTesteOposto {
  ataque: ResultadoTeste;
  defesa: ResultadoTeste;
  vencedor: 'ataque' | 'defesa' | 'empate';
}

export function resolverTesteOposto(entrada: EntradaTesteOposto): ResultadoTesteOposto {
  const ataque = rolarTeste(entrada.ataque);
  const defesa = rolarTeste(entrada.defesa);
  const vencedor =
    ataque.soma > defesa.soma ? 'ataque' : defesa.soma > ataque.soma ? 'defesa' : 'empate';
  return { ataque, defesa, vencedor };
}
