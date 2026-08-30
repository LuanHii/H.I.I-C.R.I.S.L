import type { ClasseName } from '../types';
import { NEX_EVENTOS } from '../rules/nexEventos';
import { TRILHAS } from '../../data/character/tracks';
import { ORIGENS } from '../../data/character/origins';
import { PODERES } from '../../data/character/powers';
import { habilidadesAutomaticas } from './automaticos';
import { chaveEstagio, chaveNex, montarId, montarIdFilho, ordenarPorId, paiDoId } from './ids';
import type {
  ChaveNivel,
  Escolha,
  EscolhaId,
  FichaIdentidade,
  PoderDerivado,
  Progressao,
  Slot,
  SlotKind,
} from './tipos';

/**
 * `derivarSlots` é o coração do motor novo — e é um FOLD, não um filter.
 *
 * Percorre os marcos em ordem ascendente; em cada um emite os slots daquele
 * nível, aplica imediatamente as respostas correspondentes, e segue com o
 * estado parcial atualizado. Isso é o que faz a dependência funcionar: o slot
 * de `trilhaHabilidade` em NEX 40 só existe PORQUE `trilha@nex:10#0` foi
 * respondido dois marcos antes.
 *
 * O motor antigo filtra marcos independentemente, e é por isso que
 * `subirNex(ficha, 99)` num salto difere de 19 subidas de 5% — o salto não vê
 * as escolhas intermediárias.
 */

/** Estado parcial acumulado durante o fold. */
export interface EstadoParcial {
  nivel: number;
  trilha?: string;
  /** Habilidades de trilha já concedidas, por nível. */
  habilidadesTrilha: Map<number, string>;
  afinidade?: string;
  /**
   * TODOS os poderes da ficha, com procedência — não só os escolhidos.
   *
   * Antes daqui só saíam os poderes vindos de escolha, o que fazia
   * `buildFicha` devolver um personagem sem poder de origem, sem habilidade de
   * classe e sem habilidade de trilha. Para o motor isolado isso era inofensivo;
   * para o wizard de migração seria fatal — o painel "reconstruído" mostraria a
   * ficha perdendo poderes, e o mestre recusaria a conversão com razão.
   */
  poderes: PoderDerivado[];
  rituais: string[];
  atributosGanhos: string[];
}

/** Só os nomes — atalho para os call sites que não precisam da procedência. */
export function nomesDosPoderes(estado: EstadoParcial): string[] {
  return estado.poderes.map((p) => p.nome);
}

export interface ResultadoSlots {
  slots: Slot[];
  /** Estado ao fim do fold — usado pelas etapas de derivação. */
  estadoFinal: EstadoParcial;
  /** Escolhas cujo nível está acima da progressão atual. Retidas, não descartadas. */
  inertes: Escolha[];
  /** Escolhas que não correspondem a nenhum slot emitido. */
  orfas: Escolha[];
}

/** Quantas perícias o marco de "grau de treinamento" promove. */
function quantidadePericiasPromovidas(classe: ClasseName, intelecto: number): number {
  // Combatente e Ocultista: 2 + Int. Especialista: 5 + Int.
  const base = classe === 'Especialista' ? 5 : 2;
  return Math.max(0, base + intelecto);
}

/**
 * Marcos que só existem para certas classes.
 *
 * `Ritual` é "Escolhido pelo Outro Lado", habilidade exclusiva do Ocultista
 * (Tabela 1.5, NEX 5/25/55/85).
 *
 * `Afinidade` NÃO é exclusiva. O Capítulo 5 é explícito: "Quando você atinge
 * NEX 50%... Escolha um elemento entre Conhecimento, Energia, Morte ou Sangue."
 * É regra geral de exposição paranormal, não habilidade de classe. O motor
 * antigo restringe ao Ocultista, e o plano já apontava isso como bug.
 */
function marcoSeAplica(tipo: string, classe: ClasseName): boolean {
  /*
   * `Ritual` sai daqui: `NEX_EVENTOS` lista rituais só em 5/25/55/85, que são os
   * marcos de DESBLOQUEIO DE CÍRCULO — não os de aprender ritual. O livro é
   * explícito: "começa com três rituais de 1º círculo. Sempre que avança de NEX,
   * aprende um ritual", ou seja 3 + 19 = 22 em NEX 99%.
   *
   * Confundir as duas coisas é o que faz o Ocultista nascer com zero rituais.
   * A emissão correta está em `emitirSlotsDeRitual`.
   */
  if (tipo === 'Ritual') return false;
  return true;
}

/**
 * Slots de ritual do Ocultista: um por marco de NEX, três no primeiro.
 *
 * Livro de Regras, Ocultista — "Escolhido pelo Outro Lado": *"você começa com
 * três rituais de 1º círculo. Sempre que avança de NEX, aprende um ritual"*.
 * Total em NEX 99%: 3 + 19 = 22.
 *
 * O teto de círculo (1º/2º/3º/4º em NEX 5/25/55/85) é coisa separada, e já vive
 * em `circuloMaximoPorNivel`. Este laço cuida da QUANTIDADE; aquele, do QUE pode
 * ser escolhido.
 */
function niveisDeRitual(nex: number): number[] {
  const escada = [...Array.from({ length: 19 }, (_, i) => (i + 1) * 5), 99];
  return escada.filter((n) => n <= nex);
}

const TIPO_PARA_KIND: Record<string, SlotKind | undefined> = {
  Trilha: 'trilha',
  Poder: 'poderClasse',
  Atributo: 'atributo',
  Pericia: 'pericia',
  Afinidade: 'afinidade',
  Versatilidade: 'versatilidade',
  Ritual: 'ritual',
};

/**
 * Marcos da classe Sobrevivente, que progride por ESTÁGIO e não por NEX
 * (Tabela 1.2: 1 Empenho, 2 Trilha 1ª hab, 3 Aumento de atributo,
 * 4 Trilha 2ª hab, 5 Cicatrizado).
 *
 * O motor antigo guarda estágio no campo `nex` das trilhas de sobrevivente, o
 * que faz essas trilhas nunca dispararem. Aqui a escala é explícita na chave.
 */
const MARCOS_SOBREVIVENTE: { estagio: number; kinds: SlotKind[] }[] = [
  { estagio: 2, kinds: ['trilha'] },
  { estagio: 3, kinds: ['atributo'] },
];

function respostaDe(escolhas: readonly Escolha[], id: EscolhaId): Escolha | undefined {
  return escolhas.find((e) => e.id === id);
}

/** Aplica uma resposta ao estado parcial. Só o que afeta slots futuros. */
/**
 * Grava a decisão interna no poder que a cascata pendura.
 *
 * O alvo é o poder concedido pela escolha PAI, achado por `provenancia.escolhaId`
 * — não por nome. Buscar por nome quebraria em Transcender e Treinamento em
 * Perícia, que são repetíveis: duas cópias do mesmo nome, e a segunda decisão
 * sobrescreveria a primeira.
 */
function gravarEscolhaInterna(estado: EstadoParcial, idFilho: EscolhaId, valor: string): void {
  const pai = paiDoId(idFilho);
  if (!pai) return;
  for (const poder of estado.poderes) {
    const p = poder.provenancia;
    if ('escolhaId' in p && p.escolhaId === pai) poder.escolhaInterna = valor;
  }
}

function aplicar(estado: EstadoParcial, escolha: Escolha, nivel: number): void {
  const v = escolha.valor;
  switch (v.tipo) {
    case 'trilha':
      estado.trilha = v.trilha;
      break;
    case 'versatilidade': {
      /*
       * Concede a PRIMEIRA habilidade de outra trilha, sem tocar em
       * `estado.trilha`. Não mexer na trilha é o ponto: era exatamente isso que
       * fazia o personagem perder a trilha original.
       *
       * PENDENTE DE CONFERÊNCIA NO LIVRO: a semântica "primeira habilidade de
       * uma trilha que não a sua" vem de `opcoes.ts` e não foi verificada contra
       * o texto impresso. O que está verificado é que substituir a trilha está
       * errado em qualquer leitura da regra.
       */
      const outra = TRILHAS.find((t) => t.nome === v.trilha);
      const primeira = outra?.habilidades.find((h) => h.nex === 10 || h.nex === 2);
      if (primeira && !estado.poderes.some((p) => p.nome === primeira.nome)) {
        estado.poderes.push({
          nome: primeira.nome,
          provenancia: { kind: 'versatilidade', nivel, escolhaId: escolha.id },
        });
      }
      break;
    }
    case 'habilidadeTrilha':
      /*
       * A habilidade em si já foi concedida por `concederHabilidadeTrilha` — o
       * livro é explícito em que ela é automática ("você recebe o primeiro poder
       * da trilha escolhida... um novo poder em NEX 40%, 65% e 99%"). O que a
       * escolha carrega é a decisão INTERNA (qual perícia, qual elemento, qual
       * arma), e é só isso que se registra aqui.
       */
      estado.habilidadesTrilha.set(nivel, v.habilidade);
      for (const poder of estado.poderes) {
        if (poder.nome === v.habilidade) poder.escolhaInterna = v.escolhaInterna;
      }
      break;
    case 'afinidade':
      estado.afinidade = v.elemento;
      break;
    case 'poder':
      estado.poderes.push({
        nome: v.poder,
        provenancia: { kind: 'classe', nivel, escolhaId: escolha.id },
      });
      /*
       * Se este slot é cascata (Transcender), o poder concedido também é a
       * escolha interna DE Transcender. O poder novo já entra na ficha por
       * direito próprio — isto é só o rótulo, para o card mostrar
       * "Transcender: Sangue Vivo" em vez de dois poderes sem relação visível.
       *
       * Em slot raiz `paiDoId` é undefined e nada é gravado.
       */
      gravarEscolhaInterna(estado, escolha.id, v.poder);
      break;
    case 'ritual':
      estado.rituais.push(v.ritual);
      /*
       * Se este slot é a cascata de Aprender Ritual, o ritual escolhido também
       * é a escolha interna DO PODER — e é dela que sai o elemento, porque
       * "Este poder conta como um poder do elemento do ritual escolhido"
       * (Ordem:4156). Sem gravar aqui, `elementoEfetivo` fica sem dado e os
       * requisitos "<Elemento> N" nunca são satisfeitos por Aprender Ritual.
       */
      gravarEscolhaInterna(estado, escolha.id, v.ritual);
      break;
    case 'escolhaInterna':
      gravarEscolhaInterna(estado, escolha.id, v.valor);
      break;
    case 'atributo':
      estado.atributosGanhos.push(v.atributo);
      break;
    case 'pericias':
      // Perícias não abrem slots futuros; entram na etapa de derivação.
      break;
  }
}

/**
 * Concede a habilidade de trilha do nível — automaticamente.
 *
 * Devolve a habilidade se ela tiver decisão INTERNA pendente (qual perícia, qual
 * elemento…), porque só nesse caso há um slot a emitir. As outras entram na
 * ficha e pronto: perguntar "qual habilidade de trilha você quer?" seria inventar
 * uma escolha que o livro não oferece — e era o que produzia uma pendência
 * fantasma por marco de trilha em toda ficha.
 */
function concederHabilidadeTrilha(
  estado: EstadoParcial,
  nomeTrilha: string,
  nivel: number,
): { nome: string; temEscolhaInterna: boolean } | undefined {
  const trilha = TRILHAS.find((t) => t.nome === nomeTrilha);
  const hab = trilha?.habilidades.find((h) => h.nex === nivel);
  if (!hab) return undefined;

  if (!estado.poderes.some((p) => p.nome === hab.nome)) {
    estado.poderes.push({
      nome: hab.nome,
      provenancia: { kind: 'trilha', trilha: nomeTrilha, nivel },
    });
  }
  estado.habilidadesTrilha.set(nivel, hab.nome);
  return { nome: hab.nome, temEscolhaInterna: Boolean(hab.escolha) };
}

export function derivarSlots(
  identidade: FichaIdentidade,
  progressao: Progressao,
  escolhas: readonly Escolha[],
): ResultadoSlots {
  const slots: Slot[] = [];
  const estado: EstadoParcial = {
    nivel: 0,
    habilidadesTrilha: new Map(),
    poderes: [],
    rituais: [],
    atributosGanhos: [],
  };

  const nivelDaFicha = identidade.classe === 'Sobrevivente'
    ? (progressao.estagio ?? 1)
    : progressao.nex;

  /*
   * Poderes automáticos entram ANTES do fold, porque poder de origem e
   * habilidade de classe são pré-requisito potencial de escolhas posteriores —
   * enumerar opções de NEX 15 sem eles avaliaria requisitos contra uma ficha
   * incompleta.
   */
  const origem = ORIGENS.find((o) => o.nome === identidade.origem);
  if (origem && identidade.beneficioOrigem !== 'pericias') {
    estado.poderes.push({
      nome: origem.poder.nome,
      provenancia: { kind: 'origem', origem: origem.nome },
    });
  }

  for (const hab of habilidadesAutomaticas(identidade.classe, nivelDaFicha)) {
    estado.poderes.push({
      nome: hab.nome,
      provenancia: { kind: 'classeAutomatica', nivel: hab.nivel },
    });
  }

  const usadas = new Set<EscolhaId>();

  const emitir = (
    kind: SlotKind,
    chave: ChaveNivel,
    nivel: number,
    rotulo: string,
    quantidade = 1,
    paiId?: EscolhaId,
    ordinal = 0,
    poderPai?: string,
  ): Slot => {
    const id = paiId ? montarIdFilho(paiId, kind, ordinal) : montarId(kind, chave, ordinal);
    const slot: Slot = { id, kind, chaveNivel: chave, nivel, quantidade, rotulo, paiId, poderPai };
    slots.push(slot);

    const resposta = respostaDe(escolhas, id);
    if (resposta) {
      usadas.add(id);
      aplicar(estado, resposta, nivel);
    }

    /*
     * CASCATA. Um slot de poder respondido com um poder que declara `escolha`
     * abre um slot filho — imediatamente, dentro do mesmo fold, para que o
     * estado parcial já contenha o efeito do filho quando os marcos seguintes
     * forem avaliados.
     *
     * `montarIdFilho` existia desde o commit 6 e nenhum fluxo o usava: escolher
     * Transcender concedia NADA, porque o poder paranormal nunca era escolhido.
     */
    if (resposta && resposta.valor.tipo === 'poder') {
      emitirCascata(resposta.valor.poder, slot, nivel);
    }
    return slot;
  };

  /**
   * Slots filhos de um poder que exige decisão. Uma emissão por
   * `escolha.quantidade`, com ordinais próprios, para que trocar a segunda
   * perícia de Treinamento em Perícia não desfaça a primeira.
   */
  function emitirCascata(nomePoder: string, pai: Slot, nivel: number): void {
    const poder = PODERES.find((p) => p.nome === nomePoder);
    const escolha = poder?.escolha;
    if (!escolha) return;

    const kindFilho: SlotKind | null =
      escolha.tipo === 'ritualAprendido' ? 'ritual'
      : escolha.tipo === 'poderParanormal' ? 'poderParanormal'
      : escolha.tipo === 'custom' ? null
      : 'escolhaInterna';
    if (!kindFilho) return;

    for (let ordinal = 0; ordinal < Math.max(1, escolha.quantidade); ordinal += 1) {
      const sufixo = escolha.quantidade > 1 ? ` (${ordinal + 1} de ${escolha.quantidade})` : '';
      emitir(kindFilho, pai.chaveNivel, nivel, `${nomePoder}: escolha${sufixo}`,
        1, pai.id, ordinal, nomePoder);
    }
  }

  if (identidade.classe === 'Sobrevivente') {
    const estagioAtual = progressao.estagio ?? 1;

    for (const marco of MARCOS_SOBREVIVENTE) {
      if (marco.estagio > estagioAtual) continue;
      estado.nivel = marco.estagio;
      for (const kind of marco.kinds) {
        emitir(kind, chaveEstagio(marco.estagio), marco.estagio,
          kind === 'trilha' ? `Trilha de sobrevivente (estágio ${marco.estagio})` : `Aumento de atributo (estágio ${marco.estagio})`);
      }
    }

    // Habilidades de trilha do sobrevivente: estágios 2 e 4, e só existem
    // DEPOIS de a trilha ter sido escolhida.
    if (estado.trilha) {
      for (const estagioHab of [2, 4]) {
        if (estagioHab > estagioAtual) continue;
        const hab = concederHabilidadeTrilha(estado, estado.trilha, estagioHab);
        if (!hab?.temEscolhaInterna) continue;
        estado.nivel = estagioHab;
        emitir('trilhaHabilidade', chaveEstagio(estagioHab), estagioHab,
          `${hab.nome}: decisão da habilidade (estágio ${estagioHab})`);
      }
    }
  } else {
    const marcos = [...NEX_EVENTOS].sort((a, b) => a.requisito - b.requisito);

    for (const marco of marcos) {
      if (marco.requisito > progressao.nex) continue;
      if (!marcoSeAplica(marco.tipo, identidade.classe)) continue;

      const kind = TIPO_PARA_KIND[marco.tipo];
      if (!kind) continue;

      estado.nivel = marco.requisito;
      const chave = chaveNex(marco.requisito);

      if (kind === 'trilha') {
        /*
         * O marco de trilha em NEX 10 é a ESCOLHA da trilha. Nos marcos 40, 65
         * e 99 o que se ganha é a próxima habilidade da trilha já escolhida —
         * e esse slot só existe se a trilha existir.
         */
        if (marco.requisito === 10) {
          emitir('trilha', chave, 10, 'Escolha de trilha');
        }
        if (estado.trilha) {
          const hab = concederHabilidadeTrilha(estado, estado.trilha, marco.requisito);
          /*
           * Slot só quando a habilidade tem decisão interna. As oito que têm
           * estão marcadas com `escolha` no catálogo (Carteirada, A Favorita,
           * Ser Amaldiçoado, Mascate, Iniciado, Esperto, Entendido, Tornamo-nos
           * Um). As demais são automáticas e emitir slot para elas gerava uma
           * pendência fantasma por marco em toda ficha com trilha.
           */
          if (hab?.temEscolhaInterna) {
            emitir('trilhaHabilidade', chave, marco.requisito,
              `${hab.nome}: decisão da habilidade (${marco.requisito}%)`);
          }
        }
        continue;
      }

      const quantidade = kind === 'pericia'
        ? quantidadePericiasPromovidas(identidade.classe, identidade.atributosBase.INT)
        : 1;

      emitir(kind, chave, marco.requisito, marco.descricao, quantidade);
    }

    if (identidade.classe === 'Ocultista') {
      for (const nivel of niveisDeRitual(progressao.nex)) {
        estado.nivel = nivel;
        /*
         * NEX 5% emite TRÊS slots (ordinais 0/1/2), não um slot de quantidade 3.
         *
         * São três escolhas independentes de rituais diferentes, e o valor
         * `{tipo:'ritual'}` é singular. Um slot de quantidade 3 exigiria um valor
         * de lista só para este caso, e o mestre perderia a possibilidade de
         * trocar um dos três sem refazer os outros.
         */
        const quantos = nivel === 5 ? 3 : 1;
        for (let ordinal = 0; ordinal < quantos; ordinal += 1) {
          emitir(
            'ritual',
            chaveNex(nivel),
            nivel,
            nivel === 5
              ? `Ritual inicial de 1º círculo (${ordinal + 1} de 3)`
              : `Ritual aprendido em NEX ${nivel}%`,
            1,
            undefined,
            ordinal,
          );
        }
      }
    }
  }

  const nivelAtual = identidade.classe === 'Sobrevivente'
    ? (progressao.estagio ?? 1)
    : progressao.nex;

  const inertes: Escolha[] = [];
  const orfas: Escolha[] = [];
  const idsEmitidos = new Set(slots.map((s) => s.id));

  for (const escolha of escolhas) {
    if (usadas.has(escolha.id)) continue;
    if (idsEmitidos.has(escolha.id)) continue;

    /*
     * Escolha acima do nível atual: RETIDA como inerte, nunca descartada.
     *
     * É isso que faz rebaixar-para-corrigir-e-subir-de-novo não perder o
     * trabalho do jogador. No motor antigo o level-down apaga o histórico
     * (`levelUp.ts:651`), tornando a perda irreversível.
     */
    const nivel = nivelDaEscolha(escolha.id);
    if (nivel !== null && nivel > nivelAtual) inertes.push(escolha);
    else orfas.push(escolha);
  }

  return {
    slots: ordenarPorId(slots),
    estadoFinal: estado,
    inertes: ordenarPorId(inertes),
    orfas: ordenarPorId(orfas),
  };
}

/** Nível embutido no id, sem depender de `decomporId` (evita ciclo de import). */
function nivelDaEscolha(id: EscolhaId): number | null {
  const m = id.split('/')[0].match(/@(?:nex|est):(\d+)#/);
  return m ? Number(m[1]) : null;
}

/** Slots ainda sem resposta. `Pendencia` é derivada, nunca persistida. */
export function pendenciasDe(
  resultado: ResultadoSlots,
  escolhas: readonly Escolha[],
): Slot[] {
  const respondidos = new Set(escolhas.map((e) => e.id));
  return resultado.slots.filter((s) => !respondidos.has(s.id));
}
