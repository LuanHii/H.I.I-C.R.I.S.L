import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as getPareamento } from '../pareamento/[codigo]/route';
import { GET as getMesa } from '../mesa/[id]/route';
import { respostaDeFalha } from '../falhas';

const lerMesa = vi.fn();
const lerPareamento = vi.fn();

vi.mock('@/core/firebase/mesasService', () => ({
  lerMesa: (...args: unknown[]) => lerMesa(...args),
  lerPareamento: (...args: unknown[]) => lerPareamento(...args),
}));

const mesa = {
  id: 'mesa-1',
  ownerId: 'uid-do-mestre',
  nome: 'Mesa de quinta',
  fichas: [{ agentId: 'a', nome: 'Arthur' }],
  atualizadoEm: '2026-09-23T10:00:00.000Z',
};

function pedirPareamento(codigo: string) {
  return getPareamento(new Request('http://localhost'), { params: Promise.resolve({ codigo }) });
}

describe('/api/foundry/pareamento/[codigo]', () => {
  beforeEach(() => {
    lerMesa.mockReset();
    lerPareamento.mockReset();
  });

  it('recusa codigo fora do formato sem consultar o banco', async () => {
    const resposta = await pedirPareamento('abc');

    expect(resposta.status).toBe(400);
    expect(lerPareamento).not.toHaveBeenCalled();
  });

  it('responde pendente enquanto o mestre nao confirmou', async () => {
    lerPareamento.mockResolvedValue(null);

    const corpo = await (await pedirPareamento('ABCDEFGH23')).json();

    expect(corpo).toEqual({ status: 'pendente' });
  });

  it('depois de confirmado, devolve a mesa sem o dono', async () => {
    lerPareamento.mockResolvedValue({ mesaId: 'mesa-1', ownerId: 'uid-do-mestre' });
    lerMesa.mockResolvedValue(mesa);

    const corpo = await (await pedirPareamento('ABCDEFGH23')).json();

    expect(corpo).toEqual({ status: 'confirmado', mesaId: 'mesa-1', nome: 'Mesa de quinta' });
  });
});

describe('/api/foundry/mesa/[id]', () => {
  beforeEach(() => lerMesa.mockReset());

  it('devolve as fichas sem expor o uid do mestre', async () => {
    lerMesa.mockResolvedValue(mesa);

    const resposta = await getMesa(new Request('http://localhost'), { params: Promise.resolve({ id: 'mesa-1' }) });
    const corpo = await resposta.json();

    expect(corpo.fichas).toHaveLength(1);
    expect(corpo.ownerId).toBeUndefined();
    expect(resposta.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('404 para mesa inexistente', async () => {
    lerMesa.mockResolvedValue(null);

    const resposta = await getMesa(new Request('http://localhost'), { params: Promise.resolve({ id: 'x' }) });

    expect(resposta.status).toBe(404);
  });
});

describe('respostaDeFalha', () => {
  it('permissao negada vira 503 explicando que faltam as regras, em vez de 500', async () => {
    const resposta = respostaDeFalha(Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' }));

    expect(resposta.status).toBe(503);
    expect(await resposta.json()).toEqual({ error: 'regras_nao_publicadas' });
  });

  it('outra falha do banco vira 502', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const resposta = respostaDeFalha(new Error('unavailable'));

    expect(resposta.status).toBe(502);
    expect(await resposta.json()).toEqual({ error: 'falha_no_banco' });
  });
});
