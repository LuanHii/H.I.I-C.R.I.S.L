import type { Atributos, AtributoKey } from '../types';
import { getPatentePorPP } from '../../logic/rulesEngine';
import { derivarSlots, pendenciasDe, type ResultadoSlots } from './slots';
import { derivar, type Derivados } from './etapas/derivados';
import type {
  Escolha,
  FichaPersistida,
  Pendencia,
  PoderDerivado,
  Problema,
  Slot,
} from './tipos';

export interface BuildInput {
  ficha: FichaPersistida;
}

export interface BuildResultado {
  atributos: Atributos;
  nivel: number;
  trilha?: string;
  afinidade?: string;
  poderes: PoderDerivado[];
  rituais: string[];
  patente: string;
  pendencias: Pendencia[];
  escolhasInertes: Escolha[];
  problemas: Problema[];
  slots: Slot[];
  derivados: Derivados;
}

const ATRIBUTO_MAXIMO_AGENTE = 5;
const ATRIBUTO_MAXIMO_SOBREVIVENTE = 3;

function aplicarAumentos(
  base: Atributos,
  ganhos: readonly string[],
  teto: number,
): { atributos: Atributos; excedidos: string[] } {
  const atributos: Atributos = { ...base };
  const excedidos: string[] = [];

  for (const bruto of ganhos) {
    const chave = bruto as AtributoKey;
    if (!(chave in atributos)) {
      excedidos.push(bruto);
      continue;
    }
    if (atributos[chave] >= teto) {
      excedidos.push(chave);
      continue;
    }
    atributos[chave] += 1;
  }
  return { atributos, excedidos };
}

export function buildFicha({ ficha }: BuildInput): BuildResultado {
  const { identidade, progressao, escolhas, sessao } = ficha;

  const resultado: ResultadoSlots = derivarSlots(identidade, progressao, escolhas);
  const problemas: Problema[] = [];

  const teto = identidade.classe === 'Sobrevivente'
    ? ATRIBUTO_MAXIMO_SOBREVIVENTE
    : ATRIBUTO_MAXIMO_AGENTE;

  const { atributos, excedidos } = aplicarAumentos(
    identidade.atributosBase,
    resultado.estadoFinal.atributosGanhos,
    teto,
  );

  for (const chave of excedidos) {
    problemas.push({
      gravidade: 'aviso',
      codigo: 'atributo_no_teto',
      mensagem: `Aumento em ${chave} descartado: o teto da classe ${identidade.classe} é ${teto}.`,
    });
  }

  for (const orfa of resultado.orfas) {
    problemas.push({
      gravidade: 'erro',
      codigo: 'escolha_orfa',
      mensagem: `A escolha "${orfa.id}" não corresponde a nenhuma obrigação deste nível.`,
      escolhaId: orfa.id,
    });
  }

  const nivel = identidade.classe === 'Sobrevivente'
    ? (progressao.estagio ?? 1)
    : progressao.nex;

  const patente = getPatentePorPP(sessao.pontosPrestigio ?? 0);

  const poderes: PoderDerivado[] = [
    ...resultado.estadoFinal.poderes,
    ...(ficha.ajustes.poderesManuais ?? [])
      .filter((nome) => !resultado.estadoFinal.poderes.some((p) => p.nome === nome))
      .map((nome): PoderDerivado => ({ nome, provenancia: { kind: 'manual' } })),
  ];

  const derivados = derivar({
    identidade,
    atributos,
    nivel,
    parcial: resultado.estadoFinal,
    escolhas,
    sessao,
    ajustes: ficha.ajustes,
    patente,
    poderes,
  });

  return {
    atributos,
    nivel,
    trilha: resultado.estadoFinal.trilha,
    afinidade: resultado.estadoFinal.afinidade,
    poderes,
    rituais: [...resultado.estadoFinal.rituais],
    patente,
    derivados,
    pendencias: pendenciasDe(resultado, escolhas).map((slot) => ({ slot })),
    escolhasInertes: resultado.inertes,
    problemas,
    slots: resultado.slots,
  };
}

export function definirNivel(ficha: FichaPersistida, nivel: number): FichaPersistida {
  if (ficha.identidade.classe === 'Sobrevivente') {
    return { ...ficha, progressao: { ...ficha.progressao, estagio: nivel } };
  }
  return { ...ficha, progressao: { ...ficha.progressao, nex: nivel } };
}
