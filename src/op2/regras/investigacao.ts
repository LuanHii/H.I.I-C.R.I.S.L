import { facesDe } from './dados';
import type { DesafioDeAcesso } from './desafios';
import { dadoDaPericia } from './ficha';
import { mesmaPericia } from './pericias';
import { DT_COMPARTILHAR, DT_RECAPITULAR } from './resolucao';
import type { ResultadoTeste } from './rolagem';
import type { FichaOp2, RefPericia } from './tipos';

export const CUSTO_PD_EXAMINAR_SEM_NOVIDADE = 1;

export type AcaoUnicaPorCena = 'recapitular' | 'compartilhar';

export interface InformacaoPI {
  id: string;
  pericias: RefPericia[];
  dt: number;
  texto: string;
  handout?: string;
  exclusivoPara?: string[];
  requer?: string[];
  reveladaPara: string[];
}

export interface PontoDeInteresse {
  id: string;
  nome: string;
  descricaoBasica: string;
  descricaoContextual: string;
  informacoes: InformacaoPI[];
  desafioDeAcesso?: DesafioDeAcesso;
  requer?: string[];
  handouts?: string[];
}

export interface CenaInvestigacao {
  id: string;
  titulo: string;
  narracaoInicial: string;
  pontos: PontoDeInteresse[];
  rodada: number;
  usosPorPersonagem: Record<string, AcaoUnicaPorCena[]>;
  condicoesCumpridas: string[];
}

export function criarCena(parcial: {
  id: string;
  titulo: string;
  narracaoInicial?: string;
  pontos?: PontoDeInteresse[];
}): CenaInvestigacao {
  return {
    id: parcial.id,
    titulo: parcial.titulo,
    narracaoInicial: parcial.narracaoInicial ?? '',
    pontos: parcial.pontos ?? [],
    rodada: 1,
    usosPorPersonagem: {},
    condicoesCumpridas: [],
  };
}

export function requisitosCumpridos(
  cena: CenaInvestigacao,
  requer: readonly string[] | undefined,
): boolean {
  if (!requer || requer.length === 0) return true;
  return requer.every((condicao) => cena.condicoesCumpridas.includes(condicao));
}

export function acessivelPara(informacao: InformacaoPI, personagemId: string): boolean {
  if (!informacao.exclusivoPara || informacao.exclusivoPara.length === 0) return true;
  return informacao.exclusivoPara.includes(personagemId);
}

export function jaRevelada(informacao: InformacaoPI, personagemId: string): boolean {
  return informacao.reveladaPara.includes(personagemId);
}

export function informacoesDaPericia(
  ponto: PontoDeInteresse,
  ref: RefPericia,
): InformacaoPI[] {
  return ponto.informacoes.filter((informacao) =>
    informacao.pericias.some((candidata) => mesmaPericia(candidata, ref)),
  );
}

export function pontoPorId(cena: CenaInvestigacao, pontoId: string): PontoDeInteresse {
  const ponto = cena.pontos.find((candidato) => candidato.id === pontoId);
  if (!ponto) throw new Error(`Ponto de interesse desconhecido nesta cena: ${pontoId}`);
  return ponto;
}

export function pontoAcessivel(cena: CenaInvestigacao, ponto: PontoDeInteresse): boolean {
  return requisitosCumpridos(cena, ponto.requer);
}

export interface ResultadoInvestigar {
  descricaoBasica: string;
  reveladas: InformacaoPI[];
  bloqueadoPorAcesso: boolean;
}

export function investigar(
  cena: CenaInvestigacao,
  pontoId: string,
  ficha: FichaOp2,
  ref: RefPericia,
): ResultadoInvestigar {
  const ponto = pontoPorId(cena, pontoId);

  if (!pontoAcessivel(cena, ponto)) {
    return { descricaoBasica: ponto.descricaoBasica, reveladas: [], bloqueadoPorAcesso: true };
  }

  const valorDaPericia = facesDe(dadoDaPericia(ficha, ref));

  const reveladas = informacoesDaPericia(ponto, ref).filter(
    (informacao) =>
      informacao.dt <= valorDaPericia &&
      acessivelPara(informacao, ficha.id) &&
      requisitosCumpridos(cena, informacao.requer) &&
      !jaRevelada(informacao, ficha.id),
  );

  return { descricaoBasica: ponto.descricaoBasica, reveladas, bloqueadoPorAcesso: false };
}

export interface ResultadoExaminar {
  revelada?: InformacaoPI;
  custoPd: number;
  informacaoExtraPorCritico: boolean;
  candidatasRestantes: number;
}

export function examinar(
  cena: CenaInvestigacao,
  pontoId: string,
  ficha: FichaOp2,
  ref: RefPericia,
  resultado: ResultadoTeste,
): ResultadoExaminar {
  const ponto = pontoPorId(cena, pontoId);

  const candidatas = informacoesDaPericia(ponto, ref).filter(
    (informacao) =>
      acessivelPara(informacao, ficha.id) &&
      requisitosCumpridos(cena, informacao.requer) &&
      !jaRevelada(informacao, ficha.id),
  );

  const alcancadas = candidatas.filter((informacao) => resultado.soma >= informacao.dt);
  const revelada = alcancadas.reduce<InformacaoPI | undefined>(
    (melhor, atual) => (melhor === undefined || atual.dt > melhor.dt ? atual : melhor),
    undefined,
  );

  return {
    revelada,
    custoPd: revelada ? 0 : CUSTO_PD_EXAMINAR_SEM_NOVIDADE,
    informacaoExtraPorCritico: resultado.critico === 'sucesso',
    candidatasRestantes: candidatas.length - (revelada ? 1 : 0),
  };
}

export function revelarInformacao(
  cena: CenaInvestigacao,
  informacaoId: string,
  personagemId: string,
): CenaInvestigacao {
  return {
    ...cena,
    pontos: cena.pontos.map((ponto) => ({
      ...ponto,
      informacoes: ponto.informacoes.map((informacao) =>
        informacao.id === informacaoId && !informacao.reveladaPara.includes(personagemId)
          ? { ...informacao, reveladaPara: [...informacao.reveladaPara, personagemId] }
          : informacao,
      ),
    })),
  };
}

export function revelarVarias(
  cena: CenaInvestigacao,
  informacoes: readonly InformacaoPI[],
  personagemId: string,
): CenaInvestigacao {
  return informacoes.reduce(
    (atual, informacao) => revelarInformacao(atual, informacao.id, personagemId),
    cena,
  );
}

export function cumprirCondicao(cena: CenaInvestigacao, condicao: string): CenaInvestigacao {
  if (cena.condicoesCumpridas.includes(condicao)) return cena;
  return { ...cena, condicoesCumpridas: [...cena.condicoesCumpridas, condicao] };
}

export function jaUsou(
  cena: CenaInvestigacao,
  personagemId: string,
  acao: AcaoUnicaPorCena,
): boolean {
  return (cena.usosPorPersonagem[personagemId] ?? []).includes(acao);
}

export function podeUsar(
  cena: CenaInvestigacao,
  personagemId: string,
  acao: AcaoUnicaPorCena,
): boolean {
  return !jaUsou(cena, personagemId, acao);
}

export function registrarUso(
  cena: CenaInvestigacao,
  personagemId: string,
  acao: AcaoUnicaPorCena,
): CenaInvestigacao {
  if (jaUsou(cena, personagemId, acao)) return cena;
  return {
    ...cena,
    usosPorPersonagem: {
      ...cena.usosPorPersonagem,
      [personagemId]: [...(cena.usosPorPersonagem[personagemId] ?? []), acao],
    },
  };
}

export const DT_DAS_ACOES_UNICAS: Record<AcaoUnicaPorCena, number> = {
  recapitular: DT_RECAPITULAR,
  compartilhar: DT_COMPARTILHAR,
};

export function avancarRodada(cena: CenaInvestigacao): CenaInvestigacao {
  return { ...cena, rodada: cena.rodada + 1 };
}

export interface ProgressoDaCena {
  total: number;
  reveladas: number;
  porPersonagem: Record<string, number>;
}

export function progresso(cena: CenaInvestigacao): ProgressoDaCena {
  const todas = cena.pontos.flatMap((ponto) => ponto.informacoes);
  const porPersonagem: Record<string, number> = {};

  for (const informacao of todas) {
    for (const personagemId of informacao.reveladaPara) {
      porPersonagem[personagemId] = (porPersonagem[personagemId] ?? 0) + 1;
    }
  }

  return {
    total: todas.length,
    reveladas: todas.filter((informacao) => informacao.reveladaPara.length > 0).length,
    porPersonagem,
  };
}
