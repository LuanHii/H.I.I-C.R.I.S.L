import React from 'react';
import { Personagem } from '../../../core/types';
import { Heart, Brain, Zap, Shield, Flame } from 'lucide-react';

interface OverlayViewProps {
  agent: Personagem;
  mode?: 'mini' | 'full';
}

interface StatusCompactProps {
  icon: React.ReactNode;
  label: string;
  current: number;
  max: number;
  color: string;
}

const StatusCompact = ({ icon, label, current, max, color }: StatusCompactProps) => {
  const percent = Math.min(100, Math.max(0, (current / max) * 100));
  
  return (
    <div className="flex flex-col bg-zinc-900/80 rounded-lg p-3 border border-zinc-800 relative overflow-hidden group min-h-[85px] justify-between">
      {/* Background progress bar styled simply */}
      <div 
        className={`absolute bottom-0 left-0 h-1 transition-all duration-500`} 
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
      
      <div className="flex items-center gap-2 mb-1 opacity-80 z-10">
        <span style={{ color: color }}>{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">{label}</span>
      </div>
      
      <div className="flex items-baseline gap-1 mt-auto z-10">
        <span className="text-4xl font-bold text-white leading-none tracking-tight drop-shadow-md">{current}</span>
        <span className="text-sm font-mono text-zinc-500 font-semibold">/{max}</span>
      </div>
    </div>
  );
};

export function OverlayView({ agent, mode = 'mini' }: OverlayViewProps) {
  // Se usarPd for true, ativamos a regra de Determinação (substitui SAN e PE)
  const usarDeterminacao = agent.usarPd && agent.pd;
  const hasPendencias =
    (agent.periciasTreinadasPendentes && agent.periciasTreinadasPendentes > 0) ||
    (agent.periciasPromocaoPendentes && agent.periciasPromocaoPendentes.restante > 0) ||
    agent.escolhaTrilhaPendente ||
    (agent.habilidadesTrilhaPendentes && agent.habilidadesTrilhaPendentes.length > 0);

  return (
    // Fundo Verde Chroma Key
    <div className="min-h-screen w-full bg-[#00FF00] flex items-center justify-center p-4">
      
      {/* Card Principal - Estilo "Widget" */}
      <div className="w-full max-w-[420px] bg-black border-2 border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Compacto */}
        <div className="bg-zinc-900 border-b border-zinc-800 p-4 pb-3 flex justify-between items-center gap-3">
           <div className="overflow-hidden mr-2">
             <h1 className="text-2xl font-bold text-white truncate leading-tight">
               {agent.nome}
             </h1>
             <div className="flex items-center gap-2 text-xs font-mono mt-1">
                <span className="text-ordem-red font-bold uppercase bg-ordem-red/10 px-1.5 py-0.5 rounded">
                  {agent.classe}
                </span>
                <span className="text-zinc-500">|</span>
                <span className="text-zinc-400 font-semibold">{agent.classe === 'Sobrevivente' ? `Estágio ${agent.estagio ?? 1}` : `${agent.nex}% NEX`}</span>
                {hasPendencias && (
                  <>
                    <span className="text-zinc-500">|</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded">
                      PENDENTE
                    </span>
                  </>
                )}
             </div>
           </div>
           
           {/* Defesa no Header para economizar espaço */}
           <div className="flex flex-col items-center bg-zinc-950 px-3 py-1.5 rounded border border-zinc-800">
              <Shield size={16} className="text-zinc-500 mb-0.5" />
              <span className="text-lg font-bold text-zinc-300 leading-none">{agent.defesa}</span>
           </div>
        </div>

        {/* Grid de Status */}
        <div className={`p-3 grid gap-3 bg-black/95 ${usarDeterminacao ? 'grid-cols-2' : 'grid-cols-2'}`}>
           <div className={usarDeterminacao ? '' : 'col-span-2'}>
             <StatusCompact 
                icon={<Heart size={18} />}
                label="Vida"
                current={agent.pv.atual}
                max={agent.pv.max}
                color="#ef4444" // red-500
             />
           </div>
           
           {usarDeterminacao ? (
             <StatusCompact 
                icon={<Flame size={18} />}
                label="Determinação"
                current={agent.pd!.atual}
                max={agent.pd!.max}
                color="#8b5cf6" // violet-500 (Mistura de azul e vermelho/amarelo)
             />
           ) : (
             <>
               <StatusCompact 
                  icon={<Brain size={18} />}
                  label="Sanidade"
                  current={agent.san.atual}
                  max={agent.san.max}
                  color="#3b82f6" // blue-500
               />
               
               <StatusCompact 
                  icon={<Zap size={18} />}
                  label="Esforço"
                  current={agent.pe.atual}
                  max={agent.pe.max}
                  color="#eab308" // yellow-500
               />
             </>
           )}
        </div>

        {mode === 'full' && (
          <div className="border-t border-zinc-800 bg-zinc-950/60 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold tracking-[0.3em] text-zinc-400 uppercase">Recursos</div>
              {/* Sem indicador de turno/rodada (não usado) */}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-black/40 border border-zinc-800 rounded p-2">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">PV</div>
                <div className="text-sm font-bold text-white font-mono">{agent.pv.atual}/{agent.pv.max}</div>
              </div>
              {usarDeterminacao ? (
                <div className="bg-black/40 border border-zinc-800 rounded p-2 col-span-2">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest">PD</div>
                  <div className="text-sm font-bold text-white font-mono">{agent.pd?.atual ?? 0}/{agent.pd?.max ?? 0}</div>
                </div>
              ) : (
                <>
                  <div className="bg-black/40 border border-zinc-800 rounded p-2">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">PE</div>
                    <div className="text-sm font-bold text-white font-mono">{agent.pe.atual}/{agent.pe.max}</div>
                  </div>
                  <div className="bg-black/40 border border-zinc-800 rounded p-2">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">SAN</div>
                    <div className="text-sm font-bold text-white font-mono">{agent.san.atual}/{agent.san.max}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
