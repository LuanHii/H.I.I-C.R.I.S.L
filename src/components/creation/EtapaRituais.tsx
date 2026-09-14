'use client';

import React, { useMemo, useState } from 'react';
import { RITUAIS } from '@/data/magic/rituals';
import type { Elemento } from '@/core/types';
import { ELEMENTOS } from '@/core/rules/pericias';
import { custoDoRitual } from '@/core/rules/rituais';
import { RITUAIS_INICIAIS, type Rascunho } from '@/logic/rascunhoDeCriacao';
import { Aviso, Cartao, Chip, Contador, TituloDaEtapa } from './PecasDaCriacao';

const TOM: Record<Elemento, string> = {
  Sangue: 'text-red-400',
  Morte: 'text-zinc-300',
  Conhecimento: 'text-yellow-300',
  Energia: 'text-purple-300',
  Medo: 'text-white',
};

export function EtapaRituais({ rascunho, onChange, numero }: { rascunho: Rascunho; onChange: (r: Rascunho) => void; numero: number }) {
  const [filtro, setFiltro] = useState<Elemento | 'todos'>('todos');
  const primeiros = useMemo(() => RITUAIS.filter((r) => r.circulo === 1), []);
  const lista = filtro === 'todos' ? primeiros : primeiros.filter((r) => r.elemento === filtro);
  const cheio = rascunho.rituais.length >= RITUAIS_INICIAIS;

  const alternar = (nome: string) => {
    const tem = rascunho.rituais.includes(nome);
    if (!tem && cheio) return;
    onChange({ ...rascunho, rituais: tem ? rascunho.rituais.filter((x) => x !== nome) : [...rascunho.rituais, nome] });
  };

  return (
    <div>
      <TituloDaEtapa numero={numero} titulo="Rituais iniciais" descricao="Escolhido pelo Outro Lado: o Ocultista começa sabendo três rituais de 1º círculo (1 PE cada).">
        <Contador atual={rascunho.rituais.length} total={RITUAIS_INICIAIS} rotulo="Rituais" />
      </TituloDaEtapa>

      <div className="flex flex-wrap gap-1.5">
        <Chip ativo={filtro === 'todos'} tom="neutro" onClick={() => setFiltro('todos')}>Todos</Chip>
        {ELEMENTOS.map((e) => (
          <Chip key={e} ativo={filtro === e} tom="neutro" onClick={() => setFiltro(e)}>
            <span className={TOM[e]}>{e}</span>
          </Chip>
        ))}
      </div>

      <div className="mt-3 grid max-h-[55vh] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
        {lista.map((r) => {
          const ativo = rascunho.rituais.includes(r.nome);
          return (
            <Cartao key={`${r.nome}-${r.elemento}`} compacto selecionado={ativo} desabilitado={!ativo && cheio} onClick={() => alternar(r.nome)}>
              <div className="flex items-baseline justify-between gap-2 pr-6">
                <span className="font-display text-base font-bold text-white">{r.nome}</span>
                <span className={`font-carimbo text-[10px] uppercase tracking-[0.16em] ${TOM[r.elemento]}`}>{r.elemento}</span>
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-ordem-text-muted">
                {custoDoRitual(r.circulo)} PE · {r.execucao} · {r.alcance} · {r.alvo}
              </div>
              <p className="mt-1.5 text-[11px] leading-snug text-ordem-text-secondary">{r.efeito.padrao}</p>
            </Cartao>
          );
        })}
      </div>

      <div className="mt-4">
        {!cheio && <Aviso tom="info">Faltam {RITUAIS_INICIAIS - rascunho.rituais.length} ritual(is).</Aviso>}
        {cheio && <Aviso tom="ok">Rituais escolhidos.</Aviso>}
      </div>
    </div>
  );
}
