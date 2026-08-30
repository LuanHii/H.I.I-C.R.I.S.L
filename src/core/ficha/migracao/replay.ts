import { NEX_EVENTOS } from '../../rules/nexEventos';
import { buildFicha, definirNivel } from '../buildFicha';
import { opcoesPara } from '../opcoes';
import { derivarSlots } from '../slots';
import { nivelDoId } from '../ids';
import type { FichaPersistida } from '../tipos';
import type { FalhaReplay } from './tipos';

/**
 * REPLAY PARA FRENTE — a salvaguarda que decide se a conversão é segura.
 *
 * Round trip numérico não basta, e a razão não é sutil: ele é **cego a causa mal
 * atribuída**. VIG-base um acima e o aumento de NEX 20% um abaixo produzem
 * exatamente o mesmo `pv.max` no fim, e um futuro diferente — o personagem
 * evolui errado a partir do próximo marco, sem que nada nunca acuse.
 *
 * O que distingue as duas hipóteses é o CAMINHO, não o destino. Então aqui a
 * ficha convertida é reconstruída marco a marco desde o primeiro, e cada estado
 * intermediário tem de ser legal. Má atribuição aparece como ilegalidade no
 * meio: um atributo estourando o teto num marco anterior, um poder cujo
 * pré-requisito não estava satisfeito no NEX em que foi atribuído, um recurso
 * que diminui ao subir de nível.
 *
 * Nunca lança: toda falha vira `FalhaReplay`.
 */

/** Níveis legais até o nível da ficha, em ordem ascendente. */
function niveisAte(ficha: FichaPersistida): number[] {
  if (ficha.identidade.classe === 'Sobrevivente') {
    const estagio = ficha.progressao.estagio ?? 1;
    return Array.from({ length: estagio }, (_, i) => i + 1);
  }
  const marcos = Array.from(new Set(NEX_EVENTOS.map((e) => e.requisito))).sort((a, b) => a - b);
  const alcancados = marcos.filter((n) => n <= ficha.progressao.nex);
  // NEX 5% não é marco de evento, mas é o ponto de partida de toda ficha.
  return Array.from(new Set([5, ...alcancados])).sort((a, b) => a - b);
}

export function replayParaFrente(ficha: FichaPersistida): {
  ok: boolean;
  falhas: FalhaReplay[];
} {
  const falhas: FalhaReplay[] = [];

  let pvAnterior = -Infinity;
  let peAnterior = -Infinity;
  let sanAnterior = -Infinity;

  for (const nivel of niveisAte(ficha)) {
    let build;
    try {
      build = buildFicha({ ficha: definirNivel(ficha, nivel) });
    } catch (erro) {
      falhas.push({
        nivel,
        codigo: 'excecao_no_build',
        mensagem: `O build falhou neste marco: ${String(erro)}`,
      });
      // Sem estado, os marcos seguintes não têm o que comparar.
      return { ok: false, falhas };
    }

    for (const problema of build.problemas) {
      if (problema.gravidade !== 'erro') continue;
      falhas.push({
        nivel,
        codigo: problema.codigo,
        mensagem: `${problema.mensagem} (detectado no marco ${nivel})`,
      });
    }

    /*
     * Teto de atributo NO CAMINHO, não só no fim.
     *
     * Uma distribuição pode terminar legal e passar por ilegal: se a inferência
     * põe dois aumentos cedo num atributo que já estava no teto, o total final
     * fecha e o meio não. `buildFicha` reporta isso como `atributo_no_teto`.
     */
    const noTeto = build.problemas.filter((p) => p.codigo === 'atributo_no_teto');
    for (const problema of noTeto) {
      falhas.push({
        nivel,
        codigo: 'atributo_no_teto',
        mensagem: `${problema.mensagem} (marco ${nivel})`,
      });
    }

    /*
     * Recurso nunca encolhe ao subir de nível. Se encolheu, a atribuição de
     * atributo a marcos está errada — é o sintoma direto de causa trocada.
     */
    const { pv, pe, san } = build.derivados;
    if (pv.max < pvAnterior) {
      falhas.push({ nivel, codigo: 'recurso_regrediu', mensagem: `PV máximo caiu de ${pvAnterior} para ${pv.max} ao chegar em ${nivel}.` });
    }
    if (pe.max < peAnterior) {
      falhas.push({ nivel, codigo: 'recurso_regrediu', mensagem: `PE máximo caiu de ${peAnterior} para ${pe.max} ao chegar em ${nivel}.` });
    }
    if (san.max < sanAnterior) {
      falhas.push({ nivel, codigo: 'recurso_regrediu', mensagem: `Sanidade máxima caiu de ${sanAnterior} para ${san.max} ao chegar em ${nivel}.` });
    }
    pvAnterior = pv.max;
    peAnterior = pe.max;
    sanAnterior = san.max;
  }

  falhas.push(...verificarRequisitosDeAquisicao(ficha));

  return { ok: falhas.length === 0, falhas };
}

/**
 * Todo poder escolhido era elegível NO NEX EM QUE FOI ESCOLHIDO?
 *
 * Pré-requisito em Ordem Paranormal é de AQUISIÇÃO: vale o estado no momento da
 * escolha, não o final. Um poder atribuído a um slot cedo demais passa pela
 * checagem final e falha aqui — que é exatamente a má atribuição que o conversor
 * pode cometer ao encaixar poderes no "slot mais cedo viável".
 */
function verificarRequisitosDeAquisicao(ficha: FichaPersistida): FalhaReplay[] {
  const falhas: FalhaReplay[] = [];

  let resultado;
  try {
    resultado = derivarSlots(ficha.identidade, ficha.progressao, ficha.escolhas);
  } catch (erro) {
    return [{ nivel: 0, codigo: 'excecao_nos_slots', mensagem: String(erro) }];
  }

  for (const escolha of ficha.escolhas) {
    const valor = escolha.valor;
    if (valor.tipo !== 'poder') continue;

    const slot = resultado.slots.find((s) => s.id === escolha.id);
    if (!slot) continue; // órfã: já reportada como problema pelo build.

    /*
     * O contexto é o do NÍVEL DO SLOT: reconstrói-se a ficha até ali e
     * pergunta-se ao enumerador se o poder estava disponível. Usar o estado
     * final aqui tornaria o teste vazio — no fim, tudo é elegível.
     */
    const ate = derivarSlots(
      ficha.identidade,
      ficha.identidade.classe === 'Sobrevivente'
        ? { nex: 0, estagio: slot.nivel }
        : { nex: slot.nivel },
      ficha.escolhas.filter((e) => (nivelDoId(e.id) ?? 0) < slot.nivel),
    );

    const opcoes = opcoesPara(slot, { identidade: ficha.identidade, parcial: ate.estadoFinal });
    const escolhido = opcoes.find(
      (o) => o.valor.tipo === 'poder' && o.valor.poder === valor.poder,
    );

    if (!escolhido) {
      falhas.push({
        nivel: slot.nivel,
        codigo: 'poder_fora_da_lista',
        mensagem: `"${valor.poder}" não está na lista do marco ${slot.nivel}%.`,
      });
      continue;
    }
    if (!escolhido.elegivel) {
      falhas.push({
        nivel: slot.nivel,
        codigo: 'requisito_nao_satisfeito',
        mensagem: `"${valor.poder}" atribuído ao marco ${slot.nivel}%, onde ainda não era elegível: ${escolhido.motivos.join('; ')}`,
      });
    }
  }

  return falhas;
}
