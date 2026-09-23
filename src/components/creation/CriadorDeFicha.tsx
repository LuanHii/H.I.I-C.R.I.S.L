'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronUp, Download, ExternalLink, FileText, Plus } from 'lucide-react';
import type { Personagem } from '@/core/types';
import type { FichaPersistida } from '@/core/ficha/tipos';
import { criarFicha } from '@/core/ficha/criacao';
import { paraPersonagem } from '@/core/ficha/paraPersonagem';
import { useCloudFichas } from '@/core/storage';
import { downloadJSON, downloadMarkdown, exportarFichaIndividual } from '@/core/storage/exportImportUtils';
import { registroParaExportar } from '@/core/storage/importacaoDeFicha';
import { nomeDoArquivoDoResumo, resumoDoPersonagem } from '@/core/export/resumo';
import {
  RASCUNHO_INICIAL,
  classeDe,
  dadosDe,
  esqueletoDe,
  etapasDe,
  problemasDaEtapa,
  type EtapaId,
  type Rascunho,
} from '@/logic/rascunhoDeCriacao';
import { Fita, Painel, Recurso, RotuloSecao } from '../master/ui/Pecas';
import { Aviso } from './PecasDaCriacao';
import { TrilhoDeEtapas } from './TrilhoDeEtapas';
import { PreviaDaFicha } from './PreviaDaFicha';
import { EtapaIdentidade } from './EtapaIdentidade';
import { EtapaAtributos } from './EtapaAtributos';
import { EtapaOrigem } from './EtapaOrigem';
import { EtapaClasse } from './EtapaClasse';
import { EtapaPericias } from './EtapaPericias';
import { EtapaRituais } from './EtapaRituais';
import { EtapaEquipamento } from './EtapaEquipamento';
import { EtapaRevisao } from './EtapaRevisao';
import { cn } from '@/lib/utils';

export interface CriadorDeFichaProps {
  rascunhoInicial?: Rascunho;
  etapaInicial?: EtapaId;
  onCriada?: (personagem: Personagem, ficha: FichaPersistida) => void;
}

interface FichaCriada {
  id: string;
  salvaNaConta: boolean;
  personagem: Personagem;
  ficha: FichaPersistida;
}

export function nomeDoArquivoDaFicha(personagem: Personagem, id: string): string {
  return `${personagem.nome.replace(/[^a-z0-9]/gi, '_')}-${id.slice(0, 8)}.json`;
}

export function nascerNoMotorNovo(rascunho: Rascunho): { ficha: FichaPersistida; personagem: Personagem } {
  const dados = dadosDe(rascunho);
  const resultado = criarFicha(dados);
  const erros = resultado.problemas.filter((p) => p.gravidade === 'erro');
  if (erros.length > 0) throw new Error(erros.map((p) => p.mensagem).join(' '));
  const esqueleto = esqueletoDe(rascunho);
  return { ficha: resultado.ficha, personagem: paraPersonagem({ ficha: resultado.ficha, carregarDe: esqueleto }) };
}

export default function CriadorDeFicha({ rascunhoInicial, etapaInicial, onCriada }: CriadorDeFichaProps) {
  const { criar, isCloudMode } = useCloudFichas();
  const [rascunho, setRascunho] = useState<Rascunho>(rascunhoInicial ?? RASCUNHO_INICIAL);
  const etapas = useMemo(() => etapasDe(rascunho), [rascunho]);
  const [indice, setIndice] = useState(() => Math.max(0, etapas.indexOf(etapaInicial ?? 'identidade')));
  const [alcancada, setAlcancada] = useState(() => (rascunhoInicial ? etapas.length - 1 : 0));
  const [erro, setErro] = useState<string | null>(null);
  const [previaAberta, setPreviaAberta] = useState(false);
  const [registrando, setRegistrando] = useState(false);
  const [criada, setCriada] = useState<FichaCriada | null>(null);

  const etapaAtual = etapas[Math.min(indice, etapas.length - 1)];
  const ultima = indice >= etapas.length - 1;

  const irPara = useCallback((i: number) => {
    setErro(null);
    setIndice(Math.max(0, Math.min(i, etapas.length - 1)));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [etapas.length]);

  const irParaEtapa = useCallback((etapa: EtapaId) => irPara(etapas.indexOf(etapa)), [etapas, irPara]);

  const atualizar = useCallback((r: Rascunho) => {
    setErro(null);
    setRascunho(r);
  }, []);

  const registrar = async () => {
    setRegistrando(true);
    try {
      const { ficha, personagem } = nascerNoMotorNovo(rascunho);
      if (onCriada) {
        onCriada(personagem, ficha);
        setCriada({ id: crypto.randomUUID(), salvaNaConta: false, personagem, ficha });
      } else {
        const id = await criar(personagem, ficha);
        setCriada({ id, salvaNaConta: true, personagem, ficha });
      }
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível registrar a ficha.');
    } finally {
      setRegistrando(false);
    }
  };

  const continuar = () => {
    const problemas = problemasDaEtapa(rascunho, etapaAtual);
    if (problemas.length > 0) {
      setErro(problemas[0]);
      return;
    }
    if (ultima) {
      void registrar();
      return;
    }
    setAlcancada((a) => Math.max(a, indice + 1));
    irPara(indice + 1);
  };

  const recomecar = () => {
    setRascunho(RASCUNHO_INICIAL);
    setIndice(0);
    setAlcancada(0);
    setErro(null);
    setCriada(null);
  };

  const classe = classeDe(rascunho);

  if (criada) {
    const p = criada.personagem;
    const usaPd = p.usarPd && p.pd;
    const exportarFicha = () => {
      const registro = registroParaExportar(criada.id, p, criada.ficha, new Date().toISOString());
      downloadJSON(exportarFichaIndividual(registro), nomeDoArquivoDaFicha(p, criada.id));
    };
    const baixarResumo = () => downloadMarkdown(resumoDoPersonagem(p), nomeDoArquivoDoResumo(p));
    return (
      <div data-classe={classe ?? ''} className="mx-auto w-full max-w-3xl">
        <Painel cantos aura className="p-5 sm:p-8">
          <RotuloSecao>{onCriada ? 'Ficha recriada' : 'Ficha registrada'}</RotuloSecao>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Fita variante="classe">{p.classe}</Fita>
            <Fita variante="neutra">{p.classe === 'Sobrevivente' ? `Estágio ${p.estagio ?? 1}` : `NEX ${p.nex}%`}</Fita>
            <Fita variante="neutra">{p.origem}</Fita>
            {p.trilha && <Fita variante="contorno">{p.trilha}</Fita>}
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">{p.nome}</h2>
          {p.conceito && <p className="mt-1 text-sm italic text-ordem-text-secondary">{p.conceito}</p>}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Recurso tom="pv" compacto atual={p.pv.atual} max={p.pv.max} segmentos={8} />
            {usaPd ? (
              <Recurso tom="pd" compacto atual={p.pd!.atual} max={p.pd!.max} segmentos={8} />
            ) : (
              <>
                <Recurso tom="pe" compacto atual={p.pe.atual} max={p.pe.max} segmentos={8} />
                <Recurso tom="san" compacto atual={p.san.atual} max={p.san.max} segmentos={8} />
              </>
            )}
          </div>
          <p className="mt-4 text-xs text-ordem-text-muted">
            {isCloudMode ? 'Salva na sua conta.' : 'Salva neste navegador — entre para sincronizar.'} A ficha abre no painel do mestre, onde as pendências podem ser resolvidas em Construção.
          </p>

          <div className="mt-5 border border-[var(--mestre-primary,#DC2626)]/40 bg-white/[0.03] p-4">
            <RotuloSecao>Mandar para o mestre</RotuloSecao>
            <p className="mt-1 text-xs leading-relaxed text-ordem-text-secondary">
              Baixe o arquivo da ficha e envie. O mestre importa em Fichas → Exp/Imp → &quot;Uma ficha&quot;, e ela entra na conta dele inteira, com tudo o que você escolheu.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={exportarFicha}
                className="inline-flex items-center justify-center gap-2 bg-[var(--mestre-primary,#DC2626)] px-5 py-3 font-carimbo text-[11px] uppercase tracking-[0.18em] text-black transition hover:brightness-110"
              >
                <Download size={14} /> Exportar ficha
              </button>
              <button
                type="button"
                onClick={baixarResumo}
                title="Texto só com o que o personagem tem, para colar numa IA ou ler rápido"
                className="inline-flex items-center justify-center gap-2 border border-white/15 px-5 py-3 font-carimbo text-[11px] uppercase tracking-[0.18em] text-ordem-text-secondary transition hover:border-white hover:text-white"
              >
                <FileText size={14} /> Resumo
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {criada.salvaNaConta ? (
              <Link
                href={`/mestre/fichas/${criada.id}`}
                className="inline-flex items-center justify-center gap-2 bg-white px-5 py-3 font-carimbo text-[11px] uppercase tracking-[0.18em] text-black transition hover:bg-[var(--mestre-primary,#DC2626)] hover:text-white"
              >
                <ExternalLink size={14} /> Abrir a ficha
              </Link>
            ) : (
              <Link
                href="/mestre/fichas"
                className="inline-flex items-center justify-center gap-2 bg-white px-5 py-3 font-carimbo text-[11px] uppercase tracking-[0.18em] text-black transition hover:bg-[var(--mestre-primary,#DC2626)] hover:text-white"
              >
                <ExternalLink size={14} /> Ver fichas
              </Link>
            )}
            <button
              type="button"
              onClick={recomecar}
              className="inline-flex items-center justify-center gap-2 border border-white/15 px-5 py-3 font-carimbo text-[11px] uppercase tracking-[0.18em] text-ordem-text-secondary transition hover:border-white hover:text-white"
            >
              <Plus size={14} /> Criar outra
            </button>
          </div>
        </Painel>
      </div>
    );
  }

  const numero = indice + 1;
  const propsDaEtapa = { rascunho, onChange: atualizar, numero };

  return (
    <div data-classe={classe ?? ''} className="mx-auto w-full max-w-6xl pb-28 lg:pb-8">
      <header className="mb-4 sm:mb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <RotuloSecao>{onCriada ? 'Recriar ficha' : 'Nova ficha'}</RotuloSecao>
            <h1 className="font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
              {rascunho.tipo === 'Sobrevivente' ? 'Sobrevivente' : rascunho.tipo === 'Agente' ? 'Agente da Ordem' : 'Personagem'}
            </h1>
          </div>
          <span className="font-mono text-[10px] text-ordem-text-muted">{isCloudMode ? 'conta conectada' : 'salvando neste navegador'}</span>
        </div>
        <div className="mt-3">
          <TrilhoDeEtapas etapas={etapas} atual={indice} alcancada={alcancada} irPara={irPara} />
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-5">
        <div className="min-w-0">
          {erro && <div className="mb-3"><Aviso>{erro}</Aviso></div>}

          <Painel cantos className="p-4 sm:p-6">
            {etapaAtual === 'identidade' && <EtapaIdentidade {...propsDaEtapa} />}
            {etapaAtual === 'atributos' && <EtapaAtributos {...propsDaEtapa} />}
            {etapaAtual === 'origem' && <EtapaOrigem {...propsDaEtapa} />}
            {etapaAtual === 'classe' && <EtapaClasse {...propsDaEtapa} />}
            {etapaAtual === 'pericias' && <EtapaPericias {...propsDaEtapa} />}
            {etapaAtual === 'rituais' && <EtapaRituais {...propsDaEtapa} />}
            {etapaAtual === 'equipamento' && <EtapaEquipamento {...propsDaEtapa} />}
            {etapaAtual === 'revisao' && <EtapaRevisao rascunho={rascunho} numero={numero} irPara={irParaEtapa} />}
          </Painel>

          <div className="hidden lg:mt-4 lg:flex lg:items-center lg:justify-between">
            <BotaoVoltar visivel={indice > 0} onClick={() => irPara(indice - 1)} />
            <BotaoContinuar ultima={ultima} registrando={registrando} onClick={continuar} />
          </div>
        </div>

        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <Painel cantos aura className="p-4">
            <RotuloSecao>Prévia da ficha</RotuloSecao>
            <div className="mt-2">
              <PreviaDaFicha rascunho={rascunho} />
            </div>
          </Painel>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[45] border-t border-white/10 bg-ordem-black/95 backdrop-blur safe-bottom lg:hidden">
        {previaAberta && (
          <div className="max-h-[55vh] overflow-y-auto border-b border-white/10 px-4 py-3">
            <PreviaDaFicha rascunho={rascunho} />
          </div>
        )}
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            type="button"
            onClick={() => setPreviaAberta((v) => !v)}
            aria-expanded={previaAberta}
            className="flex h-11 items-center gap-1 border border-white/15 px-3 font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-secondary"
          >
            <ChevronUp size={14} className={cn('transition', previaAberta && 'rotate-180')} /> Prévia
          </button>
          <BotaoVoltar visivel={indice > 0} onClick={() => irPara(indice - 1)} compacto />
          <BotaoContinuar ultima={ultima} registrando={registrando} onClick={continuar} className="flex-1" />
        </div>
      </div>
    </div>
  );
}

function BotaoVoltar({ visivel, onClick, compacto = false }: { visivel: boolean; onClick: () => void; compacto?: boolean }) {
  if (!visivel) return <span />;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Voltar"
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 border border-white/15 font-carimbo text-[11px] uppercase tracking-[0.18em] text-ordem-text-secondary transition hover:border-white hover:text-white',
        compacto ? 'w-11' : 'px-5',
      )}
    >
      <ArrowLeft size={14} />
      {!compacto && 'Voltar'}
    </button>
  );
}

function BotaoContinuar({ ultima, registrando, onClick, className }: { ultima: boolean; registrando: boolean; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={registrando}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 px-6 font-carimbo text-[11px] uppercase tracking-[0.18em] transition disabled:opacity-50',
        ultima
          ? 'bg-[var(--mestre-primary,#DC2626)] text-black hover:brightness-110'
          : 'bg-white text-black hover:bg-[var(--mestre-primary,#DC2626)] hover:text-white',
        className,
      )}
    >
      {ultima ? (registrando ? 'Registrando…' : 'Registrar ficha') : 'Continuar'}
      {!ultima && <ArrowRight size={14} />}
    </button>
  );
}

