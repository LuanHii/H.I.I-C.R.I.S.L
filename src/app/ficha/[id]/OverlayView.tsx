import React from 'react';
import { Personagem } from '../../../core/types';
import { Heart, Brain, Zap, Shield } from 'lucide-react';

interface OverlayViewProps {
  agent: Personagem;
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
    <div className="flex flex-col bg-zinc-900/80 rounded-lg p-3 border border-zinc-800 relative overflow-hidden group">
      {/* Background progress bar styled simply */}
      <div 
        className={`absolute bottom-0 left-0 h-1 transition-all duration-500`} 
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
      
      <div className="flex items-center gap-2 mb-1 opacity-80">
        <span style={{ color: color }}>{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">{label}</span>
      </div>
      
      <div className="flex items-baseline gap-1 mt-auto">
        <span className="text-3xl font-bold text-white leading-none tracking-tight">{current}</span>
        <span className="text-sm font-mono text-zinc-500">/{max}</span>
      </div>
    </div>
  );
};

export function OverlayView({ agent }: OverlayViewProps) {
  // Determine if PD should be shown (Block/Shielding)
  const showPd = agent.usarPd && agent.pd;

  return (
    // Fundo Verde Chroma Key
    <div className="min-h-screen w-full bg-[#00FF00] flex items-center justify-center p-4">
      
      {/* Card Principal - Estilo "Widget" */}
      <div className="w-full max-w-[400px] bg-black border-2 border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Compacto */}
        <div className="bg-zinc-900 border-b border-zinc-800 p-4 pb-3">
           <h1 className="text-2xl font-bold text-white truncate leading-tight">
             {agent.nome}
           </h1>
           <div className="flex items-center gap-2 text-xs font-mono mt-1">
              <span className="text-ordem-red font-bold uppercase bg-ordem-red/10 px-1.5 py-0.5 rounded">
                {agent.classe}
              </span>
              <span className="text-zinc-500">|</span>
              <span className="text-zinc-400 font-semibold">{agent.nex}% NEX</span>
           </div>
        </div>

        {/* Grid de Status */}
        <div className="p-3 grid grid-cols-2 gap-3 bg-black/95">
           <StatusCompact 
              icon={<Heart size={18} />}
              label="Vida"
              current={agent.pv.atual}
              max={agent.pv.max}
              color="#ef4444" // red-500
           />
           
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
           
           {showPd && agent.pd ? (
             <StatusCompact 
                icon={<Shield size={18} />}
                label="Proteção"
                current={agent.pd.atual}
                max={agent.pd.max}
                color="#a855f7" // purple-500
             />
           ) : (
             // Placeholder ou Defesa Passiva se não tiver PD
             <div className="flex flex-col bg-zinc-900/50 rounded-lg p-3 border border-zinc-800/50 items-center justify-center text-zinc-600">
                <Shield size={24} className="opacity-20 mb-1" />
                <span className="text-xs font-mono uppercase">Defesa {agent.defesa}</span>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
