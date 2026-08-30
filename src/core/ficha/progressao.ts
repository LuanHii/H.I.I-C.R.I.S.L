import { buildFicha, definirNivel } from './buildFicha';
import { habilidadesAutomaticas } from './automaticos';
import type { Escolha, FichaPersistida, PoderDerivado, Problema, Slot } from './tipos';

/**
 * Progressão no motor novo.
 *
 * Não existe "subir de nível" como operação. Existe `progressao.nex = N` e um
 * rebuild — e é essa troca que resolve, de uma vez, a lista de defeitos do
 * `levelUp.ts`:
 *
 *  - **Salto ≡ passos.** `subirNex(f, 99)` num salto difere de 19 subidas de 5%,
 *    porque o salto avalia os marcos contra a ficha de NEX 5, onde `trilha` ainda
 *    é `undefined` — e aí três das quatro habilidades de trilha são perdidas para
 *    sempre. Aqui não há caminho: o fold sempre percorre os marcos em ordem.
 *  - **Level-down é atribuição de campo.** Nada é removido por regex numa string
 *    de descrição, e o histórico não é apagado: escolhas acima do nível voltam
 *    como inertes e são devolvidas ao subir de novo.
 *  - **Preview antes de mutar.** `previsao` responde "o que este marco concede"
 *    sem gravar nada. No motor antigo `subirNex` roda dentro de um `useEffect` no
 *    mount, então quando o mestre vê a tela o NEX JÁ subiu — não há o que
 *    aprovar, só o que aceitar.
 */

/**
 * Escada de NEX: 5, 10, …, 95, 99.
 *
 * O último passo é de 4, não de 5. Deixar isso implícito num `+ 5` espalhado
 * pelos call sites é o tipo de detalhe que produz um NEX 100 inválido.
 */
export const ESCADA_NEX: readonly number[] = [
  ...Array.from({ length: 19 }, (_, i) => (i + 1) * 5),
  99,
];

/**
 * Estágio máximo do sobrevivente.
 *
 * A Tabela 1.2 vai até o estágio 5 (Cicatrizado). Os livros não dizem
 * explicitamente que 5 é o teto — está na lista de ambiguidades do plano, para
 * o mestre decidir. Até lá, 5 é o limite do que existe impresso.
 */
export const ESTAGIO_MAXIMO = 5;

/** Nível atual: NEX para agentes, estágio para sobreviventes. */
export function nivelAtual(ficha: FichaPersistida): number {
  return ficha.identidade.classe === 'Sobrevivente'
    ? (ficha.progressao.estagio ?? 1)
    : ficha.progressao.nex;
}

/** Próximo nível legal, ou `null` no teto. */
export function proximoNivel(ficha: FichaPersistida): number | null {
  const atual = nivelAtual(ficha);
  if (ficha.identidade.classe === 'Sobrevivente') {
    return atual < ESTAGIO_MAXIMO ? atual + 1 : null;
  }
  return ESCADA_NEX.find((n) => n > atual) ?? null;
}

/** Nível anterior legal, ou `null` no piso. */
export function nivelAnterior(ficha: FichaPersistida): number | null {
  const atual = nivelAtual(ficha);
  if (ficha.identidade.classe === 'Sobrevivente') {
    return atual > 1 ? atual - 1 : null;
  }
  const abaixo = ESCADA_NEX.filter((n) => n < atual);
  return abaixo.length > 0 ? abaixo[abaixo.length - 1] : null;
}

export interface Previsao {
  de: number;
  para: number;
  /** `[antes, depois]` de cada recurso. */
  pv: [number, number];
  pe: [number, number];
  san: [number, number];
  defesa: [number, number];
  /** Obrigações que passam a existir neste marco. */
  novosSlots: Slot[];
  /** Concedidos automaticamente: habilidade de classe e de trilha. */
  novosPoderes: PoderDerivado[];
  /**
   * Escolhas que estavam retidas acima do nível e voltam a valer.
   *
   * É a prova de que rebaixar-para-corrigir-e-subir-de-novo não perde trabalho.
   */
  reativadas: Escolha[];
  problemas: Problema[];
}

/**
 * O que muda ao ir para `para` — SEM gravar nada.
 *
 * Puro: recebe a ficha, devolve o diff. Chamar isto num render é seguro, e é o
 * que torna possível mostrar o marco antes de aplicá-lo.
 */
export function previsao(ficha: FichaPersistida, para: number): Previsao {
  const de = nivelAtual(ficha);
  const antes = buildFicha({ ficha });
  const depois = buildFicha({ ficha: definirNivel(ficha, para) });

  const idsAntes = new Set(antes.slots.map((s) => s.id));
  const nomesAntes = new Set(antes.poderes.map((p) => p.nome));
  const inertesAntes = new Set(antes.escolhasInertes.map((e) => e.id));

  return {
    de,
    para,
    pv: [antes.derivados.pv.max, depois.derivados.pv.max],
    pe: [antes.derivados.pe.max, depois.derivados.pe.max],
    san: [antes.derivados.san.max, depois.derivados.san.max],
    defesa: [antes.derivados.defesa, depois.derivados.defesa],
    novosSlots: depois.slots.filter((s) => !idsAntes.has(s.id)),
    /*
     * Só os AUTOMÁTICOS. Um poder que vem de escolha aparece como slot novo em
     * `novosSlots`, não como poder já concedido — misturar os dois faria o
     * preview prometer algo que ainda depende de uma decisão.
     */
    novosPoderes: depois.poderes.filter(
      (p) => !nomesAntes.has(p.nome)
        && (p.provenancia.kind === 'classeAutomatica' || p.provenancia.kind === 'trilha'),
    ),
    reativadas: antes.escolhasInertes.filter(
      (e) => inertesAntes.has(e.id) && !depois.escolhasInertes.some((d) => d.id === e.id),
    ),
    problemas: depois.problemas,
  };
}

/**
 * Habilidades de classe que o nível concede — para o resumo do marco.
 *
 * Vem da mesma tabela transcrita do livro que o build usa, não de
 * `classAbilities.ts` (que tem os NEX deslocados).
 */
export function habilidadesDoNivel(ficha: FichaPersistida, nivel: number): string[] {
  const ate = habilidadesAutomaticas(ficha.identidade.classe, nivel);
  const antes = habilidadesAutomaticas(ficha.identidade.classe, nivelAtual(ficha));
  const jaTinha = new Set(antes.map((h) => h.nome));
  return ate.filter((h) => !jaTinha.has(h.nome)).map((h) => h.nome);
}
