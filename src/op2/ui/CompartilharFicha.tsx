'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import {
  ATRASO_DE_SINCRONIZACAO_MS,
  assinaturaDaFicha,
  precisaSincronizar,
} from '../nuvem/sincronizacao';
import type { FichaOp2 } from '../regras/tipos';
import { Distintivo, RotuloDeSecao } from './Pecas';

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
    <div className="rounded-lg border border-white/10 bg-black/40 p-2">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-ordem-text-secondary">
          {rotulo}
        </span>
        <span className="font-mono text-[10px] text-ordem-text-muted">{ajuda}</span>
        <button
          type="button"
          onClick={copiar}
          className="ml-auto rounded border border-white/10 px-2 py-0.5 font-mono text-[10px] text-ordem-text-muted transition-colors hover:border-ordem-gold/50 hover:text-ordem-gold"
        >
          {copiado ? 'copiado' : 'copiar'}
        </button>
      </div>
      <code className="mt-1 block truncate font-mono text-[10px] text-ordem-cyan">{url}</code>
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
  const [sincronizando, setSincronizando] = useState(false);
  const [sincronizadoEm, setSincronizadoEm] = useState<string | null>(null);

  const assinaturaEnviada = useRef<string | null>(null);
  const assinaturaAtual = assinaturaDaFicha(ficha);

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigem(window.location.origin);
  }, []);

  useEffect(() => {
    let cancelado = false;
    setSituacao('verificando');
    assinaturaEnviada.current = null;

    buscarFichaOp2(ficha.id)
      .then((documento) => {
        if (cancelado) return;
        if (documento) {
          assinaturaEnviada.current = assinaturaDaFicha(ficha);
          setSituacao('publicada');
          setSincronizadoEm(documento.updatedAt ?? null);
        } else {
          setSituacao('fora-do-ar');
        }
      })
      .catch(() => {
        if (!cancelado) setSituacao('fora-do-ar');
      });

    return () => {
      cancelado = true;
    };
  }, [ficha.id]);

  const enviar = useCallback(async () => {
    await publicarFichaOp2(ficha.id, ficha);
    assinaturaEnviada.current = assinaturaDaFicha(ficha);
    setSincronizadoEm(new Date().toISOString());
  }, [ficha]);

  const publicada = situacao === 'publicada';

  useEffect(() => {
    if (!precisaSincronizar(publicada, assinaturaEnviada.current, assinaturaAtual)) return;

    setSincronizando(true);
    const relogio = setTimeout(() => {
      enviar()
        .then(() => setMensagemDeErro(null))
        .catch((erro) =>
          setMensagemDeErro(
            erro instanceof Error ? erro.message : 'Falha ao sincronizar a ficha.',
          ),
        )
        .finally(() => setSincronizando(false));
    }, ATRASO_DE_SINCRONIZACAO_MS);

    return () => {
      clearTimeout(relogio);
      setSincronizando(false);
    };
  }, [publicada, assinaturaAtual, enviar]);

  const publicar = async () => {
    setSituacao('publicando');
    setMensagemDeErro(null);
    try {
      await enviar();
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
      assinaturaEnviada.current = null;
      setSincronizadoEm(null);
      setSituacao('fora-do-ar');
    } catch (erro) {
      setSituacao('erro');
      setMensagemDeErro(erro instanceof Error ? erro.message : 'Falha ao remover a ficha.');
    }
  };

  if (!auth?.isAuthenticated) {
    return (
      <div
        className={cn(
          'rounded-xl border border-ordem-border bg-ordem-ooze/30 p-4 sm:p-5',
          className,
        )}
      >
        <RotuloDeSecao>Compartilhar</RotuloDeSecao>
        <p className="mt-2 text-xs text-ordem-text-muted">
          Entre com sua conta para publicar a ficha e enviar o link ao jogador.
        </p>
        <Button className="mt-3" onClick={() => auth?.signInWithGoogle()} disabled={auth?.loading}>
          Entrar
        </Button>
      </div>
    );
  }

  const ocupado = situacao === 'publicando' || situacao === 'verificando';

  return (
    <div
      className={cn(
        'space-y-3 rounded-xl border border-ordem-border bg-ordem-ooze/30 p-4 sm:p-5',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <RotuloDeSecao>Compartilhar</RotuloDeSecao>

        {situacao === 'verificando' ? (
          <Distintivo>verificando</Distintivo>
        ) : publicada ? (
          <Distintivo className="border-ordem-green/40 bg-ordem-green/10 uppercase text-ordem-green">
            no ar
          </Distintivo>
        ) : (
          <Distintivo className="border-white/10 bg-black/40 uppercase text-ordem-text-muted">
            fora do ar
          </Distintivo>
        )}

        {publicada ? (
          <span
            className={cn(
              'flex items-center gap-1.5 font-mono text-[10px]',
              sincronizando ? 'text-ordem-gold' : 'text-ordem-text-muted',
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                sincronizando ? 'animate-pulse bg-ordem-gold' : 'bg-green-500',
              )}
            />
            {sincronizando ? 'sincronizando…' : 'sincronizado'}
          </span>
        ) : null}

        <div className="ml-auto flex gap-2">
          {!publicada ? (
            <Button size="sm" onClick={publicar} disabled={ocupado}>
              Publicar
            </Button>
          ) : (
            <Button size="sm" variant="danger" onClick={despublicar} disabled={ocupado}>
              Tirar do ar
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-ordem-text-muted">
        {publicada
          ? 'Alterações de PV, PD, ímpeto e condições vão para o jogador sozinhas, em tempo real.'
          : 'Publicar envia a ficha para a nuvem e devolve o link do jogador. A partir daí, tudo que você mudar aqui aparece lá sozinho.'}
      </p>

      {mensagemDeErro ? (
        <p className="rounded-lg border border-ordem-red/50 bg-ordem-red/10 px-3 py-2 text-xs text-red-400">
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
          {sincronizadoEm ? (
            <p className="font-mono text-[10px] text-ordem-text-muted">
              Último envio: {new Date(sincronizadoEm).toLocaleTimeString('pt-BR')}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
