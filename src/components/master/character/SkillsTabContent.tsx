'use client';

import React from 'react';
import { PERICIA_ATRIBUTO } from '@/logic/rulesEngine';
import { rollPericia } from '@/logic/diceRoller';
import type { DiceRollResult } from '@/logic/diceRoller';
import type { AtributoKey, PericiaName, Personagem } from '@/core/types';
import { Dices } from 'lucide-react';

interface SkillsTabContentProps {
  agent: Personagem;
  isEditingMode: boolean;
  lastRoll: { pericia: PericiaName; result: DiceRollResult } | null;
  onLastRollChange: (roll: { pericia: PericiaName; result: DiceRollResult } | null) => void;
  editingSkill: PericiaName | null;
  tempSkillBonus: string;
  onTempSkillBonusChange: (v: string) => void;
  onToggleSkillGrade: (skill: PericiaName) => void;
  onManualSkillBonusChange: (skill: PericiaName, value: number) => void;
  onStartEditingSkill: (skill: PericiaName, currentBonus: number) => void;
}

export function SkillsTabContent({
  agent,
  isEditingMode,
  lastRoll,
  onLastRollChange,
  editingSkill,
  tempSkillBonus,
  onTempSkillBonusChange,
  onToggleSkillGrade,
  onManualSkillBonusChange,
  onStartEditingSkill,
}: SkillsTabContentProps) {
  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
      {lastRoll && (
        <div className="bg-ordem-black/30 border border-ordem-border rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-mono text-ordem-text-secondary">ÚLTIMA ROLAGEM: <span className="text-white font-bold">{lastRoll.pericia}</span></div>
            <div className="text-xs font-mono text-ordem-text-muted">{lastRoll.result.diceCount}d20 ({lastRoll.result.criterio}) {lastRoll.result.bonusFixo >= 0 ? '+' : ''}{lastRoll.result.bonusFixo}</div>
          </div>
          <div className="mt-2 text-sm text-ordem-white font-mono">
            Dados: [{lastRoll.result.dice.join(', ')}] • Escolhido: {lastRoll.result.chosen} • Total: <span className="text-ordem-green font-bold">{lastRoll.result.total}</span>
          </div>
        </div>
      )}
      <div className="space-y-5">
        {(['AGI', 'FOR', 'INT', 'PRE', 'VIG'] as AtributoKey[]).map((attr) => {
          const skills = Object.entries(agent.periciasDetalhadas).filter(([nome]) => PERICIA_ATRIBUTO[nome as PericiaName] === attr);
          if (skills.length === 0) return null;
          return (
            <div key={attr}>
              <h4 className="mb-2 flex items-center gap-2 border-b border-white/10 pb-1.5 font-carimbo text-[11px] uppercase tracking-[0.22em] text-ordem-text-muted">
                <span className="inline-block h-1.5 w-1.5 rotate-45 bg-[var(--mestre-primary,#DC2626)]" aria-hidden></span>
                {attr}
                <span className="font-mono text-ordem-text-secondary">{agent.atributos[attr]}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
                {skills.map(([nome, detalhe]) => (
                  <div key={nome} className={`group flex items-center justify-between gap-3 border px-2.5 py-2 transition-colors ${(detalhe.grau || 'Destreinado') === 'Destreinado'
                    ? 'border-white/[0.06] bg-transparent hover:border-white/15'
                    : 'border-white/12 bg-white/[0.03] hover:border-[var(--mestre-primary,#DC2626)]/40'}`}>
                    <div className={`min-w-0 flex-1 ${isEditingMode ? 'cursor-pointer hover:text-white' : ''}`} onClick={() => isEditingMode && onToggleSkillGrade(nome as PericiaName)} title={isEditingMode ? "Clique para alterar o grau" : ""}>
                      <span className={`block truncate text-sm ${(detalhe.grau || 'Destreinado') === 'Destreinado' ? 'text-ordem-text-muted' : 'font-medium text-white'}`}>{nome}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button type="button" onClick={() => { const pericia = nome as PericiaName; const det = agent.periciasDetalhadas[pericia]; if (!det) return; onLastRollChange({ pericia, result: rollPericia(det) }); }} className="border border-white/10 p-1.5 text-ordem-text-muted opacity-0 transition-all hover:border-ordem-text-muted hover:text-white focus:opacity-100 group-hover:opacity-100" title="Rolar teste">
                        <Dices size={14} />
                      </button>
                      {((detalhe.grau || 'Destreinado') !== 'Destreinado' || isEditingMode) && (
                        <span onClick={() => isEditingMode && onToggleSkillGrade(nome as PericiaName)} className={`font-carimbo text-[9px] uppercase tracking-[0.12em] px-1.5 py-0.5 border ${isEditingMode ? 'cursor-pointer hover:opacity-80' : ''} ${(detalhe.grau || 'Destreinado') === 'Destreinado' ? 'border-white/10 text-ordem-text-muted' : detalhe.grau === 'Treinado' ? 'border-ordem-green/40 text-ordem-green' : detalhe.grau === 'Veterano' ? 'border-ordem-blue/40 text-ordem-blue' : 'border-ordem-purple/40 text-ordem-purple'}`}>
                          {(detalhe.grau || 'Destreinado').substring(0, 3).toUpperCase()}
                        </span>
                      )}
                      {isEditingMode && editingSkill === nome ? (
                        <input type="number" value={tempSkillBonus} onChange={(e) => onTempSkillBonusChange(e.target.value)} onBlur={() => onManualSkillBonusChange(nome as PericiaName, parseInt(tempSkillBonus) || 0)} onKeyDown={(e) => e.key === 'Enter' && onManualSkillBonusChange(nome as PericiaName, parseInt(tempSkillBonus) || 0)} autoFocus className="w-12 bg-ordem-ooze text-white text-center font-mono text-xs border border-ordem-red rounded focus:outline-none" />
                      ) : (
                        <span onClick={() => isEditingMode && onStartEditingSkill(nome as PericiaName, detalhe.bonusFixo)} className={`w-8 text-right font-mono text-base font-bold tabular-nums ${(detalhe.grau || 'Destreinado') === 'Destreinado' ? 'text-ordem-text-muted' : 'text-white'} ${isEditingMode ? 'cursor-pointer underline decoration-dashed underline-offset-4 hover:text-ordem-red' : ''}`} title={isEditingMode ? "Editar bônus" : ""}>
                          +{detalhe.bonusFixo || 0}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
