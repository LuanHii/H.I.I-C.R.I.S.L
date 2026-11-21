'use client';

import Link from 'next/link';
import { Check, ListPlus, Swords } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuthOptional } from '@/core/firebase/auth';
import { lerEncontro, quantificarEncontro, type EntradaEncontro, type TipoParticipante } from '@/core/rules/encontro';
import { cn } from '@/lib/utils';

interface RascunhoEncontro {
  entradas: EntradaEncontro[];
  pronto: boolean;
  definirQuantidade: (tipo: TipoParticipante, id: string, quantidade: number) => void;
  concluir: (entradas: readonly EntradaEncontro[]) => void;
}
const Contexto = createContext<RascunhoEncontro | null>(null);
const VAZIO: EntradaEncontro[] = [];

export function EncontroRascunhoProvider({ children }: { children: ReactNode }) {
  const auth = useAuthOptional();
  const chave = auth?.loading ? null : 'hiicris.encontro.v1:' + (auth?.user?.uid ?? 'local');
  const [dados, setDados] = useState<{ chave: string; entradas: EntradaEncontro[] } | null>(null);

  useEffect(() => {
    if (!chave) return;
    let entradas = VAZIO;
    try {
      const salva = window.localStorage.getItem(chave);
      if (salva) entradas = lerEncontro(JSON.parse(salva));
    } catch {
      entradas = VAZIO;
    }
    setDados({ chave, entradas });
  }, [chave]);

  useEffect(() => {
    if (!dados || dados.chave !== chave) return;
    try {
      if (dados.entradas.length) window.localStorage.setItem(dados.chave, JSON.stringify(dados.entradas));
      else window.localStorage.removeItem(dados.chave);
    } catch (erro) {
      console.warn('Não foi possível guardar o rascunho do encontro neste navegador.', erro);
    }
  }, [chave, dados]);

  const definirQuantidade = useCallback((tipo: TipoParticipante, id: string, quantidade: number) => {
    setDados(anterior => anterior && anterior.chave === chave
      ? { ...anterior, entradas: quantificarEncontro(anterior.entradas, tipo, id, quantidade) }
      : anterior);
  }, [chave]);

  const concluir = useCallback((usadas: readonly EntradaEncontro[]) => {
    setDados(anterior => anterior && anterior.chave === chave ? {
      ...anterior,
      entradas: anterior.entradas.filter(item => !usadas.some(usada => usada.tipo === item.tipo && usada.id === item.id)),
    } : anterior);
  }, [chave]);

  const pronto = Boolean(dados && dados.chave === chave);
  const entradas = pronto ? dados!.entradas : VAZIO;
  const value = useMemo(() => ({ entradas, pronto, definirQuantidade, concluir }), [entradas, pronto, definirQuantidade, concluir]);
  return <Contexto.Provider value={value}>{children}</Contexto.Provider>;
}

export function useEncontroRascunho() {
  const rascunho = useContext(Contexto);
  if (!rascunho) throw new Error('Rascunho do encontro fora da área do mestre');
  return rascunho;
}

export const linkMontagem = '/mestre?tab=combate&montar=1' as const;

export function AtalhosEncontroFicha({ id, nome, className }: { id: string; nome: string; className?: string }) {
  const { entradas, pronto, definirQuantidade } = useEncontroRascunho();
  const selecionado = entradas.some(item => item.tipo === 'agente' && item.id === id);
  return (
    <div className={cn('flex flex-wrap items-center gap-2 border-b border-ordem-border bg-ordem-black/60 px-3 py-2.5 sm:px-5', className)}>
      <button
        type="button"
        disabled={!pronto}
        aria-pressed={selecionado}
        aria-label={selecionado ? 'Remover ' + nome + ' do encontro' : 'Adicionar ' + nome + ' ao encontro'}
        onClick={() => definirQuantidade('agente', id, selecionado ? 0 : 1)}
        className={cn('inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 font-dados text-sm font-semibold focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ordem-green-muted disabled:opacity-50',
          selecionado ? 'border-ordem-green-muted/45 bg-ordem-green-muted/10 text-ordem-green-muted' : 'border-ordem-border-light bg-ordem-ooze text-ordem-white hover:border-ordem-green-muted/60')}
      >
        {selecionado ? <Check size={16} aria-hidden /> : <ListPlus size={17} aria-hidden />}
        {selecionado ? 'No encontro' : 'Adicionar ao encontro'}
      </button>
      {selecionado && <Link href={linkMontagem} className="inline-flex min-h-11 items-center gap-2 rounded px-2 font-dados text-sm text-ordem-text-secondary hover:text-white">
        <Swords size={16} aria-hidden /> Ver montagem
      </Link>}
    </div>
  );
}
