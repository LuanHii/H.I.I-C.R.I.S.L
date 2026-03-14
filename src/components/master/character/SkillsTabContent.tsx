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
              <h4 className="text-ordem-text-secondary font-bold text-xs uppercase tracking-widest mb-2 border-b border-ordem-border pb-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-ordem-text-muted rotate-45 inline-block"></span>
                {attr} <span className="text-ordem-text-secondary">({agent.atributos[attr]})</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
                {skills.map(([nome, detalhe]) => (
                  <div key={nome} className={`flex justify-between items-center p-2.5 bg-ordem-black-deep/30 rounded-lg border transition-colors gap-3 ${isEditingMode ? 'border-ordem-border-light hover:border-ordem-text-muted' : 'border-ordem-border-light/50 hover:border-ordem-text-muted'}`}>
                    <div className={`flex-1 min-w-0 ${isEditingMode ? 'cursor-pointer hover:text-white' : ''}`} onClick={() => isEditingMode && onToggleSkillGrade(nome as PericiaName)} title={isEditingMode ? "Clique para alterar o grau" : ""}>
                      <span className="text-sm text-ordem-white-muted truncate block">{nome}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button type="button" onClick={() => { const pericia = nome as PericiaName; const det = agent.periciasDetalhadas[pericia]; if (!det) return; onLastRollChange({ pericia, result: rollPericia(det) }); }} className="p-1.5 rounded border border-ordem-border-light text-ordem-white-muted hover:border-ordem-text-muted hover:text-white transition-colors" title="Rolar teste">
                        <Dices size={14} />
                      </button>
                      <span onClick={() => isEditingMode && onToggleSkillGrade(nome as PericiaName)} className={`text-[10px] px-1.5 py-0.5 rounded border ${isEditingMode ? 'cursor-pointer hover:opacity-80' : ''} ${(detalhe.grau || 'Destreinado') === 'Destreinado' ? 'border-ordem-border text-ordem-text-secondary' : detalhe.grau === 'Treinado' ? 'border-green-900 text-green-500' : detalhe.grau === 'Veterano' ? 'border-blue-900 text-blue-500' : 'border-purple-900 text-purple-500'}`}>
                        {(detalhe.grau || 'Destreinado').substring(0, 3).toUpperCase()}
                      </span>
                      {isEditingMode && editingSkill === nome ? (
                        <input type="number" value={tempSkillBonus} onChange={(e) => onTempSkillBonusChange(e.target.value)} onBlur={() => onManualSkillBonusChange(nome as PericiaName, parseInt(tempSkillBonus) || 0)} onKeyDown={(e) => e.key === 'Enter' && onManualSkillBonusChange(nome as PericiaName, parseInt(tempSkillBonus) || 0)} autoFocus className="w-12 bg-ordem-ooze text-white text-center font-mono text-xs border border-ordem-red rounded focus:outline-none" />
                      ) : (
                        <span onClick={() => isEditingMode && onStartEditingSkill(nome as PericiaName, detalhe.bonusFixo)} className={`font-mono text-zinc-100 font-bold text-sm ${isEditingMode ? 'cursor-pointer hover:text-ordem-red underline decoration-dashed underline-offset-4' : ''}`} title={isEditingMode ? "Editar bônus" : ""}>
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
