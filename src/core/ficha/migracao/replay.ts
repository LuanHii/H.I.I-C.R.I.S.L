import { NEX_EVENTOS } from '../../rules/nexEventos';
import { buildFicha, definirNivel } from '../buildFicha';
import { opcoesPara } from '../opcoes';
import { derivarSlots } from '../slots';
import { nivelDoId } from '../ids';
import type { FichaPersistida } from '../tipos';
import type { FalhaReplay } from './tipos';

function niveisAte(ficha: FichaPersistida): number[] {
  if (ficha.identidade.classe === 'Sobrevivente') {
    const estagio = ficha.progressao.estagio ?? 1;
    return Array.from({ length: estagio }, (_, i) => i + 1);
  }
  const marcos = Array.from(new Set(NEX_EVENTOS.map((e) => e.requisito))).sort((a, b) => a - b);
  const alcancados = marcos.filter((n) => n <= ficha.progressao.nex);
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

    const noTeto = build.problemas.filter((p) => p.codigo === 'atributo_no_teto');
    for (const problema of noTeto) {
      falhas.push({
        nivel,
        codigo: 'atributo_no_teto',
        mensagem: `${problema.mensagem} (marco ${nivel})`,
      });
    }

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
    if (!slot) continue;

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
