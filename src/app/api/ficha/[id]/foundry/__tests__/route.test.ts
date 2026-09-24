import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import type { Personagem } from '@/core/types';
import { GET } from '../route';

const getAgentFromCloud = vi.fn();

vi.mock('@/core/firebase/firestore', () => ({
  getAgentFromCloud: (...args: unknown[]) => getAgentFromCloud(...args),
}));

function ficha(sobrescrever: Record<string, unknown> = {}): Personagem {
  return {
    nome: 'Arthur',
    classe: 'Combatente',
    origem: 'Policial',
    nex: 20,
    atributos: { AGI: 2, FOR: 2, INT: 1, PRE: 1, VIG: 2 },
    pv: { atual: 30, max: 30, temp: 0, machucado: 15 },
    pe: { atual: 5, max: 5, rodada: 4 },
    san: { atual: 18, max: 18, perturbado: false },
    defesa: 12,
    deslocamento: 9,
    periciasDetalhadas: {},
    equipamentos: [],
    poderes: [{ nome: 'Ataque Especial', tipo: 'Classe', descricao: 'Texto original' }],
    rituais: [],
    efeitosAtivos: [],
    ownerId: 'dono',
    updatedAt: '2026-09-01T10:00:00.000Z',
    ...sobrescrever,
  } as unknown as Personagem;
}

async function buscar(query = '') {
  const request = new NextRequest(`http://localhost/api/ficha/abc/foundry${query}`);
  const response = await GET(request, { params: Promise.resolve({ id: 'abc' }) });
  return response.json();
}

describe('rota /api/ficha/[id]/foundry', () => {
  beforeEach(() => {
    getAgentFromCloud.mockReset();
  });

  it('salvar a ficha sem mudar nada nao muda a revisao', async () => {
    getAgentFromCloud.mockResolvedValue(ficha());
    const antes = await buscar();

    getAgentFromCloud.mockResolvedValue(ficha({ updatedAt: '2026-09-02T18:30:00.000Z' }));
    const depois = await buscar();

    expect(depois.revision.hash).toBe(antes.revision.hash);
  });

  it('mudar a descricao de um poder muda a revisao', async () => {
    getAgentFromCloud.mockResolvedValue(ficha());
    const antes = await buscar();

    getAgentFromCloud.mockResolvedValue(ficha({
      poderes: [{ nome: 'Ataque Especial', tipo: 'Classe', descricao: 'Texto revisado' }],
    }));
    const depois = await buscar();

    expect(depois.revision.hash).not.toBe(antes.revision.hash);
  });

  it('com include=full e revisao conhecida, responde notModified sem a ficha', async () => {
    getAgentFromCloud.mockResolvedValue(ficha());
    const { revision } = await buscar();

    const resposta = await buscar(`?include=full&knownRevision=${revision.hash}`);

    expect(resposta.notModified).toBe(true);
    expect(resposta.personagem).toBeUndefined();
  });

  it('com include=full e revisao desatualizada, manda a ficha sem ownerId', async () => {
    getAgentFromCloud.mockResolvedValue(ficha());

    const resposta = await buscar('?include=full&knownRevision=velha');

    expect(resposta.notModified).toBeUndefined();
    expect(resposta.personagem.nome).toBe('Arthur');
    expect(resposta.personagem.ownerId).toBeUndefined();
  });
});
