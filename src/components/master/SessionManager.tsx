import React from 'react';
import Link from 'next/link';

export const SessionManager: React.FC = () => {
  return (
    <div className="flex flex-col min-h-full p-6">
      <div className="max-w-4xl mx-auto w-full">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-2xl font-serif text-white tracking-wide">Sessão</h2>
          <p className="text-zinc-400 font-mono text-sm mt-2">
            O bloco de “Sessão em andamento” (rodada, gerenciamento tático em tempo real, gerenciar grupo e encerrar cena) foi desativado.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/mestre/fichas"
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg font-mono text-xs transition-colors uppercase tracking-wider"
            >
              Ir para Fichas
            </Link>
            <Link
              href="/mestre"
              className="px-4 py-2 bg-black/40 hover:bg-black/60 text-zinc-300 border border-zinc-800 rounded-lg font-mono text-xs transition-colors uppercase tracking-wider"
            >
              Voltar ao Painel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
