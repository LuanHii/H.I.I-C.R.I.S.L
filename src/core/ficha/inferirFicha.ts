import type { AtributoKey, Atributos, PericiaName, Personagem } from '../types';
import { CLASSES } from '../../data/character/classes';
import { ORIGENS } from '../../data/character/origins';
import { NEX_EVENTOS } from '../rules/nexEventos';
import { TRILHAS } from '../../data/character/tracks';
import { PODERES } from '../../data/character/powers';
import { buildFicha } from './buildFicha';
import { nomesAutomaticos } from './automaticos';
import { circuloMaximoPorNivel } from './opcoes';
import { RITUAIS } from '../../data/magic/rituals';
import { chaveEstagio, chaveNex, montarId, ordenarPorId } from './ids';
import { getPatenteConfig } from '../../logic/rulesEngine';
import type { Escolha, FichaPersistida, Problema, ValorEscolha } from './tipos';

/**
 * Conversor v0 → v2, por INFERÊNCIA.
 *
 * Documentos v0 não têm log de escolhas: o motor antigo grava o resultado e
 * descarta a decisão. Então o log precisa ser reconstruído a partir do que
 * sobrou — trilha, afinidade, atributos finais, lista de poderes.
 *
 * Duas regras que governam tudo aqui:
 *
 *  - **Nada é descartado.** O que não dá para inferir vira `ajustes` ou
 *    `Problema`, nunca perda silenciosa.
 *  - **Nunca lança.** Ficha corrompida tem de virar relatório; um `throw` no
 *    meio de uma migração em lote perde o resto do lote.
 *
 * Ambiguidade INERTE é auto-aceita. Qual marco de NEX concedeu qual ponto de
 * atributo não muda número derivado nem slot futuro — só o total importa. Já
 * ambiguidade MATERIAL (um poder que não casa com slot nenhum) é reportada.
 */

export type Confianca = 'alta' | 'media' | 'baixa';

export interface EscolhaInferida extends Escolha {
  confianca: Confianca;
  /** Como foi inferida, para o wizard exibir. */
  nota: string;
}

export interface ResultadoInferencia {
  ficha: FichaPersistida;
  inferidas: EscolhaInferida[];
  problemas: Problema[];
  /** True se o build da ficha inferida reproduz os números do v0. */
  roundTripOk: boolean;
  divergencias: string[];
}

const ATRIBUTOS: AtributoKey[] = ['AGI', 'FOR', 'INT', 'PRE', 'VIG'];

/**
 * Habilidades que a classe concede AUTOMATICAMENTE, sem gastar slot de escolha.
 *
 * Vem da MESMA tabela que o motor usa para concedê-las (`automaticos.ts`). Já
 * foi uma lista escrita à mão aqui, e uma segunda cópia dessa lista é
 * exatamente o tipo de divergência que este plano existe para eliminar: bastaria
 * alguém corrigir um lado.
 */
const HABILIDADES_AUTOMATICAS = nomesAutomaticos();

/** Marcos de atributo alcançados até o NEX dado. */
function marcosDeAtributo(nex: number): number[] {
  return NEX_EVENTOS
    .filter((e) => e.tipo === 'Atributo' && e.requisito <= nex)
    .map((e) => e.requisito)
    .sort((a, b) => a - b);
}

/**
 * Reconstrói `atributosBase` e as escolhas de aumento.
 *
 * Não há como saber qual marco subiu qual atributo — e não precisa: o total é o
 * que aparece na ficha. A distribuição escolhida aqui é DETERMINÍSTICA (maiores
 * primeiro, empate pela ordem fixa dos atributos), de modo que reconverter a
 * mesma ficha dá sempre o mesmo log.
 */
function inferirAtributos(
  atributosFinais: Atributos,
  nex: number,
): { base: Atributos; escolhas: EscolhaInferida[] } {
  const marcos = marcosDeAtributo(nex);
  const base: Atributos = { ...atributosFinais };
  const escolhas: EscolhaInferida[] = [];

  for (const marco of marcos) {
    // Maior valor primeiro; empate pela ordem fixa. Nunca desce abaixo de 1.
    const candidato = [...ATRIBUTOS]
      .sort((a, b) => (base[b] - base[a]) || (ATRIBUTOS.indexOf(a) - ATRIBUTOS.indexOf(b)))
      .find((a) => base[a] > 1);

    if (!candidato) continue;

    base[candidato] -= 1;
    escolhas.push({
      id: montarId('atributo', chaveNex(marco)),
      valor: { tipo: 'atributo', atributo: candidato },
      confianca: 'media',
      nota: `Marco de NEX ${marco}%: qual atributo subiu não é registrado no v0. Distribuição inferida do total final.`,
    });
  }

  return { base, escolhas };
}

/** Perícias treinadas que não vêm das obrigatórias da classe. */
function inferirPericiasLivres(personagem: Personagem): PericiaName[] {
  const obrigatorias = new Set(CLASSES[personagem.classe].periciasObrigatorias);
  return (Object.entries(personagem.pericias) as [PericiaName, string][])
    .filter(([nome, grau]) => grau !== 'Destreinado' && !obrigatorias.has(nome))
    .map(([nome]) => nome);
}

export function inferirFicha(personagem: Personagem): ResultadoInferencia {
  const problemas: Problema[] = [];
  const inferidas: EscolhaInferida[] = [];

  const ehSobrevivente = personagem.classe === 'Sobrevivente';
  const nivel = ehSobrevivente ? (personagem.estagio ?? 1) : personagem.nex;

  // ── atributos ─────────────────────────────────────────────────────────────
  const { base, escolhas: escolhasAtributo } = ehSobrevivente
    ? { base: personagem.atributos, escolhas: [] as EscolhaInferida[] }
    : inferirAtributos(personagem.atributos, personagem.nex);
  inferidas.push(...escolhasAtributo);

  // ── trilha e afinidade: confiança alta, estão gravadas ─────────────────────
  if (personagem.trilha) {
    const existe = TRILHAS.some((t) => t.nome === personagem.trilha);
    if (existe) {
      inferidas.push({
        id: montarId('trilha', ehSobrevivente ? chaveEstagio(2) : chaveNex(10)),
        valor: { tipo: 'trilha', trilha: personagem.trilha },
        confianca: 'alta',
        nota: 'Trilha estava gravada na ficha.',
      });
    } else {
      problemas.push({
        gravidade: 'aviso',
        codigo: 'trilha_desconhecida',
        mensagem: `A trilha "${personagem.trilha}" não existe no catálogo. Mantida como ajuste manual.`,
      });
    }
  }

  if (personagem.afinidade && !ehSobrevivente && personagem.nex >= 50) {
    inferidas.push({
      id: montarId('afinidade', chaveNex(50)),
      valor: { tipo: 'afinidade', elemento: personagem.afinidade },
      confianca: 'alta',
      nota: 'Afinidade estava gravada na ficha.',
    });
  }

  // ── poderes: particionados em ordem, cada match consumindo a entrada ───────
  const naoAtribuidos: string[] = [];
  const slotsPoder = NEX_EVENTOS
    .filter((e) => e.tipo === 'Poder' && e.requisito <= nivel)
    .map((e) => e.requisito)
    .sort((a, b) => a - b);

  let proximoSlot = 0;

  /*
   * Habilidades da trilha DO PERSONAGEM, até o nível dele — e só essas.
   *
   * Antes o filtro era por nome contra TODAS as trilhas do catálogo, o que
   * descartava em silêncio uma habilidade de trilha alheia: nem slot, nem
   * `poderesManuais`, nem problema. Some da ficha e nenhum número denuncia,
   * porque metade dessas habilidades não tem efeito mecânico.
   *
   * E isso acontece de verdade: "Multifacetado" (Agente Secreto, NEX 99%)
   * concede habilidades de outra trilha, e o mestre adiciona habilidades à mão.
   * Foi a comparação de poderes do shadow mode que expôs o caso — os números
   * batiam perfeitamente.
   */
  const trilhaDoPersonagem = TRILHAS.find((t) => t.nome === personagem.trilha);
  const habilidadesProprias = new Set(
    (trilhaDoPersonagem?.habilidades ?? [])
      .filter((h) => h.nex <= nivel)
      .map((h) => h.nome),
  );
  const origemCatalogo = ORIGENS.find((o) => o.nome === personagem.origem);
  const origemPoder = personagem.poderes.find(
    (p) => p.tipo === 'Origem' || p.nome === origemCatalogo?.poder.nome,
  )?.nome;
  const temPoderDeOrigem = origemPoder !== undefined;

  for (const poder of personagem.poderes) {
    // O motor novo concede estes automaticamente; não consomem slot de escolha.
    if (poder.tipo === 'Origem' || poder.nome === origemPoder) continue;
    if (habilidadesProprias.has(poder.nome)) continue;
    if (HABILIDADES_AUTOMATICAS.has(poder.nome)) continue;

    const noCatalogo = PODERES.find((p) => p.nome === poder.nome || (p.apelidos ?? []).includes(poder.nome));
    if (!noCatalogo) {
      naoAtribuidos.push(poder.nome);
      continue;
    }

    if (proximoSlot >= slotsPoder.length) {
      naoAtribuidos.push(poder.nome);
      continue;
    }

    const marco = slotsPoder[proximoSlot];
    proximoSlot += 1;
    inferidas.push({
      id: montarId('poderClasse', chaveNex(marco)),
      valor: { tipo: 'poder', poder: noCatalogo.nome },
      confianca: 'media',
      nota: `Atribuído ao slot de poder mais cedo disponível (NEX ${marco}%). O v0 não registra em qual marco foi escolhido.`,
    });
  }

  for (const nome of naoAtribuidos) {
    problemas.push({
      gravidade: 'aviso',
      codigo: 'poder_sem_slot',
      mensagem: `"${nome}" não casou com nenhum slot. Mantido em ajustes.poderesManuais — nada foi descartado.`,
    });
  }

  // ── rituais: MAIS RESTRITO PRIMEIRO ───────────────────────────────────────
  /*
   * A ordem importa e não é estética. Um ritual de 4º círculo só pode ter vindo
   * do marco de NEX 85; um de 1º cabe em qualquer marco. Atribuindo do mais
   * folgado para o mais restrito, os de 1º círculo ocupam os marcos altos e
   * sobra o de 4º sem lugar — uma lacuna inventada pela ordem de processamento.
   *
   * Descendo por círculo, cada ritual pega o slot mais CEDO que o acomoda, e os
   * restritos encontram os marcos altos livres.
   */
  const inferidasDeRitual: EscolhaInferida[] = [];
  if (personagem.classe === 'Ocultista') {
    const escadaRitual = [...Array.from({ length: 19 }, (_, i) => (i + 1) * 5), 99]
      .filter((n) => n <= nivel);

    // Capacidade por marco: três em NEX 5%, um nos demais.
    const vagas: { nivel: number; ordinal: number }[] = escadaRitual.flatMap((n) =>
      Array.from({ length: n === 5 ? 3 : 1 }, (_, ordinal) => ({ nivel: n, ordinal })),
    );

    const doPersonagem = (personagem.rituais ?? [])
      .map((r) => RITUAIS.find((c) => c.nome === r.nome) ?? r)
      .slice()
      .sort((a, b) => (b.circulo ?? 1) - (a.circulo ?? 1));

    const usadas = new Set<string>();
    for (const ritual of doPersonagem) {
      const circulo = ritual.circulo ?? 1;
      const vaga = vagas.find(
        (v) => !usadas.has(`${v.nivel}#${v.ordinal}`) && circuloMaximoPorNivel(v.nivel) >= circulo,
      );
      if (!vaga) {
        naoAtribuidos.push(`Ritual: ${ritual.nome}`);
        continue;
      }
      usadas.add(`${vaga.nivel}#${vaga.ordinal}`);
      inferidasDeRitual.push({
        id: montarId('ritual', chaveNex(vaga.nivel), vaga.ordinal),
        valor: { tipo: 'ritual', ritual: ritual.nome },
        confianca: 'media',
        nota: `Atribuído ao marco de NEX ${vaga.nivel}% — o mais cedo que aceita um ritual de ${circulo}º círculo. O v0 não registra quando foi aprendido.`,
      });
    }
    inferidas.push(...inferidasDeRitual);
  }

  // ── ajustes: overrides absolutos viram DELTA ───────────────────────────────
  const ficha: FichaPersistida = {
    versao: 2,
    identidade: {
      nome: personagem.nome,
      conceito: personagem.conceito,
      classe: personagem.classe,
      origem: personagem.origem,
      atributosBase: base,
      periciasLivres: inferirPericiasLivres(personagem),
      /*
       * O sobrevivente pode ter trocado o poder de origem por perícias. Não há
       * campo no v0 que registre a decisão, mas a EVIDÊNCIA está na ficha: se o
       * poder de origem não está na lista, ele optou pelas perícias.
       *
       * Inferir do resíduo, e não presumir, é o que impede o build de conceder
       * um poder que o personagem nunca teve.
       */
      beneficioOrigem: temPoderDeOrigem ? 'ambos' : 'pericias',
    },
    progressao: ehSobrevivente
      ? { nex: 0, estagio: nivel }
      : { nex: personagem.nex },
    escolhas: ordenarPorId(inferidas.map(({ id, valor }) => ({ id, valor } as Escolha))),
    sessao: {
      pvDano: Math.max(0, personagem.pv.max - personagem.pv.atual),
      peGasto: Math.max(0, personagem.pe.max - personagem.pe.atual),
      sanPerdida: Math.max(0, personagem.san.max - personagem.san.atual),
      /*
       * Fichas v0 não têm `pp` — a patente era derivada do NEX. Semear o PP com
       * o mínimo da patente gravada preserva a patente que o mestre vê.
       *
       * Sem isto, TODA ficha antiga com patente acima de Recruta divergia. Foi o
       * shadow mode sobre fichas reais que apontou: "patente v0=Operador
       * v2=Recruta". A mesma regra já existia em `normalizePersonagem`; faltava
       * replicar aqui.
       */
      pontosPrestigio: personagem.pp
        ?? getPatenteConfig(personagem.patente ?? 'Recruta').ppMin,
      marcas: personagem.marcas,
    },
    ajustes: {
      periciaFixos: personagem.overrides?.periciaFixos,
      poderesManuais: naoAtribuidos.length > 0 ? naoAtribuidos : undefined,
    },
  };

  /*
   * Overrides absolutos → delta.
   *
   * `pvMaxDelta = pvMaxGuardado - pvMaxDerivado` preserva o número que o mestre
   * vê hoje E devolve o crescimento por NEX, que o absoluto congelava.
   */
  const semAjuste = buildFicha({ ficha });
  const deltas: Record<string, number | undefined> = {
    pvMaxDelta: personagem.overrides?.pvMax === undefined
      ? undefined : personagem.overrides.pvMax - semAjuste.derivados.pv.max,
    peMaxDelta: personagem.overrides?.peMax === undefined
      ? undefined : personagem.overrides.peMax - semAjuste.derivados.pe.max,
    sanMaxDelta: personagem.overrides?.sanMax === undefined
      ? undefined : personagem.overrides.sanMax - semAjuste.derivados.san.max,
  };
  for (const [chave, valor] of Object.entries(deltas)) {
    if (valor !== undefined && valor !== 0) {
      (ficha.ajustes as Record<string, unknown>)[chave] = valor;
    }
  }

  // ── round-trip: o build reproduz os números do v0? ─────────────────────────
  const final = buildFicha({ ficha });
  const divergencias: string[] = [];

  const comparar = (rotulo: string, v0: number, v2: number) => {
    if (v0 !== v2) divergencias.push(`${rotulo}: v0=${v0} v2=${v2}`);
  };
  comparar('pv.max', personagem.pv.max, final.derivados.pv.max);
  comparar('pe.max', personagem.pe.max, final.derivados.pe.max);
  comparar('san.max', personagem.san.max, final.derivados.san.max);

  for (const atributo of ATRIBUTOS) {
    comparar(`atributo.${atributo}`, personagem.atributos[atributo], final.atributos[atributo]);
  }

  return {
    ficha,
    inferidas,
    problemas,
    roundTripOk: divergencias.length === 0,
    divergencias,
  };
}
