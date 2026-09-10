'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthOptional } from '@/core/firebase/auth';
import {
  assinarBibliotecaOp2,
  removerFichaOp2DoPerfil,
  salvarFichaOp2NoPerfil,
} from '../nuvem/biblioteca';
import { diferencaParaNuvem, mesclarPrimeiraCarga } from '../nuvem/mesclagem';
import { assinaturaDaFicha, ATRASO_DE_SINCRONIZACAO_MS } from '../nuvem/sincronizacao';
import { useOp2FichasStore } from './useOp2FichasStore';

export type SituacaoDaBiblioteca =
  | 'sem-conta'
  | 'carregando'
  | 'salva-no-perfil'
  | 'salvando'
  | 'erro';

export interface BibliotecaOp2 {
  situacao: SituacaoDaBiblioteca;
  mensagemDeErro: string | null;
}

export function useBibliotecaOp2(): BibliotecaOp2 {
  const auth = useAuthOptional();
  const uid = auth?.user?.uid ?? null;

  const fichas = useOp2FichasStore((estado) => estado.fichas);
  const definirFichas = useOp2FichasStore((estado) => estado.definirFichas);

  const [situacao, setSituacao] = useState<SituacaoDaBiblioteca>('sem-conta');
  const [mensagemDeErro, setMensagemDeErro] = useState<string | null>(null);

  const enviadas = useRef<Map<string, string>>(new Map());
  const pronto = useRef(false);

  useEffect(() => {
    enviadas.current = new Map();
    pronto.current = false;

    if (!uid) {
      setSituacao('sem-conta');
      return;
    }

    setSituacao('carregando');
    setMensagemDeErro(null);

    const cancelar = assinarBibliotecaOp2(
      uid,
      (registros) => {
        for (const registro of registros) {
          enviadas.current.set(registro.id, assinaturaDaFicha(registro.ficha));
        }

        if (!pronto.current) {
          const estado = useOp2FichasStore.getState();
          const { fichas: mescladas, aSubir } = mesclarPrimeiraCarga(
            estado.fichas,
            estado.atualizadoEm,
            registros,
          );
          pronto.current = true;
          definirFichas(mescladas);
          for (const ficha of aSubir) {
            enviadas.current.set(ficha.id, assinaturaDaFicha(ficha));
            salvarFichaOp2NoPerfil(uid, ficha).catch((erro) => {
              enviadas.current.delete(ficha.id);
              setMensagemDeErro(
                erro instanceof Error ? erro.message : 'Falha ao salvar a ficha no perfil.',
              );
              setSituacao('erro');
            });
          }
        } else {
          definirFichas(registros.map((registro) => registro.ficha));
        }

        setSituacao('salva-no-perfil');
      },
      (erro) => {
        setMensagemDeErro(
          erro instanceof Error ? erro.message : 'Falha ao ler as fichas do perfil.',
        );
        setSituacao('erro');
      },
    );

    return cancelar;
  }, [uid, definirFichas]);

  useEffect(() => {
    if (!uid || !pronto.current) return;

    const { aSalvar, aRemover } = diferencaParaNuvem(fichas, enviadas.current);
    if (aSalvar.length === 0 && aRemover.length === 0) return;

    setSituacao('salvando');
    const relogio = setTimeout(() => {
      const trabalhos = [
        ...aSalvar.map((ficha) => {
          enviadas.current.set(ficha.id, assinaturaDaFicha(ficha));
          return salvarFichaOp2NoPerfil(uid, ficha).catch((erro) => {
            enviadas.current.delete(ficha.id);
            throw erro;
          });
        }),
        ...aRemover.map((id) => {
          enviadas.current.delete(id);
          return removerFichaOp2DoPerfil(uid, id);
        }),
      ];

      Promise.all(trabalhos)
        .then(() => {
          setMensagemDeErro(null);
          setSituacao('salva-no-perfil');
        })
        .catch((erro) => {
          setMensagemDeErro(
            erro instanceof Error ? erro.message : 'Falha ao salvar as fichas no perfil.',
          );
          setSituacao('erro');
        });
    }, ATRASO_DE_SINCRONIZACAO_MS);

    return () => clearTimeout(relogio);
  }, [uid, fichas]);

  return { situacao, mensagemDeErro };
}
