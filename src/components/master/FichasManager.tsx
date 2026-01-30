"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useCloudFichas, useCloudCampanhas, type FichaRegistro } from '../../core/storage';
import { AgentDetailView } from './AgentDetailView';
import { normalizePersonagem } from '../../core/personagemUtils';
import { auditPersonagem, summarizeIssues } from '../../core/validation/auditPersonagem';
import { saveAgentToCloud } from '../../core/firebase/firestore';
import { ImportExportModal } from './ImportExportModal';
import { downloadJSON, exportarFichaIndividual, exportarFichasPorCampanha } from '../../core/storage/exportImportUtils';
import { CampanhaSection, NovaCampanhaForm } from './CampanhaSection';
import { recalcularRecursosPersonagem } from '../../logic/progression';
import { Cloud, CloudOff, X, ChevronLeft, Menu, Plus, Download, Settings } from 'lucide-react';
import { WeaponModsButton } from './WeaponModsModal';

export function FichasManager() {
  const { fichas, remover, duplicar, salvar, moverParaCampanha, marcarComoSincronizada, isCloudMode, loading: fichasLoading } = useCloudFichas();
  const { campanhas, criarCampanha, renomearCampanha, removerCampanha, loading: campanhasLoading } = useCloudCampanhas();
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroClasse, setFiltroClasse] = useState<'Todas' | 'Combatente' | 'Especialista' | 'Ocultista' | 'Sobrevivente'>('Todas');
  const [filtroPatente, setFiltroPatente] = useState<'Todas' | 'Recruta' | 'Operador' | 'Agente Especial' | 'Oficial de Operações' | 'Agente de Elite'>('Todas');
  const [ordem, setOrdem] = useState<'atualizado' | 'nome' | 'nex'>('atualizado');
  const [viewMode, setViewMode] = useState<'compact' | 'full'>('full');
  const [expandAll, setExpandAll] = useState<boolean | undefined>(undefined);
  const [modalAberto, setModalAberto] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

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

  const handleRecalcular = (id: string) => {
    const registro = fichas.find((f) => f.id === id);
    if (!registro) return;
    try {
      const recalculado = recalcularRecursosPersonagem(registro.personagem);
      salvar(recalculado, id);
      alert(`Recursos de "${registro.personagem.nome}" recalculados com sucesso!`);
    } catch (error) {
      console.error('Erro ao recalcular:', error);
      alert('Erro ao recalcular recursos.');
    }
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

  const handleSelectFicha = (id: string) => {
    setSelecionada(id);
    setMobileDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setMobileDetailOpen(false);
  };

  const renderFichaCard = (registro: FichaRegistro) => {
    const issues = auditPersonagem(registro.personagem);
    const summary = summarizeIssues(issues);
    const title =
      summary.total === 0
        ? ''
        : `Problemas detectados (${summary.errors} erro(s), ${summary.warns} aviso(s)):\n${issues
          .map((i) => `- [${i.severity.toUpperCase()}] ${i.message}`)
          .join('\n')}`;

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
          className={`w-full text-left border rounded-lg px-3 py-2 transition relative overflow-hidden touch-active ${
            selecionada === registro.id
              ? 'border-ordem-red bg-ordem-red/10'
              : 'border-ordem-border bg-ordem-black/40 hover:border-ordem-text-muted active:bg-ordem-ooze/50'
          }`}
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
                  className={`px-2 py-0.5 rounded border font-mono tracking-widest ${
                    summary.errors > 0
                      ? 'border-ordem-red text-ordem-red bg-ordem-red/10'
                      : 'border-ordem-gold text-ordem-gold bg-ordem-gold/10'
                  }`}
                >
                  {summary.errors > 0 ? 'ERRO' : 'AVISO'}
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
        className={`w-full text-left border rounded-xl p-4 transition relative overflow-hidden touch-active ${selecionada === registro.id
          ? 'border-ordem-red bg-ordem-red/10'
          : 'border-ordem-border bg-ordem-black/40 hover:border-ordem-text-muted active:bg-ordem-ooze/50'
          }`}
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_0%,rgba(220,38,38,0.08),transparent_55%)]" />

        {}
        <div className="flex justify-between items-start text-xs text-ordem-white/60 relative mb-2 gap-2">
          <div className="flex flex-col min-w-0">
            <span className="font-medium">{registro.personagem.classe}</span>
            <span className="text-[10px] text-ordem-text-muted">
              Atualizado: {formatUpdated(registro.atualizadoEm)}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {registro.sincronizadaNaNuvem && (
              <span
                className="text-ordem-green"
                title="Ficha sincronizada na nuvem"
              >
                <Cloud size={14} />
              </span>
            )}
            {summary.total > 0 && (
              <span
                className={`px-2 py-0.5 rounded border text-[10px] font-mono tracking-widest ${summary.errors > 0
                  ? 'border-ordem-red text-ordem-red bg-ordem-red/10'
                  : 'border-ordem-gold text-ordem-gold bg-ordem-gold/10'
                  }`}
                title={title}
              >
                {summary.errors > 0 ? 'ERRO' : 'AVISO'}
              </span>
            )}
          </div>
        </div>

        {}
        <p className="text-lg font-semibold text-white relative truncate">{registro.personagem.nome}</p>

        {}
        <p className="text-sm text-ordem-text-secondary relative mt-1">
          NEX {registro.personagem.nex}% · {registro.personagem.patente}
        </p>

        {}
        <div className="mt-3 flex gap-3 text-xs text-ordem-text-secondary relative">
          <span className="bg-ordem-ooze/50 px-2 py-1 rounded">
            PV {registro.personagem.pv.atual}/{registro.personagem.pv.max}
          </span>
          <span className="bg-ordem-ooze/50 px-2 py-1 rounded">
            PE {registro.personagem.pe.atual}/{registro.personagem.pe.max}
          </span>
          <span className="bg-ordem-ooze/50 px-2 py-1 rounded">
            SAN {registro.personagem.san.atual}/{registro.personagem.san.max}
          </span>
        </div>

        {}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 relative">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              void handleShare(registro.id);
            }}
            className="text-xs px-3 py-2.5 border border-ordem-green text-ordem-green hover:bg-ordem-green/10 active:bg-ordem-green/20 rounded-lg touch-target-sm flex items-center justify-center gap-1"
          >
            <Cloud size={14} />
            <span className="hidden sm:inline">COMPARTILHAR</span>
            <span className="sm:hidden">SHARE</span>
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleExportarFicha(registro.id);
            }}
            className="text-xs px-3 py-2.5 border border-ordem-gold text-ordem-gold hover:bg-ordem-gold/10 active:bg-ordem-gold/20 rounded-lg touch-target-sm flex items-center justify-center gap-1"
            title="Exportar esta ficha"
          >
            <Download size={14} />
            <span>EXPORT</span>
          </button>
          <div onClick={(e) => e.stopPropagation()}>
            <WeaponModsButton
              personagem={registro.personagem}
              onUpdate={(updated) => salvar(updated, registro.id)}
              className="text-xs px-3 py-2.5"
            />
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleRecalcular(registro.id);
            }}
            className="text-xs px-3 py-2.5 border border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 active:bg-cyan-500/20 rounded-lg touch-target-sm flex items-center justify-center"
            title="Recalcular PV, PE, SAN, Defesa"
          >
            ♻ RECALC
          </button>
          <Link
            href={`/agente/recriar/${registro.id}`}
            onClick={(event) => event.stopPropagation()}
            className="text-xs px-3 py-2.5 border border-ordem-border-light text-ordem-white-muted hover:border-ordem-text-secondary hover:text-white active:bg-ordem-ooze/50 rounded-lg touch-target-sm flex items-center justify-center"
          >
            RECRIAR
          </Link>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              duplicar(registro.id);
            }}
            className="text-xs px-3 py-2.5 border border-ordem-border-light hover:border-ordem-text-secondary active:bg-ordem-ooze/50 rounded-lg touch-target-sm flex items-center justify-center"
          >
            DUPLICAR
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
            className="text-xs px-3 py-2.5 border border-ordem-red text-ordem-red hover:bg-ordem-red/10 active:bg-ordem-red/20 rounded-lg touch-target-sm flex items-center justify-center"
          >
            REMOVER
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] overflow-hidden">
      {}
      <section
        className={`
          flex-1 lg:flex-none lg:border-r border-ordem-border
          p-4 lg:p-6 space-y-4 overflow-hidden flex flex-col
          ${mobileDetailOpen ? 'hidden lg:flex' : 'flex'}
        `}
      >
        {}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-xs font-mono tracking-[0.35em] text-ordem-text-muted uppercase">Arquivo</div>
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
            <h2 className="text-xl lg:text-2xl font-serif text-white truncate">Fichas</h2>
            <div className="text-xs font-mono text-ordem-text-muted mt-1">
              {fichasLoading ? 'Carregando...' : `${fichasFiltradas.length} de ${fichas.length} ficha(s)`}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {lastSelectedId && fichas.some((f) => f.id === lastSelectedId) && (
              <button
                onClick={() => {
                  setSelecionada(lastSelectedId);
                  setMobileDetailOpen(true);
                }}
                className="px-3 py-2.5 text-[10px] font-mono tracking-[0.15em] border border-ordem-border text-ordem-text-muted hover:border-ordem-text-secondary hover:text-white rounded-lg transition touch-target-sm"
                aria-label="Abrir última ficha selecionada"
              >
                ÚLTIMA
              </button>
            )}
            <button
              onClick={() => setModalAberto(true)}
              className="px-3 py-2.5 text-[10px] font-mono tracking-[0.15em] border border-ordem-gold text-ordem-gold hover:bg-ordem-gold/10 active:bg-ordem-gold/20 rounded-lg transition touch-target-sm"
              aria-label="Exportar ou Importar fichas"
            >
              <span className="hidden sm:inline">EXP/IMP</span>
              <Download size={16} className="sm:hidden" />
            </button>
            <Link
              href="/agente/novo"
              className="px-3 py-2.5 text-[10px] font-mono tracking-[0.15em] border border-ordem-green text-ordem-green hover:bg-ordem-green/10 active:bg-ordem-green/20 rounded-lg transition touch-target-sm flex items-center gap-1"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">NOVA</span>
            </Link>
          </div>
        </div>

        {}
        <div className="space-y-2">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar fichas..."
            onKeyDown={(e) => {
              if (e.key === 'Escape') setBusca('');
            }}
            className="w-full bg-ordem-black/40 border border-ordem-border text-white px-4 py-3 rounded-lg focus:border-ordem-red focus:outline-none font-mono text-sm touch-target"
            aria-label="Buscar por nome, classe, NEX ou patente"
          />
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filtroClasse}
              onChange={(e) => setFiltroClasse(e.target.value as any)}
              className="bg-ordem-black/40 border border-ordem-border text-white px-3 py-2 rounded-lg focus:border-ordem-red focus:outline-none font-mono text-[10px]"
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
              className="bg-ordem-black/40 border border-ordem-border text-white px-3 py-2 rounded-lg focus:border-ordem-red focus:outline-none font-mono text-[10px]"
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
                className="px-3 py-2 rounded-lg border border-ordem-border text-ordem-text-muted text-[10px] font-mono uppercase tracking-widest"
              >
                Limpar filtros
              </button>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-ordem-text-muted uppercase tracking-widest">
            <span>Total: {fichas.length} ficha(s)</span>
            <span>Campanhas: {campanhas.length}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-ordem-text-muted uppercase tracking-widest">Ordenar</span>
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value as any)}
              className="bg-ordem-black/40 border border-ordem-border text-white px-3 py-2 rounded-lg focus:border-ordem-red focus:outline-none font-mono text-xs touch-target-sm"
              aria-label="Ordenar fichas"
            >
              <option value="atualizado">Mais recente</option>
              <option value="nome">Nome (A→Z)</option>
              <option value="nex">NEX (↓)</option>
            </select>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('compact')}
                className={`px-2 py-2 rounded-lg border text-[10px] font-mono uppercase tracking-widest ${
                  viewMode === 'compact'
                    ? 'border-ordem-green text-ordem-green bg-ordem-green/10'
                    : 'border-ordem-border text-ordem-text-muted'
                }`}
              >
                Compacto
              </button>
              <button
                type="button"
                onClick={() => setViewMode('full')}
                className={`px-2 py-2 rounded-lg border text-[10px] font-mono uppercase tracking-widest ${
                  viewMode === 'full'
                    ? 'border-ordem-green text-ordem-green bg-ordem-green/10'
                    : 'border-ordem-border text-ordem-text-muted'
                }`}
              >
                Detalhado
              </button>
            </div>
            {busca.trim().length > 0 && (
              <button
                type="button"
                onClick={() => setBusca('')}
                className="px-3 py-2 rounded-lg border border-ordem-border text-ordem-text-muted text-[10px] font-mono uppercase tracking-widest"
              >
                Limpar busca
              </button>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] font-mono text-ordem-text-muted uppercase tracking-widest">
              {fichasFiltradas.length} resultado(s)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExpandAll(true)}
                className="px-3 py-2 rounded-lg border border-ordem-border text-ordem-text-muted text-[10px] font-mono uppercase tracking-widest"
              >
                Expandir tudo
              </button>
              <button
                type="button"
                onClick={() => setExpandAll(false)}
                className="px-3 py-2 rounded-lg border border-ordem-border text-ordem-text-muted text-[10px] font-mono uppercase tracking-widest"
              >
                Colapsar tudo
              </button>
            </div>
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto touch-scroll custom-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 lg:pr-2 space-y-3">
          {}
          {campanhas.map((campanha) => (
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
              forceExpanded={expandAll}
              autoExpand={busca.trim().length > 0}
            />
          ))}

          {}
          <CampanhaSection
            campanha={null}
            fichas={fichasPorCampanha.get(undefined) || []}
            selecionada={selecionada}
            onSelecionar={handleSelectFicha}
            onMover={moverParaCampanha}
            campanhasDisponiveis={campanhas}
            renderFichaCard={renderFichaCard}
            onExportarCampanha={handleExportarCampanha}
            forceExpanded={expandAll}
            autoExpand={busca.trim().length > 0}
          />

          {}
          <NovaCampanhaForm onCriar={criarCampanha} />

          {fichas.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-ordem-white/60 mb-4">
                Nenhuma ficha salva ainda.
              </p>
              <Link
                href="/agente/novo"
                className="inline-flex items-center gap-2 px-4 py-3 bg-ordem-green/10 border border-ordem-green text-ordem-green rounded-lg touch-target"
              >
                <Plus size={18} />
                Criar primeiro agente
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
                className="inline-flex items-center gap-2 px-4 py-3 border border-ordem-border text-ordem-text-muted rounded-lg"
              >
                Limpar busca
              </button>
            </div>
          )}
        </div>
      </section>

      {}
      <section
        className={`
          lg:col-span-2 bg-ordem-black-deep overflow-hidden
          ${mobileDetailOpen ? 'flex flex-col absolute inset-0 z-50 lg:relative lg:z-auto' : 'hidden lg:block'}
        `}
      >
        {fichaAtual ? (
          <div className="h-full flex flex-col">
            {}
            <div className="lg:hidden flex items-center gap-3 p-4 border-b border-ordem-border bg-ordem-black safe-top">
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

            {}
            <div className="flex-1 overflow-y-auto touch-scroll p-4 lg:p-6 safe-bottom">
              <div className="rounded-xl border border-ordem-border overflow-hidden">
                <AgentDetailView agent={fichaAtual} onUpdate={handleUpdate} readOnly={false} />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-ordem-white/60 p-6">
            <div className="w-16 h-16 rounded-full bg-ordem-ooze/50 flex items-center justify-center mb-4">
              <Menu size={24} className="text-ordem-text-muted" />
            </div>
            <p className="text-lg mb-2">Nenhuma ficha selecionada</p>
            <p className="text-sm text-ordem-text-muted">Selecione uma ficha na lista para visualizar ou editar.</p>
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
    </div>
  );
}
