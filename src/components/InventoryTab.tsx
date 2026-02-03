import React, { useMemo } from 'react';
import { Personagem } from '../core/types';
import { WeaponStatsDisplay } from './WeaponStatsDisplay';

interface InventoryTabProps {
  character: Personagem;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({ character }) => {
  const items = character.equipamentos;
  const cargaAtual = character.carga.atual;
  const cargaMaxima = character.carga.maxima;
  const limiteItens = character.limiteItens;

  const itemsByCat = useMemo(() => {
    const grouped: Record<number, typeof items> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
    items.forEach(item => {
      const cat = item.categoria ?? 0;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });
    return grouped;
  }, [items]);

  const renderLimit = (cat: number, label: string) => {
    const count = itemsByCat[cat]?.length || 0;
    const limitKey = ['I', 'II', 'III', 'IV'][cat - 1] as keyof typeof limiteItens;
    const limit = cat === 0 ? Infinity : (limiteItens[limitKey] ?? 0);

    if (cat === 0) return null;

    const isExceeded = count > limit;

    return (
      <div key={cat} className="flex flex-col items-center p-2 bg-ordem-black/20 rounded border border-ordem-border">
        <span className="text-[10px] text-ordem-text-muted uppercase">{label}</span>
        <span className={`font-mono font-bold ${isExceeded ? 'text-ordem-red' : 'text-white'}`}>
          {count}/{limit}
        </span>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col gap-4">
      <div className="bg-ordem-black/40 p-4 rounded border border-ordem-border">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm text-ordem-text-secondary uppercase tracking-widest">Capacidade de Carga</span>
          <span className={`font-mono font-bold ${cargaAtual > cargaMaxima ? 'text-ordem-red animate-pulse' : 'text-ordem-white'}`}>
            {cargaAtual} / {cargaMaxima}
          </span>
        </div>
        <div className="w-full h-2 bg-ordem-ooze rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${cargaAtual > cargaMaxima ? 'bg-ordem-red' : 'bg-ordem-white'}`}
            style={{ width: `${Math.min(100, (cargaAtual / cargaMaxima) * 100)}%` }}
          ></div>
        </div>
        {cargaAtual > cargaMaxima && (
          <div className="text-xs text-ordem-red mt-2 text-center font-mono">
            ⚠ SOBRECARGA: -2 em testes físicos
          </div>
        )}

        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-ordem-border">
          {renderLimit(1, 'Cat I')}
          {renderLimit(2, 'Cat II')}
          {renderLimit(3, 'Cat III')}
          {renderLimit(4, 'Cat IV')}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
        {items.length === 0 ? (
          <div className="text-center text-ordem-text-muted py-8 italic">Inventário vazio.</div>
        ) : (
          Object.entries(itemsByCat).map(([catStr, catItems]) => {
            const cat = Number(catStr);
            if (catItems.length === 0) return null;

            const moddedCount = catItems.filter(it => it.modificacoes && it.modificacoes.length > 0).length;

            return (
              <div key={cat}>
                <h3 className="text-xs text-ordem-gold uppercase tracking-widest mb-2 sticky top-0 bg-ordem-black/80 backdrop-blur py-1 z-10 flex items-center justify-between">
                  <span>Categoria {cat === 0 ? '0' : ['I', 'II', 'III', 'IV'][cat - 1]}</span>
                  <span className="text-ordem-text-muted font-normal">
                    {catItems.length} item(ns)
                    {moddedCount > 0 && (
                      <span className="ml-2 text-ordem-green">• {moddedCount} modificado(s)</span>
                    )}
                  </span>
                </h3>
                <div className="space-y-2">
                  {catItems.map((item, idx) => (
                    <WeaponStatsDisplay
                      key={`${cat}-${item.nome}-${idx}`}
                      item={item}
                      compact={false}
                      showDescription={true}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
