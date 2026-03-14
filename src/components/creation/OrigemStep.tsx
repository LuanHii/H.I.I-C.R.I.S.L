'use client';

import React from 'react';
import { ORIGENS } from '@/data/origins';
import { OrigemSelector } from './OrigemSelector';

interface OrigemStepProps {
  value: string;
  onChange: (nome: string) => void;
}

export function OrigemStep({ value, onChange }: OrigemStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-serif text-white">Origem</h3>
          <p className="text-ordem-text-secondary text-sm">O que você fazia antes?</p>
        </div>
        <div className="text-xs font-mono text-ordem-text-muted">
          {ORIGENS.length} REGISTROS DISPONÍVEIS
        </div>
      </div>
      <OrigemSelector value={value} onChange={onChange} />
    </div>
  );
}
