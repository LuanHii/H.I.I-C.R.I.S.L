'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DiceStep } from '../regras/tipos';
import { IconeDeDado, NIVEIS_DO_DADO } from './Dados';
import {
  TONS,
  iniciaisDe,
  retratoDoPersonagem,
  tokenDoPersonagem,
  type TemaDePerfil,
  type TomDeRecurso,
} from './tema';

export const BASE_DA_PAGINA =
  'relative min-h-screen w-full overflow-x-clip bg-[var(--op2-fundo)] text-white';

export const GRAO = 'op2-grao pointer-events-none fixed inset-0 z-0';

export const VINHETA =
  'pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]';

export const CONTEUDO =
  'relative z-10 mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10 safe-x safe-top safe-bottom';

export const SOMBRA_DE_LEITURA =
  '[text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_2px_12px_rgba(0,0,0,0.75)]';

export const SOMBRA_DE_ELEMENTO = 'drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]';

export const CORES_DO_DADO: Record<DiceStep, string> = NIVEIS_DO_DADO;

export const Painel: React.FC<{
  children: React.ReactNode;
  cantos?: boolean;
  className?: string;
}> = ({ children, cantos = true, className }) => (
  <div
    className={cn(
      'relative border border-white/10 bg-[var(--op2-superficie)]',
      'shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_24px_50px_-30px_rgba(0,0,0,1)]',
      className,
    )}
  >
    {cantos ? (
      <>
        <span className="op2-canto op2-canto-se" />
        <span className="op2-canto op2-canto-sd" />
        <span className="op2-canto op2-canto-ie" />
        <span className="op2-canto op2-canto-id" />
      </>
    ) : null}
    {children}
  </div>
);

export const PAINEL =
  'relative border border-white/10 bg-[var(--op2-superficie)] shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_24px_50px_-30px_rgba(0,0,0,1)]';

export const Fita: React.FC<{
  children: React.ReactNode;
  variante?: 'perfil' | 'neutra' | 'alerta';
  className?: string;
}> = ({ children, variante = 'neutra', className }) => (
  <span
    className={cn(
      'inline-flex -rotate-1 items-center px-2.5 py-1 font-carimbo text-[11px] uppercase tracking-[0.16em] shadow-[0_2px_8px_rgba(0,0,0,0.6)]',
      variante === 'perfil' && 'bg-[var(--op2-badge)] text-white',
      variante === 'neutra' && 'bg-white/[0.07] text-white/70',
      variante === 'alerta' && 'bg-ordem-red text-white',
      className,
    )}
  >
    {children}
  </span>
);

export const RotuloDeSecao: React.FC<{
  children: React.ReactNode;
  tema?: TemaDePerfil;
  acessorio?: React.ReactNode;
  className?: string;
}> = ({ children, tema, acessorio, className }) => (
  <div className={cn('flex items-center gap-3', className)}>
    <span
      className={cn(
        'shrink-0 font-carimbo text-[11px] uppercase tracking-[0.3em]',
        tema ? tema.texto : 'text-white/45',
      )}
    >
      {children}
    </span>
    <span
      className={cn('h-px flex-1 opacity-40', tema ? tema.regua : 'bg-white/15')}
    />
    {acessorio ? <span className="shrink-0">{acessorio}</span> : null}
  </div>
);

export interface BlocosDeRecursoProps {
  rotulo: string;
  atual: number;
  maximo: number;
  tom: TomDeRecurso;
  alerta?: boolean;
  compacto?: boolean;
  className?: string;
}

export const BlocosDeRecurso: React.FC<BlocosDeRecursoProps> = ({
  rotulo,
  atual,
  maximo,
  tom,
  alerta,
  compacto,
  className,
}) => {
  const paleta = TONS[tom];
  const porLinha = maximo > 10 ? Math.ceil(maximo / 2) : maximo;
  const linhas: number[][] = [];
  for (let inicio = 0; inicio < maximo; inicio += porLinha) {
    linhas.push(Array.from({ length: Math.min(porLinha, maximo - inicio) }, (_, i) => inicio + i));
  }

  return (
    <div className={cn('min-w-0', className)}>
      <div className="flex items-end justify-between gap-3">
        <span
          className={cn(
            'truncate font-carimbo text-[11px] uppercase tracking-[0.22em]',
            alerta ? paleta.texto : 'text-white/45',
          )}
        >
          {rotulo}
        </span>
        <span className="shrink-0 font-dados leading-none tabular-nums">
          <motion.span
            key={atual}
            initial={{ opacity: 0.3, scale: 1.18 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className={cn(
              'inline-block font-bold',
              compacto ? 'text-xl' : 'text-3xl',
              alerta ? paleta.texto : 'text-white',
            )}
          >
            {atual}
          </motion.span>
          <span className={cn('text-white/30', compacto ? 'text-xs' : 'text-base')}>
            /{maximo}
          </span>
        </span>
      </div>

      <div className="mt-2 space-y-1">
        {linhas.map((linha, indiceDaLinha) => (
          <div key={indiceDaLinha} className="flex gap-1">
            {linha.map((indice) => {
              const cheio = indice < atual;
              return (
                <motion.span
                  key={indice}
                  initial={false}
                  animate={cheio ? { opacity: 1 } : { opacity: 1 }}
                  className={cn(
                    'flex-1 rounded-[2px] transition-colors duration-300',
                    compacto ? 'h-2' : 'h-2.5',
                    cheio
                      ? cn(paleta.cheio, paleta.brilho)
                      : cn(paleta.vazio, 'ring-1 ring-inset ring-white/10'),
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const PassoDeRecurso: React.FC<{
  rotulo: string;
  direcao: -1 | 1;
  desabilitado: boolean;
  onClick: () => void;
}> = ({ rotulo, direcao, desabilitado, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={desabilitado}
    aria-label={`${direcao > 0 ? 'Aumentar' : 'Reduzir'} ${rotulo}`}
    className={cn(
      'op2-chanfro flex h-7 w-7 shrink-0 items-center justify-center border border-white/12 bg-black/40 text-white/50 transition-colors',
      desabilitado
        ? 'cursor-not-allowed opacity-25'
        : 'hover:border-white/35 hover:bg-white/10 hover:text-white',
    )}
  >
    {direcao > 0 ? <Plus size={14} /> : <Minus size={14} />}
  </button>
);

export interface EspacosDePerfilProps {
  rotulo: string;
  preenchidos: number;
  total: number;
  tom: TomDeRecurso;
  icone?: React.ReactNode;
  ajuda?: string;
  compacto?: boolean;
  onDefinir?: (valor: number) => void;
  className?: string;
}

export const EspacosDePerfil: React.FC<EspacosDePerfilProps> = ({
  rotulo,
  preenchidos,
  total,
  tom,
  icone,
  ajuda,
  compacto,
  onDefinir,
  className,
}) => {
  const paleta = TONS[tom];

  return (
    <div className={cn('min-w-0', className)} title={ajuda}>
      <div className="flex items-end justify-between gap-3">
        <span className="flex items-center gap-1.5 truncate font-carimbo text-[11px] uppercase tracking-[0.22em] text-white/45">
          {icone ? <span className={paleta.texto}>{icone}</span> : null}
          {rotulo}
        </span>

        <span className="flex shrink-0 items-center gap-2">
          {onDefinir ? (
            <PassoDeRecurso
              rotulo={rotulo}
              direcao={-1}
              desabilitado={preenchidos <= 0}
              onClick={() => onDefinir(preenchidos - 1)}
            />
          ) : null}

          <span className="font-dados leading-none tabular-nums">
            <span className={cn('font-bold', compacto ? 'text-xl' : 'text-3xl', paleta.texto)}>
              {preenchidos}
            </span>
            <span className={cn('text-white/30', compacto ? 'text-xs' : 'text-base')}>
              /{total}
            </span>
          </span>

          {onDefinir ? (
            <PassoDeRecurso
              rotulo={rotulo}
              direcao={1}
              desabilitado={preenchidos >= total}
              onClick={() => onDefinir(preenchidos + 1)}
            />
          ) : null}
        </span>
      </div>

      <div className={cn('mt-2 flex gap-1.5', compacto ? 'h-3' : 'h-4')}>
        {Array.from({ length: total }, (_, indice) => {
          const cheio = indice < preenchidos;
          const aparencia = cn(
            'op2-chanfro flex-1 transition-colors duration-300',
            cheio
              ? cn(paleta.cheio, paleta.brilho)
              : cn(paleta.vazio, 'ring-1 ring-inset ring-white/10'),
          );

          if (!onDefinir) {
            return (
              <motion.span
                key={indice}
                initial={false}
                animate={{ scale: cheio ? 1 : 0.94 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={aparencia}
              />
            );
          }

          const alvo = preenchidos === indice + 1 ? indice : indice + 1;

          return (
            <motion.button
              key={indice}
              type="button"
              initial={false}
              animate={{ scale: cheio ? 1 : 0.94 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={() => onDefinir(alvo)}
              aria-label={`Definir ${rotulo} em ${alvo} de ${total}`}
              className={cn(aparencia, 'cursor-pointer hover:ring-1 hover:ring-white/45')}
            />
          );
        })}
      </div>
    </div>
  );
};


export const DistintivoDeDado: React.FC<{ dado: DiceStep; className?: string }> = ({
  dado,
  className,
}) => (
  <span className={cn('inline-flex shrink-0 items-center gap-2', NIVEIS_DO_DADO[dado], className)}>
    <IconeDeDado dado={dado} tamanho={24} />
    <span className="w-6 font-dados text-sm font-bold tabular-nums">{dado.replace('d', '')}</span>
  </span>
);

export const Distintivo: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <span
    className={cn(
      'inline-flex items-center border px-2 py-1 font-carimbo text-[11px] uppercase tracking-[0.14em]',
      className ?? 'border-white/12 bg-white/[0.04] text-white/60',
    )}
  >
    {children}
  </span>
);

export interface RetratoProps {
  nome: string;
  variante?: 'token' | 'retrato';
  tamanho?: number;
  className?: string;
}

export const Retrato: React.FC<RetratoProps> = ({
  nome,
  variante = 'token',
  tamanho = 88,
  className,
}) => {
  const fonte = variante === 'token' ? tokenDoPersonagem(nome) : retratoDoPersonagem(nome);

  if (!fonte) {
    return (
      <span
        style={{ width: tamanho, height: tamanho }}
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full border-2 border-[var(--op2-primary)]/50 bg-[var(--op2-superficie-alta)] font-display text-white/70',
          className,
        )}
      >
        {iniciaisDe(nome)}
      </span>
    );
  }

  return (
    <span
      style={{ width: tamanho, height: tamanho }}
      className={cn(
        'relative inline-block shrink-0 overflow-hidden rounded-full border-2 border-[var(--op2-primary)]/60',
        'shadow-[0_0_20px_-4px_var(--op2-glow)]',
        className,
      )}
    >
      <Image src={fonte} alt={nome} fill sizes={`${tamanho}px`} className="object-cover" />
    </span>
  );
};

export interface BotaoDeAbaProps {
  ativo: boolean;
  onClick: () => void;
  tema: TemaDePerfil;
  children: React.ReactNode;
}

export const BotaoDeAba: React.FC<BotaoDeAbaProps> = ({ ativo, onClick, tema, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={ativo}
    className={cn(
      'relative min-h-[2.75rem] whitespace-nowrap px-4 font-carimbo text-[12px] uppercase tracking-[0.2em] transition-colors duration-200',
      ativo ? 'text-white' : 'text-white/35 hover:text-white/70',
    )}
  >
    {ativo ? (
      <motion.span
        layoutId="aba-ativa-op2"
        className={cn('op2-chanfro absolute inset-0 border', tema.borda, tema.fundoSutil)}
        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
      />
    ) : null}
    <span className="relative z-10">{children}</span>
  </button>
);

export const Aparecer: React.FC<{
  children: React.ReactNode;
  className?: string;
  atraso?: number;
}> = ({ children, className, atraso = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: atraso }}
    className={className}
  >
    {children}
  </motion.div>
);

