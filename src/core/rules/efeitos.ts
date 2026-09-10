import type { AtributoKey, Atributos, PericiaName } from '../types';

export type Efeito =
  | { tipo: 'periciaBonus'; pericia: PericiaName; valor: number }
  | { tipo: 'periciaDado'; pericia: PericiaName; dados: number }
  | { tipo: 'treinamento'; pericia: PericiaName; bonusSeJaTreinado?: number }
  | { tipo: 'pv' | 'pe' | 'san'; valor: number; porNex?: number; nosNex?: readonly number[] }
  | { tipo: 'defesa'; valor: number }
  | { tipo: 'deslocamento'; valor: number }
  | { tipo: 'danoCorpoACorpo' | 'danoArmaFogo'; valor: number }
  | { tipo: 'resistenciaDano'; contra: string; valor?: number; porAtributo?: AtributoKey }
  | { tipo: 'cargaAtributo'; atributo: AtributoKey }
  | { tipo: 'cargaEspacos'; valor: number }
  | { tipo: 'sanInicialFator'; fator: number }
  | { tipo: 'narrativo'; nota: string };

export interface BonusAcumulado {
  pvBonus: number;
  peBonus: number;
  sanBonus: number;
  defesaBonus: number;
  deslocamentoBonus: number;
  danoCorpoACorpoBonus: number;
  danoArmaFogoBonus: number;
  resistencias: Record<string, number>;
  periciaFixos: Partial<Record<PericiaName, number>>;
  periciaDados: Partial<Record<PericiaName, number>>;
  treinamentos: PericiaName[];
  cargaAtributos: AtributoKey[];
  cargaEspacos: number;
  sanInicialFator: number;
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
    sanInicialFator: 1,
    notas: [],
  };
}

export interface ContextoEfeito {
  nex: number;
  atributos?: Atributos;
  jaTreinadas?: ReadonlySet<PericiaName>;
}

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

      case 'sanInicialFator':
        destino.sanInicialFator *= efeito.fator;
        break;

      case 'narrativo':
        destino.notas.push(efeito.nota);
        break;

      default: {
        const inalcancavel: never = efeito;
        throw new Error(`Efeito não tratado: ${JSON.stringify(inalcancavel)}`);
      }
    }
  }

  return destino;
}

export function aplicarVarios(
  fontes: ReadonlyArray<readonly Efeito[] | undefined>,
  contexto: ContextoEfeito,
): BonusAcumulado {
  const destino = bonusVazio();
  for (const fonte of fontes) aplicarEfeitos(fonte, contexto, destino);
  return destino;
}

export function temEfeitoMecanico(efeitos: readonly Efeito[] | undefined): boolean {
  return (efeitos ?? []).some((e) => e.tipo !== 'narrativo');
}
