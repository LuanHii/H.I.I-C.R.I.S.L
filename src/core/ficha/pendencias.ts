import type { GrauTreinamento, PericiaName } from '../types';
import { buildFicha } from './buildFicha';
import { derivarSlots } from './slots';
import { opcoesPara, type Opcao } from './opcoes';
import { compararIds } from './ids';
import type { FichaPersistida, Pendencia, Slot } from './tipos';

/**
 * A camada que a UI de pendências consome.
 *
 * Existe para que o componente não precise saber montar `ContextoOpcoes` nem
 * lembrar de passar os graus de perícia — esquecer os graus faz todo slot de
 * "grau de treinamento" listar as perícias como inelegíveis, e o mestre veria
 * uma tela de opções todas cinzas sem entender por quê.
 *
 * O contexto é sempre o do NÍVEL DO SLOT, não o da ficha inteira. Pré-requisito
 * em Ordem Paranormal é de aquisição: um poder de NEX 15% tem de ser avaliado
 * contra a ficha como ela estava em NEX 15%, não contra a de hoje. Avaliar
 * contra o estado final deixaria passar escolhas que a ficha não podia ter feito.
 */

export interface PendenciaResolvivel {
  slot: Slot;
  opcoes: Opcao[];
  /** Quantas respostas este slot espera. Perícias promovem várias de uma vez. */
  quantidade: number;
}

/**
 * Escolhas que já valiam quando este slot foi alcançado: todas as que vêm ANTES
 * dele na ordem canônica de ids.
 *
 * Filtrar por `nivelDoId < slot.nivel` — que era o critério anterior — perde os
 * IRMÃOS do mesmo marco. Os três slots de ritual de NEX 5% são o caso limite:
 * cada um ficava cego para as respostas dos outros dois, então o painel oferecia
 * um ritual já escolhido e `registrarEscolha` recusava depois com "Você já
 * conhece este ritual". O mestre clicava numa opção oferecida e tomava erro.
 *
 * `compararIds` já ordena por nível, escala, kind, ordinal e profundidade — é a
 * mesma ordem em que `derivarSlots` percorre os marcos, então usar essa ordem
 * aqui faz a enumeração ver exatamente o estado que a aceitação vai ver.
 */
function escolhasAntesDe(ficha: FichaPersistida, slot: Slot) {
  return ficha.escolhas.filter((e) => compararIds(e.id, slot.id) < 0);
}

function progressaoNoNivel(ficha: FichaPersistida, nivel: number) {
  return ficha.identidade.classe === 'Sobrevivente'
    ? { nex: 0, estagio: nivel }
    : { nex: nivel };
}

function grausNoNivel(
  ficha: FichaPersistida,
  slot: Slot,
): Record<PericiaName, GrauTreinamento> {
  const ate: FichaPersistida = {
    ...ficha,
    progressao: progressaoNoNivel(ficha, slot.nivel),
    escolhas: escolhasAntesDe(ficha, slot),
  };
  return buildFicha({ ficha: ate }).derivados.graus;
}

/** Opções de um slot, avaliadas no nível dele. Inelegíveis vêm COM o motivo. */
export function opcoesDaPendencia(ficha: FichaPersistida, slot: Slot): Opcao[] {
  const ate = derivarSlots(
    ficha.identidade,
    progressaoNoNivel(ficha, slot.nivel),
    escolhasAntesDe(ficha, slot),
  );

  return opcoesPara(slot, {
    identidade: ficha.identidade,
    parcial: ate.estadoFinal,
    graus: grausNoNivel(ficha, slot),
  });
}

/**
 * Todas as pendências da ficha, já com as opções, em ordem de nível.
 *
 * Ordenar por nível não é estética: responder o marco de NEX 10 muda o que está
 * disponível no de 40, então apresentar fora de ordem convida o mestre a
 * escolher com informação incompleta.
 */
export function pendenciasResolviveis(ficha: FichaPersistida): PendenciaResolvivel[] {
  const build = buildFicha({ ficha });
  return build.pendencias
    .slice()
    .sort((a, b) => a.slot.nivel - b.slot.nivel)
    .map((p: Pendencia) => ({
      slot: p.slot,
      opcoes: opcoesDaPendencia(ficha, p.slot),
      quantidade: p.slot.quantidade,
    }));
}

/** Resumo de uma linha, para o card da ficha. */
export function resumoDePendencias(ficha: FichaPersistida): string | null {
  const build = buildFicha({ ficha });
  if (build.pendencias.length === 0) return null;

  const porTipo = new Map<string, number>();
  for (const p of build.pendencias) {
    porTipo.set(p.slot.kind, (porTipo.get(p.slot.kind) ?? 0) + 1);
  }

  const nomes: Record<string, string> = {
    trilha: 'trilha',
    trilhaHabilidade: 'decisão de habilidade',
    poderClasse: 'poder de classe',
    atributo: 'aumento de atributo',
    pericia: 'grau de treinamento',
    afinidade: 'afinidade',
    versatilidade: 'versatilidade',
    ritual: 'ritual',
    poderParanormal: 'poder paranormal',
    escolhaInterna: 'decisão de poder',
  };

  return Array.from(porTipo.entries())
    .map(([kind, n]) => `${n} ${nomes[kind] ?? kind}${n > 1 ? 's' : ''}`)
    .join(', ');
}
