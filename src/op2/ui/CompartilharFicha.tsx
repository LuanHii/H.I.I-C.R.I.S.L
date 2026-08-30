'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuthOptional } from '@/core/firebase/auth';
import { cn } from '@/lib/utils';
import {
  buscarFichaOp2,
  despublicarFichaOp2,
  publicarFichaOp2,
  urlDaFicha,
  urlDoOverlay,
} from '../nuvem/agentes';
import type { FichaOp2 } from '../regras/tipos';

type Situacao = 'verificando' | 'fora-do-ar' | 'publicada' | 'publicando' | 'erro';

interface LinhaDeLinkProps {
  rotulo: string;
  url: string;
  ajuda: string;
}

const LinhaDeLink: React.FC<LinhaDeLinkProps> = ({ rotulo, url, ajuda }) => {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  };

  useEffect(() => {
    if (!copiado) return;
    const relogio = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(relogio);
  }, [copiado]);

  return (
    <div className="rounded border border-ordem-border bg-ordem-bg p-2">
      <div className="flex items-baseline gap-2">
        <span className="text-[0.65rem] font-bold uppercase tracking-wide text-ordem-text-secondary">
          {rotulo}
        </span>
        <span className="text-[0.6rem] text-ordem-text-muted">{ajuda}</span>
        <button
          type="button"
          onClick={copiar}
          className="ml-auto rounded border border-ordem-border px-2 py-0.5 text-[0.65rem] text-ordem-text-muted hover:border-ordem-green hover:text-ordem-green"
        >
          {copiado ? 'copiado' : 'copiar'}
        </button>
      </div>
      <code className="mt-1 block truncate font-mono text-[0.65rem] text-ordem-cyan">{url}</code>
    </div>
  );
};

export interface CompartilharFichaProps {
  ficha: FichaOp2;
  className?: string;
}

export const CompartilharFicha: React.FC<CompartilharFichaProps> = ({ ficha, className }) => {
  const auth = useAuthOptional();
  const [situacao, setSituacao] = useState<Situacao>('verificando');
  const [mensagemDeErro, setMensagemDeErro] = useState<string | null>(null);
  const [origem, setOrigem] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigem(window.location.origin);
  }, []);

  useEffect(() => {
    let cancelado = false;
    setSituacao('verificando');

    buscarFichaOp2(ficha.id)
      .then((documento) => {
        if (cancelado) return;
        setSituacao(documento ? 'publicada' : 'fora-do-ar');
      })
      .catch(() => {
        if (!cancelado) setSituacao('fora-do-ar');
      });

    return () => {
      cancelado = true;
    };
  }, [ficha.id]);

  const publicar = async () => {
    setSituacao('publicando');
    setMensagemDeErro(null);
    try {
      await publicarFichaOp2(ficha.id, ficha);
      setSituacao('publicada');
    } catch (erro) {
      setSituacao('erro');
      setMensagemDeErro(erro instanceof Error ? erro.message : 'Falha ao publicar a ficha.');
    }
  };

  const despublicar = async () => {
    setSituacao('publicando');
    setMensagemDeErro(null);
    try {
      await despublicarFichaOp2(ficha.id);
      setSituacao('fora-do-ar');
    } catch (erro) {
      setSituacao('erro');
      setMensagemDeErro(erro instanceof Error ? erro.message : 'Falha ao remover a ficha.');
    }
  };

  if (!auth?.isAuthenticated) {
    return (
      <div className={cn('rounded-lg border border-ordem-border bg-ordem-black p-4', className)}>
        <h3 className="text-sm font-bold uppercase tracking-wide text-ordem-white">Compartilhar</h3>
        <p className="mt-1 text-xs text-ordem-text-muted">
          Entre com sua conta para publicar a ficha e enviar o link ao jogador.
        </p>
        <Button className="mt-2" onClick={() => auth?.signInWithGoogle()} disabled={auth?.loading}>
          Entrar
        </Button>
      </div>
    );
  }

  const publicada = situacao === 'publicada';
  const ocupado = situacao === 'publicando' || situacao === 'verificando';

  return (
    <div className={cn('space-y-3 rounded-lg border border-ordem-border bg-ordem-black p-4', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-ordem-white">Compartilhar</h3>
        <span
          className={cn(
            'rounded px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider',
            publicada ? 'bg-ordem-green text-ordem-black' : 'bg-ordem-ooze text-ordem-text-muted',
          )}
        >
          {situacao === 'verificando' ? 'verificando' : publicada ? 'no ar' : 'fora do ar'}
        </span>

        <div className="ml-auto flex gap-2">
          <Button size="sm" onClick={publicar} disabled={ocupado}>
            {publicada ? 'Atualizar' : 'Publicar'}
          </Button>
          {publicada ? (
            <Button size="sm" variant="danger" onClick={despublicar} disabled={ocupado}>
              Tirar do ar
            </Button>
          ) : null}
        </div>
      </div>

      <p className="text-xs text-ordem-text-muted">
        Publicar envia esta ficha para a nuvem. O jogador abre o link e vê PV, PD, ímpeto e
        condições atualizando em tempo real. Publicar de novo depois de mudar algo é o que
        sincroniza.
      </p>

      {mensagemDeErro ? (
        <p className="rounded border border-ordem-red bg-ordem-red-dark/30 px-3 py-2 text-xs text-ordem-red-light">
          {mensagemDeErro}
        </p>
      ) : null}

      {publicada && origem ? (
        <div className="space-y-2">
          <LinhaDeLink
            rotulo="Ficha do jogador"
            url={urlDaFicha(ficha.id, origem)}
            ajuda="mande este para quem joga"
          />
          <LinhaDeLink
            rotulo="Overlay"
            url={urlDoOverlay(ficha.id, origem, 'mini')}
            ajuda="fundo verde, para OBS"
          />
          <LinhaDeLink
            rotulo="Overlay completo"
            url={urlDoOverlay(ficha.id, origem, 'full')}
            ajuda="inclui as perícias treinadas"
          />
        </div>
      ) : null}
    </div>
  );
};
