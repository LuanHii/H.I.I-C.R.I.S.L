'use client';

import React, { useEffect } from 'react';
import type { Personagem } from '../../../core/types';
import { textoDoValor, valoresDeOverlay, type CampoDeOverlay, type FormatoDeOverlay } from '../../../core/overlay/valores';

interface ValorViewProps {
  agent: Personagem;
  campo: CampoDeOverlay;
  formato: FormatoDeOverlay;
  fundo: 'transparente' | 'verde';
}

export function ValorView({ agent, campo, formato, fundo }: ValorViewProps) {
  useEffect(() => {
    document.documentElement.dataset.overlay = 'valor';
    return () => { delete document.documentElement.dataset.overlay; };
  }, []);

  const valores = valoresDeOverlay(agent);
  const texto = textoDoValor(valores, campo, formato);
  const recurso = campo === 'pv' || campo === 'san' || campo === 'pe' || campo === 'pd' || campo === 'carga' ? valores[campo] : undefined;
  const percentual = recurso && recurso.max > 0 ? Math.round((recurso.atual / recurso.max) * 100) : undefined;

  return (
    <div
      id="overlay"
      data-campo={campo}
      data-formato={formato}
      data-percentual={percentual}
      className={`valor-overlay valor-${campo} flex min-h-screen w-full items-center justify-center ${fundo === 'verde' ? 'bg-[#00FF00]' : 'bg-transparent'}`}
      style={{ margin: 0 }}
    >
      <span
        id="valor"
        className="valor font-display font-bold leading-none text-white"
        style={{ fontSize: '96px', textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}
      >
        {texto}
      </span>
    </div>
  );
}
