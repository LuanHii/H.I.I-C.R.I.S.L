import React from 'react';
import { Personagem } from '../core/types';
import { ORIGENS } from '../data/origins';
import { TRILHAS } from '../data/tracks';

interface ProgressionTabProps {
  character: Personagem;
}

export const ProgressionTab: React.FC<ProgressionTabProps> = ({ character }) => {
  const originData = ORIGENS.find(o => o.nome === character.origem);
  const trackData = TRILHAS.find(t => t.nome === character.trilha);
  const isSurvivor = character.classe === 'Sobrevivente';
  const milestones = isSurvivor ? [2, 4] : [10, 40, 65, 99];

  const renderTrackAbility = (nex: number) => {
    const ability = trackData?.habilidades.find(h => h.nex === nex);
    const isUnlocked = isSurvivor 
        ? (character.estagio || 0) >= nex 
        : character.nex >= nex;
    
    const label = isSurvivor ? `Estágio ${nex}` : `${nex}% NEX`;

    return (
      <div key={nex} className={`border-l-2 pl-4 py-2 relative ${isUnlocked ? 'border-ordem-green' : 'border-ordem-border opacity-50'}`}>
        <div className={`absolute -left-[9px] top-2 w-4 h-4 rounded-full border-2 ${isUnlocked ? 'bg-ordem-green border-ordem-green' : 'bg-ordem-black border-ordem-border'}`}></div>
        <h4 className={`font-mono font-bold ${isUnlocked ? 'text-ordem-white' : 'text-ordem-text-secondary'}`}>
          {label} - {ability?.nome || '???'}
        </h4>
        <p className="text-sm text-ordem-white-muted mt-1">
          {ability?.descricao || 'Habilidade bloqueada.'}
        </p>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-y-auto custom-scrollbar space-y-8 pr-2">
      
      <section>
        <h3 className="text-xs font-bold text-ordem-text-secondary uppercase tracking-widest mb-4 border-b border-ordem-border pb-2">
          Origem
        </h3>
        <div className="bg-ordem-black/40 border border-ordem-border p-4 rounded">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl text-ordem-white font-bold">{character.origem}</h2>
              <p className="text-xs text-ordem-text-secondary uppercase tracking-wider">Histórico</p>
            </div>
          </div>

          {originData && (
            <div className="space-y-4">
              <div>
                <span className="text-xs text-ordem-text-secondary uppercase block mb-1">Perícias Treinadas</span>
                <div className="flex flex-wrap gap-2">
                  {originData.pericias.map(p => (
                    <span key={p} className="px-2 py-1 bg-ordem-ooze text-ordem-white-muted text-xs rounded border border-ordem-border">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs text-ordem-text-secondary uppercase block mb-1">Poder de Origem</span>
                <div className="bg-ordem-black/60 p-3 rounded border border-ordem-border/50">
                  <h4 className="text-ordem-gold font-bold text-sm mb-1">{originData.poder.nome}</h4>
                  <p className="text-sm text-ordem-white-muted leading-relaxed">
                    {originData.poder.descricao}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-ordem-text-secondary uppercase tracking-widest mb-4 border-b border-ordem-border pb-2">
          Trilha de Classe
        </h3>
        
        <div className="bg-ordem-black/40 border border-ordem-border p-4 rounded">
          <div className="mb-6">
            <h2 className="text-xl text-ordem-white font-bold">{character.classe}</h2>
            <h3 className="text-lg text-ordem-green">{character.trilha || 'Sem Trilha'}</h3>
            <p className="text-xs text-ordem-text-secondary mt-2">
              {trackData?.descricao}
            </p>
          </div>

          <div className="space-y-6 ml-2">
            {milestones.map(m => renderTrackAbility(m))}
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-ordem-text-secondary uppercase tracking-widest mb-4 border-b border-ordem-border pb-2">
          Passivas & Bônus
        </h3>
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-ordem-black/20 p-3 rounded border border-ordem-border">
                <span className="text-xs text-ordem-text-secondary block">Proficiências</span>
                <div className="text-sm text-ordem-white-muted mt-1">
                    {character.proficiencias.length > 0 ? character.proficiencias.join(', ') : 'Nenhuma'}
                </div>
            </div>
            <div className="bg-ordem-black/20 p-3 rounded border border-ordem-border">
                <span className="text-xs text-ordem-text-secondary block">Resistências</span>
                <div className="text-sm text-ordem-white-muted mt-1">
                    -
                </div>
            </div>
        </div>
      </section>

    </div>
  );
};
