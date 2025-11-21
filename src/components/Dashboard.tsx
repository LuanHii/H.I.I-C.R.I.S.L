"use client";

import React, { useState, useEffect } from 'react';
import { StatusBar } from './StatusBar';
import { AttributesTab } from './AttributesTab';
import { InventoryTab } from './InventoryTab';
import { AbilitiesTab } from './AbilitiesTab';
import { ActionsTab } from './ActionsTab';
import { ProgressionTab } from './ProgressionTab';
import { SessionTab } from './SessionTab';
import { calcularRecursosClasse } from '../logic/rulesEngine';
import { calcularDefesaEfetiva } from '../logic/combatUtils';
import { useStoredFichas } from '../core/storage/useStoredFichas';
import { Personagem } from '../core/types';
import Link from 'next/link';

export const Dashboard: React.FC = () => {
  const { fichas, salvar } = useStoredFichas();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!selectedId && fichas.length > 0) {
      setSelectedId(fichas[0].id);
    }
  }, [fichas, selectedId]);

  const character = fichas.find(f => f.id === selectedId)?.personagem;

  const [useSanity, setUseSanity] = useState(true);
  const [activeTab, setActiveTab] = useState<'geral' | 'atributos' | 'inventario' | 'habilidades' | 'acoes' | 'progressao' | 'sessao'>('geral');

  useEffect(() => {
    if (character) {
      if (character.usarPd !== undefined) {
        setUseSanity(!character.usarPd);
      }
    }
  }, [character, selectedId]);

  const [currentStats, setCurrentStats] = useState({
    pv: 0,
    pe: 0,
    san: 0,
    pd: 0
  });

  useEffect(() => {
    if (!character) return;

    setCurrentStats(prev => ({
      pv: character.pv.atual,
      pe: character.pe.atual,
      san: character.san.atual,
      pd: character.pd?.atual ?? 0
    }));
  }, [character, useSanity]);

  const handleToggleSanity = () => {
    const newValue = !useSanity;
    setUseSanity(newValue);
    if (character && selectedId) {
      const updatedChar = { ...character, usarPd: !newValue };
      salvar(updatedChar, selectedId);
    }
  };

  const updateStat = (stat: 'pv' | 'pe' | 'san' | 'pd', newValue: number) => {
    setCurrentStats(prev => ({
      ...prev,
      [stat]: newValue
    }));
    
    if (character && selectedId) {
        const updatedChar = { ...character };
        let oldValue = 0;

        if (stat === 'pv') { oldValue = updatedChar.pv.atual; updatedChar.pv = { ...updatedChar.pv, atual: newValue }; }
        if (stat === 'pe') { oldValue = updatedChar.pe.atual; updatedChar.pe = { ...updatedChar.pe, atual: newValue }; }
        if (stat === 'san') { oldValue = updatedChar.san.atual; updatedChar.san = { ...updatedChar.san, atual: newValue }; }
        if (stat === 'pd') { 
            oldValue = updatedChar.pd?.atual || 0; 
            if (updatedChar.pd) {
                updatedChar.pd = { ...updatedChar.pd, atual: newValue };
            } else {
                updatedChar.pd = { atual: newValue, max: newValue };
            }
        }

        const diff = newValue - oldValue;
        if (diff !== 0) {
            const logEntry = {
                timestamp: Date.now(),
                mensagem: `${stat.toUpperCase()} ${diff > 0 ? '+' : ''}${diff}`,
                tipo: (diff < 0 ? (stat === 'pe' ? 'gasto' : 'dano') : 'cura') as 'dano' | 'cura' | 'gasto'
            };
            updatedChar.log = [logEntry, ...(updatedChar.log || [])].slice(0, 50);
        }

        salvar(updatedChar, selectedId);
    }
  };

  if (!character) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500 font-mono border border-gray-800 rounded bg-black/50 p-8">
        <p className="mb-4">NENHUM AGENTE ENCONTRADO NO BANCO DE DADOS LOCAL.</p>
        <Link 
            href="/agente/novo" 
            className="px-4 py-2 bg-ordem-green/20 border border-ordem-green text-ordem-green hover:bg-ordem-green/40 transition-colors rounded"
        >
            INICIAR RECRUTAMENTO
        </Link>
      </div>
    );
  }

  const recursos = calcularRecursosClasse({
      classe: character.classe,
      atributos: character.atributos,
      nex: character.nex,
      estagio: character.estagio,
      patente: character.patente || 'Recruta',
      usarPd: !useSanity
  });

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl mx-auto p-4 h-[80vh]">
      <nav className="w-full md:w-64 flex flex-col gap-2 shrink-0">
        {fichas.length > 1 && (
            <div className="mb-4">
                <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Agente Ativo</label>
                <select 
                    value={selectedId || ''} 
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-ordem-white p-2 text-sm font-mono rounded focus:border-ordem-green outline-none"
                >
                    {fichas.map(f => (
                        <option key={f.id} value={f.id}>{f.personagem.nome}</option>
                    ))}
                </select>
            </div>
        )}

        <button 
          onClick={() => setActiveTab('geral')}
          className={`p-3 text-left font-mono border ${activeTab === 'geral' ? 'bg-ordem-white text-ordem-black border-ordem-white' : 'bg-black/50 text-gray-400 border-gray-800 hover:border-gray-600'} transition-all`}
        >
          VISÃO GERAL
        </button>
        <button 
          onClick={() => setActiveTab('atributos')}
          className={`p-3 text-left font-mono border ${activeTab === 'atributos' ? 'bg-ordem-white text-ordem-black border-ordem-white' : 'bg-black/50 text-gray-400 border-gray-800 hover:border-gray-600'} transition-all`}
        >
          ATRIBUTOS & PERÍCIAS
        </button>
        <button 
          onClick={() => setActiveTab('inventario')}
          className={`p-3 text-left font-mono border ${activeTab === 'inventario' ? 'bg-ordem-white text-ordem-black border-ordem-white' : 'bg-black/50 text-gray-400 border-gray-800 hover:border-gray-600'} transition-all`}
        >
          INVENTÁRIO
        </button>
        <button 
          onClick={() => setActiveTab('habilidades')}
          className={`p-3 text-left font-mono border ${activeTab === 'habilidades' ? 'bg-ordem-white text-ordem-black border-ordem-white' : 'bg-black/50 text-gray-400 border-gray-800 hover:border-gray-600'} transition-all`}
        >
          HABILIDADES
        </button>
        <button 
          onClick={() => setActiveTab('acoes')}
          className={`p-3 text-left font-mono border ${activeTab === 'acoes' ? 'bg-ordem-white text-ordem-black border-ordem-white' : 'bg-black/50 text-gray-400 border-gray-800 hover:border-gray-600'} transition-all`}
        >
          AÇÕES
        </button>
        <button 
          onClick={() => setActiveTab('sessao')}
          className={`p-3 text-left font-mono border ${activeTab === 'sessao' ? 'bg-ordem-white text-ordem-black border-ordem-white' : 'bg-black/50 text-gray-400 border-gray-800 hover:border-gray-600'} transition-all`}
        >
          SESSÃO
        </button>
        <button 
          onClick={() => setActiveTab('progressao')}
          className={`p-3 text-left font-mono border ${activeTab === 'progressao' ? 'bg-ordem-white text-ordem-black border-ordem-white' : 'bg-black/50 text-gray-400 border-gray-800 hover:border-gray-600'} transition-all`}
        >
          PROGRESSÃO
        </button>
      </nav>

      <div className="flex-1 bg-black/50 border border-gray-800 rounded-lg backdrop-blur-sm p-6 overflow-hidden flex flex-col">
        {activeTab === 'geral' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto custom-scrollbar h-full">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-2xl font-mono text-ordem-white tracking-widest uppercase">{character.nome}</h2>
                <div className="text-xs text-gray-400 font-mono">
                    {character.classe} {character.nex}% - {character.origem}
                </div>
              </div>
              <button 
                onClick={handleToggleSanity}
                className="text-xs text-gray-500 hover:text-ordem-white transition-colors"
              >
                {useSanity ? '[MODO PADRÃO]' : '[MODO DETERMINAÇÃO]'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8 text-center">
              <div className="p-2 bg-gray-900/50 border border-gray-700 rounded">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Defesa</div>
                <div className="text-2xl font-bold text-ordem-white">
                  {calcularDefesaEfetiva(character)}
                  {calcularDefesaEfetiva(character) !== character.defesa && (
                    <span className="text-xs text-red-500 ml-1">({character.defesa})</span>
                  )}
                </div>
              </div>
              <div className="p-2 bg-gray-900/50 border border-gray-700 rounded">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Esquiva</div>
                <div className="text-2xl font-bold text-ordem-white">{character.defesa}</div>
              </div>
              <div className="p-2 bg-gray-900/50 border border-gray-700 rounded">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">RD</div>
                <div className="text-2xl font-bold text-ordem-white">0</div>
              </div>
            </div>

            <div className="space-y-6">
              <StatusBar 
                label="Pontos de Vida" 
                current={currentStats.pv} 
                max={recursos.pv} 
                color="red" 
                onChange={(val) => updateStat('pv', val)} 
              />

              {useSanity ? (
                <>
                  <StatusBar 
                    label="Pontos de Esforço" 
                    current={currentStats.pe} 
                    max={recursos.pe} 
                    color="gold" 
                    onChange={(val) => updateStat('pe', val)} 
                  />
                  <StatusBar 
                    label="Sanidade" 
                    current={currentStats.san} 
                    max={recursos.san} 
                    color="blue" 
                    onChange={(val) => updateStat('san', val)} 
                  />
                </>
              ) : (
                <StatusBar 
                  label="Determinação" 
                  current={currentStats.pd} 
                  max={recursos.pd || 0} 
                  color="purple" 
                  onChange={(val) => updateStat('pd', val)} 
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'atributos' && <AttributesTab character={character} />}
        {activeTab === 'inventario' && <InventoryTab character={character} />}
        {activeTab === 'habilidades' && <AbilitiesTab character={character} useSanity={useSanity} />}
        {activeTab === 'acoes' && <ActionsTab character={character} useSanity={useSanity} />}
        {activeTab === 'sessao' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto custom-scrollbar h-full">
             <SessionTab 
                personagem={character} 
                onUpdate={(updated) => selectedId && salvar(updated, selectedId)} 
             />
          </div>
        )}
        {activeTab === 'progressao' && <ProgressionTab character={character} />}
      </div>
    </div>
  );
};
