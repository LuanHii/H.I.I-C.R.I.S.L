"use client";

import Link from 'next/link';
import { use as usePromise, useState, useEffect, useCallback } from 'react';
import { FichaMestre } from '../../../../components/master/ficha/FichaMestre';
import { FichaAntiga } from '../../../../components/master/ficha/FichaAntiga';
import { MigracaoWizard } from '../../../../components/master/MigracaoWizard';
import { useCloudFichas } from '../../../../core/storage';
import { Personagem } from '../../../../core/types';
import { normalizePersonagem } from '../../../../core/personagemUtils';
import { MestreNavbar } from '../../../../components/master/MestreNavbar';
import { ArrowLeft, Download, FileText, Copy, Check } from 'lucide-react';
import { downloadJSON, downloadMarkdown, exportarFichaIndividual } from '../../../../core/storage/exportImportUtils';
import { resumoDoPersonagem, nomeDoArquivoDoResumo } from '../../../../core/export/resumo';
import { WeaponModsButton } from '../../../../components/master/WeaponModsModal';

export default function FichaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = usePromise(params);
  const { fichas, fichasBrutas, salvar, migrar, definirNivelDaFicha, responderEscolha, desfazerEscolha, editarFicha } = useCloudFichas();
  const [convertendo, setConvertendo] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const registro = fichas.find((ficha) => ficha.id === resolvedParams.id);
  const [personagemView, setPersonagemView] = useState<Personagem | null>(
    registro ? registro.personagem : null,
  );

  useEffect(() => {
    setPersonagemView(registro?.personagem ?? null);
  }, [registro?.personagem]);

  const atualizarPersonagem = useCallback(
    (updater: Personagem | ((prev: Personagem) => Personagem)) => {
      if (!registro) return;
      setPersonagemView((prev) => {
        const base = prev ?? registro.personagem;
        const atualizado = typeof updater === 'function' ? updater(base) : updater;
        const final = normalizePersonagem(atualizado, true);
        salvar(final, registro.id);
        return final;
      });
    },
    [registro, salvar],
  );

  const handleExportarFicha = () => {
    if (!registro || !personagemAtual) return;
    downloadJSON(
      exportarFichaIndividual({ ...registro, personagem: personagemAtual }),
      `${personagemAtual.nome.replace(/[^a-z0-9]/gi, '_')}-${registro.id.slice(0, 8)}.json`,
    );
  };

  const handleResumo = () => {
    if (!personagemAtual) return;
    downloadMarkdown(resumoDoPersonagem(personagemAtual), nomeDoArquivoDoResumo(personagemAtual));
  };

  const handleCopiarResumo = async () => {
    if (!personagemAtual) return;
    try {
      await navigator.clipboard.writeText(resumoDoPersonagem(personagemAtual));
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      handleResumo();
    }
  };

  if (!registro) {
    return (
      <div className="min-h-screen bg-ordem-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ficha não encontrada</h1>
          <Link href="/mestre/fichas" className="text-ordem-red hover:underline">
            Voltar para lista
          </Link>
        </div>
      </div>
    );
  }

  const personagemAtual = personagemView ?? registro.personagem;

  return (
    <div className="min-h-screen bg-ordem-black text-white flex flex-col">
      <MestreNavbar
        title="MESTRE"
        subtitle="ARQUIVO // EDIÇÃO"
        rightSlot={
          <div className="flex gap-2">
            <WeaponModsButton
              personagem={personagemAtual}
              onUpdate={atualizarPersonagem}
            />
            <button
              onClick={handleExportarFicha}
              className="flex items-center gap-1.5 border border-white/10 px-3 py-2 font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-secondary transition hover:border-white/30 hover:text-white"
              title="JSON completo, para importar de volta"
            >
              <Download size={13} /> Exportar
            </button>
            <button
              onClick={handleResumo}
              className="flex items-center gap-1.5 border border-white/10 px-3 py-2 font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-secondary transition hover:border-white/30 hover:text-white"
              title="Resumo em Markdown: só o que o personagem tem"
            >
              <FileText size={13} /> Resumo
            </button>
            <button
              onClick={() => void handleCopiarResumo()}
              className="flex items-center gap-1.5 border border-white/10 px-3 py-2 font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-secondary transition hover:border-white/30 hover:text-white"
              title="Copiar o resumo do personagem"
            >
              {copiado ? <Check size={13} className="text-ordem-green" /> : <Copy size={13} />} {copiado ? 'Copiado' : 'Copiar'}
            </button>
            <Link
              href="/mestre/fichas"
              className="flex items-center gap-1.5 border border-white/10 px-3 py-2 font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-secondary transition hover:border-white/30 hover:text-white"
            >
              <ArrowLeft size={13} /> Voltar
            </Link>
          </div>
        }
      />

      <main className="flex-1 bg-ordem-black-deep p-4">
        <div className="max-w-7xl mx-auto h-[calc(100vh-96px)] flex flex-col">
          <nav className="flex items-center gap-2 mb-3 text-xs font-mono text-ordem-text-muted shrink-0" aria-label="Navegação">
            <Link href="/mestre" className="hover:text-ordem-white transition-colors">Mestre</Link>
            <span>/</span>
            <Link href="/mestre/fichas" className="hover:text-ordem-white transition-colors">Fichas</Link>
            <span>/</span>
            <span className="text-ordem-white truncate max-w-[200px]">{personagemAtual.nome}</span>
          </nav>

          <div className="flex-1 overflow-y-auto border border-white/10 bg-ordem-ooze/50">
            {registro?.fonte === 'v2' && registro.ficha ? (
              <FichaMestre
                ficha={registro.ficha}
                personagem={personagemAtual}
                onSessao={atualizarPersonagem}
                onDefinirNivel={(nivel) => definirNivelDaFicha(registro.id, nivel)}
                onResponder={(escolhaId, valor) => responderEscolha(registro.id, escolhaId, valor)}
                onDesfazer={(escolhaId) => desfazerEscolha(registro.id, escolhaId)}
                onEditar={(transformar) => editarFicha(registro.id, transformar)}
              />
            ) : (
              <FichaAntiga
                personagem={personagemAtual}
                motivo={registro.ficha ? registro.motivoDaFonte : undefined}
                onConverter={() => setConvertendo(true)}
              />
            )}
            <MigracaoWizard
              isOpen={convertendo}
              fichas={[{ id: registro.id, personagem: fichasBrutas.find((f) => f.id === registro.id)?.personagem ?? registro.personagem }]}
              onClose={() => setConvertendo(false)}
              onConverter={(id, ficha, opcoes) => migrar(id, ficha, opcoes)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
