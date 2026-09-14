import type { Personagem } from '../types';

export const CAMPOS_DE_OVERLAY = ['pv', 'san', 'pe', 'pd', 'defesa', 'nex', 'nome', 'deslocamento', 'carga'] as const;
export type CampoDeOverlay = (typeof CAMPOS_DE_OVERLAY)[number];

export const FORMATOS_DE_OVERLAY = ['atual', 'max', 'atual-max', 'percentual'] as const;
export type FormatoDeOverlay = (typeof FORMATOS_DE_OVERLAY)[number];

export interface ValoresDeOverlay {
  nome: string;
  classe: string;
  nex: number;
  estagio?: number;
  pv: { atual: number; max: number };
  san: { atual: number; max: number };
  pe: { atual: number; max: number };
  pd?: { atual: number; max: number };
  defesa: number;
  deslocamento: number;
  carga: { atual: number; max: number };
}

export function valoresDeOverlay(p: Personagem): ValoresDeOverlay {
  return {
    nome: p.nome,
    classe: p.classe,
    nex: p.nex,
    ...(p.classe === 'Sobrevivente' ? { estagio: p.estagio ?? 1 } : {}),
    pv: { atual: p.pv.atual, max: p.pv.max },
    san: { atual: p.san.atual, max: p.san.max },
    pe: { atual: p.pe.atual, max: p.pe.max },
    ...(p.usarPd && p.pd ? { pd: { atual: p.pd.atual, max: p.pd.max } } : {}),
    defesa: p.defesa,
    deslocamento: p.deslocamento,
    carga: { atual: p.carga.atual, max: p.carga.maxima },
  };
}

export function ehCampoDeOverlay(valor: string | null | undefined): valor is CampoDeOverlay {
  return (CAMPOS_DE_OVERLAY as readonly string[]).includes(valor ?? '');
}

export function ehFormatoDeOverlay(valor: string | null | undefined): valor is FormatoDeOverlay {
  return (FORMATOS_DE_OVERLAY as readonly string[]).includes(valor ?? '');
}

function par(v: ValoresDeOverlay, campo: CampoDeOverlay): { atual: number; max: number } | null {
  switch (campo) {
    case 'pv': return v.pv;
    case 'san': return v.san;
    case 'pe': return v.pe;
    case 'pd': return v.pd ?? null;
    case 'carga': return v.carga;
    default: return null;
  }
}

export function textoDoValor(v: ValoresDeOverlay, campo: CampoDeOverlay, formato: FormatoDeOverlay = 'atual'): string {
  const recurso = par(v, campo);
  if (recurso) {
    switch (formato) {
      case 'max': return String(recurso.max);
      case 'atual-max': return `${recurso.atual} / ${recurso.max}`;
      case 'percentual': return recurso.max > 0 ? `${Math.round((recurso.atual / recurso.max) * 100)}%` : '0%';
      default: return String(recurso.atual);
    }
  }
  switch (campo) {
    case 'defesa': return String(v.defesa);
    case 'nex': return v.estagio !== undefined ? `Estágio ${v.estagio}` : `${v.nex}%`;
    case 'nome': return v.nome;
    case 'deslocamento': return `${v.deslocamento}m`;
    default: return '';
  }
}
