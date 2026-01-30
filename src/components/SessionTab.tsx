import React, { useState } from 'react';
import { Personagem } from '../core/types';
import { ConditionsManager } from './ConditionsManager';

interface SessionTabProps {
  personagem: Personagem;
  onUpdate: (updated: Personagem) => void;
}

export const SessionTab: React.FC<SessionTabProps> = ({ personagem, onUpdate }) => {
  const [rodada, setRodada] = useState(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="bg-ordem-ooze p-4 rounded-lg border border-ordem-border">
          <h3 className="text-xl font-bold text-zinc-100 mb-4">Controle de Cena</h3>
          <div className="flex items-center justify-between bg-ordem-black-deep p-4 rounded border border-ordem-border">
            <span className="text-ordem-text-secondary">Rodada Atual</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setRodada(Math.max(1, rodada - 1))}
                className="w-8 h-8 flex items-center justify-center bg-ordem-ooze hover:bg-ordem-border-light rounded text-ordem-white"
              >
                -
              </button>
              <span className="text-2xl font-mono font-bold text-red-500">{rodada}</span>
              <button
                onClick={() => setRodada(rodada + 1)}
                className="w-8 h-8 flex items-center justify-center bg-ordem-ooze hover:bg-ordem-border-light rounded text-ordem-white"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <ConditionsManager personagem={personagem} onUpdate={onUpdate} />
      </div>

      <div className="space-y-6">
        <div className="bg-ordem-ooze p-4 rounded-lg border border-ordem-border">
          <h3 className="text-xl font-bold text-zinc-100 mb-4">Log de Combate</h3>
          <div className="h-96 bg-ordem-black-deep rounded border border-ordem-border p-4 overflow-y-auto custom-scrollbar font-mono text-sm">
            {personagem.log && personagem.log.length > 0 ? (
              <div className="space-y-2">
                {personagem.log.map((entry, index) => (
                  <div key={index} className="flex gap-2 text-ordem-text-secondary border-b border-ordem-ooze pb-1 last:border-0">
                    <span className="text-ordem-text-secondary text-xs whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className={`
                      ${entry.tipo === 'dano' ? 'text-red-500' : ''}
                      ${entry.tipo === 'cura' ? 'text-green-500' : ''}
                      ${entry.tipo === 'gasto' ? 'text-blue-400' : ''}
                      ${entry.tipo === 'condicao' ? 'text-yellow-500' : ''}
                    `}>
                      {entry.mensagem}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-ordem-text-secondary italic">Nenhum registro.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
