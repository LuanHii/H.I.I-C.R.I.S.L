"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useStoredFichas, useCampanhas, type FichaRegistro } from '../../core/storage/useStoredFichas';
import { AgentDetailView } from './AgentDetailView';
import { normalizePersonagem } from '../../core/personagemUtils';
import { auditPersonagem, summarizeIssues } from '../../core/validation/auditPersonagem';
import { saveAgentToCloud } from '../../core/firebase/firestore';
import { ImportExportModal } from './ImportExportModal';
import { downloadJSON, exportarFichaIndividual, exportarFichasPorCampanha } from '../../core/storage/exportImportUtils';
import { CampanhaSection, NovaCampanhaForm } from './CampanhaSection';
import { recalcularRecursosPersonagem } from '../../logic/progression';
import { Cloud } from 'lucide-react';

export function FichasManager() {
  const { fichas, remover, duplicar, salvar, moverParaCampanha, marcarComoSincronizada } = useStoredFichas();
  const { campanhas, criarCampanha, renomearCampanha, removerCampanha } = useCampanhas();
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [ordem, setOrdem] = useState<'atualizado' | 'nome' | 'nex'>('atualizado');
  const [modalAberto, setModalAberto] = useState(false);

  const registroAtual = fichas.find((ficha) => ficha.id === selecionada);
  const fichaAtual = registroAtual?.personagem;

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

    return [...filtradas].sort((a, b) => {
      if (ordem === 'nome') return a.personagem.nome.localeCompare(b.personagem.nome);
      if (ordem === 'nex') return (b.personagem.nex ?? 0) - (a.personagem.nex ?? 0);
      return toMs(b.atualizadoEm) - toMs(a.atualizadoEm);
    });
  }, [busca, fichas, ordem]);

  // Agrupar fichas por campanha
  const fichasPorCampanha = useMemo(() => {
    const grupos: Map<string | undefined, FichaRegistro[]> = new Map();

    // Inicializa grupos para todas as campanhas
    campanhas.forEach((c) => grupos.set(c.id, []));
    grupos.set(undefined, []); // Fichas sem campanha

    // Distribui fichas
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
    // Move todas as fichas da campanha para "Fichas Soltas"
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

  const renderFichaCard = (registro: FichaRegistro) => {
    const issues = auditPersonagem(registro.personagem);
    const summary = summarizeIssues(issues);
    const title =
      summary.total === 0
        ? ''
        : `Problemas detectados (${summary.errors} erro(s), ${summary.warns} aviso(s)):\n${issues
          .map((i) => `- [${i.severity.toUpperCase()}] ${i.message}`)
          .join('\n')}`;

    return (
      <article
        key={registro.id}
        role="button"
        tabIndex={0}
        onClick={() => setSelecionada(registro.id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setSelecionada(registro.id);
          }
        }}
        className={`w-full text-left border rounded-xl p-3 transition relative overflow-hidden ${selecionada === registro.id
          ? 'border-ordem-red bg-ordem-red/10'
          : 'border-zinc-800 bg-black/40 hover:border-zinc-600'
          }`}
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_0%,rgba(220,38,38,0.08),transparent_55%)]" />
        <div className="flex justify-between text-xs text-ordem-white/60 relative">
          <span>{registro.personagem.classe}</span>
          <div className="flex items-center gap-2">
            {registro.sincronizadaNaNuvem && (
              <span
                className="text-ordem-green"
                title="Ficha sincronizada na nuvem - alterações são atualizadas automaticamente"
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
                {summary.errors > 0 ? 'ERRO' : 'AVISO'} {summary.total}
              </span>
            )}
            <span>{new Date(registro.atualizadoEm as any).toLocaleDateString()}</span>
          </div>
        </div>
        <p className="text-lg font-semibold text-white relative">{registro.personagem.nome}</p>
        <p className="text-xs text-zinc-400 relative">
          NEX {registro.personagem.nex}% · Patente {registro.personagem.patente}
        </p>
        <div className="mt-2 flex gap-2 text-[10px] text-zinc-400 relative">
          <span>
            PV {registro.personagem.pv.atual}/{registro.personagem.pv.max}
          </span>
          <span>
            PE {registro.personagem.pe.atual}/{registro.personagem.pe.max}
          </span>
          <span>
            SAN {registro.personagem.san.atual}/{registro.personagem.san.max}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 relative">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              void handleShare(registro.id);
            }}
            className="text-xs px-2 py-1 border border-ordem-green text-ordem-green hover:bg-ordem-green/10 rounded"
          >
            COMPARTILHAR
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleExportarFicha(registro.id);
            }}
            className="text-xs px-2 py-1 border border-ordem-gold text-ordem-gold hover:bg-ordem-gold/10 rounded"
            title="Exportar esta ficha"
          >
            EXPORTAR
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleRecalcular(registro.id);
            }}
            className="text-xs px-2 py-1 border border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 rounded"
            title="Recalcular PV, PE, SAN, Defesa (aplica bônus de origem e trilha)"
          >
            ♻ RECALCULAR
          </button>
          <Link
            href={`/agente/recriar/${registro.id}`}
            onClick={(event) => event.stopPropagation()}
            className="text-xs px-2 py-1 border border-zinc-700 text-zinc-300 hover:border-zinc-400 hover:text-white rounded"
          >
            RECRIAR
          </Link>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              duplicar(registro.id);
            }}
            className="text-xs px-2 py-1 border border-zinc-700 hover:border-zinc-400 rounded"
          >
            DUPLICAR
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              remover(registro.id);
              if (selecionada === registro.id) setSelecionada(null);
            }}
            className="text-xs px-2 py-1 border border-ordem-red text-ordem-red hover:bg-ordem-red/10 rounded"
          >
            REMOVER
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-64px)]">
      <section className="border-r border-zinc-800 p-6 space-y-4 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-mono tracking-[0.35em] text-zinc-500 uppercase">Arquivo</div>
            <h2 className="text-2xl font-serif text-white truncate">Fichas</h2>
            <div className="text-xs font-mono text-zinc-500 mt-1">
              {fichasFiltradas.length} de {fichas.length} ficha(s)
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setModalAberto(true)}
              className="px-3 py-2 text-[10px] font-mono tracking-[0.25em] border border-ordem-gold text-ordem-gold hover:bg-ordem-gold/10 rounded-lg transition"
            >
              EXP/IMP
            </button>
            <Link
              href="/agente/novo"
              className="px-3 py-2 text-[10px] font-mono tracking-[0.25em] border border-ordem-green text-ordem-green hover:bg-ordem-green/10 rounded-lg transition"
            >
              NOVA
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, classe, NEX, patente..."
            className="w-full bg-black/40 border border-zinc-800 text-white px-3 py-2 rounded-lg focus:border-ordem-red focus:outline-none font-mono text-sm"
          />
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Ordenar</div>
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value as any)}
              className="bg-black/40 border border-zinc-800 text-white px-2 py-2 rounded-lg focus:border-ordem-red focus:outline-none font-mono text-xs"
            >
              <option value="atualizado">Mais recente</option>
              <option value="nome">Nome (A→Z)</option>
              <option value="nex">NEX (↓)</option>
            </select>
          </div>
        </div>

        {/* Campanhas */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
          {/* Campanhas existentes */}
          {campanhas.map((campanha) => (
            <CampanhaSection
              key={campanha.id}
              campanha={campanha}
              fichas={fichasPorCampanha.get(campanha.id) || []}
              selecionada={selecionada}
              onSelecionar={setSelecionada}
              onMover={moverParaCampanha}
              campanhasDisponiveis={campanhas}
              renderFichaCard={renderFichaCard}
              onRenomear={renomearCampanha}
              onRemoverCampanha={handleRemoverCampanha}
              onExportarCampanha={handleExportarCampanha}
            />
          ))}

          {/* Fichas sem campanha */}
          <CampanhaSection
            campanha={null}
            fichas={fichasPorCampanha.get(undefined) || []}
            selecionada={selecionada}
            onSelecionar={setSelecionada}
            onMover={moverParaCampanha}
            campanhasDisponiveis={campanhas}
            renderFichaCard={renderFichaCard}
            onExportarCampanha={handleExportarCampanha}
          />

          {/* Criar nova campanha */}
          <NovaCampanhaForm onCriar={criarCampanha} />

          {fichas.length === 0 && (
            <p className="text-sm text-ordem-white/60">
              Nenhuma ficha salva ainda. Gere um agente em{' '}
              <Link href="/agente/novo" className="text-ordem-green underline">
                /agente/novo
              </Link>{' '}
              para começar.
            </p>
          )}
        </div>
      </section>

      <section className="lg:col-span-2 p-6 bg-zinc-950 overflow-y-auto">
        {fichaAtual ? (
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <AgentDetailView agent={fichaAtual} onUpdate={handleUpdate} readOnly={false} />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-ordem-white/60">
            <p>Selecione uma ficha para visualizar/editar.</p>
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
