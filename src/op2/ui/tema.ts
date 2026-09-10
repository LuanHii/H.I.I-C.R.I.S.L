import type { FichaOp2 } from '../regras/tipos';
import type { IdSobrevivente } from '../presets/sobreviventes';

export type Perfil = FichaOp2['perfil']['tipo'];

export interface TemaDePerfil {
  rotulo: string;
  lema: string;
  texto: string;
  borda: string;
  fundoSutil: string;
  preenchimento: string;
  brilho: string;
  aura: string;
  regua: string;
  badge: string;
}

const CLASSES_DO_TEMA: Omit<TemaDePerfil, 'rotulo' | 'lema'> = {
  texto: 'text-[var(--op2-primary)]',
  borda: 'border-[var(--op2-border)]',
  fundoSutil: 'bg-[var(--op2-primary)]/10',
  preenchimento: 'bg-[var(--op2-primary)]',
  brilho: 'shadow-[0_0_18px_-2px_var(--op2-glow)]',
  aura: 'bg-[radial-gradient(ellipse_80%_45%_at_50%_-10%,var(--op2-glow),transparent_70%)]',
  regua: 'bg-gradient-to-r from-[var(--op2-primary)] to-transparent',
  badge: 'bg-[var(--op2-badge)] text-white',
};

export const TEMAS: Record<Perfil, TemaDePerfil> = {
  EXECUTOR: {
    ...CLASSES_DO_TEMA,
    rotulo: 'Executor',
    lema: 'Age primeiro e pensa depois. Se não der certo, tenta de novo até conseguir.',
  },
  VIGILANTE: {
    ...CLASSES_DO_TEMA,
    rotulo: 'Vigilante',
    lema: 'Sempre atento aos arredores, aproveitando a brecha perfeita para agir primeiro.',
  },
  ANALISTA: {
    ...CLASSES_DO_TEMA,
    rotulo: 'Analista',
    lema: 'Observa, entende e se prepara, para só então agir — com a maior precisão possível.',
  },
};

export function temaDe(ficha: FichaOp2): TemaDePerfil {
  return TEMAS[ficha.perfil.tipo];
}

export type TomDeRecurso = 'vida' | 'determinacao' | 'impeto' | 'avaliacao';

export interface TomVisual {
  cheio: string;
  brilho: string;
  texto: string;
  vazio: string;
}

export const TONS: Record<TomDeRecurso, TomVisual> = {
  vida: {
    cheio: 'bg-ordem-red',
    brilho: 'shadow-[0_0_10px_-2px_rgba(229,57,53,0.9)]',
    texto: 'text-red-400',
    vazio: 'bg-ordem-red-dark/20',
  },
  determinacao: {
    cheio: 'bg-ordem-purple',
    brilho: 'shadow-[0_0_10px_-2px_rgba(168,85,247,0.9)]',
    texto: 'text-ordem-purple',
    vazio: 'bg-ordem-purple/15',
  },
  impeto: {
    cheio: 'bg-ordem-red',
    brilho: 'shadow-[0_0_12px_-2px_rgba(229,57,53,0.95)]',
    texto: 'text-red-400',
    vazio: 'bg-ordem-red-dark/20',
  },
  avaliacao: {
    cheio: 'bg-ordem-cyan',
    brilho: 'shadow-[0_0_12px_-2px_rgba(2,136,209,0.9)]',
    texto: 'text-ordem-cyan',
    vazio: 'bg-ordem-cyan/15',
  },
};

const RETRATOS: Record<string, IdSobrevivente> = {
  alan: 'alan',
  victor: 'victor',
  eloísa: 'eloisa',
  eloisa: 'eloisa',
  edgar: 'edgar',
  kênia: 'kenia',
  kenia: 'kenia',
};

function chaveDoNome(nome: string): string {
  return nome.trim().toLowerCase();
}

export function tokenDoPersonagem(nome: string): string | null {
  const chave = RETRATOS[chaveDoNome(nome)];
  return chave ? `/op2/tokens/${chave}.webp` : null;
}

export function retratoDoPersonagem(nome: string): string | null {
  const chave = RETRATOS[chaveDoNome(nome)];
  return chave ? `/op2/retratos/${chave}.webp` : null;
}

export function iniciaisDe(nome: string): string {
  return nome
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('');
}
