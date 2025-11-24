import React, { useState } from 'react';
import { Personagem, AtributoKey, PericiaName, Item, Poder } from '../../core/types';
import { StatusBar } from '../StatusBar';
import { calcularDefesaEfetiva } from '../../logic/combatUtils';
import { PERICIA_ATRIBUTO, calcularPericiasDetalhadas } from '../../logic/rulesEngine';
import { ActionsTab } from '../ActionsTab';
import { ItemSelectorModal } from './ItemSelectorModal';
import { AbilitySelectorModal } from './AbilitySelectorModal';
import { SkillSelectorModal } from './SkillSelectorModal';
import { levelUp, levelDown, applyAttributePoint, removeAttributePoint, chooseTrack } from '../../logic/progression';
import { ProgressionTab } from '../ProgressionTab';
import { PendingChoiceModal } from '../PendingChoiceModal';
import { TrackSelectorModal } from '../TrackSelectorModal';

interface AgentDetailViewProps {
  agent: Personagem;
  onUpdate: (updated: Personagem) => void;
  readOnly?: boolean;
  disableInteractionModals?: boolean;
}

export const AgentDetailView: React.FC<AgentDetailViewProps> = ({ agent, onUpdate, readOnly, disableInteractionModals }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    status: true,
    attributes: true,
    inventory: false,
    abilities: false,
    actions: false,
    progression: false
  });

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isAbilityModalOpen, setIsAbilityModalOpen] = useState(false);
  const [isPendingChoiceModalSuppressed, setIsPendingChoiceModalSuppressed] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLevelUp = () => {
    const updated = levelUp(agent);
    onUpdate(updated);
  };

  const handleLevelDown = () => {
    const updated = levelDown(agent);
    onUpdate(updated);
  };

  const handleAttributeChange = (attr: AtributoKey, increase: boolean) => {
    if (increase) {
        const updated = applyAttributePoint(agent, attr);
        onUpdate(updated);
    } else {
        const updated = removeAttributePoint(agent, attr);
        onUpdate(updated);
    }
  };

  const updateStat = (stat: 'pv' | 'pe' | 'san' | 'pd', newValue: number) => {
    const updated = { ...agent };
    if (stat === 'pv') updated.pv.atual = newValue;
    if (stat === 'pe') updated.pe.atual = newValue;
    if (stat === 'san') updated.san.atual = newValue;
    if (stat === 'pd') {
        if (updated.pd) updated.pd.atual = newValue;
        else updated.pd = { atual: newValue, max: newValue };
    }
    onUpdate(updated);
  };

  const handleAddItem = (item: Item) => {
    const updated = { ...agent };
    updated.equipamentos = [...updated.equipamentos, item];
    const currentLoad = updated.equipamentos.reduce((acc, i) => acc + i.espaco, 0);
    updated.carga.atual = currentLoad;
    
    onUpdate(updated);
    setIsItemModalOpen(false);
  };

  const handleRemoveItem = (index: number) => {
    const updated = { ...agent };
    updated.equipamentos = updated.equipamentos.filter((_, i) => i !== index);
    const currentLoad = updated.equipamentos.reduce((acc, i) => acc + i.espaco, 0);
    updated.carga.atual = currentLoad;
    onUpdate(updated);
  };

  const handleAddAbility = (ability: Poder) => {
    const updated = { ...agent };
    updated.poderes = [...updated.poderes, ability];
    onUpdate(updated);
    setIsAbilityModalOpen(false);
  };

  const handleRemoveAbility = (index: number) => {
    const updated = { ...agent };
    updated.poderes = updated.poderes.filter((_, i) => i !== index);
    onUpdate(updated);
  };

  const handleTrackSelection = (trackName: string) => {
      const updated = chooseTrack(agent, trackName);
      onUpdate(updated);
  };

  const handleSkillSelection = (skill: PericiaName) => {
      const updated = { ...agent };
      updated.pericias = { ...updated.pericias, [skill]: 'Treinado' };
      updated.periciasTreinadasPendentes = (updated.periciasTreinadasPendentes || 0) - 1;
      updated.periciasDetalhadas = calcularPericiasDetalhadas(updated.atributos, updated.pericias);
      onUpdate(updated);
  };

  const pendingChoice = agent.habilidadesTrilhaPendentes && agent.habilidadesTrilhaPendentes.length > 0 
    ? agent.habilidadesTrilhaPendentes[0] 
    : null;

  const hasPendingStuff = pendingChoice || (agent.periciasTreinadasPendentes && agent.periciasTreinadasPendentes > 0) || agent.escolhaTrilhaPendente;

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar pr-2">
      {hasPendingStuff && isPendingChoiceModalSuppressed && !disableInteractionModals && (
          <button 
            onClick={() => setIsPendingChoiceModalSuppressed(false)}
            className="w-full bg-yellow-600/20 border border-yellow-600/50 text-yellow-500 p-3 rounded flex items-center justify-between hover:bg-yellow-600/30 transition-colors animate-pulse"
          >
              <div className="flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <span className="font-bold">ESCOLHAS PENDENTES</span>
              </div>
              <span className="text-xs uppercase tracking-wider border border-yellow-600/50 px-2 py-1 rounded">Resolver Agora</span>
          </button>
      )}

      {!disableInteractionModals && !isPendingChoiceModalSuppressed && agent.periciasTreinadasPendentes && agent.periciasTreinadasPendentes > 0 && (
          <SkillSelectorModal 
            isOpen={true}
            currentSkills={agent.pericias}
            onSelect={handleSkillSelection}
            onDefer={() => setIsPendingChoiceModalSuppressed(true)}
          />
      )}
      {!disableInteractionModals && !isPendingChoiceModalSuppressed && agent.escolhaTrilhaPendente && (
          <TrackSelectorModal 
            agent={agent}
            onConfirm={handleTrackSelection}
            onDefer={() => setIsPendingChoiceModalSuppressed(true)}
          />
      )}
      {!disableInteractionModals && !isPendingChoiceModalSuppressed && pendingChoice && (
          <PendingChoiceModal 
            agent={agent}
            pendingChoice={pendingChoice}
            onConfirm={onUpdate}
            onDefer={() => setIsPendingChoiceModalSuppressed(true)}
          />
      )}
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></svg>
        </div>
        
        <div className="relative z-10 flex justify-between items-start">
            <div>
                <h2 className="text-4xl font-bold text-white tracking-tight mb-1">{agent.nome}</h2>
                <div className="flex items-center gap-3 text-zinc-300 font-mono text-sm">
                    <span className="bg-zinc-800 px-2 py-1 rounded border border-zinc-600">{agent.classe}</span>
                    <div className="flex items-center bg-zinc-800 rounded border border-zinc-600 overflow-hidden">
                        {!readOnly && (
                            <button 
                                onClick={handleLevelDown}
                                className="px-2 py-1 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors border-r border-zinc-600"
                                title="Diminuir Nível"
                            >
                                -
                            </button>
                        )}
                        <span className="px-2 py-1 text-zinc-100">
                            {agent.classe === 'Sobrevivente' ? `Estágio ${agent.estagio || 1}` : `${agent.nex}% NEX`}
                        </span>
                        {!readOnly && (
                            <button 
                                onClick={handleLevelUp}
                                className="px-2 py-1 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors border-l border-zinc-600"
                                title="Aumentar Nível"
                            >
                                +
                            </button>
                        )}
                    </div>
                    <span className="bg-zinc-800 px-2 py-1 rounded border border-zinc-600">{agent.origem || 'Sem Origem'}</span>
                </div>
            </div>
            
            <div className="text-right">
                <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Defesa</div>
                <div className="text-3xl font-bold text-zinc-100 flex items-center justify-end gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
                    {calcularDefesaEfetiva(agent)}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <StatusBar 
                label="Pontos de Vida" 
                current={agent.pv.atual} 
                max={agent.pv.max} 
                color="red" 
                onChange={(v) => updateStat('pv', v)} 
                readOnly={readOnly}
            />
            {agent.usarPd ? (
                <StatusBar 
                    label="Determinação" 
                    current={agent.pd?.atual || 0} 
                    max={agent.pd?.max || 0} 
                    color="purple" 
                    onChange={(v) => updateStat('pd', v)} 
                    readOnly={readOnly}
                />
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <StatusBar 
                        label="Sanidade" 
                        current={agent.san.atual} 
                        max={agent.san.max} 
                        color="blue" 
                        onChange={(v) => updateStat('san', v)} 
                        readOnly={readOnly}
                    />
                    <StatusBar 
                        label="Pontos de Esforço" 
                        current={agent.pe.atual} 
                        max={agent.pe.max} 
                        color="gold" 
                        onChange={(v) => updateStat('pe', v)} 
                        readOnly={readOnly}
                    />
                </div>
            )}
        </div>
      </div>
      
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-lg">
        <button 
            onClick={() => toggleSection('attributes')}
            className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 transition-colors border-b border-zinc-700"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-700 rounded text-zinc-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <span className="font-bold text-zinc-100">Atributos & Perícias</span>
            </div>
            {openSections['attributes'] ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m6 9 6 6 6-6"/></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m9 18 6-6-6-6"/></svg>
            )}
        </button>
        
        {openSections['attributes'] && (
            <div className="p-6 animate-in slide-in-from-top-2">
                {agent.pontosAtributoPendentes && agent.pontosAtributoPendentes !== 0 ? (
                    <div className={`mb-4 p-3 rounded border ${agent.pontosAtributoPendentes > 0 ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-red-900/20 border-red-800 text-red-400'} text-center font-mono text-sm`}>
                        {agent.pontosAtributoPendentes > 0 
                            ? `VOCÊ TEM ${agent.pontosAtributoPendentes} PONTO(S) DE ATRIBUTO PARA GASTAR!` 
                            : `VOCÊ PRECISA REMOVER ${Math.abs(agent.pontosAtributoPendentes)} PONTO(S) DE ATRIBUTO!`}
                    </div>
                ) : null}

                <div className="flex justify-between gap-4 mb-8">
                    {Object.entries(agent.atributos).map(([key, val]) => (
                        <div key={key} className="flex flex-col items-center flex-1 bg-zinc-950/50 p-3 rounded border border-zinc-700 relative group">
                            <span className="text-xs font-mono text-zinc-400 uppercase mb-1">{key}</span>
                            <span className="text-2xl font-bold text-zinc-100">{val}</span>
                            
                            {!readOnly && agent.pontosAtributoPendentes && agent.pontosAtributoPendentes > 0 && (agent.classe !== 'Sobrevivente' || val < 3) && (
                                <button 
                                    onClick={() => handleAttributeChange(key as AtributoKey, true)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 hover:bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                >
                                    +
                                </button>
                            )}
                            {!readOnly && agent.pontosAtributoPendentes && agent.pontosAtributoPendentes < 0 && val > 0 && (
                                <button 
                                    onClick={() => handleAttributeChange(key as AtributoKey, false)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                >
                                    -
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                
                <div className="space-y-6">
                    {(['AGI', 'FOR', 'INT', 'PRE', 'VIG'] as AtributoKey[]).map((attr) => {
                        const skills = Object.entries(agent.periciasDetalhadas).filter(([nome]) => PERICIA_ATRIBUTO[nome as PericiaName] === attr);
                        if (skills.length === 0) return null;

                        return (
                            <div key={attr}>
                                <h4 className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-2 border-b border-zinc-800 pb-1 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-zinc-600 rotate-45 inline-block"></span>
                                    {attr} <span className="text-zinc-600">({agent.atributos[attr]})</span>
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {skills.map(([nome, detalhe]) => (
                                        <div key={nome} className="flex justify-between items-center p-2 bg-zinc-950/30 rounded border border-zinc-700/50 hover:border-zinc-600 transition-colors">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm text-zinc-300">{nome}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] px-1 rounded border ${
                                                    detalhe.grau === 'Destreinado' ? 'border-zinc-800 text-zinc-600' :
                                                    detalhe.grau === 'Treinado' ? 'border-green-900 text-green-500' :
                                                    detalhe.grau === 'Veterano' ? 'border-blue-900 text-blue-500' :
                                                    'border-purple-900 text-purple-500'
                                                }`}>
                                                    {detalhe.grau.substring(0, 3).toUpperCase()}
                                                </span>
                                                <span className="font-mono text-zinc-100 font-bold">+{detalhe.bonusFixo}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-lg">
        <button 
            onClick={() => toggleSection('inventory')}
            className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 transition-colors border-b border-zinc-700"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-700 rounded text-zinc-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5"/><path d="M8 10h8"/><path d="M8 18h8"/></svg>
                </div>
                <span className="font-bold text-zinc-100">Inventário</span>
                <span className="text-xs font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 border border-zinc-600">
                    {agent.carga.atual}/{agent.carga.maxima}
                </span>
            </div>
            {openSections['inventory'] ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m6 9 6 6 6-6"/></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m9 18 6-6-6-6"/></svg>
            )}
        </button>
        
        {openSections['inventory'] && (
            <div className="p-6 animate-in slide-in-from-top-2">
                <div className="space-y-2">
                    {agent.equipamentos.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-zinc-950/50 rounded border border-zinc-700 hover:border-zinc-500 group">
                            <div>
                                <div className="font-bold text-zinc-200">{item.nome}</div>
                                <div className="text-xs text-zinc-400">{item.categoria} • {item.espaco} espaço</div>
                            </div>
                            {!readOnly && (
                            <button 
                                onClick={() => handleRemoveItem(idx)}
                                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-900/30 rounded text-zinc-400 hover:text-red-400 transition-all"
                                title="Remover Item"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                            )}
                        </div>
                    ))}
                    {!readOnly && (
                    <button 
                        onClick={() => setIsItemModalOpen(true)}
                        className="w-full py-3 border border-dashed border-zinc-700 rounded text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/50 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg> Adicionar Item
                    </button>
                    )}
                </div>
            </div>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-lg">
        <button 
            onClick={() => toggleSection('abilities')}
            className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 transition-colors border-b border-zinc-700"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-700 rounded text-zinc-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <span className="font-bold text-zinc-100">Habilidades & Poderes</span>
            </div>
            {openSections['abilities'] ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m6 9 6 6 6-6"/></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m9 18 6-6-6-6"/></svg>
            )}
        </button>
        
        {openSections['abilities'] && (
            <div className="p-6 animate-in slide-in-from-top-2 space-y-4">
                {agent.poderes.map((poder, idx) => (
                    <div key={idx} className="bg-zinc-950/50 p-4 rounded border border-zinc-700 group relative">
                        <h4 className="font-bold text-zinc-100 mb-1">{poder.nome}</h4>
                        <p className="text-sm text-zinc-300">{poder.descricao}</p>
                        {!readOnly && (
                            <button 
                                onClick={() => handleRemoveAbility(idx)}
                                className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 hover:bg-red-900/30 rounded text-zinc-400 hover:text-red-400 transition-all"
                                title="Remover Habilidade"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                        )}
                    </div>
                ))}
                 {!readOnly && (
                 <button 
                    onClick={() => setIsAbilityModalOpen(true)}
                    className="w-full py-3 border border-dashed border-zinc-700 rounded text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/50 transition-all flex items-center justify-center gap-2 text-sm"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg> Adicionar Habilidade
                </button>
                 )}
            </div>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-lg">
        <button 
            onClick={() => toggleSection('actions')}
            className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 transition-colors border-b border-zinc-700"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-700 rounded text-zinc-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                </div>
                <span className="font-bold text-zinc-100">Ações Disponíveis</span>
            </div>
            {openSections['actions'] ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m6 9 6 6 6-6"/></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m9 18 6-6-6-6"/></svg>
            )}
        </button>
        
        {openSections['actions'] && (
            <div className="p-6 animate-in slide-in-from-top-2">
                <ActionsTab character={agent} useSanity={!agent.usarPd} />
            </div>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-lg">
        <button 
            onClick={() => toggleSection('progression')}
            className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 transition-colors border-b border-zinc-700"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-700 rounded text-zinc-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                </div>
                <span className="font-bold text-zinc-100">Progressão & Trilha</span>
            </div>
            {openSections['progression'] ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m6 9 6 6 6-6"/></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m9 18 6-6-6-6"/></svg>
            )}
        </button>
        
        {openSections['progression'] && (
            <div className="p-6 animate-in slide-in-from-top-2 h-[500px]">
                <ProgressionTab character={agent} />
            </div>
        )}
      </div>

      <ItemSelectorModal 
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSelect={handleAddItem}
      />

      <AbilitySelectorModal
        isOpen={isAbilityModalOpen}
        onClose={() => setIsAbilityModalOpen(false)}
        onSelect={handleAddAbility}
      />
    </div>
  );
};
