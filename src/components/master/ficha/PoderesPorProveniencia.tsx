'use client';

import { useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Personagem, Poder } from '../../../core/types';
import type { BuildResultado } from '../../../core/ficha/buildFicha';
import type { PoderDerivado, PoderProvenancia } from '../../../core/ficha/tipos';
import { Fita, RotuloSecao } from '../ui/Pecas';

export interface PoderesPorProvenienciaProps {
  build: BuildResultado;
  personagem: Personagem;
  editavel: boolean;
  onAdicionar: () => void;
  onRemoverManual: (nome: string) => void;
}

type Grupo = PoderProvenancia['kind'];

const ORDEM: Grupo[] = ['origem', 'classeAutomatica', 'classe', 'trilha', 'versatilidade', 'paranormal', 'manual'];

const TITULO: Record<Grupo, string> = {
  origem: 'Origem',
  classeAutomatica: 'Habilidades de classe',
  classe: 'Poderes de classe',
  trilha: 'Trilha',
  versatilidade: 'Versatilidade',
  paranormal: 'Poderes paranormais',
  manual: 'Fora dos marcos',
};

function marcoDe(proc: PoderProvenancia, sobrevivente: boolean): string | null {
  const nivel = (n: number) => (sobrevivente ? `Estágio ${n}` : `NEX ${n}%`);
  switch (proc.kind) {
    case 'origem':
      return proc.origem;
    case 'classeAutomatica':
    case 'classe':
    case 'versatilidade':
    case 'paranormal':
    case 'trilha':
      return nivel(proc.nivel);
    case 'manual':
      return proc.nota ?? null;
  }
}

export function PoderesPorProveniencia({ build, personagem, editavel, onAdicionar, onRemoverManual }: PoderesPorProvenienciaProps) {
  const sobrevivente = personagem.classe === 'Sobrevivente';

  const grupos = useMemo(() => {
    const mapa = new Map<Grupo, { derivado: PoderDerivado; poder: Poder | undefined }[]>();
    build.poderes.forEach((derivado, i) => {
      const lista = mapa.get(derivado.provenancia.kind) ?? [];
      lista.push({ derivado, poder: personagem.poderes[i] });
      mapa.set(derivado.provenancia.kind, lista);
    });
    return ORDEM.filter((g) => mapa.has(g)).map((g) => [g, mapa.get(g)!] as const);
  }, [build.poderes, personagem.poderes]);

  return (
    <div className="space-y-5">
      {grupos.length === 0 && (
        <p className="text-sm italic text-ordem-text-muted">Nenhum poder ainda.</p>
      )}

      {grupos.map(([grupo, itens]) => (
        <section key={grupo}>
          <div className="mb-2 flex items-baseline gap-2">
            <RotuloSecao className={grupo === 'manual' ? 'text-ordem-red' : 'text-[var(--mestre-primary,#DC2626)]'}>{TITULO[grupo]}</RotuloSecao>
            <span className="text-[11px] text-ordem-text-muted">{itens.length}</span>
          </div>
          <ul className="space-y-2">
            {itens.map(({ derivado, poder }) => {
              const marco = marcoDe(derivado.provenancia, sobrevivente);
              return (
                <li key={`${grupo}-${derivado.nome}`} className="group relative border border-white/10 bg-white/[0.02]">
                  <details className="[&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-sm text-white transition hover:bg-white/5">
                      <span className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="font-semibold">{derivado.nome}</span>
                        {derivado.escolhaInterna && (
                          <span className="text-xs text-ordem-text-secondary">— {derivado.escolhaInterna}</span>
                        )}
                      </span>
                      {marco && <Fita variante="neutra" className="shrink-0">{marco}</Fita>}
                    </summary>
                    {poder?.descricao && (
                      <p className="border-t border-white/[0.06] px-3 py-2.5 text-sm text-ordem-white-muted">{poder.descricao}</p>
                    )}
                  </details>
                  {editavel && grupo === 'manual' && (
                    <button
                      type="button"
                      title="Remover poder manual"
                      onClick={() => onRemoverManual(derivado.nome)}
                      className="absolute right-2 top-2 p-1 text-ordem-text-muted opacity-0 transition hover:text-ordem-red group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {editavel && (
        <button
          type="button"
          onClick={onAdicionar}
          className="flex w-full items-center justify-center gap-2 border border-dashed border-white/15 py-2.5 font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-secondary transition hover:border-white/40 hover:text-white"
        >
          <Plus size={13} /> Poder fora dos marcos
        </button>
      )}
    </div>
  );
}
