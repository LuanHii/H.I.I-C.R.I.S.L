import type { FichaOp2 } from '../regras/tipos';

export type Perfil = FichaOp2['perfil']['tipo'];

/**
 * Cada perfil tem uma identidade cromatica propria, porque o perfil e a
 * primeira coisa que define como o personagem joga. Antes as tres fichas
 * saiam identicas e so o texto do distintivo mudava.
 *
 * O acento colore APENAS a moldura — nome, aba, regua de secao, aura da
 * pagina. Os recursos guardam cor semantica fixa (vida vermelha, determinacao
 * violeta) em toda ficha, porque um jogador que aprende "a barra vermelha e
 * minha vida" nao pode reaprender ao trocar de personagem.
 */
export interface TemaDePerfil {
  rotulo: string;
  lema: string;
  texto: string;
  borda: string;
  fundo: string;
  barra: string;
  brilho: string;
  aura: string;
  regua: string;
  distintivo: string;
}

export const TEMAS: Record<Perfil, TemaDePerfil> = {
  EXECUTOR: {
    rotulo: 'Executor',
    lema: 'Age primeiro, pensa depois. Insiste até conseguir.',
    texto: 'text-ordem-red-light',
    borda: 'border-ordem-red/40',
    fundo: 'bg-ordem-red/[0.12]',
    barra: 'bg-ordem-red',
    brilho: 'shadow-[0_0_16px_-2px_rgba(220,38,38,0.85)]',
    aura: 'bg-[radial-gradient(ellipse_85%_50%_at_50%_-12%,rgba(220,38,38,0.22),transparent_72%)]',
    regua: 'from-ordem-red/45',
    distintivo: 'text-ordem-red-light border-ordem-red/45 bg-ordem-red/[0.14]',
  },
  ANALISTA: {
    rotulo: 'Analista',
    lema: 'Observa, entende e se prepara. Depois age com precisão.',
    texto: 'text-ordem-cyan',
    borda: 'border-ordem-cyan/40',
    fundo: 'bg-ordem-cyan/[0.12]',
    barra: 'bg-ordem-cyan',
    brilho: 'shadow-[0_0_16px_-2px_rgba(34,211,238,0.75)]',
    aura: 'bg-[radial-gradient(ellipse_85%_50%_at_50%_-12%,rgba(34,211,238,0.16),transparent_72%)]',
    regua: 'from-ordem-cyan/45',
    distintivo: 'text-ordem-cyan border-ordem-cyan/45 bg-ordem-cyan/[0.12]',
  },
  VIGILANTE: {
    rotulo: 'Vigilante',
    lema: 'Sempre atento, pronto para a brecha. Age antes de todos.',
    texto: 'text-ordem-green-muted',
    borda: 'border-ordem-green/40',
    fundo: 'bg-ordem-green/[0.10]',
    barra: 'bg-ordem-green-muted',
    brilho: 'shadow-[0_0_16px_-2px_rgba(102,255,102,0.6)]',
    aura: 'bg-[radial-gradient(ellipse_85%_50%_at_50%_-12%,rgba(102,255,102,0.13),transparent_72%)]',
    regua: 'from-ordem-green/45',
    distintivo: 'text-ordem-green-muted border-ordem-green/45 bg-ordem-green/[0.12]',
  },
};

export function temaDe(ficha: FichaOp2): TemaDePerfil {
  return TEMAS[ficha.perfil.tipo];
}

export type TomDeRecurso = 'vida' | 'determinacao' | 'impeto' | 'avaliacao';

export interface TomVisual {
  barra: string;
  brilho: string;
  texto: string;
  trilho: string;
}

/**
 * Cor SOLIDA, nao gradiente. O gradiente anterior usava `to-ordem-red-light`,
 * que o Tailwind nao gera nesta config — a parada final virava transparente e
 * a barra de vida aparecia lavada, encostada na de determinacao.
 */
export const TONS: Record<TomDeRecurso, TomVisual> = {
  vida: {
    barra: 'bg-ordem-red',
    brilho: 'shadow-[0_0_18px_-3px_rgba(220,38,38,0.9)]',
    texto: 'text-ordem-red-light',
    trilho: 'bg-ordem-red-dark/25',
  },
  determinacao: {
    barra: 'bg-ordem-purple',
    brilho: 'shadow-[0_0_18px_-3px_rgba(168,85,247,0.85)]',
    texto: 'text-ordem-purple',
    trilho: 'bg-ordem-purple/15',
  },
  impeto: {
    barra: 'bg-ordem-gold',
    brilho: 'shadow-[0_0_18px_-3px_rgba(255,215,0,0.8)]',
    texto: 'text-ordem-gold',
    trilho: 'bg-ordem-gold/12',
  },
  avaliacao: {
    barra: 'bg-ordem-cyan',
    brilho: 'shadow-[0_0_18px_-3px_rgba(34,211,238,0.8)]',
    texto: 'text-ordem-cyan',
    trilho: 'bg-ordem-cyan/12',
  },
};
