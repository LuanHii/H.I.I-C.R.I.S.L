import type { Atributos, ClasseName, Marca, Patente, PericiaName } from '../types';
import { calculateDerivedStats } from './derivedStats';

export interface EntradaDeRecursos {
  classe: ClasseName;
  atributos: Atributos;
  nex: number;
  estagio?: number;
  patente: Patente;
  usarPd?: boolean;
  pvBonus?: number;
  origemNome?: string;
  beneficioOrigem?: 'pericias' | 'poder' | 'ambos';
  trilhaNome?: string;
  qtdTranscender?: number;
  marcas?: readonly Marca[];
  poderes?: readonly { nome: string }[];
  periciasTreinadas?: readonly PericiaName[];
}

export function calcularRecursosClasse(params: EntradaDeRecursos) {
  const derived = calculateDerivedStats({
    classe: params.classe,
    atributos: params.atributos,
    nex: params.nex,
    estagio: params.estagio,
    origemNome: params.origemNome,
    beneficioOrigem: params.beneficioOrigem,
    trilhaNome: params.trilhaNome,
    qtdTranscender: params.qtdTranscender,
    marcas: params.marcas,
    poderes: params.poderes,
    periciasTreinadas: params.periciasTreinadas,
  });

  return {
    periciaBonus: derived.periciaBonus,
    periciaDados: derived.periciaDados,
    pv: derived.pvMax + (params.pvBonus ?? 0),
    pe: derived.peMax,
    san: derived.sanMax,
    pd: params.usarPd ? derived.pdMax : undefined,
    limitePeRodada: derived.peRodada,
    defesa: derived.defesa,
    deslocamento: derived.deslocamento,
  };
}
