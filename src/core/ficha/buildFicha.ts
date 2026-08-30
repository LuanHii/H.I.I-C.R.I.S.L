import type { Atributos, AtributoKey } from '../types';
/*
 * Importado do motor existente de propósito. Duplicar a Tabela 3.1 aqui
 * recriaria a segunda fonte de verdade que o commit 6 eliminou — e há um teste
 * que falha se uma terceira tabela de limites aparecer.
 */
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

/**
 * `buildFicha` — a função pura que substitui `subirNex`/`rebaixarNex`.
 *
 * Não existe "subir de nível" como operação. Existe `progressao.nex = N` e um
 * rebuild. Consequências estruturais, não por esforço:
 *
 *  - **Level-down é atribuição de campo.** Nada é removido; escolhas acima do
 *    nível simplesmente não geram slot e voltam como inertes.
 *  - **Idempotência.** Buildar duas vezes dá o mesmo resultado, porque não há
 *    mutação de delta em cima do estado anterior.
 *  - **Salto ≡ passos.** Um build em NEX 99 percorre os mesmos marcos que 19
 *    builds sucessivos, na mesma ordem. O motor antigo viola isso.
 *
 * Esta é a versão de commit 9: derivação de atributos, perícias promovidas e
 * saldo de recursos. As etapas de poderes/rituais/derivados completos entram
 * junto com `opcoes.ts` e `registrarEscolha.ts`.
 */

export interface BuildInput {
  ficha: FichaPersistida;
}

export interface BuildResultado {
  /** Atributos com os aumentos por NEX aplicados. */
  atributos: Atributos;
  /** Nível efetivo: NEX para agentes, estágio para sobreviventes. */
  nivel: number;
  trilha?: string;
  afinidade?: string;
  /**
   * Lista COMPLETA de poderes, com procedência: origem, habilidade automática de
   * classe, habilidade de trilha, escolha de slot e manuais do mestre.
   *
   * Completa é requisito, não luxo: é esta lista que o wizard de migração põe
   * lado a lado com a do v0. Uma lista parcial faria toda conversão parecer
   * perda de poderes.
   */
  poderes: PoderDerivado[];
  rituais: string[];
  patente: string;
  /** Obrigações sem resposta. DERIVADA — nunca persistida. */
  pendencias: Pendencia[];
  /** Escolhas acima do nível, retidas. */
  escolhasInertes: Escolha[];
  problemas: Problema[];
  slots: Slot[];
  /** Números da ficha: perícias, PV/PE/SAN, patente. */
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

  /*
   * Poderes que o mestre adicionou à mão entram na ficha como `manual`.
   *
   * É o outro lado do "nada é descartado" do conversor: o que ele não conseguiu
   * casar com slot vai para `ajustes.poderesManuais`, e se o build ignorasse
   * esse campo o poder sumiria da view — perda silenciosa exatamente onde o
   * plano exige relatório.
   */
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

/**
 * Muda o nível. Não é "subir" nem "rebaixar" — é atribuição e rebuild.
 *
 * O motor antigo tem duas estratégias opostas no mesmo arquivo: `subirNex` soma
 * deltas, `rebaixarNex` atribui absolutos. Aqui não há caminho de ida e volta
 * para divergir.
 */
export function definirNivel(ficha: FichaPersistida, nivel: number): FichaPersistida {
  if (ficha.identidade.classe === 'Sobrevivente') {
    return { ...ficha, progressao: { ...ficha.progressao, estagio: nivel } };
  }
  return { ...ficha, progressao: { ...ficha.progressao, nex: nivel } };
}
