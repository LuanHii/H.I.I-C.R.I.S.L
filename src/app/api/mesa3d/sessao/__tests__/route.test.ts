import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { criarFicha } from '@/testUtils/fixtures';
import { migrarFicha } from '@/core/ficha/migracao/migrarFicha';
import { paraPersonagem } from '@/core/ficha/paraPersonagem';
import { camposDeRest, camposParaRest, deRest, paraRest, uidDoToken, ValorCru } from '@/core/mesa3d/firestoreRest';
import { POST } from '../route';

const ATUALIZADO = '2026-10-01T00:00:00.000Z';

function token(payload: object) {
  const b = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${b({ alg: 'RS256' })}.${b(payload)}.assinatura`;
}
const TOKEN = token({ user_id: 'uid-1', aud: 'hii-cris' });

function registro() {
  const v0 = criarFicha({ classe: 'Combatente', nex: 15 });
  const ficha = migrarFicha(v0).ficha;
  return { id: 'f1', ficha, fichaMigradaDe: ATUALIZADO, personagem: paraPersonagem({ ficha, carregarDe: v0 }), atualizadoEm: ATUALIZADO };
}

function pedir(corpo: unknown, auth = `Bearer ${TOKEN}`) {
  return POST(new Request('http://localhost/api/mesa3d/sessao', {
    method: 'POST', headers: { Authorization: auth, 'Content-Type': 'application/json' }, body: JSON.stringify(corpo),
  }));
}

const resposta = (status: number, corpo: unknown) =>
  new Response(typeof corpo === 'string' ? corpo : JSON.stringify(corpo), { status });

let fetchFalso: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'hii-cris');
  fetchFalso = vi.fn();
  vi.stubGlobal('fetch', fetchFalso);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

/** O Firestore de mentira: lê o registro; grava (a 1ª gravação pode dar conflito). */
function banco(reg: Record<string, unknown>, conflitos = 0) {
  const gravados: { url: string; dados: Record<string, unknown> }[] = [];
  fetchFalso.mockImplementation(async (url: string, init?: RequestInit) => {
    if (!init?.method || init.method === 'GET') {
      return resposta(200, { name: 'x', fields: camposParaRest(reg), updateTime: '2026-10-01T00:00:01.000000Z' });
    }
    if (conflitos > 0 && url.includes('/fichas/')) {
      conflitos--;
      return resposta(400, { error: { status: 'FAILED_PRECONDITION' } });
    }
    gravados.push({ url, dados: camposDeRest(JSON.parse(String(init.body)).fields) });
    return resposta(200, {});
  });
  return gravados;
}

describe('/api/mesa3d/sessao', () => {
  it('sem o login do mestre não consulta o banco', async () => {
    const r = await pedir({ fichaId: 'f1' }, '');
    expect(r.status).toBe(401);
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it('recusa ficha com caminho estranho e mudança malformada', async () => {
    expect((await pedir({ fichaId: '../agentes/x' })).status).toBe(400);
    expect((await pedir({ fichaId: 'f1', recursos: { pv: { atual: 'x' } } })).status).toBe(400);
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it('grava a ficha do próprio mestre, só se não mudou desde a leitura, e a cópia pública', async () => {
    const reg = registro();
    const gravados = banco(reg);
    const max = reg.personagem.pv.max;

    const r = await pedir({ fichaId: 'f1', recursos: { pv: { atual: max - 4 } }, condicoes: ['Abalado'] });
    const corpo = await r.json();

    expect(r.status).toBe(200);
    expect(corpo.ok).toBe(true);
    expect(corpo.atualizadoEm > ATUALIZADO).toBe(true);
    expect(corpo.personagem.pv.atual).toBe(max - 4);
    const [ficha, espelho] = gravados;
    expect(ficha.url).toContain('/documents/users/uid-1/fichas/f1?currentDocument.updateTime=');
    expect((ficha.dados.ficha as { sessao: { pvDano: number } }).sessao.pvDano).toBe(4);
    expect(ficha.dados.atualizadoEm).toBe(corpo.atualizadoEm);
    expect(espelho.url).toMatch(/\/documents\/agentes\/f1$/);
    expect(espelho.dados.ownerId).toBe('uid-1');
    expect(espelho.dados.efeitosAtivos).toEqual(['Abalado']);
  });

  it('o mestre salvou no site entre ler e gravar: lê de novo e grava', async () => {
    const gravados = banco(registro(), 1);
    const r = await pedir({ fichaId: 'f1', condicoes: [] });
    expect(r.status).toBe(200);
    expect(fetchFalso.mock.calls.filter(([, i]) => !i?.method).length, 'leu duas vezes').toBe(2);
    expect(gravados.length).toBe(2);
  });

  it('ficha que não é dele (ou não existe) não é criada', async () => {
    fetchFalso.mockResolvedValue(resposta(404, { error: { status: 'NOT_FOUND' } }));
    const r = await pedir({ fichaId: 'f9', condicoes: [] });
    expect(r.status).toBe(404);
    expect(fetchFalso).toHaveBeenCalledTimes(1);
  });
});

describe('valores do Firestore', () => {
  it('ida e volta mantém inteiro, fração, nulo, listas e o timestamp', () => {
    const ts = new ValorCru({ timestampValue: '2026-01-01T00:00:00Z' });
    const o = { a: 1, b: 1.5, c: null, d: ['x', true], e: { f: ts }, g: undefined };
    expect(paraRest(1)).toEqual({ integerValue: '1' });
    expect(paraRest(1.5)).toEqual({ doubleValue: 1.5 });
    const volta = camposDeRest(camposParaRest(o));
    expect(volta).toEqual({ a: 1, b: 1.5, c: null, d: ['x', true], e: { f: ts } });
    expect(deRest(paraRest(ts))).toBeInstanceOf(ValorCru);
  });

  it('o uid sai do token; token torto não tem uid', () => {
    expect(uidDoToken(TOKEN)).toBe('uid-1');
    expect(uidDoToken('abc')).toBeNull();
    expect(uidDoToken(token({ user_id: '../x' }))).toBeNull();
  });
});
