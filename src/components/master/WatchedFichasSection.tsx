"use client";

import Link from 'next/link';
import { useWatchedFichas } from '../../core/storage';
import { Eye, ExternalLink, Trash2 } from 'lucide-react';

export function WatchedFichasSection() {
  const { watchedFichas, loading, removeWatch, isAuthenticated } = useWatchedFichas();

  const handleRemove = async (agentId: string) => {
    if (confirm('Deseja parar de observar esta ficha?')) {
      await removeWatch(agentId);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 text-center">
        <Eye className="w-12 h-12 mx-auto mb-4 text-ordem-text-muted opacity-50" />
        <h3 className="text-lg font-medium text-ordem-white mb-2">Fichas Observadas</h3>
        <p className="text-sm text-ordem-text-muted mb-4">
          Faça login para acompanhar fichas compartilhadas por outros mestres.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ordem-green/30 border-t-ordem-green rounded-full animate-spin" />
      </div>
    );
  }

  if (!watchedFichas.length) {
    return (
      <div className="p-6 text-center">
        <Eye className="w-12 h-12 mx-auto mb-4 text-ordem-text-muted opacity-50" />
        <h3 className="text-lg font-medium text-ordem-white mb-2">Nenhuma ficha observada</h3>
        <p className="text-sm text-ordem-text-muted">
          Quando alguém compartilhar uma ficha com você, acesse o link e clique em &quot;Acompanhar&quot; para adicioná-la aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-mono tracking-widest text-ordem-text-muted uppercase">
          Links salvos ({watchedFichas.length})
        </h3>
      </div>

      {watchedFichas.map((ficha) => (
        <Link
          key={ficha.agentId}
          href={`/ficha/${ficha.agentId}`}
          className="flex items-center justify-between gap-3 border border-ordem-border rounded-lg p-3 bg-ordem-black/40 hover:border-ordem-gold/50 hover:bg-ordem-gold/5 transition-colors group"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate group-hover:text-ordem-gold transition-colors">
              {ficha.nome}
            </p>
            <p className="text-xs text-ordem-text-muted">
              {ficha.classe} · NEX {ficha.nex}%
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ExternalLink size={16} className="text-ordem-text-muted group-hover:text-ordem-gold transition-colors" />
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRemove(ficha.agentId);
              }}
              className="p-1.5 text-ordem-red/50 hover:text-ordem-red hover:bg-ordem-red/10 rounded transition-colors"
              title="Remover"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </Link>
      ))}

      <p className="text-[10px] text-ordem-text-muted text-center pt-2">
        Clique para abrir a ficha compartilhada
      </p>
    </div>
  );
}
