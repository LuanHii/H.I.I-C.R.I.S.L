import type { FichaRegistro, MonsterRegistro } from './registros';
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

export function exportarRegistros(fichas: readonly FichaRegistro[]): string {
  const data: ExportData = {
    version: EXPORT_VERSION,
    exportadoEm: new Date().toISOString(),
    fichas: [...fichas],
  };

  return JSON.stringify(data, null, 2);
}

export function exportarTudo(fichas: readonly FichaRegistro[]): string {
  if (typeof window === 'undefined') {
    throw new Error('Exportação só pode ser feita no navegador');
  }

  const itensRaw = window.localStorage.getItem('custom-items');
  const armasRaw = window.localStorage.getItem('custom-weapons');
  const monstrosRaw = window.localStorage.getItem('monstros-customizados');

  const itens: Item[] = itensRaw ? JSON.parse(itensRaw) : [];
  const armas: Weapow[] = armasRaw ? JSON.parse(armasRaw) : [];
  const monstros: MonsterRegistro[] = monstrosRaw ? JSON.parse(monstrosRaw) : [];

  const data: ExportData = {
    version: EXPORT_VERSION,
    exportadoEm: new Date().toISOString(),
    fichas: [...fichas],
    itens,
    armas,
    monstros,
  };

  return JSON.stringify(data, null, 2);
}

export function downloadTexto(data: string, filename: string, tipo = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([data], { type: tipo });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSON(data: string, filename: string): void {
  downloadTexto(data, filename, 'application/json');
}

export function downloadMarkdown(data: string, filename: string): void {
  downloadTexto(data, filename, 'text/markdown;charset=utf-8');
}

export function validarDadosImportacao(jsonString: string): ExportData | null {
  try {
    const data = JSON.parse(jsonString) as ExportData;

    if (!data || typeof data !== 'object') {
      return null;
    }

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

export function importarDados(
  data: ExportData,
  opcao: 'mesclar' | 'substituir' = 'mesclar'
): {
  itens: { importados: number; total: number };
  armas: { importadas: number; total: number };
  monstros: { importados: number; total: number };
} {
  if (typeof window === 'undefined') {
    throw new Error('Importação só pode ser feita no navegador');
  }

  const resultado = {
    itens: { importados: 0, total: 0 },
    armas: { importadas: 0, total: 0 },
    monstros: { importados: 0, total: 0 },
  };

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

export interface ExportFichaIndividual {
  version: string;
  exportadoEm: string;
  tipo: 'ficha-individual';
  ficha: FichaRegistro;
}

export function exportarFichaIndividual(ficha: FichaRegistro): string {
  const data: ExportFichaIndividual = {
    version: EXPORT_VERSION,
    exportadoEm: new Date().toISOString(),
    tipo: 'ficha-individual',
    ficha,
  };
  return JSON.stringify(data, null, 2);
}

export interface ExportCampanhaData {
  version: string;
  exportadoEm: string;
  tipo: 'campanha';
  campanhaNome: string;
  campanhaId?: string;
  fichas: FichaRegistro[];
}

export function exportarFichasPorCampanha(
  fichas: FichaRegistro[],
  campanhaNome: string,
  campanhaId?: string
): string {
  const data: ExportCampanhaData = {
    version: EXPORT_VERSION,
    exportadoEm: new Date().toISOString(),
    tipo: 'campanha',
    campanhaNome,
    campanhaId,
    fichas,
  };
  return JSON.stringify(data, null, 2);
}

export function validarFichaIndividual(jsonString: string): ExportFichaIndividual | null {
  try {
    const data = JSON.parse(jsonString);

    if (data && typeof data === 'object') {

      if (data.tipo === 'ficha-individual' && data.ficha) {
        return {
          version: data.version || EXPORT_VERSION,
          exportadoEm: data.exportadoEm || new Date().toISOString(),
          tipo: 'ficha-individual',
          ficha: data.ficha,
        };
      }

      if (data.fichas && Array.isArray(data.fichas) && data.fichas.length > 0) {
        return {
          version: data.version || EXPORT_VERSION,
          exportadoEm: data.exportadoEm || new Date().toISOString(),
          tipo: 'ficha-individual',
          ficha: data.fichas[0],
        };
      }

      if (data.id && data.personagem) {
        return {
          version: EXPORT_VERSION,
          exportadoEm: new Date().toISOString(),
          tipo: 'ficha-individual',
          ficha: data as FichaRegistro,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao validar ficha individual:', error);
    return null;
  }
}
