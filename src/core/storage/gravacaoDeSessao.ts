import type { Personagem } from '../types';
import type { FichaPersistida } from '../ficha/tipos';
import { atualizarSessao } from '../ficha/sessao';
import { paraPersonagem } from '../ficha/paraPersonagem';

export interface RegistroComDocumento {
  ficha?: FichaPersistida;
  fichaMigradaDe?: string;
}

export interface GravacaoDeSessao {
  personagem: Personagem;
  ficha?: FichaPersistida;
  fichaMigradaDe?: string;
  estrutural: boolean;
  divergiu: string[];
}

export function prepararGravacao(
  existente: RegistroComDocumento | undefined,
  personagem: Personagem,
  agora: string,
): GravacaoDeSessao {
  if (!existente?.ficha) {
    return { personagem, estrutural: false, divergiu: [] };
  }

  let resultado: ReturnType<typeof atualizarSessao>;
  try {
    resultado = atualizarSessao(existente.ficha, personagem);
  } catch {
    return { personagem, ficha: existente.ficha, fichaMigradaDe: existente.fichaMigradaDe, estrutural: true, divergiu: ['exceção ao absorver a sessão'] };
  }

  if (resultado.estrutural) {
    return {
      personagem,
      ficha: existente.ficha,
      fichaMigradaDe: existente.fichaMigradaDe,
      estrutural: true,
      divergiu: resultado.divergiu,
    };
  }

  return {
    personagem: paraPersonagem({ ficha: resultado.ficha, carregarDe: personagem }),
    ficha: resultado.ficha,
    fichaMigradaDe: agora,
    estrutural: false,
    divergiu: [],
  };
}
