import React, { useState } from 'react';
import { PericiaName, GrauTreinamento } from '../../core/types';
import { TODAS_PERICIAS } from '../../logic/rulesEngine';

interface SkillSelectorModalProps {
  isOpen: boolean;
  currentSkills: Record<PericiaName, GrauTreinamento>;
  onSelect: (skill: PericiaName) => void;
  onDefer?: () => void;
  title?: string;
  description?: string;
  eligibleFrom?: GrauTreinamento;
  confirmLabel?: string;
}

export const SkillSelectorModal: React.FC<SkillSelectorModalProps> = ({
  isOpen,
  currentSkills,
  onSelect,
  onDefer,
  title,
  description,
  eligibleFrom,
  confirmLabel,
}) => {
  const [selected, setSelected] = useState<PericiaName | null>(null);

  if (!isOpen) return null;

  const from = eligibleFrom ?? 'Destreinado';
  const availableSkills = TODAS_PERICIAS.filter(
    (p) => currentSkills[p] === from
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2">{title ?? 'Nova Perícia Treinada'}</h3>
        <p className="text-zinc-400 text-sm mb-4">
          {description ?? 'Seu Intelecto aumentou! Escolha uma nova perícia para se tornar Treinado.'}
        </p>

        <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 mb-6">
          {availableSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => setSelected(skill)}
              className={`w-full text-left p-3 rounded border transition-all ${
                selected === skill
                  ? 'bg-zinc-800 border-green-500 text-white'
                  : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {onDefer && (
            <button
              onClick={onDefer}
              className="w-1/3 py-3 border border-zinc-600 text-zinc-400 hover:text-white hover:border-white rounded transition-colors font-bold"
            >
              Depois
            </button>
          )}
          <button
            onClick={() => selected && onSelect(selected)}
            disabled={!selected}
            className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded transition-colors"
          >
            {confirmLabel ?? 'Confirmar Escolha'}
          </button>
        </div>
      </div>
    </div>
  );
};
