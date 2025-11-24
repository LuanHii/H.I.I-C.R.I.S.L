import React, { useState } from 'react';
import { Personagem, Trilha } from '../core/types';
import { TRILHAS } from '../data/tracks';

interface TrackSelectorModalProps {
  agent: Personagem;
  onConfirm: (trackName: string) => void;
  onDefer?: () => void;
}

export const TrackSelectorModal: React.FC<TrackSelectorModalProps> = ({ agent, onConfirm, onDefer }) => {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  const availableTracks = TRILHAS.filter(t => t.classe === agent.classe);

  const handleConfirm = () => {
    if (selectedTrack) {
      onConfirm(selectedTrack);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-4xl w-full shadow-2xl h-[80vh] flex flex-col">
        <div className="mb-4 border-b border-zinc-800 pb-4">
            <h2 className="text-2xl font-serif text-ordem-red mb-1">ESCOLHA SUA TRILHA</h2>
            <p className="text-zinc-400">
                Seu personagem atingiu um novo patamar. Escolha como ele se especializará.
            </p>
        </div>
        
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
            {availableTracks.map(track => (
                <div 
                    key={track.nome}
                    onClick={() => setSelectedTrack(track.nome)}
                    className={`
                        cursor-pointer border rounded-lg p-4 transition-all duration-200
                        flex flex-col gap-2 relative overflow-hidden group
                        ${selectedTrack === track.nome 
                            ? 'bg-zinc-800 border-ordem-red ring-1 ring-ordem-red' 
                            : 'bg-black/40 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50'}
                    `}
                >
                    <div className="flex justify-between items-start">
                        <h3 className={`font-bold text-lg ${selectedTrack === track.nome ? 'text-ordem-red' : 'text-white group-hover:text-zinc-200'}`}>
                            {track.nome}
                        </h3>
                        {selectedTrack === track.nome && (
                            <div className="w-3 h-3 bg-ordem-red rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
                        )}
                    </div>
                    
                    <p className="text-sm text-zinc-400 leading-relaxed flex-1">
                        {track.descricao}
                    </p>

                    <div className="mt-4 pt-4 border-t border-zinc-800/50">
                        <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-2 block">
                            Primeira Habilidade
                        </span>
                        {track.habilidades[0] && (
                            <div>
                                <span className="text-zinc-300 font-bold text-sm block mb-1">
                                    {track.habilidades[0].nome}
                                </span>
                                <p className="text-xs text-zinc-400 line-clamp-3">
                                    {track.habilidades[0].descricao}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end gap-4 items-center">
            <div className="text-zinc-400 text-sm italic">
                {selectedTrack ? `Selecionado: ${selectedTrack}` : 'Nenhuma trilha selecionada'}
            </div>
            {onDefer && (
                <button 
                    onClick={onDefer}
                    className="px-6 py-3 border border-zinc-600 text-zinc-400 rounded hover:text-white hover:border-white transition-colors font-bold tracking-wide"
                >
                    ESCOLHER DEPOIS
                </button>
            )}
            <button 
                onClick={handleConfirm}
                disabled={!selectedTrack}
                className="px-6 py-3 bg-ordem-red text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold tracking-wide transition-colors"
            >
                CONFIRMAR ESCOLHA
            </button>
        </div>
      </div>
    </div>
  );
};
