import { FichaRegistro } from './useStoredFichas';
import { MonsterRegistro } from './useStoredMonsters';
import { Item, Weapow } from '../types';

export interface ExportData {
  version: string;
  exportadoEm: string;
  fichas?: FichaRegistro[];
  itens?: Item[];
  armas?: Weapow[];
  monstros?: MonsterRegistro[];
}

const EXPORT_VERSION = '1.0.0';

/**
 * Exporta todas as fichas do localStorage
 */
export function exportarFichas(): string {
  if (typeof window === 'undefined') {
    throw new Error('Exportação só pode ser feita no navegador');
  }

  const raw = window.localStorage.getItem('fichas-origem');
  const fichas: FichaRegistro[] = raw ? JSON.parse(raw) : [];

  const data: ExportData = {
    version: EXPORT_VERSION,
    exportadoEm: new Date().toISOString(),
    fichas,
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Exporta todos os dados do usuário (fichas + itens + monstros)
 */
export function exportarTudo(): string {
  if (typeof window === 'undefined') {
    throw new Error('Exportação só pode ser feita no navegador');
  }

  const fichasRaw = window.localStorage.getItem('fichas-origem');
  const itensRaw = window.localStorage.getItem('custom-items');
  const armasRaw = window.localStorage.getItem('custom-weapons');
  const monstrosRaw = window.localStorage.getItem('monstros-customizados');

  const fichas: FichaRegistro[] = fichasRaw ? JSON.parse(fichasRaw) : [];
  const itens: Item[] = itensRaw ? JSON.parse(itensRaw) : [];
  const armas: Weapow[] = armasRaw ? JSON.parse(armasRaw) : [];
  const monstros: MonsterRegistro[] = monstrosRaw ? JSON.parse(monstrosRaw) : [];

  const data: ExportData = {
    version: EXPORT_VERSION,
    exportadoEm: new Date().toISOString(),
    fichas,
    itens,
    armas,
    monstros,
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Faz download de um arquivo JSON
 */
export function downloadJSON(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Valida e parseia dados de importação
 */
export function validarDadosImportacao(jsonString: string): ExportData | null {
  try {
    const data = JSON.parse(jsonString) as ExportData;
    
    // Validação básica
    if (!data || typeof data !== 'object') {
      return null;
    }

    // Valida estrutura básica
    const validado: ExportData = {
      version: data.version || EXPORT_VERSION,
      exportadoEm: data.exportadoEm || new Date().toISOString(),
    };

    if (data.fichas && Array.isArray(data.fichas)) {
      validado.fichas = data.fichas;
    }

    if (data.itens && Array.isArray(data.itens)) {
      validado.itens = data.itens;
    }

    if (data.armas && Array.isArray(data.armas)) {
      validado.armas = data.armas;
    }

    if (data.monstros && Array.isArray(data.monstros)) {
      validado.monstros = data.monstros;
    }

    return validado;
  } catch (error) {
    console.error('Erro ao validar dados de importação:', error);
    return null;
  }
}

/**
 * Importa dados no localStorage (mesclando ou substituindo)
 */
export function importarDados(
  data: ExportData,
  opcao: 'mesclar' | 'substituir' = 'mesclar'
): {
  fichas: { importadas: number; total: number };
  itens: { importados: number; total: number };
  armas: { importadas: number; total: number };
  monstros: { importados: number; total: number };
} {
  if (typeof window === 'undefined') {
    throw new Error('Importação só pode ser feita no navegador');
  }

  const resultado = {
    fichas: { importadas: 0, total: 0 },
    itens: { importados: 0, total: 0 },
    armas: { importadas: 0, total: 0 },
    monstros: { importados: 0, total: 0 },
  };

  // Importar fichas
  if (data.fichas && data.fichas.length > 0) {
    resultado.fichas.total = data.fichas.length;
    
    if (opcao === 'substituir') {
      window.localStorage.setItem('fichas-origem', JSON.stringify(data.fichas));
      resultado.fichas.importadas = data.fichas.length;
    } else {
      // Mesclar: adiciona novas e atualiza existentes
      const raw = window.localStorage.getItem('fichas-origem');
      const existentes: FichaRegistro[] = raw ? JSON.parse(raw) : [];
      const idsExistentes = new Set(existentes.map((f) => f.id));
      
      const novas = data.fichas.filter((f) => !idsExistentes.has(f.id));
      const atualizadas = data.fichas.filter((f) => idsExistentes.has(f.id));
      
      // Remove as antigas que serão atualizadas
      const semAtualizadas = existentes.filter(
        (f) => !atualizadas.some((a) => a.id === f.id)
      );
      
      const mescladas = [...atualizadas, ...semAtualizadas, ...novas];
      window.localStorage.setItem('fichas-origem', JSON.stringify(mescladas));
      resultado.fichas.importadas = novas.length + atualizadas.length;
    }
  }

  // Importar itens
  if (data.itens && data.itens.length > 0) {
    resultado.itens.total = data.itens.length;
    
    if (opcao === 'substituir') {
      window.localStorage.setItem('custom-items', JSON.stringify(data.itens));
      resultado.itens.importados = data.itens.length;
    } else {
      const raw = window.localStorage.getItem('custom-items');
      const existentes: Item[] = raw ? JSON.parse(raw) : [];
      const nomesExistentes = new Set(existentes.map((i) => i.nome));
      
      const novos = data.itens.filter((i) => !nomesExistentes.has(i.nome));
      const mesclados = [...existentes, ...novos];
      window.localStorage.setItem('custom-items', JSON.stringify(mesclados));
      resultado.itens.importados = novos.length;
    }
  }

  // Importar armas
  if (data.armas && data.armas.length > 0) {
    resultado.armas.total = data.armas.length;
    
    if (opcao === 'substituir') {
      window.localStorage.setItem('custom-weapons', JSON.stringify(data.armas));
      resultado.armas.importadas = data.armas.length;
    } else {
      const raw = window.localStorage.getItem('custom-weapons');
      const existentes: Weapow[] = raw ? JSON.parse(raw) : [];
      const nomesExistentes = new Set(existentes.map((w) => w.nome));
      
      const novas = data.armas.filter((w) => !nomesExistentes.has(w.nome));
      const mescladas = [...existentes, ...novas];
      window.localStorage.setItem('custom-weapons', JSON.stringify(mescladas));
      resultado.armas.importadas = novas.length;
    }
  }

  // Importar monstros
  if (data.monstros && data.monstros.length > 0) {
    resultado.monstros.total = data.monstros.length;
    
    if (opcao === 'substituir') {
      window.localStorage.setItem('monstros-customizados', JSON.stringify(data.monstros));
      resultado.monstros.importados = data.monstros.length;
    } else {
      const raw = window.localStorage.getItem('monstros-customizados');
      const existentes: MonsterRegistro[] = raw ? JSON.parse(raw) : [];
      const idsExistentes = new Set(existentes.map((m) => m.id));
      
      const novos = data.monstros.filter((m) => !idsExistentes.has(m.id));
      const atualizados = data.monstros.filter((m) => idsExistentes.has(m.id));
      
      const semAtualizados = existentes.filter(
        (m) => !atualizados.some((a) => a.id === m.id)
      );
      
      const mesclados = [...atualizados, ...semAtualizados, ...novos];
      window.localStorage.setItem('monstros-customizados', JSON.stringify(mesclados));
      resultado.monstros.importados = novos.length + atualizados.length;
    }
  }

  return resultado;
}

/**
 * Lê um arquivo JSON do input file
 */
export function lerArquivoJSON(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        resolve(e.target.result);
      } else {
        reject(new Error('Erro ao ler arquivo'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file);
  });
}

