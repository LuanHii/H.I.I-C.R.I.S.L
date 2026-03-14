'use client';

import React from 'react';
import type { Personagem } from '@/core/types';
import { calcularDefesaEfetiva } from '@/logic/combatUtils';
import { Brain, Flame, Edit2 } from 'lucide-react';

interface AuditSummary {
  total: number;
  errors: number;
  warns: number;
}

interface CharacterHeaderProps {
  agent: Personagem;
  readOnly?: boolean;
  auditSummary: AuditSummary;
  auditTitle: string;
  warnings: string[];
  onLevelUp: () => void;
  onLevelDown: () => void;
  onPatenteClick: () => void;
  onTogglePd: () => void;
  onFixInconsistencies: () => void;
}

export function CharacterHeader({
  agent,
  readOnly,
  auditSummary,
  auditTitle,
  warnings,
  onLevelUp,
  onLevelDown,
  onPatenteClick,
  onTogglePd,
  onFixInconsistencies,
}: CharacterHeaderProps) {
  const defesa = calcularDefesaEfetiva(agent);

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight truncate">{agent.nome}</h2>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-ordem-white-muted font-mono text-[10px] sm:text-xs">
            <span className="bg-ordem-black-deep/50 px-2 py-1 rounded border border-ordem-text-muted">{agent.classe}</span>
            <div className="flex items-center bg-ordem-black-deep/50 rounded border border-ordem-text-muted overflow-hidden">
              {!readOnly && (
                <button type="button" onClick={onLevelDown} className="px-2 py-1 hover:bg-ordem-border-light text-ordem-text-secondary hover:text-white transition-colors border-r border-ordem-text-muted touch-target-sm" title="Diminuir Nível">-</button>
              )}
              <span className="px-2 py-1 text-zinc-100">
                {agent.classe === 'Sobrevivente' ? `Est. ${agent.estagio || 1}` : `${agent.nex}%`}
              </span>
              {!readOnly && (
                <button type="button" onClick={onLevelUp} className="px-2 py-1 hover:bg-ordem-border-light text-ordem-text-secondary hover:text-white transition-colors border-l border-ordem-text-muted touch-target-sm" title="Aumentar Nível">+</button>
              )}
            </div>
            <span className="bg-ordem-black-deep/50 px-2 py-1 rounded border border-ordem-text-muted truncate max-w-[120px] sm:max-w-none">{agent.origem || 'Sem Origem'}</span>
            {!readOnly ? (
              <button type="button" onClick={onPatenteClick} className="bg-ordem-black-deep/50 px-2 py-1 rounded border border-ordem-gold/50 text-ordem-gold hover:bg-ordem-gold/10 transition-colors flex items-center gap-1" title="Alterar Patente">
                {agent.patente || 'Recruta'} <Edit2 size={10} className="opacity-60" />
              </button>
            ) : (
              <span className="bg-ordem-black-deep/50 px-2 py-1 rounded border border-ordem-gold/50 text-ordem-gold">{agent.patente || 'Recruta'}</span>
            )}
            {!readOnly && (
              <button type="button" onClick={onTogglePd} className="px-2 py-1 bg-ordem-black-deep/50 rounded border border-ordem-text-muted hover:border-ordem-text-secondary transition-colors" title={agent.usarPd ? "Desativar Regra de Determinação" : "Ativar Regra de Determinação"}>
                {agent.usarPd ? <Flame size={14} className="text-violet-300" /> : <Brain size={14} className="text-blue-300" />}
              </button>
            )}
            {auditSummary.total > 0 && (
              <div className={`px-2 py-1 rounded border text-[10px] font-mono tracking-widest ${auditSummary.errors > 0 ? 'border-ordem-red text-ordem-red bg-ordem-red/10' : 'border-ordem-gold text-ordem-gold bg-ordem-gold/10'}`} title={auditTitle}>
                {auditSummary.errors > 0 ? 'ERRO' : 'AVISO'} {auditSummary.total}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center shrink-0">
          <div className="text-[10px] sm:text-xs text-ordem-text-secondary uppercase tracking-widest">Defesa</div>
          <div className="text-2xl sm:text-3xl font-bold text-zinc-100 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ordem-text-secondary sm:w-6 sm:h-6"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
            {defesa}
          </div>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="mb-4 bg-ordem-red/10 border border-ordem-red/30 rounded-lg p-3 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <ul className="text-xs text-ordem-white space-y-0.5 list-disc pl-4">
              {warnings.slice(0, 3).map((w, idx) => <li key={idx}>{w}</li>)}
            </ul>
          </div>
          {!readOnly && <button type="button" onClick={onFixInconsistencies} className="shrink-0 px-2 py-1 text-[10px] font-mono uppercase border border-ordem-red/40 text-ordem-red hover:bg-ordem-red/15 rounded transition-colors">Corrigir</button>}
        </div>
      )}
    </div>
  );
}
