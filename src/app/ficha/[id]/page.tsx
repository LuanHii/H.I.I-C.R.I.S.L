"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { subscribeToAgent, saveAgentToCloud } from '../../../core/firebase/firestore';
import { Personagem } from '../../../core/types';
import { RemoteAgentView } from '../../../components/RemoteAgentView';
import { OverlayView } from './OverlayView';
import { ExternalLink } from 'lucide-react';

function PlayerAgentContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isOverlay = searchParams.get('overlay') === 'true';
  const overlayMode = (searchParams.get('overlayMode') as 'mini' | 'full' | null) ?? 'mini';

  const [agent, setAgent] = useState<Personagem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <RemoteAgentView
      agent={agent}
      connected={true}
      onOpenOverlayMini={openOverlay}
      onOpenOverlayFull={openOverlayFull}
    />
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
