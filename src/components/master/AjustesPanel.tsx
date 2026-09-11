'use client';

import { useEffect, useMemo, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { buildFicha } from '../../core/ficha/buildFicha';
import { DELTAS_DE_RECURSO, definirDelta, definirNota, removerPoderManual, type DeltaDeRecurso } from '../../core/ficha/ajustes';
import type { FichaPersistida } from '../../core/ficha/tipos';
import { Cantos, RotuloSecao, TOM_DE_RECURSO } from './ui/Pecas';

export interface AjustesPanelProps {
  ficha: FichaPersistida;
  onEditar: (transformar: (ficha: FichaPersistida) => FichaPersistida) => Promise<void> | void;
}

const ROTULO: Record<DeltaDeRecurso, { nome: string; cor: string }> = {
  pvMaxDelta: { nome: 'PV máx.', cor: TOM_DE_RECURSO.pv.texto },
  peMaxDelta: { nome: 'PE máx.', cor: TOM_DE_RECURSO.pe.texto },
  sanMaxDelta: { nome: 'SAN máx.', cor: TOM_DE_RECURSO.san.texto },
  pdMaxDelta: { nome: 'PD máx.', cor: TOM_DE_RECURSO.pd.texto },
  defesaDelta: { nome: 'Defesa', cor: 'text-white' },
};

function LinhaDelta({
  campo,
  delta,
  final,
  onDelta,
}: {
  campo: DeltaDeRecurso;
  delta: number;
  final: number;
  onDelta: (valor: number) => void;
}) {
  const { nome, cor } = ROTULO[campo];
  const base = final - delta;

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className={`font-carimbo text-[11px] uppercase tracking-[0.16em] ${cor}`}>{nome}</span>
      <div className="flex items-center gap-2 font-mono text-sm tabular-nums">
        <span className="text-ordem-text-muted">{base}</span>
        <div className="flex items-center border border-white/10">
          <button
            type="button"
            aria-label={`${nome}: −1`}
            onClick={() => onDelta(delta - 1)}
            className="grid h-7 w-7 place-items-center text-ordem-text-secondary transition hover:bg-white/5 hover:text-white"
          >
            <Minus size={12} />
          </button>
          <span className={`min-w-[2.5rem] text-center text-xs ${delta === 0 ? 'text-ordem-text-muted' : delta > 0 ? 'text-ordem-green' : 'text-ordem-red'}`}>
            {delta > 0 ? `+${delta}` : delta}
          </span>
          <button
            type="button"
            aria-label={`${nome}: +1`}
            onClick={() => onDelta(delta + 1)}
            className="grid h-7 w-7 place-items-center text-ordem-text-secondary transition hover:bg-white/5 hover:text-white"
          >
            <Plus size={12} />
          </button>
        </div>
        <span className="min-w-[2rem] text-right font-bold text-white">{final}</span>
      </div>
    </div>
  );
}

export function AjustesPanel({ ficha, onEditar }: AjustesPanelProps) {
  const build = useMemo(() => buildFicha({ ficha }), [ficha]);
  const { ajustes } = ficha;
  const usaPd = build.derivados.pd !== undefined;

  const [nota, setNota] = useState(ajustes.nota ?? '');
  useEffect(() => { setNota(ajustes.nota ?? ''); }, [ajustes.nota]);

  const finais: Record<DeltaDeRecurso, number> = {
    pvMaxDelta: build.derivados.pv.max,
    peMaxDelta: build.derivados.pe.max,
    sanMaxDelta: build.derivados.san.max,
    pdMaxDelta: build.derivados.pd?.max ?? 0,
    defesaDelta: build.derivados.defesa,
  };

  const campos = DELTAS_DE_RECURSO.filter((c) => (usaPd ? c !== 'peMaxDelta' && c !== 'sanMaxDelta' : c !== 'pdMaxDelta'));

  const manuais = ajustes.poderesManuais ?? [];

  return (
    <section className="relative border border-ordem-red/30 bg-ordem-red/[0.04] px-4 py-3">
      <Cantos />
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <RotuloSecao className="text-ordem-red">Ajustes do mestre</RotuloSecao>
        <span className="text-[11px] text-ordem-text-muted">Somam ao que o motor calcula. Zero apaga o ajuste.</span>
      </div>

      <div className="grid gap-x-8 sm:grid-cols-2">
        {campos.map((campo) => (
          <LinhaDelta
            key={campo}
            campo={campo}
            delta={ajustes[campo] ?? 0}
            final={finais[campo]}
            onDelta={(valor) => onEditar((f) => definirDelta(f, campo, valor))}
          />
        ))}
      </div>

      {manuais.length > 0 && (
        <div className="mt-3">
          <RotuloSecao>Poderes fora dos marcos</RotuloSecao>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {manuais.map((nome) => (
              <li key={nome} className="inline-flex items-center gap-1 border border-white/10 bg-white/[0.03] px-2 py-0.5 text-xs text-white">
                {nome}
                <button
                  type="button"
                  aria-label={`Remover ${nome}`}
                  onClick={() => onEditar((f) => removerPoderManual(f, nome))}
                  className="text-ordem-text-muted transition hover:text-ordem-red"
                >
                  <X size={12} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <label className="mt-3 block">
        <RotuloSecao>Nota</RotuloSecao>
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          onBlur={() => { if (nota.trim() !== (ajustes.nota ?? '')) onEditar((f) => definirNota(f, nota)); }}
          rows={2}
          placeholder="Por que existe este ajuste (item, bênção, regra da mesa)…"
          className="mt-1 w-full resize-y border border-white/10 bg-black/30 px-2.5 py-1.5 text-sm text-white placeholder:text-ordem-text-muted focus:border-ordem-red/60 focus:outline-none"
        />
      </label>
    </section>
  );
}
