import type { AtributoKey, Atributos, PericiaName } from '../types';

/**
 * Modelo declarativo de efeitos mecânicos.
 *
 * Antes disto, o que uma origem ou trilha fazia estava escrito duas vezes: em
 * prosa, no campo `descricao`, e à mão, num `switch` gigante. Havia dois
 * switches diferentes — um usado só na criação (`calcularBonusPoderOrigem`) e
 * outro no recálculo (`calcularBonusOrigem`) — com coberturas distintas. O
 * resultado era um split-brain: o +2 Diplomacia do Diplomata era concedido na
 * criação e apagado no primeiro save, porque o recálculo não conhecia o caso.
 *
 * Com `efeitos: Efeito[]` no dado, existe UM interpretador (`aplicarEfeitos`)
 * e os dois caminhos passam por ele.
 */
export type Efeito =
  /** Bônus fixo numa perícia. "+2 em Diplomacia" */
  | { tipo: 'periciaBonus'; pericia: PericiaName; valor: number }
  /** Dados extras numa perícia. "+1d20 em Furtividade" */
  | { tipo: 'periciaDado'; pericia: PericiaName; dados: number }
  /**
   * Treinamento numa perícia. O livro quase sempre escreve
   * "recebe treinamento em X ou, se já for treinado, +2 nela" — daí o
   * `bonusSeJaTreinado`, que por padrão é 2.
   */
  | { tipo: 'treinamento'; pericia: PericiaName; bonusSeJaTreinado?: number }
  /**
   * Recurso derivado, com três formas de escala:
   *  - fixo: `{ valor: 5 }`
   *  - por degrau: `{ valor: 1, porNex: 5 }` = "+1 para cada 5% de NEX"
   *  - em marcos: `{ valor: 1, nosNex: [5, 15, 25] }` = "+1 ao atingir cada um
   *    desses NEX", que é como o livro escreve a Dedicação do Universitário
   *    ("+1 PE adicional a cada NEX ímpar").
   * `porNex` e `nosNex` são mutuamente exclusivos.
   */
  | { tipo: 'pv' | 'pe' | 'san'; valor: number; porNex?: number; nosNex?: readonly number[] }
  | { tipo: 'defesa'; valor: number }
  /** Deslocamento em metros. "+3m em seu deslocamento" */
  | { tipo: 'deslocamento'; valor: number }
  | { tipo: 'danoCorpoACorpo' | 'danoArmaFogo'; valor: number }
  /**
   * Resistência a dano. `contra` é livre: 'mental', 'Sangue', 'balístico',
   * 'geral'. `porAtributo` cobre "resistência a dano mental igual ao seu
   * Intelecto" (Teórico da Conspiração), em que o valor não é constante.
   */
  | { tipo: 'resistenciaDano'; contra: string; valor?: number; porAtributo?: AtributoKey }
  /** Soma um atributo ao limite de carga, além da Força. (Inventário Otimizado) */
  | { tipo: 'cargaAtributo'; atributo: AtributoKey }
  /**
   * Limite de carga em ESPAÇOS, direto. "Seu limite de carga aumenta em 5
   * espaços" (Mochileiro).
   *
   * Distinto de `cargaAtributo`, que soma um ATRIBUTO ao limite. Sem este tipo,
   * o único jeito de expressar o Mochileiro era não expressá-lo — e era o que
   * estava acontecendo.
   */
  | { tipo: 'cargaEspacos'; valor: number }
  /**
   * Sem efeito numérico: a habilidade é narrativa, custa recurso em uso, ou
   * depende de arbitragem do mestre.
   *
   * Existe para o teste de cobertura poder separar "já analisado, não há número
   * a aplicar" de "ninguém olhou ainda". Sem esta variante, toda entrada não
   * estruturada e toda entrada deliberadamente sem número ficariam iguais.
   */
  | { tipo: 'narrativo'; nota: string };

export interface BonusAcumulado {
  pvBonus: number;
  peBonus: number;
  sanBonus: number;
  defesaBonus: number;
  deslocamentoBonus: number;
  danoCorpoACorpoBonus: number;
  danoArmaFogoBonus: number;
  /** Por tipo de dano, em minúsculas: { mental: 5, sangue: 10 } */
  resistencias: Record<string, number>;
  periciaFixos: Partial<Record<PericiaName, number>>;
  periciaDados: Partial<Record<PericiaName, number>>;
  /** Perícias que o efeito torna treinadas. */
  treinamentos: PericiaName[];
  /** Atributos que somam ao limite de carga, além de Força. */
  cargaAtributos: AtributoKey[];
  /** Espaços somados direto ao limite de carga. */
  cargaEspacos: number;
  /** Notas narrativas, para exibição. */
  notas: string[];
}

export function bonusVazio(): BonusAcumulado {
  return {
    pvBonus: 0,
    peBonus: 0,
    sanBonus: 0,
    defesaBonus: 0,
    deslocamentoBonus: 0,
    danoCorpoACorpoBonus: 0,
    danoArmaFogoBonus: 0,
    resistencias: {},
    periciaFixos: {},
    periciaDados: {},
    treinamentos: [],
    cargaAtributos: [],
    cargaEspacos: 0,
    notas: [],
  };
}

export interface ContextoEfeito {
  nex: number;
  /** Necessário para efeitos cujo valor é um atributo. */
  atributos?: Atributos;
  /** Perícias já treinadas, para resolver "ou, se já for treinado, +2". */
  jaTreinadas?: ReadonlySet<PericiaName>;
}

/**
 * Escala por NEX. O livro escreve "+1 PV para cada 5% de NEX", que em NEX 32%
 * vale 6 — conta-se quantos degraus COMPLETOS de 5% cabem, não arredonda para
 * cima. Vale para PV (5%), PE (10%) e qualquer outro degrau declarado.
 */
function escalar(
  valor: number,
  nex: number,
  porNex?: number,
  nosNex?: readonly number[],
): number {
  if (nosNex) return valor * nosNex.filter((marco) => nex >= marco).length;
  if (porNex) return valor * Math.floor(nex / porNex);
  return valor;
}

/** Interpretador único: transforma efeitos declarados em números. */
export function aplicarEfeitos(
  efeitos: readonly Efeito[] | undefined,
  contexto: ContextoEfeito,
  destino: BonusAcumulado = bonusVazio(),
): BonusAcumulado {
  if (!efeitos) return destino;

  for (const efeito of efeitos) {
    switch (efeito.tipo) {
      case 'periciaBonus':
        destino.periciaFixos[efeito.pericia] =
          (destino.periciaFixos[efeito.pericia] ?? 0) + efeito.valor;
        break;

      case 'periciaDado':
        destino.periciaDados[efeito.pericia] =
          (destino.periciaDados[efeito.pericia] ?? 0) + efeito.dados;
        break;

      case 'treinamento': {
        // "recebe treinamento em X ou, se já for treinado, recebe +2 nela"
        if (contexto.jaTreinadas?.has(efeito.pericia)) {
          const extra = efeito.bonusSeJaTreinado ?? 2;
          destino.periciaFixos[efeito.pericia] =
            (destino.periciaFixos[efeito.pericia] ?? 0) + extra;
        } else if (!destino.treinamentos.includes(efeito.pericia)) {
          destino.treinamentos.push(efeito.pericia);
        }
        break;
      }

      case 'pv':
        destino.pvBonus += escalar(efeito.valor, contexto.nex, efeito.porNex, efeito.nosNex);
        break;
      case 'pe':
        destino.peBonus += escalar(efeito.valor, contexto.nex, efeito.porNex, efeito.nosNex);
        break;
      case 'san':
        destino.sanBonus += escalar(efeito.valor, contexto.nex, efeito.porNex, efeito.nosNex);
        break;

      case 'defesa':
        destino.defesaBonus += efeito.valor;
        break;
      case 'deslocamento':
        destino.deslocamentoBonus += efeito.valor;
        break;
      case 'danoCorpoACorpo':
        destino.danoCorpoACorpoBonus += efeito.valor;
        break;
      case 'danoArmaFogo':
        destino.danoArmaFogoBonus += efeito.valor;
        break;

      case 'resistenciaDano': {
        const chave = efeito.contra.toLowerCase();
        const valor = efeito.porAtributo
          ? (contexto.atributos?.[efeito.porAtributo] ?? 0)
          : (efeito.valor ?? 0);
        destino.resistencias[chave] = (destino.resistencias[chave] ?? 0) + valor;
        break;
      }

      case 'cargaAtributo':
        if (!destino.cargaAtributos.includes(efeito.atributo)) {
          destino.cargaAtributos.push(efeito.atributo);
        }
        break;

      case 'cargaEspacos':
        destino.cargaEspacos += efeito.valor;
        break;

      case 'narrativo':
        destino.notas.push(efeito.nota);
        break;

      default: {
        // Exaustividade: um Efeito novo sem case aqui não compila.
        const inalcancavel: never = efeito;
        throw new Error(`Efeito não tratado: ${JSON.stringify(inalcancavel)}`);
      }
    }
  }

  return destino;
}

/** Conveniência: acumula efeitos de várias fontes (origem + trilha + poderes). */
export function aplicarVarios(
  fontes: ReadonlyArray<readonly Efeito[] | undefined>,
  contexto: ContextoEfeito,
): BonusAcumulado {
  const destino = bonusVazio();
  for (const fonte of fontes) aplicarEfeitos(fonte, contexto, destino);
  return destino;
}

/** True se o efeito produz algum número — usado pelo teste de cobertura. */
export function temEfeitoMecanico(efeitos: readonly Efeito[] | undefined): boolean {
  return (efeitos ?? []).some((e) => e.tipo !== 'narrativo');
}
