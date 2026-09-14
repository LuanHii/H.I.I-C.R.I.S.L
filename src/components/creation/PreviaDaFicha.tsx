'use client';

import React from 'react';
import type { AtributoKey } from '@/core/types';
import { Fita, Recurso, RotuloSecao } from '../master/ui/Pecas';
import { classeDe, nivelDe, previaDe, type Rascunho } from '@/logic/rascunhoDeCriacao';

const ATRIBUTOS: AtributoKey[] = ['AGI', 'FOR', 'INT', 'PRE', 'VIG'];

export function PreviaDaFicha({ rascunho, compacta = false }: { rascunho: Rascunho; compacta?: boolean }) {
  const previa = previaDe(rascunho);
  const build = previa.build;
  const classe = classeDe(rascunho);
  const d = build?.derivados;
  const usaPd = rascunho.usarPd && d?.pd;

  const treinadas = d ? Object.entries(d.graus).filter(([, g]) => g !== 'Destreinado').map(([n]) => n) : [];
  const pendencias = build?.pendencias.length ?? 0;

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1.5">
        {rascunho.tipo && <Fita variante="classe">{classe ?? rascunho.tipo}</Fita>}
        {rascunho.tipo && classe && <Fita variante="neutra">{rascunho.tipo === 'Sobrevivente' ? `Estágio ${nivelDe(rascunho)}` : `NEX ${nivelDe(rascunho)}%`}</Fita>}
        {rascunho.origem && <Fita variante="neutra">{rascunho.origem}</Fita>}
        {rascunho.trilha && <Fita variante="contorno">{rascunho.trilha}</Fita>}
      </div>
      <div className="mt-2 truncate font-display text-xl font-bold text-white">{rascunho.nome.trim() || <span className="text-ordem-text-muted">Sem nome</span>}</div>
      {rascunho.conceito.trim() && !compacta && <p className="mt-0.5 text-xs italic text-ordem-text-secondary">{rascunho.conceito.trim()}</p>}

      {d ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Recurso tom="pv" compacto atual={d.pv.max} max={d.pv.max} segmentos={6} />
          {usaPd ? (
            <Recurso tom="pd" compacto atual={d.pd!.max} max={d.pd!.max} segmentos={6} />
          ) : (
            <>
              <Recurso tom="pe" compacto atual={d.pe.max} max={d.pe.max} segmentos={6} />
              <Recurso tom="san" compacto atual={d.san.max} max={d.san.max} segmentos={6} />
            </>
          )}
        </div>
      ) : (
        <p className="mt-3 text-[11px] text-ordem-text-muted">PV, PE e Sanidade aparecem quando origem e classe estiverem escolhidas.</p>
      )}

      <div className="mt-3 grid grid-cols-5 gap-1">
        {ATRIBUTOS.map((a) => (
          <div key={a} className="border border-white/10 py-1.5 text-center">
            <div className="font-carimbo text-[9px] uppercase tracking-[0.18em] text-ordem-text-muted">{a}</div>
            <div className="font-display text-lg font-bold leading-none text-white">{rascunho.atributos[a]}</div>
          </div>
        ))}
      </div>

      {d && (
        <div className="mt-3 flex items-baseline justify-between font-mono text-[11px] text-ordem-text-secondary">
          <span>Defesa <span className="text-white">{d.defesa}</span></span>
          <span>Desl. <span className="text-white">{d.deslocamento}m</span></span>
          <span>Limite PE <span className="text-white">{d.peRodada}</span></span>
        </div>
      )}

      {!compacta && (
        <>
          {treinadas.length > 0 && (
            <div className="mt-3">
              <RotuloSecao>Perícias treinadas · {treinadas.length}</RotuloSecao>
              <div className="mt-1 flex flex-wrap gap-1">
                {treinadas.map((n) => (
                  <span key={n} className="border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-ordem-text-secondary">{n}</span>
                ))}
              </div>
            </div>
          )}
          {build && build.poderes.length > 0 && (
            <div className="mt-3">
              <RotuloSecao>Habilidades e poderes</RotuloSecao>
              <ul className="mt-1 space-y-0.5 text-[11px] text-ordem-text-secondary">
                {build.poderes.map((p) => (
                  <li key={`${p.nome}-${p.provenancia.kind}`} className="flex items-center gap-1.5">
                    <span className="h-1 w-1 shrink-0 bg-[var(--mestre-primary,#DC2626)]" />
                    <span className="text-white">{p.nome}</span>
                    {p.escolhaInterna && <span className="text-ordem-text-muted">· {p.escolhaInterna}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {build && build.rituais.length > 0 && (
            <div className="mt-3">
              <RotuloSecao>Rituais</RotuloSecao>
              <div className="mt-1 text-[11px] text-ordem-text-secondary">{build.rituais.join(' · ')}</div>
            </div>
          )}
          {rascunho.equipamentos.length > 0 && (
            <div className="mt-3">
              <RotuloSecao>Equipamento · {rascunho.equipamentos.length}</RotuloSecao>
              <div className="mt-1 text-[11px] text-ordem-text-secondary">{rascunho.equipamentos.map((i) => i.nome).join(' · ')}</div>
            </div>
          )}
          {pendencias > 0 && (
            <div className="mt-3 border border-ordem-gold/40 bg-ordem-gold/10 px-2 py-1.5 font-carimbo text-[10px] uppercase tracking-[0.14em] text-ordem-gold">
              {pendencias} escolha(s) ficam pendentes na ficha
            </div>
          )}
          {previa.erros.length > 0 && (
            <ul className="mt-3 space-y-1 text-[11px] text-red-300">
              {previa.erros.map((e) => <li key={e}>{e}</li>)}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
