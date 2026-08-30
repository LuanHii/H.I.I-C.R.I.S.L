import type { Personagem, Patente, Poder } from '../types';
import { PODERES } from '../../data/character/powers';
import { TRILHAS } from '../../data/character/tracks';
import { ORIGENS } from '../../data/character/origins';
import { getPatenteConfig, calcularCarga, listarEventosNex } from '../../logic/rulesEngine';
import { buildFicha, type BuildResultado } from './buildFicha';
import type { FichaPersistida, PoderDerivado } from './tipos';

/**
 * Renderiza o documento v2 no tipo de VIEW (`Personagem`).
 *
 * `Personagem` continua existindo e nenhum componente muda de assinatura — o que
 * muda é que ele deixa de ser a fonte da verdade e passa a ser saída.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * A FRONTEIRA, explícita, porque é ela que carrega o risco desta virada
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * O motor novo POSSUI (sobrescreve, ignorando o que houver no v0):
 *   identidade e progressão, atributos, perícias e periciasDetalhadas, PV/PE/SAN/PD,
 *   defesa, deslocamento, trilha, afinidade, patente, pp, poderes, limiteItens,
 *   carga, e os seis contadores de pendência.
 *
 * O motor novo NÃO possui — é CARREGADO do v0 sem interpretação:
 *   equipamentos, rituais, proficiências, efeitosAtivos, log, marcas, bonus,
 *   ativo, usarPd, qtdTranscender, eventosNex desbloqueados.
 *
 * Rituais estão do lado carregado de propósito: o motor ainda não deriva os três
 * rituais iniciais do Ocultista (`nexEventos` dá 4 eventos e o de NEX 5% nunca
 * dispara, então a ficha nasce com zero). Derivá-los aqui pela metade apagaria
 * os rituais reais das fichas do mestre — carregar preserva.
 *
 * Esta lista tem teste que a enumera campo a campo. Sem isso, "virar a leitura"
 * seria um salto de fé: qualquer campo esquecido some da ficha em silêncio no
 * instante em que a chave vira.
 */

/**
 * Encontra a descrição do poder — catálogo, trilha, origem, nesta ordem.
 *
 * O último caso devolve o nome com descrição vazia em vez de omitir a entrada:
 * um poder que a view não sabe descrever ainda é um poder que o personagem tem,
 * e sumir com ele seria a perda silenciosa que este plano persegue.
 */
function materializar(derivado: PoderDerivado): Poder {
  const doCatalogo = PODERES.find(
    (p) => p.nome === derivado.nome || (p.apelidos ?? []).includes(derivado.nome),
  );
  if (doCatalogo) {
    return { ...doCatalogo, ...notaDeEscolha(derivado) } as Poder;
  }

  const proc = derivado.provenancia;

  if (proc.kind === 'trilha') {
    const trilha = TRILHAS.find((t) => t.nome === proc.trilha);
    const hab = trilha?.habilidades.find((h) => h.nome === derivado.nome);
    if (hab && trilha) {
      return {
        nome: hab.nome,
        descricao: hab.descricao,
        tipo: 'Trilha',
        livro: trilha.livro,
        ...notaDeEscolha(derivado),
      } as Poder;
    }
  }

  if (proc.kind === 'origem') {
    const origem = ORIGENS.find((o) => o.nome === proc.origem);
    if (origem) {
      return {
        nome: origem.poder.nome,
        descricao: origem.poder.descricao,
        tipo: 'Origem',
        livro: origem.livro,
      } as Poder;
    }
  }

  return { nome: derivado.nome, descricao: '', tipo: 'Classe', livro: 'Regras Básicas' } as Poder;
}

/**
 * A escolha interna aparece na descrição para o mestre LER, mas o dado de
 * verdade vive em `escolhas`, estruturado.
 *
 * É a diferença central em relação ao motor antigo, que concatena
 * `[Escolha: X]` na descrição e depois tenta recuperar o valor com regex — o
 * mesmo regex que o level-down usa para descobrir o que remover.
 */
/**
 * A escolha interna vai para a view em DOIS lugares, e os dois são necessários.
 *
 *  - `escolhaInterna`: campo estruturado, o único que outro código pode LER.
 *    É dele que `elementoEfetivo` tira o elemento de Aprender Ritual
 *    ("Este poder conta como um poder do elemento do ritual escolhido",
 *    Ordem:4156). Sem ele a contagem de elemento fica sem dado.
 *  - `descricao`: só exibição, para o mestre ver a escolha no card do poder.
 *
 * Antes daqui existia apenas a segunda. Era o mesmo defeito que o motor antigo
 * tem em `levelUp.ts:503` — a escolha concatenada numa string de UI, e o resto
 * do sistema descobrindo-a por regex. Um `Escolha:` reescrito na tradução ou na
 * exibição levava a regra embora com ele.
 */
function notaDeEscolha(derivado: PoderDerivado): { descricao?: string; escolhaInterna?: string } {
  if (!derivado.escolhaInterna) return {};
  const base = PODERES.find((p) => p.nome === derivado.nome)?.descricao ?? '';
  return {
    escolhaInterna: derivado.escolhaInterna,
    descricao: `${base}\n\nEscolha: ${derivado.escolhaInterna}`.trim(),
  };
}

export interface RenderInput {
  ficha: FichaPersistida;
  /**
   * A ficha v0, usada APENAS como portadora do que o motor novo não modela.
   * Nenhum campo derivado é lido daqui — ver a lista no topo.
   */
  carregarDe: Personagem;
  /** Build já pronto, para não recalcular quando quem chama já tem um. */
  build?: BuildResultado;
}

export function paraPersonagem({ ficha, carregarDe, build }: RenderInput): Personagem {
  const b = build ?? buildFicha({ ficha });
  const { identidade, progressao, sessao, ajustes } = ficha;
  const d = b.derivados;

  const poderes = b.poderes.map(materializar);

  const carga = calcularCarga({
    atributos: b.atributos,
    itens: carregarDe.equipamentos ?? [],
    poderes,
  });

  /*
   * Pendências: DERIVADAS do build, nunca carregadas.
   *
   * Carregar os contadores do v0 aqui ressuscitaria os dois sistemas paralelos
   * de pendência que este plano existe para matar — e um deles tem o bug de
   * `AgentDetailView:338`, que testa `pendenciasNex.length > 0` em vez de
   * não-resolvidas e desabilita quatro modais para sempre depois do primeiro
   * level up. Numa ficha lida do motor novo esse bug simplesmente não existe.
   */
  const porTipo = (kind: string) => b.pendencias.filter((p) => p.slot.kind === kind).length;

  return {
    ...carregarDe,

    // ── identidade e progressão ──────────────────────────────────────────────
    nome: identidade.nome,
    conceito: identidade.conceito,
    classe: identidade.classe,
    origem: identidade.origem,
    nex: identidade.classe === 'Sobrevivente' ? 0 : progressao.nex,
    estagio: identidade.classe === 'Sobrevivente' ? (progressao.estagio ?? 1) : carregarDe.estagio,

    // ── derivados que o motor novo possui ────────────────────────────────────
    atributos: b.atributos,
    pericias: d.graus,
    periciasDetalhadas: d.periciasDetalhadas,
    trilha: b.trilha,
    afinidade: b.afinidade as Personagem['afinidade'],
    patente: b.patente as Patente,
    pp: sessao.pontosPrestigio,
    limiteItens: getPatenteConfig(b.patente as Patente).limiteItens,
    defesa: d.defesa,
    deslocamento: d.deslocamento,
    carga,
    poderes,

    pv: { ...carregarDe.pv, max: d.pv.max, atual: d.pv.atual, machucado: d.pv.machucado },
    pe: { ...carregarDe.pe, max: d.pe.max, atual: d.pe.atual, rodada: d.peRodada },
    san: { ...carregarDe.san, max: d.san.max, atual: d.san.atual, perturbado: d.san.perturbado },
    pd: d.pd,

    /*
     * `overrides` sai como ABSOLUTO derivado do delta, para os componentes que o
     * leem continuarem funcionando. A fonte da verdade é `ajustes.*Delta` — este
     * campo é projeção, não estado.
     */
    overrides: {
      ...(ajustes.pvMaxDelta !== undefined ? { pvMax: d.pv.max } : {}),
      ...(ajustes.peMaxDelta !== undefined ? { peMax: d.pe.max } : {}),
      ...(ajustes.sanMaxDelta !== undefined ? { sanMax: d.san.max } : {}),
      ...(ajustes.defesaDelta !== undefined ? { defesa: d.defesa } : {}),
      ...(ajustes.periciaFixos ? { periciaFixos: ajustes.periciaFixos } : {}),
    },

    // ── pendências derivadas ─────────────────────────────────────────────────
    pontosAtributoPendentes: porTipo('atributo'),
    periciasTreinadasPendentes: 0,
    poderesClassePendentes: porTipo('poderClasse'),
    escolhaTrilhaPendente: porTipo('trilha') > 0,
    habilidadesTrilhaPendentes: [],
    pendenciasNex: [],

    eventosNex: listarEventosNex(identidade.classe === 'Sobrevivente' ? 0 : progressao.nex),
    marcas: sessao.marcas ?? carregarDe.marcas,
  };
}
