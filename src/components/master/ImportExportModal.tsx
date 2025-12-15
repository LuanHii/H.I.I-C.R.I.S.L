"use client";

import { useState, useRef } from 'react';
import {
  exportarFichas,
  exportarTudo,
  downloadJSON,
  validarDadosImportacao,
  importarDados,
  lerArquivoJSON,
} from '../../core/storage/exportImportUtils';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

export function ImportExportModal({
  isOpen,
  onClose,
  onImportComplete,
}: ImportExportModalProps) {
  const [modo, setModo] = useState<'exportar' | 'importar'>('exportar');
  const [opcaoImportacao, setOpcaoImportacao] = useState<'mesclar' | 'substituir'>('mesclar');
  const [importando, setImportando] = useState(false);
  const [resultadoImportacao, setResultadoImportacao] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportarFichas = () => {
    try {
      const data = exportarFichas();
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
      const data = exportarTudo();
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
      if (dados.fichas) {
        mensagens.push(
          `Fichas: ${resultado.fichas.importadas} de ${resultado.fichas.total} importadas`
        );
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
      
      if (onImportComplete) {
        onImportComplete();
      }

      // Recarrega a página após 2 segundos para atualizar os dados
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Erro ao importar:', error);
      setResultadoImportacao(`Erro ao importar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setImportando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif text-white">
            {modo === 'exportar' ? 'EXPORTAR DADOS' : 'IMPORTAR DADOS'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setModo('exportar')}
            className={`flex-1 px-4 py-2 text-sm font-mono border rounded-lg transition ${
              modo === 'exportar'
                ? 'border-ordem-green text-ordem-green bg-ordem-green/10'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
            }`}
          >
            EXPORTAR
          </button>
          <button
            onClick={() => setModo('importar')}
            className={`flex-1 px-4 py-2 text-sm font-mono border rounded-lg transition ${
              modo === 'importar'
                ? 'border-ordem-green text-ordem-green bg-ordem-green/10'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
            }`}
          >
            IMPORTAR
          </button>
        </div>

        {modo === 'exportar' && (
          <div className="space-y-3">
            <div className="text-sm text-zinc-400 mb-4">
              Escolha o que deseja exportar:
            </div>
            <button
              onClick={handleExportarFichas}
              className="w-full px-4 py-3 border border-ordem-red text-ordem-red hover:bg-ordem-red/10 rounded-lg transition text-left"
            >
              <div className="font-semibold">Exportar Fichas</div>
              <div className="text-xs text-zinc-400 mt-1">
                Exporta apenas as fichas de personagens
              </div>
            </button>
            <button
              onClick={handleExportarTudo}
              className="w-full px-4 py-3 border border-ordem-green text-ordem-green hover:bg-ordem-green/10 rounded-lg transition text-left"
            >
              <div className="font-semibold">Exportar Tudo</div>
              <div className="text-xs text-zinc-400 mt-1">
                Exporta fichas, itens customizados, armas e monstros
              </div>
            </button>
          </div>
        )}

        {modo === 'importar' && (
          <div className="space-y-4">
            <div className="text-sm text-zinc-400 mb-4">
              Selecione um arquivo JSON para importar:
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono text-zinc-500 uppercase tracking-widest">
                Opção de Importação
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setOpcaoImportacao('mesclar')}
                  className={`flex-1 px-3 py-2 text-sm border rounded-lg transition ${
                    opcaoImportacao === 'mesclar'
                      ? 'border-ordem-green text-ordem-green bg-ordem-green/10'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  Mesclar
                </button>
                <button
                  onClick={() => setOpcaoImportacao('substituir')}
                  className={`flex-1 px-3 py-2 text-sm border rounded-lg transition ${
                    opcaoImportacao === 'substituir'
                      ? 'border-ordem-red text-ordem-red bg-ordem-red/10'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  Substituir
                </button>
              </div>
              <div className="text-xs text-zinc-500 mt-1">
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
              className="w-full px-4 py-3 border border-ordem-green text-ordem-green hover:bg-ordem-green/10 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importando ? 'Importando...' : 'Selecionar Arquivo JSON'}
            </button>

            {resultadoImportacao && (
              <div
                className={`p-3 rounded-lg border text-sm whitespace-pre-line ${
                  resultadoImportacao.startsWith('Erro')
                    ? 'border-ordem-red text-ordem-red bg-ordem-red/10'
                    : 'border-ordem-green text-ordem-green bg-ordem-green/10'
                }`}
              >
                {resultadoImportacao}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:text-white rounded-lg transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

