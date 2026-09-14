"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useCloudFichas, useCloudCampanhas, useWatchedFichas, type FichaRegistro } from '../../core/storage';
import type { Personagem } from '../../core/types';
import { FichaMestre } from './ficha/FichaMestre';
import { FichaAntiga } from './ficha/FichaAntiga';
import { normalizePersonagem } from '../../core/personagemUtils';
import { saveAgentToCloud } from '../../core/firebase/firestore';
import { ImportExportModal } from './ImportExportModal';
import { downloadJSON, downloadMarkdown, exportarFichaIndividual, exportarFichasPorCampanha } from '../../core/storage/exportImportUtils';
import { dossieParaIA, nomeDoArquivoDoDossie } from '../../core/export/dossie';
import { CampanhaSection, NovaCampanhaForm } from './CampanhaSection';
import { descreverSinal, sinalDaFicha } from '../../core/ficha/sinal';
import { MigracaoWizard } from './MigracaoWizard';
import { Cloud, CloudOff, ChevronLeft, Plus, Download, Eye, PanelLeftClose, PanelLeft, RefreshCw, MoreHorizontal, Bot } from 'lucide-react';
import { WeaponModsButton } from './WeaponModsModal';
import { WatchedFichasSection } from './WatchedFichasSection';
import { Cantos, Fita, Recurso, iniciaisDoNome } from './ui/Pecas';

type FichasViewMode = 'minhas' | 'observadas';

export function FichasManager() {
  const { fichas, fichasBrutas, remover, duplicar, salvar, moverParaCampanha, marcarComoSincronizada, sincronizarFicha, migrar, responderEscolha, desfazerEscolha, definirNivelDaFicha, editarFicha, isCloudMode, loading: fichasLoading } = useCloudFichas();
  const { campanhas, criarCampanha, renomearCampanha, removerCampanha, moverCampanha, priorizarCampanha, loading: campanhasLoading } = useCloudCampanhas();
  const { watchedFichas, isAuthenticated: isLoggedIn } = useWatchedFichas();
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroClasse, setFiltroClasse] = useState<'Todas' | 'Combatente' | 'Especialista' | 'Ocultista' | 'Sobrevivente'>('Todas');
  const [filtroPatente, setFiltroPatente] = useState<'Todas' | 'Recruta' | 'Operador' | 'Agente Especial' | 'Oficial de Operações' | 'Agente de Elite'>('Todas');
  const [ordem, setOrdem] = useState<'atualizado' | 'nome' | 'nex'>('atualizado');
  const [viewMode, setViewMode] = useState<'compact' | 'full'>('full');
  const [expandAll, setExpandAll] = useState<boolean | undefined>(undefined);
  const [modalAberto, setModalAberto] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [fichasViewMode, setFichasViewMode] = useState<FichasViewMode>('minhas');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [migrando, setMigrando] = useState<{ id: string; personagem: Personagem }[]>([]);
  const [acoesAbertas, setAcoesAbertas] = useState<Set<string>>(new Set());

  const alternarAcoes = (id: string) => {
    setAcoesAbertas((prev) => {
      const proximo = new Set(prev);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  };

  const registroAtual = fichas.find((ficha) => ficha.id === selecionada);
  const fichaAtual = registroAtual?.personagem;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedOrdem = window.localStorage.getItem('fichas.ordem') as 'atualizado' | 'nome' | 'nex' | null;
      const storedView = window.localStorage.getItem('fichas.view') as 'compact' | 'full' | null;
      if (storedOrdem) setOrdem(storedOrdem);
      if (storedView) setViewMode(storedView);
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && hydrated) {
      window.localStorage.setItem('fichas.ordem', ordem);
    }
  }, [ordem, hydrated]);

  useEffect(() => {
    if (typeof window !== 'undefined' && hydrated) {
      window.localStorage.setItem('fichas.view', viewMode);
    }
  }, [viewMode, hydrated]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!selecionada) {
      const stored = window.localStorage.getItem('fichas.selecionada');
      setLastSelectedId(stored);
      if (stored && fichas.some((f) => f.id === stored)) {
        setSelecionada(stored);
      }
    }
  }, [fichas, selecionada]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (selecionada) {
      window.localStorage.setItem('fichas.selecionada', selecionada);
      setLastSelectedId(selecionada);
    }
  }, [selecionada]);

  const formatUpdated = (value: unknown) => {
    const timestamp = toMs(value);
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleDateString('pt-BR');
  };

  const toMs = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'string') {
      const t = new Date(value).getTime();
      return Number.isFinite(t) ? t : 0;
    }
    return 0;
  };

  const fichasFiltradas = useMemo(() => {
    const filtradas = fichas.filter((r) => {
      if (!busca.trim()) return true;
      const b = busca.trim().toLowerCase();
      const p = r.personagem;
      return (
        p.nome.toLowerCase().includes(b) ||
        p.classe.toLowerCase().includes(b) ||
        String(p.nex).includes(b) ||
        (p.patente || '').toLowerCase().includes(b)
      );
    });

    const filtradasPorTag = filtradas.filter((r) => {
      const p = r.personagem;
      if (filtroClasse !== 'Todas' && p.classe !== filtroClasse) return false;
      if (filtroPatente !== 'Todas' && p.patente !== filtroPatente) return false;
      return true;
    });

    return [...filtradasPorTag].sort((a, b) => {
      if (ordem === 'nome') return a.personagem.nome.localeCompare(b.personagem.nome);
      if (ordem === 'nex') return (b.personagem.nex ?? 0) - (a.personagem.nex ?? 0);
      return toMs(b.atualizadoEm) - toMs(a.atualizadoEm);
    });
  }, [busca, fichas, ordem, filtroClasse, filtroPatente]);

  const fichasPorCampanha = useMemo(() => {
    const grupos: Map<string | undefined, FichaRegistro[]> = new Map();

    campanhas.forEach((c) => grupos.set(c.id, []));
    grupos.set(undefined, []);

    fichasFiltradas.forEach((f) => {
      const campanhaId = f.campanha;
      if (!grupos.has(campanhaId)) {
        grupos.set(undefined, [...(grupos.get(undefined) || []), f]);
      } else {
        grupos.get(campanhaId)!.push(f);
      }
    });

    return grupos;
  }, [fichasFiltradas, campanhas]);

  const handleUpdate = (updated: any) => {
    if (!registroAtual) return;
    const final = normalizePersonagem(updated, true);
    salvar(final, registroAtual.id);
  };

  const handleShare = async (id: string) => {
    const registro = fichas.find((f) => f.id === id);
    if (!registro) return;
    try {
      await saveAgentToCloud(id, registro.personagem);
      if (!registro.sincronizadaNaNuvem) {
        marcarComoSincronizada(id);
      }
      const link = `${window.location.origin}/ficha/${id}`;
      await navigator.clipboard.writeText(link);
      const mensagem = registro.sincronizadaNaNuvem
        ? 'Link copiado! (A ficha já estava sincronizada e atualizada na nuvem)'
        : 'Ficha sincronizada e link copiado! Alterações futuras serão sincronizadas automaticamente.';
      alert(mensagem);
    } catch (e) {
      console.error(e);
      alert('Não foi possível copiar o link. Verifique permissões do navegador.');
    }
  };

  const handleSincronizar = async (id: string) => {
    setIsSyncing(true);
    try {
      if (sincronizarFicha) {
        await sincronizarFicha(id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportarFicha = (id: string) => {
    const registro = fichas.find((f) => f.id === id);
    if (!registro) return;
    try {
      const data = exportarFichaIndividual(registro);
      const nomeArquivo = `${registro.personagem.nome.replace(/[^a-z0-9]/gi, '_')}-${id.slice(0, 8)}.json`;
      downloadJSON(data, nomeArquivo);
    } catch (error) {
      console.error('Erro ao exportar ficha:', error);
      alert('Erro ao exportar ficha. Verifique o console para mais detalhes.');
    }
  };

  const handleDossie = (id: string) => {
    const registro = fichas.find((f) => f.id === id);
    if (!registro) return;
    downloadMarkdown(dossieParaIA(registro.personagem), nomeDoArquivoDoDossie(registro.personagem));
  };

  const handleRemoverCampanha = (campanhaId: string) => {
    fichas
      .filter((f) => f.campanha === campanhaId)
      .forEach((f) => moverParaCampanha(f.id, undefined));
    removerCampanha(campanhaId);
  };

  const handleExportarCampanha = (fichasDaCampanha: FichaRegistro[], campanhaNome: string, campanhaId?: string) => {
    try {
      const data = exportarFichasPorCampanha(fichasDaCampanha, campanhaNome, campanhaId);
      const timestamp = new Date().toISOString().split('T')[0];
      const nomeArquivo = `campanha-${campanhaNome.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${timestamp}.json`;
      downloadJSON(data, nomeArquivo);
      alert(`Fichas da campanha "${campanhaNome}" exportadas com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar campanha:', error);
      alert('Erro ao exportar campanha. Verifique o console para mais detalhes.');
    }
  };

  useEffect(() => {
  }, [registroAtual?.id, registroAtual?.personagem]);

  const handleSelectFicha = (id: string) => {
    setSelecionada(id);
    setMobileDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setMobileDetailOpen(false);
  };

  const handleConverterCampanha = (doLote: FichaRegistro[]) => {
    setMigrando(
      doLote.map((registro) => {
        const bruto = fichasBrutas.find((f) => f.id === registro.id);
        return { id: registro.id, personagem: bruto?.personagem ?? registro.personagem };
      }),
    );
  };

  const renderFichaCard = (registro: FichaRegistro) => {
    const sinal = registro.fonte === 'v2' && registro.ficha ? sinalDaFicha(registro.ficha) : null;
    const summary = sinal
      ? { total: sinal.pendentes + sinal.erros.length + sinal.avisos.length, errors: sinal.erros.length, warns: sinal.pendentes + sinal.avisos.length }
      : { total: 1, errors: 0, warns: 1 };
    const title = sinal ? descreverSinal(sinal) : `Formato antigo — converter para abrir.${registro.motivoDaFonte ? `\n${registro.motivoDaFonte}` : ''}`;
    const rotuloDoSinal = summary.errors > 0 ? 'ERRO' : sinal ? `${sinal.pendentes} PEND.` : 'CONVERTER';

    if (viewMode === 'compact') {
      return (
        <article
          key={registro.id}
          role="button"
          tabIndex={0}
          onClick={() => handleSelectFicha(registro.id)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleSelectFicha(registro.id);
            }
          }}
          className={`relative w-full overflow-hidden border px-3 py-2 text-left transition touch-active ${selecionada === registro.id
            ? 'border-[var(--mestre-primary,#DC2626)] bg-white/[0.04]'
            : 'border-white/10 bg-white/[0.02] hover:border-white/30'
            }`}
          data-classe={registro.personagem.classe}
          title={title}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{registro.personagem.nome}</p>
              <p className="text-[10px] text-ordem-text-secondary">
                {registro.personagem.classe} · NEX {registro.personagem.nex}% · {registro.personagem.patente}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-ordem-text-muted">
              {summary.total > 0 && (
                <span
                  className={`border px-1.5 py-0.5 font-carimbo text-[9px] uppercase tracking-[0.14em] ${summary.errors > 0
                    ? 'border-ordem-red/60 text-ordem-red'
                    : 'border-ordem-gold/60 text-ordem-gold'
                    }`}
                >
                  {rotuloDoSinal}
                </span>
              )}
              {registro.sincronizadaNaNuvem && <Cloud size={14} className="text-ordem-green" />}
            </div>
          </div>
        </article>
      );
    }

    return (
      <article
        key={registro.id}
        role="button"
        tabIndex={0}
        onClick={() => handleSelectFicha(registro.id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleSelectFicha(registro.id);
          }
        }}
        data-classe={registro.personagem.classe}
        className={`group relative w-full border p-3.5 text-left transition-colors touch-active shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_18px_40px_-30px_rgba(0,0,0,1)] ${selecionada === registro.id
          ? 'border-[var(--mestre-primary)]/50 bg-[var(--mestre-primary)]/[0.05]'
          : 'border-white/10 bg-ordem-black/50 hover:border-white/20 hover:bg-ordem-ooze/25'
          }`}
      >
        {selecionada === registro.id && <Cantos />}
        <span aria-hidden className="mestre-aura pointer-events-none absolute inset-0" />

        <div className="relative flex items-start gap-3">
          <span
            aria-hidden
            className={`grid h-10 w-10 shrink-0 place-items-center border font-carimbo text-xs tracking-widest ${selecionada === registro.id
              ? 'border-[var(--mestre-primary)]/60 bg-[var(--mestre-primary)]/10 text-[var(--mestre-primary)]'
              : 'border-ordem-border bg-ordem-black/60 text-ordem-text-secondary'
              }`}
          >
            {iniciaisDoNome(registro.personagem.nome)}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[15px] font-semibold leading-tight tracking-wide text-white">
              {registro.personagem.nome}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1">
              <Fita variante={selecionada === registro.id ? 'classe' : 'neutra'}>
                {registro.personagem.classe}
              </Fita>
              <Fita variante="neutra">
                {registro.personagem.classe === 'Sobrevivente'
                  ? `Est. ${registro.personagem.estagio ?? 1}`
                  : `NEX ${registro.personagem.nex}%`}
              </Fita>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {summary.total > 0 && (
              <span
                className={`h-1.5 w-1.5 rounded-full ${summary.errors > 0 ? 'bg-ordem-red' : 'bg-ordem-gold'}`}
                title={title}
              />
            )}
            <button
              type="button"
              aria-label={acoesAbertas.has(registro.id) ? 'Esconder ações' : 'Mostrar ações'}
              aria-expanded={acoesAbertas.has(registro.id)}
              onClick={(event) => {
                event.stopPropagation();
                alternarAcoes(registro.id);
              }}
              className={`grid h-7 w-7 place-items-center transition ${acoesAbertas.has(registro.id)
                ? 'bg-ordem-ooze text-white'
                : 'text-ordem-text-muted hover:bg-ordem-ooze/60 hover:text-white'
                }`}
            >
              <MoreHorizontal size={15} />
            </button>
          </div>
        </div>

        <div className="relative mt-3 grid grid-cols-3 gap-3">
          <Recurso tom="pv" compacto atual={registro.personagem.pv.atual} max={registro.personagem.pv.max} />
          <Recurso tom="pe" compacto atual={registro.personagem.pe.atual} max={registro.personagem.pe.max} />
          <Recurso tom="san" compacto atual={registro.personagem.san.atual} max={registro.personagem.san.max} />
        </div>

        {acoesAbertas.has(registro.id) && (
        <div className="relative mt-3 grid grid-cols-2 gap-1.5 border-t border-white/[0.06] pt-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              void handleShare(registro.id);
            }}
            className="flex items-center justify-center gap-1.5 border border-white/10 px-2.5 py-2 font-carimbo text-[10px] uppercase tracking-[0.14em] text-ordem-text-secondary transition hover:border-white/30 hover:text-white touch-target-sm"
          >
            <Cloud size={13} />
            Compartilhar
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleExportarFicha(registro.id);
            }}
            className="flex items-center justify-center gap-1.5 border border-white/10 px-2.5 py-2 font-carimbo text-[10px] uppercase tracking-[0.14em] text-ordem-text-secondary transition hover:border-white/30 hover:text-white touch-target-sm"
            title="Exportar esta ficha"
          >
            <Download size={13} />
            Exportar
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleDossie(registro.id);
            }}
            className="flex items-center justify-center gap-1.5 border border-white/10 px-2.5 py-2 font-carimbo text-[10px] uppercase tracking-[0.14em] text-ordem-text-secondary transition hover:border-white/30 hover:text-white touch-target-sm"
            title="Dossiê em Markdown: só o que o personagem tem, para colar numa IA"
          >
            <Bot size={13} />
            Dossiê IA
          </button>
          <div className="contents" onClick={(e) => e.stopPropagation()}>
            <WeaponModsButton
              personagem={registro.personagem}
              onUpdate={(updated) => salvar(updated, registro.id)}
              className="w-full justify-center border-white/10 px-2.5 py-2 text-[10px] tracking-[0.14em] text-ordem-text-secondary hover:border-white/30 hover:bg-transparent hover:text-white"
            />
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              const bruto = fichasBrutas.find((f) => f.id === registro.id);
              setMigrando([{ id: registro.id, personagem: bruto?.personagem ?? registro.personagem }]);
            }}
            className={`flex items-center justify-center gap-1.5 border border-white/10 px-2.5 py-2 font-carimbo text-[10px] uppercase tracking-[0.14em] text-ordem-text-secondary transition hover:border-white/30 hover:text-white touch-target-sm ${
              registro.fonte === 'v2'
                ? 'text-ordem-green'
                : registro.ficha
                  ? 'border-ordem-gold/60 text-ordem-gold'
                  : 'border-ordem-purple/60 text-ordem-purple'
            }`}
            title={registro.motivoDaFonte ?? 'Comparar com o motor novo e converter (a ficha atual não é alterada)'}
          >
            {registro.fonte === 'v2' ? 'Conversão' : registro.ficha ? 'Reconverter' : 'Converter'}
          </button>
          <Link
            href={`/agente/recriar/${registro.id}`}
            onClick={(event) => event.stopPropagation()}
            className="flex items-center justify-center gap-1.5 border border-white/10 px-2.5 py-2 font-carimbo text-[10px] uppercase tracking-[0.14em] text-ordem-text-secondary transition hover:border-white/30 hover:text-white touch-target-sm"
          >
            Recriar
          </Link>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              duplicar(registro.id);
            }}
            className="flex items-center justify-center gap-1.5 border border-white/10 px-2.5 py-2 font-carimbo text-[10px] uppercase tracking-[0.14em] text-ordem-text-secondary transition hover:border-white/30 hover:text-white touch-target-sm"
          >
            Duplicar
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              if (confirm(`Tem certeza que deseja remover "${registro.personagem.nome}"?`)) {
                remover(registro.id);
                if (selecionada === registro.id) {
                  setSelecionada(null);
                  setMobileDetailOpen(false);
                }
                if (typeof window !== 'undefined') {
                  window.localStorage.removeItem('fichas.selecionada');
                  setLastSelectedId(null);
                }
              }
            }}
            className="col-span-full flex items-center justify-center gap-1.5 border border-white/10 px-2.5 py-2 font-carimbo text-[10px] uppercase tracking-[0.14em] text-ordem-text-secondary transition hover:border-white/30 hover:text-white touch-target-sm border-ordem-red/40 text-ordem-red hover:border-ordem-red hover:text-ordem-red"
          >
            Remover
          </button>
        </div>
        )}
      </article>
    );
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] overflow-hidden">
      <section
        className={`
          lg:border-r border-ordem-border
          p-4 lg:p-6 space-y-4 overflow-hidden flex flex-col
          ${mobileDetailOpen ? 'hidden lg:flex' : 'flex'}
          ${isSidebarCollapsed ? 'lg:hidden' : ''}
        `}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="font-carimbo text-[10px] uppercase tracking-[0.35em] text-ordem-text-muted">Arquivo</div>
              {isCloudMode ? (
                <span className="flex items-center gap-1 text-[10px] text-ordem-green" title="Sincronizado na nuvem">
                  <Cloud size={12} />
                  <span className="hidden sm:inline">Nuvem</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-ordem-text-muted" title="Dados locais">
                  <CloudOff size={12} />
                  <span className="hidden sm:inline">Local</span>
                </span>
              )}
            </div>
            <h2 className="truncate font-display text-2xl uppercase leading-none tracking-[0.06em] text-white lg:text-3xl">Fichas</h2>
            <div className="text-xs font-mono text-ordem-text-muted mt-1">
              {fichasLoading ? 'Carregando...' : ''}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {lastSelectedId && fichas.some((f) => f.id === lastSelectedId) && (
              <button
                onClick={() => {
                  setSelecionada(lastSelectedId);
                  setMobileDetailOpen(true);
                }}
                className="border border-white/10 px-3 py-2 font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-secondary transition hover:border-white/30 hover:text-white touch-target-sm"
                aria-label="Abrir última ficha selecionada"
              >
                ÚLTIMA
              </button>
            )}
            <button
              onClick={() => setModalAberto(true)}
              className="border border-white/10 px-3 py-2 font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-secondary transition hover:border-white/30 hover:text-white touch-target-sm"
              aria-label="Exportar ou Importar fichas"
            >
              <span className="hidden sm:inline">EXP/IMP</span>
              <Download size={16} className="sm:hidden" />
            </button>
            <Link
              href="/agente/novo"
              className="flex items-center gap-1.5 border border-ordem-red bg-ordem-red/15 px-3 py-2 font-carimbo text-[10px] uppercase tracking-[0.16em] text-white transition hover:bg-ordem-red/30 touch-target-sm"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">NOVA</span>
            </Link>
          </div>
        </div>

        {isLoggedIn && (
          <div className="flex border border-white/10 p-0.5">
            <button
              onClick={() => setFichasViewMode('minhas')}
              className={`flex-1 px-3 py-1.5 font-carimbo text-[10px] uppercase tracking-[0.16em] transition-colors ${fichasViewMode === 'minhas'
                ? 'bg-ordem-red text-black'
                : 'text-ordem-text-muted hover:text-white'
                }`}
            >
              MINHAS FICHAS
            </button>
            <button
              onClick={() => setFichasViewMode('observadas')}
              className={`flex flex-1 items-center justify-center gap-1 px-3 py-1.5 font-carimbo text-[10px] uppercase tracking-[0.16em] transition-colors ${fichasViewMode === 'observadas'
                ? 'bg-ordem-gold text-black'
                : 'text-ordem-text-muted hover:text-white'
                }`}
            >
              <Eye size={12} />
              OBSERVADAS
              {watchedFichas.length > 0 && (
                <span className="ml-1 bg-black/20 px-1.5 py-0.5 font-mono text-[9px]">
                  {watchedFichas.length}
                </span>
              )}
            </button>
          </div>
        )}

        {fichasViewMode === 'observadas' && isLoggedIn ? (
          <div className="flex-1 overflow-y-auto -mx-4 px-4 lg:mx-0 lg:px-0">
            <WatchedFichasSection />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar fichas..."
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setBusca('');
                }}
                className="w-full border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-sm text-white placeholder:text-ordem-text-muted focus:border-ordem-red/60 focus:outline-none touch-target"
                aria-label="Buscar por nome, classe, NEX ou patente"
              />
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={filtroClasse}
                  onChange={(e) => setFiltroClasse(e.target.value as any)}
                  className="border border-white/10 bg-black/30 px-2.5 py-2 font-carimbo text-[10px] uppercase tracking-[0.12em] text-ordem-text-secondary focus:border-ordem-red/60 focus:outline-none"
                  aria-label="Filtrar por classe"
                >
                  <option value="Todas">Todas as classes</option>
                  <option value="Combatente">Combatente</option>
                  <option value="Especialista">Especialista</option>
                  <option value="Ocultista">Ocultista</option>
                  <option value="Sobrevivente">Sobrevivente</option>
                </select>
                <select
                  value={filtroPatente}
                  onChange={(e) => setFiltroPatente(e.target.value as any)}
                  className="border border-white/10 bg-black/30 px-2.5 py-2 font-carimbo text-[10px] uppercase tracking-[0.12em] text-ordem-text-secondary focus:border-ordem-red/60 focus:outline-none"
                  aria-label="Filtrar por patente"
                >
                  <option value="Todas">Todas as patentes</option>
                  <option value="Recruta">Recruta</option>
                  <option value="Operador">Operador</option>
                  <option value="Agente Especial">Agente Especial</option>
                  <option value="Oficial de Operações">Oficial de Operações</option>
                  <option value="Agente de Elite">Agente de Elite</option>
                </select>
                {(filtroClasse !== 'Todas' || filtroPatente !== 'Todas') && (
                  <button
                    type="button"
                    onClick={() => {
                      setFiltroClasse('Todas');
                      setFiltroPatente('Todas');
                    }}
                    className="font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-muted transition hover:text-white"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="shrink-0 font-carimbo text-[10px] uppercase tracking-[0.18em] text-ordem-text-muted">Ordenar por</span>
                <select
                  value={ordem}
                  onChange={(e) => setOrdem(e.target.value as any)}
                  className="border border-white/10 bg-black/30 px-2.5 py-2 font-carimbo text-[10px] uppercase tracking-[0.12em] text-ordem-text-secondary focus:border-ordem-red/60 focus:outline-none touch-target-sm"
                  aria-label="Ordenar fichas"
                >
                  <option value="atualizado">Mais recente</option>
                  <option value="nome">Nome (A→Z)</option>
                  <option value="nex">NEX (↓)</option>
                </select>
                <div className="ml-auto flex border border-white/10 p-0.5" role="group" aria-label="Densidade da lista">
                  {([['compact', 'Compacto'], ['full', 'Detalhado']] as const).map(([modo, rotulo]) => (
                    <button
                      key={modo}
                      type="button"
                      aria-pressed={viewMode === modo}
                      onClick={() => setViewMode(modo)}
                      className={`px-2.5 py-1 font-carimbo text-[10px] uppercase tracking-[0.14em] transition ${viewMode === modo
                        ? 'bg-white/10 text-white'
                        : 'text-ordem-text-muted hover:text-white'
                        }`}
                    >
                      {rotulo}
                    </button>
                  ))}
                </div>
                {busca.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => setBusca('')}
                    className="font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-muted transition hover:text-white"
                  >
                    Limpar busca
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] pt-2">
                <div className="font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-muted">
                  {fichasFiltradas.length === fichas.length
                    ? `${fichas.length} fichas`
                    : `${fichasFiltradas.length} de ${fichas.length}`}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setExpandAll(true)}
                    className="font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-muted transition hover:text-white"
                  >
                    Expandir tudo
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandAll(false)}
                    className="font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-muted transition hover:text-white"
                  >
                    Colapsar tudo
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto touch-scroll custom-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 lg:pr-2 space-y-3">
              {campanhas.map((campanha, indiceCampanha) => (
                <CampanhaSection
                  key={campanha.id}
                  campanha={campanha}
                  fichas={fichasPorCampanha.get(campanha.id) || []}
                  selecionada={selecionada}
                  onSelecionar={handleSelectFicha}
                  onMover={moverParaCampanha}
                  campanhasDisponiveis={campanhas}
                  renderFichaCard={renderFichaCard}
                  onRenomear={renomearCampanha}
                  onRemoverCampanha={handleRemoverCampanha}
                  onExportarCampanha={handleExportarCampanha}
                  onConverterCampanha={handleConverterCampanha}
                  onMoverCampanha={moverCampanha}
                  onPriorizarCampanha={priorizarCampanha}
                  podeSubir={indiceCampanha > 0}
                  podeDescer={indiceCampanha < campanhas.length - 1}
                  forceExpanded={expandAll}
                  autoExpand={busca.trim().length > 0}
                />
              ))}

              <CampanhaSection
                campanha={null}
                fichas={fichasPorCampanha.get(undefined) || []}
                selecionada={selecionada}
                onSelecionar={handleSelectFicha}
                onMover={moverParaCampanha}
                campanhasDisponiveis={campanhas}
                renderFichaCard={renderFichaCard}
                onExportarCampanha={handleExportarCampanha}
                  onConverterCampanha={handleConverterCampanha}
                forceExpanded={expandAll}
                autoExpand={busca.trim().length > 0}
              />

              <NovaCampanhaForm onCriar={criarCampanha} />

              {fichas.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-ordem-white/60 mb-4">
                    Nenhuma ficha salva ainda.
                  </p>
                  <Link
                    href="/agente/novo"
                    className="inline-flex items-center gap-2 border border-ordem-red bg-ordem-red/15 px-4 py-2.5 font-carimbo text-[11px] uppercase tracking-[0.16em] text-white transition hover:bg-ordem-red/30 touch-target"
                  >
                    <Plus size={14} />
                    Criar o primeiro agente
                  </Link>
                </div>
              )}
              {fichas.length > 0 && fichasFiltradas.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-ordem-white/60 mb-4">
                    Nenhuma ficha corresponde aos filtros atuais.
                  </p>
                  <button
                    type="button"
                    onClick={() => setBusca('')}
                    className="inline-flex items-center gap-2 border border-white/10 px-4 py-2.5 font-carimbo text-[11px] uppercase tracking-[0.16em] text-ordem-text-secondary transition hover:border-white/30 hover:text-white"
                  >
                    Limpar busca
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      <section
        className={`
          lg:col-span-2 bg-ordem-black-deep overflow-hidden flex flex-col
          ${isSidebarCollapsed ? 'lg:col-span-3' : ''}
          ${mobileDetailOpen ? 'absolute inset-0 z-50 lg:relative lg:z-auto' : 'hidden lg:flex'}
        `}
      >
        {fichaAtual ? (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="lg:hidden flex items-center gap-3 p-4 border-b border-ordem-border bg-ordem-black safe-top shrink-0">
              <button
                onClick={handleCloseDetail}
                className="p-2 -ml-2 rounded-lg hover:bg-ordem-ooze/50 active:bg-ordem-ooze touch-target"
                aria-label="Voltar para lista"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-white truncate">{fichaAtual.nome}</h2>
                <p className="text-xs text-ordem-text-secondary">{fichaAtual.classe} · NEX {fichaAtual.nex}%</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-between p-4 border-b border-ordem-border bg-ordem-black shrink-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="-ml-2 flex items-center justify-center border border-white/10 p-2 text-ordem-text-muted transition-colors hover:border-white/30 hover:text-white"
                  title={isSidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
                >
                  {isSidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
                </button>
                <div className="min-w-0">
                  <p className="truncate font-carimbo text-[11px] uppercase tracking-[0.22em] text-ordem-text-muted">
                    {fichaAtual.nome}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isCloudMode && (
                  <button
                    onClick={() => handleSincronizar(selecionada!)}
                    disabled={isSyncing}
                    className={`flex items-center gap-2 border px-4 py-2 font-carimbo text-[10px] uppercase tracking-[0.16em] transition-all ${registroAtual?.sincronizadaNaNuvem
                      ? 'border-ordem-green/30 text-ordem-green hover:bg-ordem-green/10'
                      : 'border-ordem-gold/50 text-ordem-gold bg-ordem-gold/10 hover:bg-ordem-gold/20'
                      } ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Forçar atualizamento de ficha e organização na nuvem"
                  >
                    <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                    {isSyncing ? 'SINCRONIZANDO...' : 'ATUALIZAR NA NUVEM'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto touch-scroll p-4 lg:p-6 safe-bottom">
              <div className="overflow-hidden border border-white/10">
                {registroAtual?.fonte === 'v2' && registroAtual.ficha ? (
                  <FichaMestre
                    ficha={registroAtual.ficha}
                    personagem={fichaAtual}
                    onSessao={handleUpdate}
                    onDefinirNivel={(nivel) => definirNivelDaFicha(registroAtual.id, nivel)}
                    onResponder={(escolhaId, valor) => responderEscolha(registroAtual.id, escolhaId, valor)}
                    onDesfazer={(escolhaId) => desfazerEscolha(registroAtual.id, escolhaId)}
                    onEditar={(transformar) => editarFicha(registroAtual.id, transformar)}
                  />
                ) : registroAtual ? (
                  <FichaAntiga
                    personagem={fichaAtual}
                    motivo={registroAtual.ficha ? registroAtual.motivoDaFonte : undefined}
                    onConverter={() => {
                      const bruto = fichasBrutas.find((f) => f.id === registroAtual.id);
                      setMigrando([{ id: registroAtual.id, personagem: bruto?.personagem ?? registroAtual.personagem }]);
                    }}
                  />
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="relative border border-white/10 px-10 py-8">
              <Cantos />
              <p className="font-carimbo text-[10px] uppercase tracking-[0.3em] text-ordem-text-muted">Arquivo</p>
              <p className="mt-2 font-display text-2xl uppercase tracking-[0.06em] text-white">Nenhuma ficha aberta</p>
              <p className="mt-2 text-sm text-ordem-text-muted">Escolha uma ficha na lista ao lado.</p>
            </div>
          </div>
        )}
      </section>

      <ImportExportModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onImportComplete={() => {
          window.location.reload();
        }}
      />

      <MigracaoWizard
        isOpen={migrando.length > 0}
        fichas={migrando}
        onClose={() => setMigrando([])}
        onConverter={(id, ficha, opcoes) => migrar(id, ficha, opcoes)}
      />
    </div>
  );
}
