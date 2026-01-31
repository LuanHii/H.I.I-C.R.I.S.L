"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { subscribeToAgent, saveAgentToCloud } from '../../../core/firebase/firestore';
import { Personagem } from '../../../core/types';
import { RemoteAgentView } from '../../../components/RemoteAgentView';
import { OverlayView } from './OverlayView';
import { useWatchedFichas } from '../../../core/storage';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthOptional } from '../../../core/firebase/auth';

function PlayerAgentContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isOverlay = searchParams.get('overlay') === 'true';
  const overlayMode = (searchParams.get('overlayMode') as 'mini' | 'full' | null) ?? 'mini';

  const auth = useAuthOptional();
  const { addWatch, removeWatch, isWatching, isAuthenticated } = useWatchedFichas();

  const [agent, setAgent] = useState<Personagem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchLoading, setWatchLoading] = useState(false);

  const isCurrentlyWatching = isWatching(id);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = subscribeToAgent(id, (data) => {
      if (data) {
        setAgent(data);
        setLoading(false);
      } else {
        setError('Agente não encontrado. Verifique se o Mestre salvou a ficha na nuvem.');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [id]);

  const handleToggleWatch = async () => {
    if (!agent) return;
    setWatchLoading(true);

    try {
      if (isCurrentlyWatching) {
        await removeWatch(id);
      } else {
        await addWatch(id, agent);
      }
    } catch (err) {
      console.error('Erro ao alterar observação:', err);
    } finally {
      setWatchLoading(false);
    }
  };

  const handleUpdate = async (updatedAgent: Personagem) => {
    setAgent(updatedAgent);
    await saveAgentToCloud(id, updatedAgent);
  };

  const openOverlay = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('overlay', 'true');
    url.searchParams.set('overlayMode', 'mini');
    window.open(url.toString(), '_blank', 'width=500,height=500,menubar=no,toolbar=no,location=no,status=no');
  };

  const openOverlayFull = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('overlay', 'true');
    url.searchParams.set('overlayMode', 'full');
    window.open(url.toString(), '_blank', 'width=520,height=680,menubar=no,toolbar=no,location=no,status=no');
  };

  if (loading) {
    if (isOverlay) return null;
    return (
      <div className="min-h-screen bg-ordem-black text-white flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-ordem-red border-t-transparent rounded-full animate-spin"></div>
          <div className="animate-pulse tracking-widest">CARREGANDO DADOS DA ORDEM...</div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    if (isOverlay) return <div className="text-red-500 font-bold p-4 bg-ordem-black/50">ERRO: {error || 'Agente não encontrado'}</div>;
    return (
      <div className="min-h-screen bg-ordem-black text-ordem-red flex flex-col items-center justify-center font-mono p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        <h2 className="text-xl font-bold mb-2">ERRO DE CONEXÃO</h2>
        <p className="text-ordem-text-secondary max-w-md">{error || 'Agente não encontrado.'}</p>
      </div>
    );
  }

  if (isOverlay) {
    return <OverlayView agent={agent} mode={overlayMode} />;
  }

  return (
    <div className="min-h-screen bg-ordem-black">
      <div className="sticky top-0 z-50 bg-ordem-black/95 backdrop-blur border-b border-ordem-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-xs font-mono tracking-widest text-ordem-text-muted uppercase">Ficha Compartilhada</div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={handleToggleWatch}
                disabled={watchLoading}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-mono tracking-wider rounded-lg border transition-colors ${
                  isCurrentlyWatching
                    ? 'border-ordem-gold text-ordem-gold bg-ordem-gold/10 hover:bg-ordem-gold/20'
                    : 'border-ordem-green text-ordem-green hover:bg-ordem-green/10'
                } disabled:opacity-50`}
              >
                {watchLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isCurrentlyWatching ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
                <span className="hidden sm:inline">
                  {isCurrentlyWatching ? 'OBSERVANDO' : 'ACOMPANHAR'}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-ordem-text-muted">
                <LogIn size={14} />
                <span className="hidden sm:inline">Faça login para acompanhar</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <RemoteAgentView
        agent={agent}
        connected={true}
        onOpenOverlayMini={openOverlay}
        onOpenOverlayFull={openOverlayFull}
      />
    </div>
  );
}

export default function PlayerAgentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ordem-black text-white flex items-center justify-center font-mono">
        <div className="animate-pulse">INICIALIZANDO...</div>
      </div>
    }>
      <PlayerAgentContent />
    </Suspense>
  );
}
