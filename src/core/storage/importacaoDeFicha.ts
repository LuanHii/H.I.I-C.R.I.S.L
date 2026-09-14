import type { Personagem } from '../types';
import type { FichaPersistida } from '../ficha/tipos';
import { buildFicha } from '../ficha/buildFicha';
import { paraPersonagem } from '../ficha/paraPersonagem';
import type { FichaRegistro } from './registros';

export type OpcaoDeImportacao = 'mesclar' | 'substituir-se-existir';

export interface PlanoDeImportacao {
  registro: FichaRegistro;
  acao: 'adicionada' | 'atualizada' | 'renomeada';
  mensagem: string;
  avisos: string[];
}

export function registroParaExportar(id: string, personagem: Personagem, ficha: FichaPersistida, agora: string): FichaRegistro {
  return {
    id,
    personagem,
    ficha,
    atualizadoEm: agora,
    fichaMigradaDe: agora,
    fichaConfirmada: true,
  };
}

function documentoValido(ficha: unknown): ficha is FichaPersistida {
  if (!ficha || typeof ficha !== 'object') return false;
  try {
    buildFicha({ ficha: ficha as FichaPersistida });
    return true;
  } catch {
    return false;
  }
}

const marcar = (nome: string): string => (nome.endsWith('(importado)') ? nome : `${nome} (importado)`);

export function planejarImportacao(
  existentes: readonly FichaRegistro[],
  recebida: FichaRegistro,
  opcao: OpcaoDeImportacao,
  agora: string,
  novoId: () => string,
): PlanoDeImportacao {
  const avisos: string[] = [];
  const temDocumento = recebida.ficha !== undefined;
  const documento = temDocumento && documentoValido(recebida.ficha) ? recebida.ficha : undefined;
  if (temDocumento && !documento) {
    avisos.push('O documento do motor novo veio corrompido; a ficha entrou como ficha antiga e pode ser convertida de novo.');
  }

  const personagem = documento ? paraPersonagem({ ficha: documento, carregarDe: recebida.personagem }) : recebida.personagem;

  let registro: FichaRegistro = {
    id: recebida.id,
    personagem,
    atualizadoEm: agora,
    ...(documento
      ? { ficha: documento, fichaMigradaDe: agora, fichaConfirmada: recebida.fichaConfirmada ?? true }
      : {}),
    ...(recebida.personagemOriginal ? { personagemOriginal: recebida.personagemOriginal } : {}),
  };

  const mesmoId = existentes.find((f) => f.id === registro.id);
  const nomeRepetido = (id: string) => existentes.some((f) => f.personagem.nome === registro.personagem.nome && f.id !== id);

  if (mesmoId && opcao === 'substituir-se-existir') {
    return {
      registro: { ...registro, campanha: mesmoId.campanha },
      acao: 'atualizada',
      mensagem: `Ficha "${registro.personagem.nome}" atualizada.`,
      avisos,
    };
  }

  if (mesmoId) {
    const id = novoId();
    registro = { ...registro, id, personagem: { ...registro.personagem, nome: marcar(registro.personagem.nome) } };
    return {
      registro,
      acao: 'renomeada',
      mensagem: `Ficha "${registro.personagem.nome}" importada como cópia — o id já existia na sua conta.`,
      avisos,
    };
  }

  if (nomeRepetido(registro.id)) {
    registro = { ...registro, personagem: { ...registro.personagem, nome: marcar(registro.personagem.nome) } };
  }

  return {
    registro,
    acao: 'adicionada',
    mensagem: `Ficha "${registro.personagem.nome}" importada.`,
    avisos,
  };
}
