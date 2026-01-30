import React, { useState } from 'react';
import { Ameaca } from '../../core/types';

interface ActiveThreat {
  instanceId: string;
  data: Ameaca;
  currentHP: number;
}

interface ThreatCardProps {
  threat: ActiveThreat;
  onUpdateHP: (instanceId: string, newHP: number) => void;
  onRemove: (instanceId: string) => void;
}

export const ThreatCard: React.FC<ThreatCardProps> = ({ threat, onUpdateHP, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, currentHP } = threat;

  const handleHpChange = (delta: number) => {
    const newHP = Math.max(0, Math.min(data.vida, currentHP + delta));
    onUpdateHP(threat.instanceId, newHP);
  };

  return (
    <div className={`bg-ordem-black-deep/50 border ${isExpanded ? 'border-ordem-text-muted' : 'border-ordem-border-light'} rounded-lg overflow-hidden transition-all duration-200`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex items-center gap-2">
                <h4 className="font-bold text-lg text-zinc-100 hover:text-white transition-colors">{data.nome}</h4>
                {isExpanded ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ordem-text-muted"><path d="m18 15-6-6-6 6"/></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ordem-text-muted"><path d="m6 9 6 6 6-6"/></svg>
                )}
            </div>
            <div className="flex gap-2 mt-1">
              <span className="text-[10px] font-mono bg-ordem-black/50 px-1.5 py-0.5 rounded text-ordem-text-secondary border border-ordem-border-light">VD {data.vd}</span>
              <span className="text-[10px] font-mono bg-ordem-black/50 px-1.5 py-0.5 rounded text-ordem-text-secondary border border-ordem-border-light">DEF {data.defesa}</span>
              <span className="text-[10px] font-mono bg-ordem-black/50 px-1.5 py-0.5 rounded text-ordem-text-secondary border border-ordem-border-light">{data.tamanho}</span>
            </div>
          </div>
          <button
            onClick={() => onRemove(threat.instanceId)}
            className="text-ordem-text-muted hover:text-red-400 transition-colors p-1 ml-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 12"/></svg>
          </button>
        </div>

        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1 font-mono">
            <span className="text-ordem-text-secondary">PV</span>
            <span className="text-ordem-white">{currentHP} / {data.vida}</span>
          </div>
          <div className="h-3 bg-ordem-black-deep border border-ordem-border-light rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-red-900 to-red-600 transition-all duration-500"
              style={{ width: `${(currentHP / data.vida) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-ordem-border-light bg-ordem-ooze/30 p-4 animate-in slide-in-from-top-2">

            <div className="flex items-center justify-between mb-6 bg-ordem-black-deep p-2 rounded border border-ordem-border">
                <span className="text-xs font-mono text-ordem-text-muted uppercase ml-2">Gerenciar Vida</span>
                <div className="flex items-center gap-1">
                    <button onClick={() => handleHpChange(-10)} className="px-2 py-1 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded text-xs font-mono border border-red-900/30">-10</button>
                    <button onClick={() => handleHpChange(-5)} className="px-2 py-1 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded text-xs font-mono border border-red-900/30">-5</button>
                    <button onClick={() => handleHpChange(-1)} className="px-2 py-1 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded text-xs font-mono border border-red-900/30">-1</button>
                    <div className="w-px h-4 bg-ordem-ooze mx-1"></div>
                    <button onClick={() => handleHpChange(1)} className="px-2 py-1 bg-green-900/20 hover:bg-green-900/40 text-green-500 rounded text-xs font-mono border border-green-900/30">+1</button>
                    <button onClick={() => handleHpChange(5)} className="px-2 py-1 bg-green-900/20 hover:bg-green-900/40 text-green-500 rounded text-xs font-mono border border-green-900/30">+5</button>
                    <button onClick={() => handleHpChange(10)} className="px-2 py-1 bg-green-900/20 hover:bg-green-900/40 text-green-500 rounded text-xs font-mono border border-green-900/30">+10</button>
                </div>
            </div>

            <div className="flex justify-between gap-2 mb-6">
                {Object.entries(data.atributos).map(([key, val]) => (
                    <div key={key} className="flex flex-col items-center flex-1 bg-ordem-black-deep/50 p-2 rounded border border-ordem-border">
                        <span className="text-[10px] font-mono text-ordem-text-muted uppercase">{key}</span>
                        <span className="text-lg font-bold text-ordem-white">{val}</span>
                    </div>
                ))}
            </div>

            {(data.resistencias || data.vulnerabilidades || data.imunidades) && (
                <div className="mb-6 space-y-2 text-xs">
                    {data.resistencias && data.resistencias.length > 0 && (
                        <div className="flex gap-2">
                            <span className="text-ordem-text-muted font-bold">RESISTÊNCIAS:</span>
                            <span className="text-ordem-white-muted">{data.resistencias.join(', ')}</span>
                        </div>
                    )}
                    {data.vulnerabilidades && data.vulnerabilidades.length > 0 && (
                        <div className="flex gap-2">
                            <span className="text-ordem-text-muted font-bold">VULNERABILIDADES:</span>
                            <span className="text-ordem-white-muted">{data.vulnerabilidades.join(', ')}</span>
                        </div>
                    )}
                    {data.imunidades && data.imunidades.length > 0 && (
                        <div className="flex gap-2">
                            <span className="text-ordem-text-muted font-bold">IMUNIDADES:</span>
                            <span className="text-ordem-white-muted">{data.imunidades.join(', ')}</span>
                        </div>
                    )}
                </div>
            )}

            {data.acoes.length > 0 && (
                <div className="mb-6">
                    <h5 className="text-xs font-bold text-ordem-text-muted uppercase mb-3 border-b border-ordem-border pb-1">Ações</h5>
                    <div className="space-y-3">
                        {data.acoes.map((acao, idx) => (
                            <div key={idx} className="bg-ordem-black-deep/30 p-3 rounded border border-ordem-border">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-ordem-white text-sm">{acao.nome}</span>
                                    {acao.tipo && <span className="text-[10px] bg-ordem-ooze px-1.5 py-0.5 rounded text-ordem-text-muted border border-ordem-border">{acao.tipo}</span>}
                                </div>
                                <p className="text-xs text-ordem-text-secondary leading-relaxed">{acao.descricao}</p>
                                {(acao.teste || acao.dano) && (
                                    <div className="flex gap-3 mt-2 text-[10px] font-mono text-ordem-text-muted">
                                        {acao.teste && <span className="text-ordem-white-muted">Teste: {acao.teste}</span>}
                                        {acao.dano && <span className="text-red-400">Dano: {acao.dano}</span>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {data.habilidades.length > 0 && (
                <div>
                    <h5 className="text-xs font-bold text-ordem-text-muted uppercase mb-3 border-b border-ordem-border pb-1">Habilidades</h5>
                    <div className="space-y-3">
                        {data.habilidades.map((hab, idx) => (
                            <div key={idx} className="bg-ordem-black-deep/30 p-3 rounded border border-ordem-border">
                                <span className="font-bold text-ordem-white text-sm block mb-1">{hab.nome}</span>
                                <p className="text-xs text-ordem-text-secondary leading-relaxed">{hab.descricao}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {data.presencaPerturbadora && (
                <div className="mt-4 bg-purple-900/10 border border-purple-900/30 p-3 rounded">
                    <h5 className="text-xs font-bold text-purple-400 uppercase mb-1">Presença Perturbadora</h5>
                    <div className="flex justify-between text-xs text-purple-300 font-mono">
                        <span>DT {data.presencaPerturbadora.dt}</span>
                        <span>{data.presencaPerturbadora.dano} mental</span>
                        {data.presencaPerturbadora.nexImune && <span>NEX Imune: {data.presencaPerturbadora.nexImune}%</span>}
                    </div>
                </div>
            )}

        </div>
      )}
    </div>
  );
};
