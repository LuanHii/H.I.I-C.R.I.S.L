import React, { useState } from 'react';
import { Atributos, Personagem, PericiaName } from '../core/types';

interface AttributesTabProps {
  character: Personagem;
}

export const AttributesTab: React.FC<AttributesTabProps> = ({ character }) => {
  const attributes = character.atributos;
  const skills = Object.values(character.periciasDetalhadas).map(p => ({
    name: p.atributoBase
  }));

  const [openAttribute, setOpenAttribute] = useState<keyof Atributos | null>(null);

  const toggleAttribute = (attr: keyof Atributos) => {
    setOpenAttribute(openAttribute === attr ? null : attr);
  };

  const getSkillsForAttribute = (attr: keyof Atributos) => {
    return Object.entries(character.periciasDetalhadas)
      .filter(([_, detalhe]) => detalhe.atributoBase === attr)
      .map(([nome, detalhe]) => ({
        name: nome as PericiaName,
        bonus: detalhe.bonusFixo,
        training: detalhe.grau,
        attribute: detalhe.atributoBase
      }));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-y-auto custom-scrollbar">
      <div className="flex justify-center gap-4 mb-8 py-4">
        {Object.entries(attributes).map(([key, value]) => (
          <div 
            key={key}
            onClick={() => toggleAttribute(key as keyof Atributos)}
            className={`relative w-16 h-16 flex flex-col items-center justify-center border-2 cursor-pointer transition-all hover:scale-110 ${openAttribute === key ? 'border-ordem-white bg-white/10' : 'border-ordem-border-light bg-ordem-black/40'}`}
            style={{ transform: 'rotate(45deg)' }}
          >
            <div className="-rotate-45 text-center">
              <div className="text-2xl font-bold text-ordem-white">{value}</div>
              <div className="text-[10px] font-mono text-ordem-text-secondary">{key}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {Object.keys(attributes).map((attrKey) => {
            const attr = attrKey as keyof Atributos;
            const attrSkills = getSkillsForAttribute(attr);
            const isOpen = openAttribute === attr || openAttribute === null;

            if (attrSkills.length === 0 && openAttribute === attr) return (
                <div key={attr} className="text-center text-ordem-text-muted text-sm py-2">Nenhuma perícia treinada em {attr}</div>
            );
            
            if (attrSkills.length === 0) return null;

            return (
                <div key={attr} className={`transition-all duration-300 ${isOpen ? 'opacity-100 max-h-[500px]' : 'opacity-30 max-h-0 overflow-hidden'}`}>
                    {isOpen && (
                        <>
                            <h3 className="text-xs font-bold text-ordem-text-muted uppercase tracking-widest mb-1 ml-2 border-l-2 border-ordem-border pl-2">
                                {attr}
                            </h3>
                            <div className="grid grid-cols-1 gap-1 mb-4">
                                {attrSkills.map((skill) => (
                                    <div key={skill.name} className="flex justify-between items-center p-2 bg-ordem-black/20 hover:bg-white/5 rounded border border-transparent hover:border-ordem-border-light transition-colors group">
                                        <div className="flex items-center gap-2">
                                            <span className="text-ordem-white-muted font-mono text-sm group-hover:text-white">{skill.name}</span>
                                            <span className="text-[10px] text-ordem-text-muted border border-ordem-border px-1 rounded uppercase">{skill.training}</span>
                                        </div>
                                        <div className="font-bold text-ordem-white font-mono">
                                            +{skill.bonus}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
};
