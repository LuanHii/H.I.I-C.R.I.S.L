'use client';

import { useEffect, useState } from 'react';
import type { FichaPersistida } from '../../../core/ficha/tipos';
import { definirIdentidade } from '../../../core/ficha/ajustes';
import { RotuloSecao } from '../ui/Pecas';

export interface IdentidadeFichaProps {
  ficha: FichaPersistida;
  onEditar: (transformar: (ficha: FichaPersistida) => FichaPersistida) => Promise<void> | void;
}

export function IdentidadeFicha({ ficha, onEditar }: IdentidadeFichaProps) {
  const [nome, setNome] = useState(ficha.identidade.nome);
  const [conceito, setConceito] = useState(ficha.identidade.conceito ?? '');

  useEffect(() => { setNome(ficha.identidade.nome); }, [ficha.identidade.nome]);
  useEffect(() => { setConceito(ficha.identidade.conceito ?? ''); }, [ficha.identidade.conceito]);

  const gravarNome = () => {
    if (!nome.trim()) {
      setNome(ficha.identidade.nome);
      return;
    }
    if (nome.trim() !== ficha.identidade.nome) onEditar((f) => definirIdentidade(f, { nome }));
  };

  const gravarConceito = () => {
    if (conceito.trim() !== (ficha.identidade.conceito ?? '')) onEditar((f) => definirIdentidade(f, { conceito }));
  };

  const campo = 'mt-1 w-full border border-white/10 bg-black/30 px-2.5 py-1.5 text-sm text-white placeholder:text-ordem-text-muted focus:border-[var(--mestre-primary,#DC2626)]/60 focus:outline-none';

  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <label className="block">
        <RotuloSecao>Nome</RotuloSecao>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onBlur={gravarNome}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          className={`${campo} font-display text-base uppercase tracking-[0.06em]`}
        />
      </label>
      <label className="block">
        <RotuloSecao>Conceito</RotuloSecao>
        <input
          type="text"
          value={conceito}
          onChange={(e) => setConceito(e.target.value)}
          onBlur={gravarConceito}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          placeholder="Uma linha sobre quem é este agente"
          className={`${campo} italic`}
        />
      </label>
    </div>
  );
}
