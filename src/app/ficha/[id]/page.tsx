"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { subscribeToAgent } from '../../../core/firebase/firestore';
import { Personagem } from '../../../core/types';
import { RemoteAgentView } from '../../../components/RemoteAgentView';
import { OverlayView } from './OverlayView';
import { useWatchedFichas } from '../../../core/storage';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthOptional } from '../../../core/firebase/auth';
import { FichaOp2Remota, useFichaOp2Remota } from '@/op2';

function PlayerAgentContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isOverlay = searchParams.get('overlay') === 'true';
  const isFoundryEmbed = searchParams.get('embed') === 'foundry';
  const overlayMode = (searchParams.get('overlayMode') as 'mini' | 'full' | null) ?? 'mini';
  const overlayFundo = searchParams.get('fundo') === 'verde' ? 'verde' : 'transparente';

  const auth = useAuthOptional();
  const { addWatch, removeWatch, isWatching, isAuthenticated } = useWatchedFichas();

  const op2 = useFichaOp2Remota(id);
  const ehOp2 = op2.fase === 'op2';

  const [agent, setAgent] = useState<Personagem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchLoading, setWatchLoading] = useState(false);

  const isCurrentlyWatching = isWatching(id);

  useEffect(() => {
    if (!id || ehOp2) return;

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
  }, [id, ehOp2]);

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

  if (op2.fase === 'op2') {
    return (
      <FichaOp2Remota
        ficha={op2.documento}
        atualizadoEm={op2.documento.updatedAt}
        overlay={isOverlay}
        modoDoOverlay={overlayMode}
        fundoDoOverlay={overlayFundo}
        embutida={isFoundryEmbed}
        aoAbrirOverlay={isFoundryEmbed ? undefined : (modo) => {
          const url = new URL(window.location.href);
          url.searchParams.set('overlay', 'true');
          url.searchParams.set('overlayMode', modo);
          window.open(
            url.toString(),
            '_blank',
            `width=${modo === 'full' ? 520 : 500},height=${modo === 'full' ? 680 : 500},menubar=no,toolbar=no,location=no,status=no`,
          );
        }}
      />
    );
  }

  if (loading || op2.fase === 'carregando') {
    if (isOverlay) return null;
    return (
      <div className="min-h-screen bg-ordem-black text-white flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-ordem-red"></div>
          <div className="animate-pulse font-carimbo text-[11px] uppercase tracking-[0.3em] text-ordem-text-muted">Carregando dados da Ordem</div>
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
      {!isFoundryEmbed && (
        <div className="sticky top-0 z-50 border-b border-white/10 bg-ordem-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2.5">
          <div className="flex min-w-0 items-baseline gap-3">
            <span className="font-display text-lg uppercase tracking-[0.1em] text-ordem-red">C.R.I.S.</span>
            <span className="font-carimbo text-[10px] uppercase tracking-[0.3em] text-ordem-text-muted">Ordo Realitas</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <button
                onClick={handleToggleWatch}
                disabled={watchLoading}
                className={`flex items-center gap-2 border px-3 py-2 font-carimbo text-[10px] uppercase tracking-[0.16em] transition-colors ${
                  isCurrentlyWatching
                    ? 'border-ordem-gold/60 bg-ordem-gold/10 text-ordem-gold hover:bg-ordem-gold/20'
                    : 'border-white/10 text-ordem-text-secondary hover:border-white/30 hover:text-white'
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
                  {isCurrentlyWatching ? 'Observando' : 'Acompanhar'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => auth?.signInWithGoogle()}
                disabled={auth?.loading}
                className="flex items-center gap-2 border border-white/10 px-3 py-2 font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-secondary transition-colors hover:border-white/30 hover:text-white disabled:opacity-50 touch-target-sm"
              >
                <LogIn size={14} />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>
        </div>
      )}

      <RemoteAgentView
        agent={agent}
        connected={true}
        onOpenOverlayMini={isFoundryEmbed ? undefined : openOverlay}
        onOpenOverlayFull={isFoundryEmbed ? undefined : openOverlayFull}
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
