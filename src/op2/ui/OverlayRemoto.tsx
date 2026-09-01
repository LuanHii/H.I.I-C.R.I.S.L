'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useFichaOp2Remota } from './FichaOp2Remota';
import { OverlayOp2, type FundoDoOverlay } from './OverlayOp2';

export const OverlayRemoto: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = typeof params?.id === 'string' ? params.id : undefined;
  const modo = searchParams.get('modo') === 'full' ? 'full' : 'mini';
  const fundo: FundoDoOverlay = searchParams.get('fundo') === 'verde' ? 'verde' : 'transparente';

  const estado = useFichaOp2Remota(id);

  if (estado.fase !== 'op2') return null;

  return <OverlayOp2 ficha={estado.documento} modo={modo} fundo={fundo} />;
};
