"use client";

import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { Cantos, RotuloSecao } from './ui/Pecas';
import {
  exportarRegistros,
  exportarTudo,
  downloadJSON,
  validarDadosImportacao,
  importarDados,
  lerArquivoJSON,
  validarFichaIndividual,
} from '../../core/storage/exportImportUtils';
import { planejarImportacao, type OpcaoDeImportacao } from '../../core/storage/importacaoDeFicha';
import type { FichaRegistro } from '../../core/storage/registros';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  fichas: readonly FichaRegistro[];
  onImportarRegistro: (registro: FichaRegistro) => Promise<void>;
}

export function ImportExportModal({
  isOpen,
  onClose,
  fichas,
  onImportarRegistro,
}: ImportExportModalProps) {
  const [modo, setModo] = useState<'exportar' | 'importar' | 'importar-ficha'>('exportar');
  const [opcaoImportacao, setOpcaoImportacao] = useState<'mesclar' | 'substituir'>('mesclar');
  const [opcaoFichaIndividual, setOpcaoFichaIndividual] = useState<OpcaoDeImportacao>('mesclar');
  const [importando, setImportando] = useState(false);
  const [resultadoImportacao, setResultadoImportacao] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fichaInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const importarRegistros = async (recebidas: readonly FichaRegistro[], opcao: OpcaoDeImportacao): Promise<string[]> => {
    const linhas: string[] = [];
    let existentes = [...fichas];
    for (const recebida of recebidas) {
      const plano = planejarImportacao(existentes, recebida, opcao, new Date().toISOString(), () => crypto.randomUUID());
      await onImportarRegistro(plano.registro);
      existentes = [plano.registro, ...existentes.filter((f) => f.id !== plano.registro.id)];
      linhas.push(`✓ ${plano.mensagem}`, ...plano.avisos.map((a) => `⚠ ${a}`));
    }
    return linhas;
  };

  const handleExportarFichas = () => {
    try {
      const data = exportarRegistros(fichas);
      const timestamp = new Date().toISOString().split('T')[0];
      downloadJSON(data, `fichas-export-${timestamp}.json`);
      alert('Fichas exportadas com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao exportar fichas:', error);
      alert('Erro ao exportar fichas. Verifique o console para mais detalhes.');
    }
  };

  const handleExportarTudo = () => {
    try {
      const data = exportarTudo(fichas);
      const timestamp = new Date().toISOString().split('T')[0];
      downloadJSON(data, `cris-backup-completo-${timestamp}.json`);
      alert('Todos os dados exportados com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert('Erro ao exportar dados. Verifique o console para mais detalhes.');
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportando(true);
    setResultadoImportacao(null);

    try {
      const jsonString = await lerArquivoJSON(file);
      const dados = validarDadosImportacao(jsonString);

      if (!dados) {
        setResultadoImportacao('Erro: Arquivo inválido ou corrompido.');
        setImportando(false);
        return;
      }

      const resultado = importarDados(dados, opcaoImportacao);

      const mensagens: string[] = [];
      if (dados.fichas && dados.fichas.length > 0) {
        const linhas = await importarRegistros(
          dados.fichas.filter((f) => f && typeof f === 'object' && f.personagem),
          opcaoImportacao === 'substituir' ? 'substituir-se-existir' : 'mesclar',
        );
        mensagens.push(`Fichas: ${linhas.filter((l) => l.startsWith('✓')).length} de ${dados.fichas.length} importadas`, ...linhas.filter((l) => l.startsWith('⚠')));
      }
      if (dados.itens) {
        mensagens.push(
          `Itens: ${resultado.itens.importados} de ${resultado.itens.total} importados`
        );
      }
      if (dados.armas) {
        mensagens.push(
          `Armas: ${resultado.armas.importadas} de ${resultado.armas.total} importadas`
        );
      }
      if (dados.monstros) {
        mensagens.push(
          `Monstros: ${resultado.monstros.importados} de ${resultado.monstros.total} importados`
        );
      }

      setResultadoImportacao(mensagens.join('\n'));
    } catch (error) {
      console.error('Erro ao importar:', error);
      setResultadoImportacao(`Erro ao importar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setImportando(false);
    }
  };

  const handleFichaIndividualSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportando(true);
    setResultadoImportacao(null);

    try {
      const jsonString = await lerArquivoJSON(file);
      const fichaData = validarFichaIndividual(jsonString);

      if (!fichaData) {
        setResultadoImportacao('Erro: Arquivo de ficha inválido. O arquivo deve conter uma ficha de personagem válida.');
        setImportando(false);
        return;
      }

      const linhas = await importarRegistros([fichaData.ficha], opcaoFichaIndividual);
      setResultadoImportacao(linhas.join('\n'));
    } catch (error) {
      console.error('Erro ao importar ficha individual:', error);
      setResultadoImportacao(`Erro ao importar ficha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setImportando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ordem-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative max-h-[92dvh] w-full overflow-y-auto border border-white/10 bg-[var(--mestre-superficie,#16161a)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_40px_80px_-30px_rgba(0,0,0,1)] sm:max-h-full sm:max-w-lg sm:p-6">
        <Cantos />
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <RotuloSecao>Arquivo</RotuloSecao>
            <h2 className="mt-1 font-display text-2xl uppercase leading-none tracking-[0.06em] text-white">
              {modo === 'exportar' ? 'Exportar dados' : modo === 'importar' ? 'Importar dados' : 'Importar ficha'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center border border-white/10 text-ordem-text-muted transition hover:border-white/30 hover:text-white"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-5 flex gap-1.5">
          <button
            onClick={() => { setModo('exportar'); setResultadoImportacao(null); }}
            className={`flex-1 border px-3 py-1.5 font-carimbo text-[10px] uppercase tracking-[0.16em] transition ${modo === 'exportar' ? 'border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)]/15 text-white' : 'border-white/10 text-ordem-text-muted hover:border-white/30 hover:text-white'}`}
          >
            Exportar
          </button>
          <button
            onClick={() => { setModo('importar'); setResultadoImportacao(null); }}
            className={`flex-1 border px-3 py-1.5 font-carimbo text-[10px] uppercase tracking-[0.16em] transition ${modo === 'importar' ? 'border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)]/15 text-white' : 'border-white/10 text-ordem-text-muted hover:border-white/30 hover:text-white'}`}
          >
            Importar
          </button>
          <button
            onClick={() => { setModo('importar-ficha'); setResultadoImportacao(null); }}
            className={`flex-1 border px-3 py-1.5 font-carimbo text-[10px] uppercase tracking-[0.16em] transition ${modo === 'importar-ficha' ? 'border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)]/15 text-white' : 'border-white/10 text-ordem-text-muted hover:border-white/30 hover:text-white'}`}
          >
            Uma ficha
          </button>
        </div>

        {modo === 'exportar' && (
          <div className="space-y-3">
            <div className="text-sm text-ordem-text-secondary mb-4">
              Escolha o que deseja exportar:
            </div>
            <button
              onClick={handleExportarFichas}
              className="w-full border border-white/10 bg-white/[0.02] px-4 py-3 text-left transition hover:border-[var(--mestre-primary,#DC2626)]/70 hover:bg-white/[0.04]"
            >
              <div className="text-sm font-semibold text-white">Exportar Fichas</div>
              <div className="text-xs text-ordem-text-secondary mt-1">
                Exporta apenas as fichas de personagens
              </div>
            </button>
            <button
              onClick={handleExportarTudo}
              className="w-full border border-white/10 bg-white/[0.02] px-4 py-3 text-left transition hover:border-[var(--mestre-primary,#DC2626)]/70 hover:bg-white/[0.04]"
            >
              <div className="text-sm font-semibold text-white">Exportar Tudo</div>
              <div className="text-xs text-ordem-text-secondary mt-1">
                Exporta fichas, itens customizados, armas e monstros
              </div>
            </button>
          </div>
        )}

        {modo === 'importar' && (
          <div className="space-y-4">
            <div className="text-sm text-ordem-text-secondary mb-4">
              Selecione um arquivo JSON para importar:
            </div>

            <div className="space-y-2">
              <label className="block font-carimbo text-[10px] uppercase tracking-[0.18em] text-ordem-text-muted">
                Opção de Importação
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setOpcaoImportacao('mesclar')}
                  className={`flex-1 border px-3 py-2 text-sm transition ${opcaoImportacao === 'mesclar' ? 'border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)]/10 text-white' : 'border-white/10 text-ordem-text-secondary hover:border-white/30'}`}
                >
                  Mesclar
                </button>
                <button
                  onClick={() => setOpcaoImportacao('substituir')}
                  className={`flex-1 border px-3 py-2 text-sm transition ${opcaoImportacao === 'substituir' ? 'border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)]/10 text-white' : 'border-white/10 text-ordem-text-secondary hover:border-white/30'}`}
                >
                  Substituir
                </button>
              </div>
              <div className="text-xs text-ordem-text-muted mt-1">
                {opcaoImportacao === 'mesclar'
                  ? 'Adiciona novos itens e atualiza existentes'
                  : 'Substitui todos os dados existentes'}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importando}
              className="w-full border border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)]/15 px-4 py-2.5 font-carimbo text-[11px] uppercase tracking-[0.16em] text-white transition hover:bg-[var(--mestre-primary,#DC2626)]/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {importando ? 'Importando...' : 'Selecionar Arquivo JSON'}
            </button>

            {resultadoImportacao && (
              <div
                className={`border p-3 text-sm whitespace-pre-line ${resultadoImportacao.startsWith('Erro')
                    ? 'border-ordem-red text-ordem-red bg-ordem-red/10'
                    : 'border-ordem-green text-ordem-green bg-ordem-green/10'
                  }`}
              >
                {resultadoImportacao}
              </div>
            )}
          </div>
        )}

        {modo === 'importar-ficha' && (
          <div className="space-y-4">
            <div className="border border-ordem-gold/40 bg-ordem-gold/10 p-3">
              <div className="text-sm text-amber-400 font-semibold mb-1">
                📋 Importar Ficha de Jogador
              </div>
              <div className="text-xs text-ordem-text-secondary">
                O arquivo que o jogador baixou em &quot;Exportar ficha&quot;, no fim da criação ou na própria ficha.
                Ela entra na sua conta como está — inclusive o documento do motor novo.
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-carimbo text-[10px] uppercase tracking-[0.18em] text-ordem-text-muted">
                Se a ficha já existir
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setOpcaoFichaIndividual('mesclar')}
                  className={`flex-1 border px-3 py-2 text-sm transition ${opcaoFichaIndividual === 'mesclar' ? 'border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)]/10 text-white' : 'border-white/10 text-ordem-text-secondary hover:border-white/30'}`}
                >
                  Criar Nova
                </button>
                <button
                  onClick={() => setOpcaoFichaIndividual('substituir-se-existir')}
                  className={`flex-1 border px-3 py-2 text-sm transition ${opcaoFichaIndividual === 'substituir-se-existir' ? 'border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)]/10 text-white' : 'border-white/10 text-ordem-text-secondary hover:border-white/30'}`}
                >
                  Atualizar
                </button>
              </div>
              <div className="text-xs text-ordem-text-muted mt-1">
                {opcaoFichaIndividual === 'mesclar'
                  ? 'Se o id já existir, entra como cópia ("(importado)")'
                  : 'Se o id já existir, a ficha é substituída pela do arquivo'}
              </div>
            </div>

            <input
              ref={fichaInputRef}
              type="file"
              accept=".json"
              onChange={handleFichaIndividualSelect}
              className="hidden"
            />

            <button
              onClick={() => fichaInputRef.current?.click()}
              disabled={importando}
              className="w-full border border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)]/15 px-4 py-2.5 font-carimbo text-[11px] uppercase tracking-[0.16em] text-white transition hover:bg-[var(--mestre-primary,#DC2626)]/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {importando ? 'Importando Ficha...' : '📁 Selecionar Ficha do Jogador'}
            </button>

            {resultadoImportacao && (
              <div
                className={`border p-3 text-sm whitespace-pre-line ${resultadoImportacao.startsWith('Erro')
                    ? 'border-ordem-red text-ordem-red bg-ordem-red/10'
                    : 'border-ordem-green text-ordem-green bg-ordem-green/10'
                  }`}
              >
                {resultadoImportacao}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-ordem-border">
          <button
            onClick={onClose}
            className="w-full border border-white/10 px-4 py-2 font-carimbo text-[11px] uppercase tracking-[0.16em] text-ordem-text-secondary transition hover:border-white/30 hover:text-white"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
