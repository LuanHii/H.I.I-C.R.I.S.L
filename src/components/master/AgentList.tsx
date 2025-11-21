import React, { useState, useMemo } from 'react';
import { useStoredFichas } from '../../core/storage/useStoredFichas';
import { Personagem, Item } from '../../core/types';
import { ItemSelectorModal } from './ItemSelectorModal';
import { calcularRecursosClasse } from '../../logic/rulesEngine';

export const AgentList: React.FC = () => {
  const { fichas, salvar } = useStoredFichas();

  if (fichas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="font-mono text-lg">Nenhum agente registrado.</p>
        <p className="text-xs text-gray-600 mt-2">Crie fichas na aba &quot;Agente&quot; para vê-las aqui.</p>
      </div>
    );
  }

  const handleUpdate = (id: string, updates: Partial<Personagem>) => {
    const ficha = fichas.find(f => f.id === id);
    if (ficha) {
      const novoPersonagem = { ...ficha.personagem, ...updates };
      salvar(novoPersonagem, id);
    }
  };

  const activeFichas = fichas.filter(f => f.personagem.ativo).sort((a, b) => a.personagem.nome.localeCompare(b.personagem.nome));
  const inactiveFichas = fichas.filter(f => !f.personagem.ativo).sort((a, b) => a.personagem.nome.localeCompare(b.personagem.nome));

  return (
    <div className="p-4 pb-20 space-y-8">
      
      {/* Active Agents Section */}
      {activeFichas.length > 0 && (
        <section>
            <h2 className="text-xl font-serif text-ordem-red mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-ordem-red rounded-full animate-pulse"/>
                Em Missão
            </h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {activeFichas.map((registro) => (
                    <AgentCard 
                        key={registro.id} 
                        id={registro.id}
                        personagem={registro.personagem} 
                        onUpdate={(updates) => handleUpdate(registro.id, updates)}
                    />
                ))}
            </div>
        </section>
      )}

      {/* Inactive Agents Section */}
      <section>
        <h2 className="text-lg font-serif text-gray-500 mb-4">Banco de Agentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {inactiveFichas.map((registro) => (
                <AgentCard 
                    key={registro.id} 
                    id={registro.id}
                    personagem={registro.personagem} 
                    onUpdate={(updates) => handleUpdate(registro.id, updates)}
                />
            ))}
        </div>
      </section>
    </div>
  );
};

interface AgentCardProps {
    id: string;
    personagem: Personagem;
    onUpdate: (updates: Partial<Personagem>) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ id, personagem, onUpdate }) => {
  const { nome, classe, nex, patente, pv, pe, san, pd, atributos, defesa, usarPd, ativo, equipamentos } = personagem;
  const [showInventory, setShowInventory] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  const usesPd = usarPd === true || (pd !== undefined && pd > 0);

  const pdMax = useMemo(() => {
      if (!usesPd) return 0;
      const recursos = calcularRecursosClasse({
          classe: personagem.classe,
          atributos: personagem.atributos,
          nex: personagem.nex,
          estagio: personagem.estagio,
          patente: personagem.patente || 'Recruta',
          usarPd: true
      });
      return recursos.pd || 0;
  }, [personagem.classe, personagem.atributos, personagem.nex, personagem.estagio, personagem.patente, usesPd]);

  const adjustStat = (stat: 'pv' | 'pe' | 'san' | 'pd', delta: number) => {
    if (stat === 'pv') {
        const novoAtual = Math.min(Math.max(0, pv.atual + delta), pv.max);
        onUpdate({ pv: { ...pv, atual: novoAtual } });
    } else if (stat === 'pe') {
        const novoAtual = Math.min(Math.max(0, pe.atual + delta), pe.max);
        onUpdate({ pe: { ...pe, atual: novoAtual } });
    } else if (stat === 'san') {
        const novoAtual = Math.min(Math.max(0, san.atual + delta), san.max);
        onUpdate({ san: { ...san, atual: novoAtual } });
    } else if (stat === 'pd') {
        const currentPd = pd ?? 0;
        const max = pdMax || 999;
        const novoPd = Math.min(Math.max(0, currentPd + delta), max);
        onUpdate({ pd: novoPd });
    }
  };

  const toggleActive = () => {
    onUpdate({ ativo: !ativo });
  };

  const handleAddItem = (item: Item) => {
    onUpdate({ equipamentos: [...equipamentos, item] });
    setIsItemModalOpen(false);
  };

  return (
    <>
    <div className={`border p-4 rounded transition-all duration-300 group relative overflow-hidden flex flex-col gap-4
        ${ativo ? 'bg-black/80 border-ordem-red shadow-[0_0_15px_rgba(220,38,38,0.15)] min-h-[300px]' : 'bg-black/60 border-gray-800 hover:border-gray-600'}
    `}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
            <button 
                onClick={toggleActive}
                className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center transition-colors
                    ${ativo ? 'bg-ordem-red border-ordem-red' : 'border-gray-600 hover:border-gray-400'}
                `}
                title={ativo ? "Remover da Sessão" : "Adicionar à Sessão"}
            >
                {ativo && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </button>
            <div>
                <h3 className={`text-lg font-serif leading-tight truncate ${ativo ? 'text-white text-2xl w-full' : 'text-gray-400 w-40'}`} title={nome}>{nome}</h3>
                <p className="text-xs font-mono text-gray-500">
                    {classe} <span className="text-gray-700">|</span> {nex}% <span className="text-gray-700">|</span> {patente}
                </p>
            </div>
        </div>
        <div className="text-right bg-gray-900/50 px-2 py-1 rounded border border-gray-800">
            <div className="text-[10px] font-mono text-gray-500 uppercase">DEFESA</div>
            <div className="text-xl font-bold text-white leading-none">{defesa}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid gap-2 ${ativo ? 'grid-cols-3 gap-4' : 'grid-cols-3'}`}>
        {/* PV */}
        <div className={`relative overflow-hidden bg-black/40 border border-red-900/30 p-2 rounded flex flex-col items-center justify-between group/stat ${ativo ? 'h-24' : 'h-20'}`}>
          {/* Bar Background */}
          <div className="absolute bottom-0 left-0 w-full bg-red-900/20 h-full z-0" />
          {/* Bar Fill */}
          <div 
            className="absolute bottom-0 left-0 w-full bg-red-600/20 transition-all duration-500 ease-out z-0 border-t border-red-500/30"
            style={{ height: `${Math.min(100, (pv.atual / pv.max) * 100)}%` }}
          />
          
          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="text-[10px] font-mono text-red-400 uppercase mb-1">PV</div>
            <div className={`font-bold text-white leading-none ${ativo ? 'text-3xl' : 'text-xl'}`}>
                {pv.atual}<span className="text-xs text-gray-500">/{pv.max}</span>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="relative z-10 flex gap-1 mt-1">
            <button onClick={() => adjustStat('pv', -1)} className="w-6 h-6 flex items-center justify-center bg-black/60 hover:bg-red-900/80 text-red-200 rounded text-xs border border-red-900/50 transition-colors">-1</button>
            <button onClick={() => adjustStat('pv', 1)} className="w-6 h-6 flex items-center justify-center bg-black/60 hover:bg-red-900/80 text-red-200 rounded text-xs border border-red-900/50 transition-colors">+1</button>
          </div>
        </div>

        {/* SAN / PD */}
        <div className={`relative overflow-hidden bg-black/40 border p-2 rounded flex flex-col items-center justify-between ${ativo ? 'h-24' : 'h-20'} ${usesPd ? 'border-gray-700' : 'border-blue-900/30'}`}>
          {/* Bar Background */}
          <div className={`absolute bottom-0 left-0 w-full h-full z-0 ${usesPd ? 'bg-gray-800/20' : 'bg-blue-900/20'}`} />
          {/* Bar Fill */}
          <div 
            className={`absolute bottom-0 left-0 w-full transition-all duration-500 ease-out z-0 border-t ${usesPd ? 'bg-gray-500/20 border-gray-400/30' : 'bg-blue-600/20 border-blue-500/30'}`}
            style={{ height: `${usesPd ? `${Math.min(100, ((pd ?? 0) / (pdMax || 1)) * 100)}%` : `${Math.min(100, (san.atual / san.max) * 100)}%`}` }}
          />

          <div className="relative z-10 flex flex-col items-center w-full">
            <div className={`text-[10px] font-mono uppercase mb-1 ${usesPd ? 'text-gray-400' : 'text-blue-400'}`}>
                {usesPd ? 'PD' : 'SAN'}
            </div>
            <div className={`font-bold text-white leading-none ${ativo ? 'text-3xl' : 'text-xl'}`}>
                {usesPd ? (pd ?? 0) : san.atual}
                <span className="text-xs text-gray-500">/{usesPd ? pdMax : san.max}</span>
            </div>
          </div>

          <div className="relative z-10 flex gap-1 mt-1">
            <button 
                onClick={() => adjustStat(usesPd ? 'pd' : 'san', -1)} 
                className={`w-6 h-6 flex items-center justify-center rounded text-xs border transition-colors bg-black/60
                    ${usesPd ? 'hover:bg-gray-700 text-gray-300 border-gray-600' : 'hover:bg-blue-900/80 text-blue-200 border-blue-900/50'}`}
            >
                -1
            </button>
            <button 
                onClick={() => adjustStat(usesPd ? 'pd' : 'san', 1)} 
                className={`w-6 h-6 flex items-center justify-center rounded text-xs border transition-colors bg-black/60
                    ${usesPd ? 'hover:bg-gray-700 text-gray-300 border-gray-600' : 'hover:bg-blue-900/80 text-blue-200 border-blue-900/50'}`}
            >
                +1
            </button>
          </div>
        </div>

        {/* PE (Hidden if using PD) */}
        {!usesPd && (
        <div className={`relative overflow-hidden bg-black/40 border border-yellow-900/30 p-2 rounded flex flex-col items-center justify-between ${ativo ? 'h-24' : 'h-20'}`}>
          {/* Bar Background */}
          <div className="absolute bottom-0 left-0 w-full bg-yellow-900/20 h-full z-0" />
          {/* Bar Fill */}
          <div 
            className="absolute bottom-0 left-0 w-full bg-yellow-600/20 transition-all duration-500 ease-out z-0 border-t border-yellow-500/30"
            style={{ height: `${Math.min(100, (pe.atual / pe.max) * 100)}%` }}
          />

          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="text-[10px] font-mono text-yellow-400 uppercase mb-1">PE</div>
            <div className={`font-bold text-white leading-none ${ativo ? 'text-3xl' : 'text-xl'}`}>
                {pe.atual}<span className="text-xs text-gray-500">/{pe.max}</span>
            </div>
          </div>

          <div className="relative z-10 flex gap-1 mt-1">
            <button onClick={() => adjustStat('pe', -1)} className="w-6 h-6 flex items-center justify-center bg-black/60 hover:bg-yellow-900/80 text-yellow-200 rounded text-xs border border-yellow-900/50 transition-colors">-1</button>
            <button onClick={() => adjustStat('pe', 1)} className="w-6 h-6 flex items-center justify-center bg-black/60 hover:bg-yellow-900/80 text-yellow-200 rounded text-xs border border-yellow-900/50 transition-colors">+1</button>
          </div>
        </div>
        )}
      </div>

      {/* Attributes Mini */}
      <div className="flex justify-between border-t border-gray-800 pt-3 mt-auto">
        {Object.entries(atributos).map(([key, value]) => (
          <div key={key} className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-gray-500">{key}</span>
            <span className="text-sm font-bold text-gray-300">{value}</span>
          </div>
        ))}
      </div>

      {/* Inventory Quick View */}
      <div className="border-t border-gray-800 pt-2">
        <button 
            onClick={() => setShowInventory(!showInventory)}
            className="w-full text-xs font-mono text-gray-500 hover:text-white flex items-center justify-between"
        >
            <span>INVENTÁRIO ({equipamentos.length})</span>
            <span>{showInventory ? '▲' : '▼'}</span>
        </button>
        
        {showInventory && (
            <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
                <div className="max-h-32 overflow-y-auto custom-scrollbar mb-2 space-y-1">
                    {equipamentos.map((item, idx) => (
                        <div key={idx} className="text-xs text-gray-400 flex justify-between border-b border-gray-800 pb-1">
                            <span>{item.nome}</span>
                            <span className="text-gray-600">Cat {item.categoria}</span>
                        </div>
                    ))}
                    {equipamentos.length === 0 && <p className="text-xs text-gray-600 italic">Vazio</p>}
                </div>
                <button 
                    onClick={() => setIsItemModalOpen(true)}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white text-xs py-1 rounded border border-gray-700 transition-colors"
                >
                    + Adicionar Item
                </button>
            </div>
        )}
      </div>
    </div>

    <ItemSelectorModal 
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSelect={handleAddItem}
    />
    </>
  );
};

