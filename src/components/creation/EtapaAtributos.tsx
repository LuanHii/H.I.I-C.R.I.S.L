'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';
import type { AtributoKey } from '@/core/types';
import { ajustarAtributo, orcamentoDeAtributos, type Rascunho } from '@/logic/rascunhoDeCriacao';
import { Aviso, Contador, TituloDaEtapa } from './PecasDaCriacao';
import { cn } from '@/lib/utils';

const ATRIBUTOS: { chave: AtributoKey; nome: string; efeito: string }[] = [
  { chave: 'AGI', nome: 'Agilidade', efeito: 'Reflexos, Iniciativa, Pontaria, Furtividade' },
  { chave: 'FOR', nome: 'Força', efeito: 'Luta, Atletismo, capacidade de carga' },
  { chave: 'INT', nome: 'Intelecto', efeito: '+1 perícia treinada por ponto' },
  { chave: 'PRE', nome: 'Presença', efeito: 'Soma em PE (no início e a cada NEX); DT de rituais' },
  { chave: 'VIG', nome: 'Vigor', efeito: 'Soma em PV (no início e a cada NEX); Fortitude' },
];

function descricaoDoValor(v: number): string {
  if (v === 0) return '2d20, fica com o pior';
  return `${v}d20, fica com o melhor`;
}

export function EtapaAtributos({ rascunho, onChange, numero }: { rascunho: Rascunho; onChange: (r: Rascunho) => void; numero: number }) {
  const orcamento = orcamentoDeAtributos(rascunho);

  return (
    <div>
      <TituloDaEtapa
        numero={numero}
        titulo="Atributos"
        descricao={`Todos começam em 1. ${rascunho.tipo === 'Sobrevivente' ? 'Sobrevivente distribui 3 pontos' : 'Agente distribui 4 pontos'}; máximo 3 em cada. Zerar um único atributo devolve 1 ponto — mas nesse atributo você rola 2d20 e fica com o pior.`}
      >
        <Contador atual={orcamento.gastos} total={orcamento.total} rotulo="Pontos" />
      </TituloDaEtapa>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {ATRIBUTOS.map(({ chave, nome, efeito }) => {
          const valor = rascunho.atributos[chave];
          const podeSubir = ajustarAtributo(rascunho, chave, 1) !== rascunho;
          const podeDescer = ajustarAtributo(rascunho, chave, -1) !== rascunho;
          return (
            <div
              key={chave}
              className={cn(
                'flex items-center gap-3 border border-white/10 bg-white/[0.02] p-3 lg:flex-col lg:items-stretch lg:text-center',
                valor === 0 && 'border-ordem-red/40',
              )}
            >
              <div className="min-w-0 flex-1 lg:flex-none">
                <div className="font-carimbo text-[10px] uppercase tracking-[0.2em] text-ordem-text-muted">{chave}</div>
                <div className="font-display text-base font-bold text-white">{nome}</div>
                <p className="mt-0.5 text-[11px] leading-snug text-ordem-text-secondary lg:min-h-[2.4em]">{efeito}</p>
              </div>
              <div className="flex items-center gap-2 lg:mt-2 lg:justify-center">
                <button
                  type="button"
                  aria-label={`Diminuir ${nome}`}
                  onClick={() => onChange(ajustarAtributo(rascunho, chave, -1))}
                  disabled={!podeDescer}
                  className="grid h-11 w-11 place-items-center border border-white/15 text-ordem-text-secondary transition hover:border-white hover:text-white disabled:opacity-25 lg:h-9 lg:w-9"
                >
                  <Minus size={14} />
                </button>
                <span className={cn('w-10 text-center font-display text-3xl font-bold leading-none', valor === 0 ? 'text-ordem-red' : 'text-white')}>{valor}</span>
                <button
                  type="button"
                  aria-label={`Aumentar ${nome}`}
                  onClick={() => onChange(ajustarAtributo(rascunho, chave, 1))}
                  disabled={!podeSubir}
                  className="grid h-11 w-11 place-items-center border border-white/15 text-ordem-text-secondary transition hover:border-white hover:text-white disabled:opacity-25 lg:h-9 lg:w-9"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="hidden font-mono text-[10px] text-ordem-text-muted lg:mt-1.5 lg:block">{descricaoDoValor(valor)}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        {orcamento.restantes > 0 && <Aviso tom="info">Ainda restam {orcamento.restantes} ponto(s) para distribuir.</Aviso>}
        {orcamento.valido && <Aviso tom="ok">Distribuição fechada. Você pode seguir.</Aviso>}
      </div>
    </div>
  );
}
