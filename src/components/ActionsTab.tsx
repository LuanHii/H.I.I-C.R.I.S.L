import React, { useState } from 'react';
import { Personagem, Poder, Ritual } from '../core/types';
import { UNIVERSAL_ACTIONS, INVESTIGATION_ACTIONS, CHASE_ACTIONS, STEALTH_ACTIONS, ActionDefinition } from '../data/actions';
import { ORIGENS } from '../data/origins';
import { CLASS_ABILITIES } from '../data/classAbilities';
import { TRILHAS } from '../data/tracks';
import { getPenalidadesPericia } from '../logic/combatUtils';

interface ActionsTabProps {
  character: Personagem;
  useSanity: boolean;
}

export const ActionsTab: React.FC<ActionsTabProps> = ({ character, useSanity }) => {
  const [filter, setFilter] = useState<'todos' | 'universais' | 'habilidades' | 'rituais' | 'cenarios' | 'ataques'>('todos');
  
  const formatCost = (cost?: string) => {
    if (!cost) return null;
    if (useSanity) return cost;
    
    let newCost = cost.replace(/PE/g, 'PD').replace(/SAN/g, 'PD');
    return newCost;
  };

  const getRitualCost = (circle: number) => {
    const costs = { 1: '1 PE', 2: '3 PE', 3: '6 PE', 4: '10 PE' };
    return costs[circle as keyof typeof costs] || '? PE';
  };

  const renderActionCard = (action: ActionDefinition | Poder | Ritual, source?: string) => {
    const isRitual = 'circulo' in action;
    const isPoder = 'tipo' in action && !isRitual;
    
    let cost: string | undefined = undefined;
    if ('custo' in action) cost = action.custo;
    if (isRitual) cost = getRitualCost((action as Ritual).circulo);

    const displayCost = formatCost(cost);
    
    let borderColor = "border-gray-800";
    let hoverColor = "hover:border-ordem-red/50";
    
    if (isRitual) {
        const el = (action as Ritual).elemento;
        if (el === 'Sangue') { borderColor = "border-red-900/30"; hoverColor = "hover:border-red-600"; }
        if (el === 'Morte') { borderColor = "border-gray-800"; hoverColor = "hover:border-gray-400"; }
        if (el === 'Conhecimento') { borderColor = "border-yellow-900/30"; hoverColor = "hover:border-yellow-500"; }
        if (el === 'Energia') { borderColor = "border-purple-900/30"; hoverColor = "hover:border-purple-500"; }
        if (el === 'Medo') { borderColor = "border-white/10"; hoverColor = "hover:border-white"; }
    }

    return (
      <div key={action.nome} className={`bg-black/40 border ${borderColor} p-3 rounded ${hoverColor} transition-colors group relative overflow-hidden`}>
        {isRitual && (
            <div className={`absolute top-0 right-0 w-16 h-16 opacity-10 pointer-events-none -mr-4 -mt-4 rounded-full blur-xl
                ${(action as Ritual).elemento === 'Sangue' ? 'bg-red-600' : ''}
                ${(action as Ritual).elemento === 'Morte' ? 'bg-gray-200' : ''}
                ${(action as Ritual).elemento === 'Conhecimento' ? 'bg-yellow-500' : ''}
                ${(action as Ritual).elemento === 'Energia' ? 'bg-purple-500' : ''}
                ${(action as Ritual).elemento === 'Medo' ? 'bg-white' : ''}
            `} />
        )}

        <div className="flex justify-between items-start mb-1 relative z-10">
          <h4 className="font-bold text-gray-200 group-hover:text-ordem-red transition-colors">{action.nome}</h4>
          {displayCost && (
            <span className="text-xs font-mono bg-gray-900 px-2 py-0.5 rounded text-ordem-gold border border-ordem-gold/30">
              {displayCost}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2 relative z-10">
            {source && <span className="uppercase tracking-wider">{source}</span>}
            {'tipo' in action && !isRitual && <span className="uppercase tracking-wider">{(action as any).tipo}</span>}
            {'acao' in action && (action as any).acao && <span className="text-gray-400">• {(action as any).acao}</span>}
            {'teste' in action && (
                <span className="text-ordem-green font-mono font-bold border border-ordem-green/30 px-1 rounded">
                    {(action as any).teste}
                </span>
            )}
            
            {isRitual && (
                <>
                    <span className={`uppercase tracking-wider font-bold
                        ${(action as Ritual).elemento === 'Sangue' ? 'text-red-700' : ''}
                        ${(action as Ritual).elemento === 'Morte' ? 'text-gray-400' : ''}
                        ${(action as Ritual).elemento === 'Conhecimento' ? 'text-yellow-600' : ''}
                        ${(action as Ritual).elemento === 'Energia' ? 'text-purple-500' : ''}
                        ${(action as Ritual).elemento === 'Medo' ? 'text-white' : ''}
                    `}>{(action as Ritual).elemento} {(action as Ritual).circulo}</span>
                    <span className="text-gray-400">• {(action as Ritual).execucao}</span>
                    <span className="text-gray-400">• {(action as Ritual).alcance}</span>
                </>
            )}
        </div>

        <p className="text-sm text-gray-400 leading-relaxed relative z-10">
          {action.descricao}
        </p>

        {isRitual && (
            <div className="mt-3 pt-3 border-t border-gray-800/50 space-y-3 text-xs relative z-10">
                <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-gray-400">
                    <div><span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Execução:</span> {(action as Ritual).execucao}</div>
                    <div><span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Alcance:</span> {(action as Ritual).alcance}</div>
                    <div><span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Alvo:</span> {(action as Ritual).alvo}</div>
                    <div><span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Duração:</span> {(action as Ritual).duracao}</div>
                    {(action as Ritual).resistencia && (
                        <div className="col-span-2"><span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Resistência:</span> {(action as Ritual).resistencia}</div>
                    )}
                </div>
                
                <div className="space-y-2">
                    <div className="bg-black/20 p-2 rounded border border-gray-800/50">
                        <span className="text-ordem-white font-bold block mb-1 text-[10px] uppercase tracking-widest">Padrão</span>
                        <p className="text-gray-400">{(action as Ritual).efeito.padrao}</p>
                    </div>
                    {(action as Ritual).efeito.discente && (
                        <div className="bg-black/20 p-2 rounded border border-gray-800/50">
                            <span className="text-ordem-gold font-bold block mb-1 text-[10px] uppercase tracking-widest">Discente</span>
                            <p className="text-gray-400">{(action as Ritual).efeito.discente}</p>
                        </div>
                    )}
                    {(action as Ritual).efeito.verdadeiro && (
                        <div className="bg-black/20 p-2 rounded border border-gray-800/50">
                            <span className="text-ordem-red font-bold block mb-1 text-[10px] uppercase tracking-widest">Verdadeiro</span>
                            <p className="text-gray-400">{(action as Ritual).efeito.verdadeiro}</p>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    );
  };

  const activePowers = character.poderes.filter(p => p.custo || p.acao || p.tipo === 'Paranormal'); 
  
  const originData = ORIGENS.find(o => o.nome === character.origem);
  const originPower = originData?.poder;

  const classAbilities = CLASS_ABILITIES[character.classe]?.filter(a => a.nex <= character.nex) || [];

  const trackData = TRILHAS.find(t => t.nome === character.trilha);
  const trackAbilities = trackData?.habilidades.filter(h => h.nex <= character.nex) || [];

  const weaponActions = character.equipamentos
    .filter(item => item.tipo === 'Arma')
    .map(item => {
      const alcance = item.stats?.alcance?.toLowerCase() || '';
      const isMelee = alcance.includes('corpo') || alcance.includes('adjacente') || alcance === '';
      const periciaName = isMelee ? 'Luta' : 'Pontaria';
      const pericia = character.periciasDetalhadas[periciaName];
      
      const penalidade = getPenalidadesPericia(character, pericia.atributoBase);
      const dados = Math.max(0, pericia.dados + penalidade);
      const bonus = pericia.bonusFixo + pericia.bonusO;
      const sinal = bonus >= 0 ? '+' : '';

      return {
        nome: item.nome,
        tipo: 'Ataque',
        descricao: `Dano: ${item.stats?.dano || '-'} | Crítico: ${item.stats?.critico || '-'} | Alcance: ${item.stats?.alcance || '-'} ${item.stats?.tipoDano ? `| ${item.stats.tipoDano}` : ''}\n${item.descricao}`,
        pericia: periciaName,
        teste: `${dados}d20 ${sinal}${bonus}${penalidade !== 0 ? ` (${penalidade}d)` : ''}`
      } as any;
    });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      {/* Tabs Navigation */}
      <div className="flex gap-2 mb-4 border-b border-gray-800 pb-2 shrink-0 overflow-x-auto custom-scrollbar">
        <button 
          onClick={() => setFilter('todos')}
          className={`px-3 py-1 text-sm font-mono rounded whitespace-nowrap ${filter === 'todos' ? 'bg-ordem-white text-black' : 'text-gray-400 hover:text-white'}`}
        >
          TODOS
        </button>
        <button 
          onClick={() => setFilter('universais')}
          className={`px-3 py-1 text-sm font-mono rounded whitespace-nowrap ${filter === 'universais' ? 'bg-ordem-white text-black' : 'text-gray-400 hover:text-white'}`}
        >
          UNIVERSAIS
        </button>
        <button 
          onClick={() => setFilter('ataques')}
          className={`px-3 py-1 text-sm font-mono rounded whitespace-nowrap ${filter === 'ataques' ? 'bg-ordem-white text-black' : 'text-gray-400 hover:text-white'}`}
        >
          ATAQUES
        </button>
        <button 
          onClick={() => setFilter('habilidades')}
          className={`px-3 py-1 text-sm font-mono rounded whitespace-nowrap ${filter === 'habilidades' ? 'bg-ordem-white text-black' : 'text-gray-400 hover:text-white'}`}
        >
          HABILIDADES
        </button>
        <button 
          onClick={() => setFilter('rituais')}
          className={`px-3 py-1 text-sm font-mono rounded whitespace-nowrap ${filter === 'rituais' ? 'bg-ordem-white text-black' : 'text-gray-400 hover:text-white'}`}
        >
          RITUAIS
        </button>
        <button 
          onClick={() => setFilter('cenarios')}
          className={`px-3 py-1 text-sm font-mono rounded whitespace-nowrap ${filter === 'cenarios' ? 'bg-ordem-white text-black' : 'text-gray-400 hover:text-white'}`}
        >
          CENÁRIOS
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-8">
      
      {/* Section: Weapons & Attacks */}
      {(filter === 'todos' || filter === 'ataques') && weaponActions.length > 0 && (
        <section>
            <h3 className="text-lg font-serif text-ordem-red border-b border-gray-800 pb-2 mb-4 flex items-center gap-2 sticky top-0 bg-black/90 py-2 z-10">
            <span className="w-2 h-2 bg-ordem-red rotate-45 inline-block"></span>
            Armas & Ataques
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {weaponActions.map((a, idx) => renderActionCard(a, 'Equipamento'))}
            </div>
        </section>
      )}

      {/* Section: Universal Actions */}
      {(filter === 'todos' || filter === 'universais') && (
        <section>
            <h3 className="text-lg font-serif text-ordem-red border-b border-gray-800 pb-2 mb-4 flex items-center gap-2 sticky top-0 bg-black/90 py-2 z-10">
            <span className="w-2 h-2 bg-ordem-red rotate-45 inline-block"></span>
            Ações Universais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {UNIVERSAL_ACTIONS.map(a => renderActionCard(a))}
            </div>
        </section>
      )}

      {/* Section: Character Abilities (Class, Origin, Powers) */}
      {(filter === 'todos' || filter === 'habilidades') && (
        <section>
            <h3 className="text-lg font-serif text-ordem-red border-b border-gray-800 pb-2 mb-4 flex items-center gap-2 sticky top-0 bg-black/90 py-2 z-10">
            <span className="w-2 h-2 bg-ordem-red rotate-45 inline-block"></span>
            Habilidades & Poderes
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Origin Power */}
                {originPower && renderActionCard({
                    nome: originPower.nome,
                    descricao: originPower.descricao,
                    tipo: 'Origem',
                } as any, 'Origem')}

                {/* Class Abilities */}
                {classAbilities.map(a => renderActionCard({
                    nome: a.nome,
                    descricao: a.descricao,
                    custo: a.custo,
                    acao: a.acao,
                    tipo: 'Classe'
                } as any, `Classe (${a.nex}%)`))}

                {/* Track Abilities */}
                {trackAbilities.map(a => renderActionCard({
                    nome: a.nome,
                    descricao: a.descricao,
                    tipo: 'Trilha'
                } as any, `Trilha (${a.nex}%)`))}

                {/* Other Powers */}
                {activePowers.map(p => renderActionCard(p))}
                
                {!originPower && classAbilities.length === 0 && trackAbilities.length === 0 && activePowers.length === 0 && (
                    <div className="col-span-2 text-gray-600 italic text-sm py-2">
                        Nenhuma habilidade ativa registrada.
                    </div>
                )}
            </div>
        </section>
      )}

      {/* Section: Rituals */}
      {(filter === 'todos' || filter === 'rituais') && character.rituais.length > 0 && (
        <section>
            <h3 className="text-lg font-serif text-purple-500 border-b border-gray-800 pb-2 mb-4 flex items-center gap-2 sticky top-0 bg-black/90 py-2 z-10">
            <span className="w-2 h-2 bg-purple-500 rotate-45 inline-block"></span>
            Rituais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {character.rituais.map(r => renderActionCard(r))}
            </div>
        </section>
      )}

      {/* Section: Scenario Actions */}
      {(filter === 'todos' || filter === 'cenarios') && (
        <section>
            <h3 className="text-lg font-serif text-gray-400 border-b border-gray-800 pb-2 mb-4 flex items-center gap-2 sticky top-0 bg-black/90 py-2 z-10">
            <span className="w-2 h-2 bg-gray-600 rotate-45 inline-block"></span>
            Cenários Específicos
            </h3>
            
            <div className="space-y-6">
                <div>
                    <h4 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-widest">Investigação</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {INVESTIGATION_ACTIONS.map(a => renderActionCard(a))}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-widest">Perseguição</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {CHASE_ACTIONS.map(a => renderActionCard(a))}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-widest">Furtividade</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {STEALTH_ACTIONS.map(a => renderActionCard(a))}
                    </div>
                </div>
            </div>
        </section>
      )}
      </div>
    </div>
  );
};
