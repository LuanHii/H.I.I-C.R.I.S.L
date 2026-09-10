import type { Confianca } from '../inferirFicha';
import type { Escolha, EscolhaId, FichaPersistida, Problema } from '../tipos';

export interface Lacuna {
  campo: string;
  valor: unknown;
  motivo: string;
}

export interface Ambiguidade {
  escolhaId: EscolhaId;
  descricao: string;
  arbitrado: unknown;
  alternativas?: unknown[];
  material: boolean;
  confianca: Confianca;
}

export interface FalhaReplay {
  nivel: number;
  codigo: string;
  mensagem: string;
}

export interface RoundTripRelatorio {
  endpointOk: boolean;
  divergencias: string[];
  replayOk: boolean;
  falhasReplay: FalhaReplay[];
  ok: boolean;
}

export type Geracao = 'escolha' | 'escolhido' | 'mista' | 'sem-marcador';

export interface ResultadoMigracao {
  ficha: FichaPersistida;
  escolhas: (Escolha & { confianca: Confianca; nota: string })[];
  naoInferido: Lacuna[];
  ambiguidades: Ambiguidade[];
  problemas: Problema[];
  geracao: Geracao;
  confianca: Confianca;
  roundTrip: RoundTripRelatorio;
}
