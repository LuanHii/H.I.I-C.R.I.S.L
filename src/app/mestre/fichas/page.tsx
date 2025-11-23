"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useStoredFichas } from '../../../core/storage/useStoredFichas';
import { AgentDetailView } from '../../../components/master/AgentDetailView';
import { normalizePersonagem } from '../../../core/personagemUtils';

export default function FichasPage() {
  const { fichas, remover, duplicar, salvar } = useStoredFichas();
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const registroAtual = fichas.find((ficha) => ficha.id === selecionada);
  const fichaAtual = registroAtual?.personagem;

  const handleUpdate = (updated: any) => {
      if (registroAtual) {
          const final = normalizePersonagem(updated, true);
          salvar(final, registroAtual.id);
      }
  };

  return (
    <main className="min-h-screen bg-ordem-black text-ordem-white grid grid-cols-1 lg:grid-cols-3">
      <section className="border-r border-ordem-white/15 p-6 space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ordem-white/60">PROTOCOLO</p>
            <h1 className="text-xl font-mono text-ordem-green">C.R.I.S // FICHAS</h1>
          </div>
          <Link
            href="/agente/novo"
            className="px-4 py-2 border border-ordem-green text-ordem-green text-xs tracking-widest hover:bg-ordem-green/10"
          >
            NOVA FICHA
          </Link>
        </header>
        <div className="space-y-2 max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar">
          {fichas.map((registro) => (
            <article
              key={registro.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelecionada(registro.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelecionada(registro.id);
                }
              }}
              className={`w-full text-left border p-3 transition ${
                selecionada === registro.id
                  ? 'border-ordem-green bg-ordem-green/10'
                  : 'border-ordem-white/15 hover:border-ordem-white'
              }`}
            >
              <div className="flex justify-between text-xs text-ordem-white/60">
                <span>{registro.personagem.classe}</span>
                <span>{new Date(registro.atualizadoEm).toLocaleDateString()}</span>
              </div>
              <p className="text-lg font-semibold text-ordem-white">{registro.personagem.nome}</p>
              <p className="text-xs text-ordem-white/70">
                NEX {registro.personagem.nex}% · Patente {registro.personagem.patente}
              </p>
              <div className="mt-2 flex gap-2 text-[10px] text-ordem-white/60">
                <span>PV {registro.personagem.pv.atual}/{registro.personagem.pv.max}</span>
                <span>PE {registro.personagem.pe.atual}/{registro.personagem.pe.max}</span>
                <span>SAN {registro.personagem.san.atual}/{registro.personagem.san.max}</span>
              </div>
              <div className="mt-3 flex gap-2">
                {(() => {
                  const cockpitHref: `/mestre/fichas/${string}` = `/mestre/fichas/${registro.id}`;
                  return (
                    <Link
                      href={cockpitHref}
                      onClick={(event) => event.stopPropagation()}
                      className="text-xs px-2 py-1 border border-ordem-green text-ordem-green hover:bg-ordem-green/10"
                    >
                      EDITAR
                    </Link>
                  );
                })()}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    duplicar(registro.id);
                  }}
                  className="text-xs px-2 py-1 border border-ordem-white/30 hover:border-ordem-white"
                >
                  DUPLICAR
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    remover(registro.id);
                    if (selecionada === registro.id) setSelecionada(null);
                  }}
                  className="text-xs px-2 py-1 border border-ordem-red text-ordem-red hover:bg-ordem-red/10"
                >
                  REMOVER
                </button>
              </div>
            </article>
          ))}
          {fichas.length === 0 && (
            <p className="text-sm text-ordem-white/60">
              Nenhuma ficha salva ainda. Gere um agente em <Link href="/agente/novo" className="text-ordem-green underline">/agente/novo</Link> para começar.
            </p>
          )}
        </div>
      </section>

      <section className="lg:col-span-2 p-6 bg-zinc-900/50">
        {fichaAtual ? (
          <div className="h-full overflow-hidden rounded-xl border border-zinc-800">
             <AgentDetailView 
                agent={fichaAtual} 
                onUpdate={handleUpdate}
                readOnly={false}
             />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-ordem-white/60">
            <p>Selecione uma ficha para visualizar os detalhes.</p>
          </div>
        )}
      </section>
    </main>
  );
}
