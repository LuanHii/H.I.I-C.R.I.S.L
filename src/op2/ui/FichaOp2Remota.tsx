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
    <FichaOp2Publica
      ficha={ficha}
      atualizadoEm={atualizadoEm}
      aoAbrirOverlay={embutida ? undefined : aoAbrirOverlay}
    />
  );
};
