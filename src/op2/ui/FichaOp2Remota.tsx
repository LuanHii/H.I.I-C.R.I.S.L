'use client';

import React, { useEffect, useState } from 'react';
import { assinarFichaOp2, type DocumentoAgenteOp2 } from '../nuvem/agentes';
import type { FichaOp2 } from '../regras/tipos';
import { FichaOp2Publica } from './FichaOp2Publica';
import { OverlayOp2 } from './OverlayOp2';

export type EstadoDaAssinatura =
  | { fase: 'carregando' }
  | { fase: 'op2'; documento: DocumentoAgenteOp2 }
  | { fase: 'nao-e-op2' };

export function useFichaOp2Remota(agenteId: string | undefined): EstadoDaAssinatura {
  const [estado, setEstado] = useState<EstadoDaAssinatura>({ fase: 'carregando' });

  useEffect(() => {
    if (!agenteId) {
      setEstado({ fase: 'nao-e-op2' });
      return;
    }

    setEstado({ fase: 'carregando' });

    const cancelar = assinarFichaOp2(agenteId, (documento) => {
      setEstado(documento ? { fase: 'op2', documento } : { fase: 'nao-e-op2' });
    });

    return cancelar;
  }, [agenteId]);

  return estado;
}

export interface FichaOp2RemotaProps {
  ficha: FichaOp2;
  atualizadoEm?: string;
  overlay: boolean;
  modoDoOverlay: 'mini' | 'full';
  aoAbrirOverlay?: (modo: 'mini' | 'full') => void;
  embutida?: boolean;
}

export const FichaOp2Remota: React.FC<FichaOp2RemotaProps> = ({
  ficha,
  atualizadoEm,
  overlay,
  modoDoOverlay,
  aoAbrirOverlay,
  embutida,
}) => {
  if (overlay) {
    return <OverlayOp2 ficha={ficha} modo={modoDoOverlay} />;
  }

  return (
    <div className="min-h-screen bg-ordem-black">
      {!embutida ? (
        <div className="sticky top-0 z-50 border-b border-ordem-border bg-ordem-black/95 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
            <span className="font-mono text-xs uppercase tracking-widest text-ordem-text-muted">
              Ficha compartilhada · Ordem 2
            </span>
            {aoAbrirOverlay ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => aoAbrirOverlay('mini')}
                  className="rounded-lg border border-ordem-border-light px-3 py-2 font-mono text-xs tracking-wider text-ordem-white/80 transition-colors hover:border-ordem-green hover:text-ordem-green"
                >
                  Overlay
                </button>
                <button
                  type="button"
                  onClick={() => aoAbrirOverlay('full')}
                  className="rounded-lg border border-ordem-border-light px-3 py-2 font-mono text-xs tracking-wider text-ordem-white/80 transition-colors hover:border-ordem-green hover:text-ordem-green"
                >
                  Overlay+
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <FichaOp2Publica ficha={ficha} atualizadoEm={atualizadoEm} />
    </div>
  );
};
