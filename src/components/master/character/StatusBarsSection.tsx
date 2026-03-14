'use client';

import React from 'react';
import { StatusBar } from '@/components/StatusBar';
import type { Personagem } from '@/core/types';

interface StatusBarsSectionProps {
  agent: Personagem;
  readOnly?: boolean;
  isEditingMode?: boolean;
  onStatChange: (stat: 'pv' | 'pe' | 'san' | 'pd', value: number) => void;
  onMaxStatChange?: (stat: 'pv' | 'pe' | 'san' | 'pd', value: number) => void;
}

export function StatusBarsSection({
  agent,
  readOnly,
  isEditingMode,
  onStatChange,
  onMaxStatChange,
}: StatusBarsSectionProps) {
  const onMaxChange = isEditingMode ? onMaxStatChange : undefined;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
      <StatusBar label="PV" current={agent.pv.atual} max={agent.pv.max} color="red" onChange={(v) => onStatChange('pv', v)} onMaxChange={onMaxChange ? (v) => onMaxChange('pv', v) : undefined} readOnly={readOnly} />
      {agent.usarPd ? (
        <StatusBar label="PD" current={agent.pd?.atual || 0} max={agent.pd?.max || 0} color="purple" onChange={(v) => onStatChange('pd', v)} onMaxChange={onMaxChange ? (v) => onMaxChange('pd', v) : undefined} readOnly={readOnly} />
      ) : (
        <StatusBar label="SAN" current={agent.san.atual} max={agent.san.max} color="blue" onChange={(v) => onStatChange('san', v)} onMaxChange={onMaxChange ? (v) => onMaxChange('san', v) : undefined} readOnly={readOnly} />
      )}
      {!agent.usarPd && (
        <StatusBar label="PE" current={agent.pe.atual} max={agent.pe.max} color="gold" onChange={(v) => onStatChange('pe', v)} onMaxChange={onMaxChange ? (v) => onMaxChange('pe', v) : undefined} readOnly={readOnly} />
      )}
    </div>
  );
}
