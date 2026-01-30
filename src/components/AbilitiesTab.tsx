import React, { useState } from 'react';
import { AbilityCard } from './AbilityCard';
import { Personagem } from '../core/types';

interface AbilitiesTabProps {
  character: Personagem;
  useSanity?: boolean;
}

export const AbilitiesTab: React.FC<AbilitiesTabProps> = ({ character, useSanity = true }) => {
  const [filter, setFilter] = useState<'todos' | 'poderes' | 'rituais'>('todos');

  const myPowers = character.poderes;
  const myRituals = character.rituais;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex gap-2 mb-4 border-b border-ordem-border pb-2">
        <button
          onClick={() => setFilter('todos')}
          className={`px-3 py-1 text-sm font-mono rounded ${filter === 'todos' ? 'bg-ordem-white text-black' : 'text-ordem-text-secondary hover:text-white'}`}
        >
          TODOS
        </button>
        <button
          onClick={() => setFilter('poderes')}
          className={`px-3 py-1 text-sm font-mono rounded ${filter === 'poderes' ? 'bg-ordem-white text-black' : 'text-ordem-text-secondary hover:text-white'}`}
        >
          HABILIDADES
        </button>
        <button
          onClick={() => setFilter('rituais')}
          className={`px-3 py-1 text-sm font-mono rounded ${filter === 'rituais' ? 'bg-ordem-white text-black' : 'text-ordem-text-secondary hover:text-white'}`}
        >
          RITUAIS
        </button>
      </div>

      <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
        {(filter === 'todos' || filter === 'poderes') && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-ordem-text-muted uppercase tracking-widest mb-2 sticky top-0 bg-ordem-black/90 py-1 z-10">
              Habilidades & Poderes
            </h3>
            {myPowers.map((poder, idx) => (
              <AbilityCard key={`p-${idx}`} data={poder} type="poder" useSanity={useSanity} />
            ))}
          </div>
        )}

        {(filter === 'todos' || filter === 'rituais') && (
          <div>
            <h3 className="text-xs font-bold text-ordem-text-muted uppercase tracking-widest mb-2 sticky top-0 bg-ordem-black/90 py-1 z-10">
              Rituais
            </h3>
            {myRituals.map((ritual, idx) => (
              <AbilityCard key={`r-${idx}`} data={ritual} type="ritual" useSanity={useSanity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
