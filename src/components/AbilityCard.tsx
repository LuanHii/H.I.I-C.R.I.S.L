import React, { useState } from 'react';
import { Poder, Ritual } from '../core/types';

interface AbilityCardProps {
  data: Poder | Ritual;
  type: 'poder' | 'ritual';
  useSanity?: boolean;
}

export const AbilityCard: React.FC<AbilityCardProps> = ({ data, type, useSanity = true }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getElementColor = (element?: string) => {
    switch (element) {
      case 'Sangue': return 'text-ordem-red border-ordem-red';
      case 'Morte': return 'text-ordem-ooze border-ordem-ooze'; // Using ooze for black/death
      case 'Conhecimento': return 'text-ordem-gold border-ordem-gold';
      case 'Energia': return 'text-ordem-purple border-ordem-purple';
      case 'Medo': return 'text-white border-white';
      default: return 'text-gray-400 border-gray-600';
    }
  };

  const getCost = () => {
    let cost = '-';
    if (type === 'ritual') {
      const r = data as Ritual;
      const costs = { 1: 1, 2: 3, 3: 6, 4: 10 };
      cost = `${costs[r.circulo]} PE`;
    } else {
      const p = data as Poder;
      cost = p.custo ? p.custo : '-';
    }

    if (!useSanity && cost !== '-') {
      return cost.replace(/PE/g, 'PD').replace(/SAN/g, 'PD');
    }
    return cost;
  };

  const elementColorClass = getElementColor(data.elemento);

  return (
    <div 
      className={`w-full mb-2 border-l-2 bg-black/40 hover:bg-white/5 transition-all cursor-pointer overflow-hidden ${isOpen ? 'border-l-4' : ''} ${elementColorClass.split(' ')[1]}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex justify-between items-center p-3">
        <div className="flex items-center gap-2">
          <span className={`font-bold font-mono ${elementColorClass.split(' ')[0]}`}>
            {type === 'ritual' ? (data as Ritual).circulo + 'º ' : ''}
            {data.nome}
          </span>
          {data.elemento && (
            <span className={`text-[10px] uppercase px-1 border rounded ${elementColorClass}`}>
              {data.elemento}
            </span>
          )}
        </div>
        <div className="text-xs font-mono text-gray-400">
          {getCost()}
        </div>
      </div>

      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-3 pt-0 text-sm text-gray-300 border-t border-white/10 mt-1">
          
          {type === 'ritual' && (
            <div className="grid grid-cols-2 gap-2 mb-2 text-xs text-gray-500 font-mono">
              <div>Exec: {(data as Ritual).execucao}</div>
              <div>Alcance: {(data as Ritual).alcance}</div>
              <div>Alvo: {(data as Ritual).alvo}</div>
              <div>Duração: {(data as Ritual).duracao}</div>
              {(data as Ritual).resistencia && <div className="col-span-2">Resistência: {(data as Ritual).resistencia}</div>}
            </div>
          )}

          <p className="leading-relaxed mb-2">{data.descricao}</p>

          {type === 'ritual' && (data as Ritual).efeito && (
            <div className="space-y-1 mt-2 bg-black/20 p-2 rounded">
              <div className="text-xs"><strong className="text-ordem-white">Padrão:</strong> {(data as Ritual).efeito.padrao}</div>
              {(data as Ritual).efeito.discente && (
                <div className="text-xs"><strong className="text-ordem-gold">Discente:</strong> {(data as Ritual).efeito.discente}</div>
              )}
              {(data as Ritual).efeito.verdadeiro && (
                <div className="text-xs"><strong className="text-ordem-red">Verdadeiro:</strong> {(data as Ritual).efeito.verdadeiro}</div>
              )}
            </div>
          )}
          
          {type === 'poder' && (data as Poder).requisitos && (
            <div className="text-xs text-gray-500 mt-2">
              Requisitos: {(data as Poder).requisitos}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
