import type { Personagem } from '../types';
import { buildFicha } from './buildFicha';
import { paraPersonagem } from './paraPersonagem';
import { replayParaFrente } from './migracao/replay';
import type { FichaPersistida } from './tipos';

/**
 * DE QUAL MOTOR esta ficha é lida — decidido POR DOCUMENTO.
 *
 * A virada é por ficha e não global, e a razão é operacional: com a chave global
 * uma única ficha ruim obriga a reverter a campanha inteira, então a reversão
 * nunca acontece e o mestre convive com a ficha errada. Por documento, a ficha
 * ruim cai sozinha para o v0 e as outras seguem.
 *
 * Três portas, todas fecháveis:
 *
 *  1. **Existe documento v2?** Sem ele, v0. Óbvio, mas é o rollback: apagar o
 *     campo devolve a ficha ao motor antigo, sem migração reversa.
 *  2. **O v2 ainda corresponde ao v0?** `fichaMigradaDe` carimba o `atualizadoEm`
 *     do v0 no momento da conversão. Se o v0 mudou depois, o v2 ficou para trás
 *     e cai — confiar num v2 obsoleto seria mostrar a ficha de ontem.
 *  3. **O round trip passa?** Reverificado AGORA, não lido de um veredito
 *     gravado: o catálogo muda entre versões do app, e uma conversão que era
 *     válida em março pode não ser em julho. `fichaConfirmada` é o único jeito
 *     de passar por aqui com o relatório vermelho, e é decisão explícita do
 *     mestre, registrada no documento.
 */

export type FonteDaFicha = 'v0' | 'v2';

export interface RegistroLegivel {
  personagem: Personagem;
  atualizadoEm: string;
  ficha?: FichaPersistida;
  fichaMigradaDe?: string;
  fichaConfirmada?: boolean;
}

export interface Resolucao {
  personagem: Personagem;
  fonte: FonteDaFicha;
  /** Por que esta fonte, em português — a UI mostra isto ao mestre. */
  motivo: string;
}

/**
 * Resolve qual `Personagem` a UI deve mostrar.
 *
 * NUNCA lança e NUNCA muta. Qualquer falha inesperada cai para o v0 com o motivo
 * registrado: o pior caso de ler do motor novo tem de ser voltar ao motor
 * antigo, nunca uma tela branca no meio da sessão do mestre.
 */
export function resolverPersonagem(registro: RegistroLegivel): Resolucao {
  const v0 = registro.personagem;

  if (!registro.ficha) {
    return { personagem: v0, fonte: 'v0', motivo: 'Ficha ainda não convertida.' };
  }

  if (registro.fichaMigradaDe && registro.fichaMigradaDe !== registro.atualizadoEm) {
    return {
      personagem: v0,
      fonte: 'v0',
      motivo: 'A ficha foi editada depois da conversão; o documento novo ficou para trás. Converta de novo para usá-lo.',
    };
  }

  try {
    const replay = replayParaFrente(registro.ficha);
    if (!replay.ok && !registro.fichaConfirmada) {
      return {
        personagem: v0,
        fonte: 'v0',
        motivo: `A reconstrução falhou em ${replay.falhas.length} ponto(s): ${replay.falhas[0]?.mensagem ?? 'motivo não registrado'}`,
      };
    }

    const build = buildFicha({ ficha: registro.ficha });

    /*
     * O endpoint também é reverificado aqui, não só o caminho.
     *
     * `replayParaFrente` prova que a ficha v2 é internamente legal — mas não que
     * ela ainda corresponde a ESTE v0. As duas perguntas são independentes, e a
     * segunda é a que impede a ficha do mestre de mudar de números sozinha ao
     * abrir. `migrarFicha` faz as duas na conversão; refazê-las na leitura cobre
     * o caso de o catálogo ter mudado entre a conversão e agora.
     */
    const endpoint = compararEndpoint(v0, build);
    if (endpoint.length > 0 && !registro.fichaConfirmada) {
      return {
        personagem: v0,
        fonte: 'v0',
        motivo: `Os números do motor novo não batem mais com a ficha: ${endpoint.join('; ')}. Converta de novo.`,
      };
    }

    /*
     * O motivo tem de refletir AS DUAS portas.
     *
     * A primeira versão olhava só o replay, então uma ficha que passou porque o
     * mestre confirmou por cima de números divergentes exibia "verificada em
     * todos os marcos" — exatamente a garantia que ela não tem. Um selo que
     * mente é pior que selo nenhum.
     */
    const verificada = replay.ok && endpoint.length === 0;
    return {
      personagem: paraPersonagem({ ficha: registro.ficha, carregarDe: v0, build }),
      fonte: 'v2',
      motivo: verificada
        ? 'Lendo do motor novo: números conferidos e reconstrução legal em todos os marcos.'
        : 'Lendo do motor novo por confirmação sua, apesar do relatório com pendências.',
    };
  } catch (erro) {
    /*
     * Queda automática. Este catch é o que torna a virada reversível sem
     * intervenção: um bug no motor novo degrada para o comportamento de antes
     * em vez de derrubar a sessão.
     */
    return {
      personagem: v0,
      fonte: 'v0',
      motivo: `O motor novo falhou ao reconstruir esta ficha (${String(erro)}). Usando a ficha antiga.`,
    };
  }
}

/**
 * Compara os números que os DOIS motores deveriam produzir igual.
 *
 * Só o que ambos derivam. Equipamento, rituais e condições ficam de fora porque
 * o motor novo não os modela — reportá-los como divergência derrubaria toda
 * ficha para o v0 por um motivo que não é divergência nenhuma.
 */
function compararEndpoint(
  v0: Personagem,
  build: ReturnType<typeof buildFicha>,
): string[] {
  const fora: string[] = [];

  const conferir = (rotulo: string, a: unknown, b: unknown) => {
    if (a !== b) fora.push(`${rotulo} ${String(a)}≠${String(b)}`);
  };

  conferir('PV', v0.pv.max, build.derivados.pv.max);
  conferir('PE', v0.pe.max, build.derivados.pe.max);
  conferir('SAN', v0.san.max, build.derivados.san.max);
  for (const atributo of ['AGI', 'FOR', 'INT', 'PRE', 'VIG'] as const) {
    conferir(atributo, v0.atributos[atributo], build.atributos[atributo]);
  }
  return fora;
}

/** Só a fonte, para quem precisa decidir sem pagar o build. */
export function fonteDaFicha(registro: RegistroLegivel): FonteDaFicha {
  return resolverPersonagem(registro).fonte;
}
