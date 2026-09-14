import { describe, expect, it } from 'vitest';
import type { Personagem } from '@/core/types';
import { criarFicha as fixtureV0 } from '@/testUtils/fixtures';
import { criarFicha } from '@/core/ficha/criacao';
import { paraPersonagem } from '@/core/ficha/paraPersonagem';
import { resolverPersonagem } from '@/core/ficha/leitura';
import { RASCUNHO_INICIAL, dadosDe, esqueletoDe, metaDePericias, type Rascunho } from '@/logic/rascunhoDeCriacao';
import { exportarFichaIndividual, validarFichaIndividual } from '../exportImportUtils';
import type { FichaRegistro } from '../registros';
import { planejarImportacao, registroParaExportar } from '../importacaoDeFicha';

const AGORA = '2026-09-15T10:00:00.000Z';
const ids = ['novo-1', 'novo-2'];
const novoId = () => ids.shift() ?? 'novo-x';

function registroDoCriador(nome = 'Bianca Duarte'): FichaRegistro {
  const base: Rascunho = { ...RASCUNHO_INICIAL, tipo: 'Agente', nome, atributos: { AGI: 1, FOR: 1, INT: 3, PRE: 2, VIG: 2 }, origem: 'Acadêmico', classe: 'Especialista' };
  const r = { ...base, periciasLivres: metaDePericias(base)!.sugestao };
  const ficha = criarFicha(dadosDe(r)).ficha;
  const personagem = paraPersonagem({ ficha, carregarDe: esqueletoDe(r) });
  return registroParaExportar('jogador-1', personagem, ficha, '2026-09-14T20:00:00.000Z');
}

describe('o que o jogador exporta no fim da criação volta inteiro na conta do mestre', () => {
  it('ida e volta: exportar → validar → planejar preserva o documento v2 e a ficha lê pelo motor novo', () => {
    const original = registroDoCriador();
    const json = exportarFichaIndividual(original);
    const lido = validarFichaIndividual(json);
    expect(lido?.ficha.ficha?.versao).toBe(2);

    const plano = planejarImportacao([], lido!.ficha, 'mesclar', AGORA, novoId);
    expect(plano.acao).toBe('adicionada');
    expect(plano.registro.ficha).toEqual(original.ficha);
    expect(plano.registro.id).toBe('jogador-1');
    expect(plano.registro.fichaMigradaDe).toBe(AGORA);
    expect(plano.registro.atualizadoEm).toBe(AGORA);
    expect(plano.registro.fichaConfirmada).toBe(true);
    expect(resolverPersonagem(plano.registro).fonte).toBe('v2');
    expect(plano.registro.personagem.pv.max).toBe(original.personagem.pv.max);
  });

  it('a campanha e a sincronização do outro lado não vêm junto', () => {
    const recebida = { ...registroDoCriador(), campanha: 'campanha-do-jogador', sincronizadaNaNuvem: true, fonte: 'v2' as const, motivoDaFonte: 'x' };
    const plano = planejarImportacao([], recebida, 'mesclar', AGORA, novoId);
    expect(plano.registro.campanha).toBeUndefined();
    expect('sincronizadaNaNuvem' in plano.registro).toBe(false);
    expect('fonte' in plano.registro).toBe(false);
  });

  it('id já existente: mesclar cria uma cópia com id novo; substituir mantém o id', () => {
    const existente = registroDoCriador();
    const ferida = registroDoCriador();
    const recebida = { ...ferida, ficha: { ...ferida.ficha!, sessao: { ...ferida.ficha!.sessao, pvDano: 15 } } };

    const copia = planejarImportacao([existente], recebida, 'mesclar', AGORA, () => 'copia-1');
    expect(copia.acao).toBe('renomeada');
    expect(copia.registro.id).toBe('copia-1');
    expect(copia.registro.personagem.nome).toBe('Bianca Duarte (importado)');

    const troca = planejarImportacao([existente], recebida, 'substituir-se-existir', AGORA, novoId);
    expect(troca.acao).toBe('atualizada');
    expect(troca.registro.id).toBe('jogador-1');
    expect(troca.registro.personagem.pv.atual, 'o dano vem do documento, projetado').toBe(existente.personagem.pv.max - 15);
  });

  it('mesmo nome com id diferente entra como nova, marcada', () => {
    const existente = { ...registroDoCriador(), id: 'outra' };
    const plano = planejarImportacao([existente], registroDoCriador(), 'mesclar', AGORA, novoId);
    expect(plano.acao).toBe('adicionada');
    expect(plano.registro.id).toBe('jogador-1');
    expect(plano.registro.personagem.nome).toBe('Bianca Duarte (importado)');
  });

  it('ficha antiga (sem documento v2) importa como antiga — o store nunca converte sozinho', () => {
    const v0 = fixtureV0({ classe: 'Combatente', nex: 20 });
    const recebida: FichaRegistro = { id: 'antiga-1', personagem: v0, atualizadoEm: '2025-01-01T00:00:00.000Z' };
    const plano = planejarImportacao([], recebida, 'mesclar', AGORA, novoId);
    expect(plano.registro.ficha).toBeUndefined();
    expect(plano.registro.fichaMigradaDe).toBeUndefined();
    expect(plano.registro.personagem).toBe(v0);
    expect(resolverPersonagem(plano.registro).fonte).toBe('v0');
  });

  it('documento v2 corrompido não derruba a importação: entra como antiga, com aviso', () => {
    const recebida = { ...registroDoCriador(), ficha: { versao: 2, identidade: null } as never };
    const plano = planejarImportacao([], recebida, 'mesclar', AGORA, novoId);
    expect(plano.registro.ficha).toBeUndefined();
    expect(plano.avisos.join(' ')).toMatch(/antiga/);
  });

  it('o personagem gravado é a projeção do documento, não o objeto do arquivo', () => {
    const original = registroDoCriador();
    const adulterado = { ...original, personagem: { ...original.personagem, pv: { ...original.personagem.pv, max: 999 } } as Personagem };
    const plano = planejarImportacao([], adulterado, 'mesclar', AGORA, novoId);
    expect(plano.registro.personagem.pv.max).toBe(original.personagem.pv.max);
  });
});
