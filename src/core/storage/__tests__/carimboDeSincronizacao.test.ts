import { describe, expect, it } from 'vitest';
import type { Personagem } from '@/core/types';
import { normalizePersonagem } from '@/core/personagemUtils';
import { criarFicha } from '@/testUtils/fixtures';
import { migrarFicha } from '@/core/ficha/migracao/migrarFicha';
import { resolverPersonagem } from '@/core/ficha/leitura';
import { carimbarSincronizacao, type RegistroCarimbavel } from '../carimboDeSincronizacao';

const ANTES = '2026-09-01T10:00:00.000Z';
const AGORA = '2026-09-10T18:30:00.000Z';

function registroConvertido() {
  const v0: Personagem = normalizePersonagem(
    criarFicha({ classe: 'Especialista', nex: 25, trilha: 'Técnico' }),
    false,
  );
  const ficha = migrarFicha(v0).ficha;
  return { personagem: v0, atualizadoEm: ANTES, ficha, fichaMigradaDe: ANTES, fichaConfirmada: true };
}

describe('sincronizar com a nuvem não derruba a ficha para o motor antigo', () => {
  it('premissa: o registro convertido é lido do motor novo', () => {
    expect(resolverPersonagem(registroConvertido()).fonte).toBe('v2');
  });

  it('depois de sincronizar, continua sendo lido do motor novo', () => {
    const sincronizado = carimbarSincronizacao(registroConvertido(), AGORA);

    expect(
      resolverPersonagem(sincronizado).fonte,
      'sincronizar invalidou a conversão sem nada do personagem ter mudado',
    ).toBe('v2');
  });

  it('e o carimbo move os dois campos juntos', () => {
    const sincronizado = carimbarSincronizacao(registroConvertido(), AGORA);

    expect(sincronizado.atualizadoEm).toBe(AGORA);
    expect(
      sincronizado.fichaMigradaDe,
      'fichaMigradaDe ficou para trás e a válvula de segurança dispara',
    ).toBe(AGORA);
    expect(sincronizado.sincronizadaNaNuvem).toBe(true);
  });

  it('ficha que JÁ estava desatualizada não é revalidada de graça', () => {
    const desatualizada = { ...registroConvertido(), atualizadoEm: AGORA, fichaMigradaDe: ANTES };
    expect(resolverPersonagem(desatualizada).fonte, 'premissa').toBe('v0');

    const sincronizada = carimbarSincronizacao(desatualizada, '2026-09-11T00:00:00.000Z');
    expect(
      resolverPersonagem(sincronizada).fonte,
      'sincronizar carimbou como válida uma conversão que estava para trás',
    ).toBe('v0');
  });

  it('ficha sem documento novo não ganha fichaMigradaDe do nada', () => {
    const soV0: RegistroCarimbavel & { personagem: Personagem } = {
      personagem: registroConvertido().personagem,
      atualizadoEm: ANTES,
    };
    const sincronizada = carimbarSincronizacao(soV0, AGORA);

    expect(sincronizada.fichaMigradaDe).toBeUndefined();
    expect(resolverPersonagem(sincronizada).fonte).toBe('v0');
  });
});
