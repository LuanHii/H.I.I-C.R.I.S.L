import type { Personagem } from '../types';

export type CondicaoDeDescanso = 'precaria' | 'normal' | 'confortavel' | 'luxuosa';
export type AcaoDeInterludio = 'dormir' | 'relaxar' | 'manutencao';

export interface DescricaoDeCondicao {
  id: CondicaoDeDescanso;
  rotulo: string;
  multiplicador: number;
  exemplo: string;
}

export const CONDICOES_DE_DESCANSO: readonly DescricaoDeCondicao[] = [
  { id: 'precaria', rotulo: 'Precária', multiplicador: 0.5, exemplo: 'Dentro do carro, tenda de acampamento. Recuperação pela metade.' },
  { id: 'normal', rotulo: 'Normal', multiplicador: 1, exemplo: 'Quarto simples com cama e banheiro. Recuperação igual ao limite de PE.' },
  { id: 'confortavel', rotulo: 'Confortável', multiplicador: 2, exemplo: 'Hotel ou pousada três estrelas. Recuperação dobrada.' },
  { id: 'luxuosa', rotulo: 'Luxuosa', multiplicador: 3, exemplo: 'Hotel de luxo, tratamento vip, spa. Recuperação triplicada.' },
];

export interface PedidoDeInterludio {
  acao: AcaoDeInterludio;
  condicao: CondicaoDeDescanso;
  quantosRelaxaram?: number;
}

export interface ResultadoDeInterludio {
  personagem: Personagem;
  relato: string;
}

export function recuperacaoDeDescanso(limitePe: number, condicao: CondicaoDeDescanso): number {
  const { multiplicador } = CONDICOES_DE_DESCANSO.find((c) => c.id === condicao) ?? CONDICOES_DE_DESCANSO[1];
  return Math.floor(Math.max(0, limitePe) * multiplicador);
}

const usaPd = (p: Personagem): boolean => Boolean(p.usarPd && p.pd);

const ateOMaximo = (atual: number, max: number, ganho: number): number => Math.min(max, atual + ganho);

function dormir(p: Personagem, condicao: CondicaoDeDescanso): ResultadoDeInterludio {
  const ganho = recuperacaoDeDescanso(p.pe.rodada, condicao);
  const pv = ateOMaximo(p.pv.atual, p.pv.max, ganho);

  if (usaPd(p)) {
    return {
      personagem: { ...p, pv: { ...p.pv, atual: pv } },
      relato: `${p.nome} dormiu e recuperou ${pv - p.pv.atual} PV.`,
    };
  }

  const pe = ateOMaximo(p.pe.atual, p.pe.max, ganho);
  return {
    personagem: { ...p, pv: { ...p.pv, atual: pv }, pe: { ...p.pe, atual: pe } },
    relato: `${p.nome} dormiu e recuperou ${pv - p.pv.atual} PV e ${pe - p.pe.atual} PE.`,
  };
}

function relaxar(p: Personagem, condicao: CondicaoDeDescanso, quantosRelaxaram: number): ResultadoDeInterludio {
  const ganho = recuperacaoDeDescanso(p.pe.rodada, condicao) + Math.max(0, quantosRelaxaram);

  if (usaPd(p) && p.pd) {
    const pd = ateOMaximo(p.pd.atual, p.pd.max, ganho);
    return {
      personagem: { ...p, pd: { ...p.pd, atual: pd } },
      relato: `${p.nome} relaxou e recuperou ${pd - p.pd.atual} PD.`,
    };
  }

  const san = ateOMaximo(p.san.atual, p.san.max, ganho);
  return {
    personagem: { ...p, san: { ...p.san, atual: san } },
    relato: `${p.nome} relaxou e recuperou ${san - p.san.atual} SAN.`,
  };
}

export function aplicarInterludio(p: Personagem, pedido: PedidoDeInterludio): ResultadoDeInterludio {
  switch (pedido.acao) {
    case 'dormir':
      return dormir(p, pedido.condicao);
    case 'relaxar':
      return relaxar(p, pedido.condicao, pedido.quantosRelaxaram ?? 1);
    case 'manutencao':
      return { personagem: p, relato: `${p.nome} fez manutenção: conserta um item quebrado, recuperando os PV dele ao máximo.` };
  }
}
