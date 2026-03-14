'use client';

import React from 'react';
import type { ClasseName, Patente } from '@/core/types';
import type { ClassePreferencias } from '@/logic/rulesEngine';
import { ClasseSelector } from './ClasseSelector';
import { NexPatenteSelector } from './NexPatenteSelector';

interface ConceitoClasseStepProps {
  tipo: 'Agente' | 'Sobrevivente' | '';
  nome: string;
  onNomeChange: (v: string) => void;
  conceito: string;
  onConceitoChange: (v: string) => void;
  usarPd: boolean;
  onUsarPdChange: (v: boolean) => void;
  classeSelecionada: ClasseName | '';
  onClasseSelecionadaChange: (v: ClasseName) => void;
  preferenciasCombatente: ClassePreferencias;
  onPreferenciasCombatenteChange: (v: ClassePreferencias) => void;
  nivelSelecionado: number;
  onNivelSelecionadoChange: (v: number) => void;
  patenteSelecionada: Patente;
  onPatenteSelecionadaChange: (v: Patente) => void;
}

export function ConceitoClasseStep({
  tipo,
  nome,
  onNomeChange,
  conceito,
  onConceitoChange,
  usarPd,
  onUsarPdChange,
  classeSelecionada,
  onClasseSelecionadaChange,
  preferenciasCombatente,
  onPreferenciasCombatenteChange,
  nivelSelecionado,
  onNivelSelecionadoChange,
  patenteSelecionada,
  onPatenteSelecionadaChange,
}: ConceitoClasseStepProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-ordem-text-secondary uppercase tracking-widest">Nome do Personagem</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => onNomeChange(e.target.value)}
            placeholder="Ex: Arthur Cervero"
            className="w-full bg-ordem-black/50 border border-ordem-border-light p-4 text-white focus:border-ordem-red focus:outline-none focus:ring-1 focus:ring-ordem-red/50 transition-all font-mono rounded"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-ordem-text-secondary uppercase tracking-widest">Conceito / Passado</label>
          <input
            type="text"
            value={conceito}
            onChange={(e) => onConceitoChange(e.target.value)}
            placeholder="Ex: Músico fracassado que viu o que não devia..."
            className="w-full bg-ordem-black/50 border border-ordem-border-light p-4 text-white focus:border-ordem-red focus:outline-none focus:ring-1 focus:ring-ordem-red/50 transition-all font-mono rounded"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-ordem-black/30 border border-ordem-border rounded-lg">
        <input
          type="checkbox"
          id="usarPd"
          checked={usarPd}
          onChange={(e) => onUsarPdChange(e.target.checked)}
          className="w-5 h-5 rounded border-ordem-border-light bg-ordem-black/50 text-ordem-red focus:ring-ordem-red/50"
        />
        <label htmlFor="usarPd" className="cursor-pointer">
          <span className="block text-sm font-bold text-ordem-white-muted">Usar Regra de Determinação (Sobrevivendo ao Horror)</span>
          <span className="block text-xs text-ordem-text-secondary">Substitui Sanidade e PE por Pontos de Determinação (PD).</span>
        </label>
      </div>

      {tipo === 'Agente' && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 space-y-4">
              <label className="text-xs font-bold text-ordem-text-secondary uppercase tracking-widest">Classe</label>
              <ClasseSelector
                value={classeSelecionada}
                onChange={onClasseSelecionadaChange}
                preferenciasCombatente={preferenciasCombatente}
                onPreferenciasCombatenteChange={onPreferenciasCombatenteChange}
              />
            </div>
            <div className="w-full lg:w-48 mt-4 lg:mt-0">
              <NexPatenteSelector
                nex={nivelSelecionado}
                onNexChange={onNivelSelecionadoChange}
                patente={patenteSelecionada}
                onPatenteChange={onPatenteSelecionadaChange}
              />
            </div>
          </div>
        </div>
      )}

      {tipo === 'Sobrevivente' && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 p-6 border border-ordem-red/30 bg-ordem-red/5 rounded-lg text-center flex flex-col justify-center">
            <h3 className="text-lg sm:text-xl font-serif text-white mb-2">CLASSE: SOBREVIVENTE</h3>
            <p className="text-ordem-white-muted text-sm">Você não possui treinamento especial. Sua única arma é sua vontade de viver.</p>
          </div>
          <div className="w-full sm:w-32 space-y-2">
            <label className="text-xs font-bold text-ordem-text-secondary uppercase tracking-widest">Estágio</label>
            <select
              value={nivelSelecionado}
              onChange={(e) => onNivelSelecionadoChange(Number(e.target.value))}
              className="w-full bg-ordem-black/50 border border-ordem-border-light p-4 text-white focus:border-ordem-red focus:outline-none focus:ring-1 focus:ring-ordem-red/50 transition-all font-mono rounded-lg touch-target"
            >
              {[1, 2, 3, 4, 5].map(estagio => (
                <option key={estagio} value={estagio}>Estágio {estagio}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
