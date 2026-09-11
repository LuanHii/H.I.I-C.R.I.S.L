'use client';

import { useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { buildFicha } from '../../core/ficha/buildFicha';
import type { FichaPersistida, Slot, ValorEscolha } from '../../core/ficha/tipos';
import { Cantos, Fita, RotuloSecao } from './ui/Pecas';

export interface HistoricoEscolhasProps {
  ficha: FichaPersistida;
  onDesfazer?: (escolhaId: string) => void;
  onResponderPendencias?: () => void;
}

export function resumirValor(valor: ValorEscolha): string {
  switch (valor.tipo) {
    case 'trilha':
    case 'versatilidade':
      return valor.trilha;
    case 'poder':
      return valor.poder;
    case 'atributo':
      return `+1 ${valor.atributo}`;
    case 'pericias':
      return valor.pericias.join(', ');
    case 'afinidade':
      return valor.elemento;
    case 'ritual':
      return valor.ritual;
    case 'origem':
      return valor.origem;
    case 'habilidadeTrilha':
      return valor.escolhaInterna ? `${valor.habilidade} — ${valor.escolhaInterna}` : valor.habilidade;
    case 'escolhaInterna':
      return valor.valor;
  }
}

interface Linha {
  slot: Slot;
  resumo: string;
}

export function HistoricoEscolhas({ ficha, onDesfazer, onResponderPendencias }: HistoricoEscolhasProps) {
  const build = useMemo(() => buildFicha({ ficha }), [ficha]);
  const sobrevivente = ficha.identidade.classe === 'Sobrevivente';
  const rotuloNivel = (n: number) => (sobrevivente ? `Estágio ${n}` : `NEX ${n}%`);

  const porNivel = useMemo(() => {
    const respondidas = new Map(ficha.escolhas.map((e) => [e.id, e.valor] as const));
    const grupos = new Map<number, Linha[]>();
    for (const slot of build.slots) {
      const valor = respondidas.get(slot.id);
      if (!valor) continue;
      const lista = grupos.get(slot.nivel) ?? [];
      lista.push({ slot, resumo: resumirValor(valor) });
      grupos.set(slot.nivel, lista);
    }
    return Array.from(grupos.entries()).sort((a, b) => b[0] - a[0]);
  }, [build.slots, ficha.escolhas]);

  const pendentes = build.pendencias.length;

  return (
    <section className="relative border border-white/10 bg-white/[0.02] px-4 py-3">
      <Cantos />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <RotuloSecao className="text-[var(--mestre-primary,#DC2626)]">Escolhas registradas</RotuloSecao>
        {pendentes > 0 ? (
          <button
            type="button"
            onClick={onResponderPendencias}
            className="border border-ordem-gold/60 px-2.5 py-1 font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-gold transition hover:bg-ordem-gold/10"
          >
            {pendentes} pendente{pendentes === 1 ? '' : 's'} — responder
          </button>
        ) : (
          <span className="text-[11px] text-ordem-green">✓ nada pendente</span>
        )}
      </div>

      {porNivel.length === 0 ? (
        <p className="mt-2 text-sm text-ordem-text-muted">Nenhuma escolha registrada ainda — tudo que a ficha tem veio de classe e origem.</p>
      ) : (
        <ol className="mt-3 space-y-3">
          {porNivel.map(([nivel, linhas]) => (
            <li key={nivel}>
              <Fita variante="neutra">{rotuloNivel(nivel)}</Fita>
              <ul className="mt-1.5 divide-y divide-white/[0.06] border-l border-white/10 pl-3">
                {linhas.map(({ slot, resumo }) => (
                  <li key={slot.id} className="group flex items-start justify-between gap-3 py-1.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-white">{resumo}</p>
                      <p className="truncate text-[11px] text-ordem-text-muted">{slot.rotulo}</p>
                    </div>
                    {onDesfazer && (
                      <button
                        type="button"
                        title="Limpar esta escolha — ela volta a ficar pendente"
                        onClick={() => onDesfazer(slot.id)}
                        className="flex shrink-0 items-center gap-1 text-[11px] text-ordem-text-muted opacity-0 transition hover:text-ordem-red group-hover:opacity-100 focus:opacity-100"
                      >
                        <RotateCcw size={12} /> limpar
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
