'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GiEyeTarget, GiFlame } from 'react-icons/gi';
import { cn } from '@/lib/utils';
import {
  avaliacaoDe,
  dadoDaPericia,
  estadoDeRisco,
  impetoDe,
  pdAtual,
  pvAtual,
} from '../regras/ficha';
import { PERICIAS_SIMPLES, pericia } from '../regras/pericias';
import { facesDe } from '../regras/dados';
import {
  MAXIMO_AVALIACAO,
  MAXIMO_IMPETO,
  ROTULO_ATRIBUTO,
  type FichaOp2,
} from '../regras/tipos';
import { IconeDeDado } from './Dados';
import {
  BlocosDeRecurso,
  EspacosDePerfil,
  Retrato,
  SOMBRA_DE_ELEMENTO,
  SOMBRA_DE_LEITURA,
} from './Pecas';
import { temaDe } from './tema';

export type FundoDoOverlay = 'transparente' | 'verde';

export interface OverlayOp2Props {
  ficha: FichaOp2;
  modo?: 'mini' | 'full';
  fundo?: FundoDoOverlay;
}

export const OverlayOp2: React.FC<OverlayOp2Props> = ({
  ficha,
  modo = 'mini',
  fundo = 'transparente',
}) => {
  const tema = temaDe(ficha);
  const risco = estadoDeRisco(ficha);

  const treinadas = PERICIAS_SIMPLES.map((nome) => ({
    nome,
    dado: dadoDaPericia(ficha, pericia(nome)),
  }))
    .filter((entrada) => entrada.dado !== 'd4')
    .sort((a, b) => facesDe(b.dado) - facesDe(a.dado) || a.nome.localeCompare(b.nome, 'pt-BR'));

  return (
    <div
      data-perfil={ficha.perfil.tipo}
      className={cn(
        'min-h-screen w-full p-4',
        fundo === 'verde' ? 'bg-ordem-green' : 'bg-transparent',
      )}
    >
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'op2-chanfro w-full max-w-[430px] border border-white/10 bg-[var(--op2-superficie)]/90 backdrop-blur-sm',
          'drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]',
        )}
      >
        <div
          className={cn(
            'flex items-center gap-3 border-b border-white/10 px-4 py-3',
            tema.fundoSutil,
          )}
        >
          <Retrato nome={ficha.nome} tamanho={54} />
          <div className="min-w-0 flex-1">
            <h1
              className={cn(
                'truncate font-display text-2xl font-bold leading-tight tracking-[0.05em] text-white',
                SOMBRA_DE_LEITURA,
              )}
            >
              {ficha.nome}
            </h1>
            <div className="mt-0.5 flex items-center gap-2 font-carimbo text-[11px] uppercase tracking-[0.18em]">
              <span className={tema.texto}>{tema.rotulo}</span>
              <span className="text-white/20">·</span>
              <span className="truncate text-white/45">{ficha.ocupacao}</span>
            </div>
          </div>
          <span
            className={cn(
              'op2-chanfro shrink-0 border px-2.5 py-1 font-dados text-base font-bold',
              tema.borda,
              tema.texto,
            )}
          >
            {ficha.nivel}
          </span>
        </div>

        <div className={cn('space-y-3.5 px-4 py-4', SOMBRA_DE_ELEMENTO)}>
          <BlocosDeRecurso
            rotulo="Vida"
            atual={pvAtual(ficha)}
            maximo={ficha.pvMax}
            tom="vida"
            alerta={risco.precisaFerimento}
            compacto
          />
          <BlocosDeRecurso
            rotulo="Determinação"
            atual={pdAtual(ficha)}
            maximo={ficha.pdMax}
            tom="determinacao"
            alerta={risco.precisaTrauma}
            compacto
          />

          {ficha.perfil.tipo === 'EXECUTOR' ? (
            <EspacosDePerfil
              rotulo="Ímpeto"
              preenchidos={impetoDe(ficha)}
              total={MAXIMO_IMPETO}
              tom="impeto"
              icone={<GiFlame size={13} />}
              compacto
            />
          ) : null}

          {ficha.perfil.tipo === 'ANALISTA' ? (
            <EspacosDePerfil
              rotulo="Avaliação"
              preenchidos={avaliacaoDe(ficha)}
              total={MAXIMO_AVALIACAO}
              tom="avaliacao"
              icone={<GiEyeTarget size={13} />}
              compacto
            />
          ) : null}

          {ficha.sessao.condicoes.length > 0 || risco.precisaFerimento || risco.precisaTrauma ? (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {risco.precisaFerimento ? (
                <span className="op2-chanfro animate-pulse bg-ordem-red px-2 py-0.5 font-carimbo text-[11px] uppercase tracking-wide text-white">
                  Ferimento DT {risco.dtFerimento}
                </span>
              ) : null}
              {risco.precisaTrauma ? (
                <span className="op2-chanfro animate-pulse bg-ordem-purple px-2 py-0.5 font-carimbo text-[11px] uppercase tracking-wide text-white">
                  Trauma DT {risco.dtTrauma}
                </span>
              ) : null}
              {ficha.sessao.condicoes.map((condicao) => (
                <span
                  key={condicao}
                  className="op2-chanfro bg-white/10 px-2 py-0.5 font-carimbo text-[11px] uppercase tracking-wide text-white/80"
                >
                  {condicao}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {modo === 'full' ? (
          <div className="space-y-3 border-t border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              {(['FISICO', 'MENTE', 'EMOCAO'] as const).map((atributo) => (
                <span
                  key={atributo}
                  className="op2-chanfro flex flex-1 items-center justify-center gap-1.5 border border-white/10 bg-black/40 px-2 py-1.5"
                >
                  <span className={tema.texto}>
                    <IconeDeDado dado={ficha.atributos[atributo]} tamanho={18} />
                  </span>
                  <span className="font-carimbo text-[10px] uppercase tracking-wide text-white/50">
                    {ROTULO_ATRIBUTO[atributo]}
                  </span>
                  <span className="font-dados text-sm font-bold text-white">
                    {ficha.atributos[atributo].replace('d', '')}
                  </span>
                </span>
              ))}
            </div>

            {treinadas.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {treinadas.map((entrada) => (
                  <span
                    key={entrada.nome}
                    className="op2-chanfro flex items-center gap-1 border border-white/10 bg-black/40 px-2 py-0.5"
                  >
                    <span className="font-carimbo text-[11px] uppercase tracking-wide text-white/65">
                      {entrada.nome}
                    </span>
                    <span className="font-dados text-[11px] font-bold text-ordem-cyan">
                      {entrada.dado.replace('d', '')}
                    </span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </motion.div>
    </div>
  );
};
