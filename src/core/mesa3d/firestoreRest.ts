/**
 * Firestore pela API REST, COM O TOKEN DO PRÓPRIO MESTRE (rota /api/mesa3d/sessao).
 *
 * Por que não o SDK: no servidor, o SDK web não tem como "ser" o mestre — ele só
 * loga pela janela do Google, no navegador. E o SDK de administrador exigiria uma
 * credencial de serviço na Vercel, que passa por cima das regras do banco. Com o
 * REST e o `Authorization: Bearer <idToken do mestre>`, quem decide é o Firestore,
 * pelas mesmas regras do site: um token falso ou de outra conta é recusado lá, não
 * aqui. Nenhum segredo no servidor.
 */

const BASE = 'https://firestore.googleapis.com/v1';

/**
 * Valor que o Firestore guarda com tipo próprio (timestamp, referência, geo,
 * bytes). Lido e gravado de volta como veio: sem isso, um timestamp viraria texto
 * na regravação do documento inteiro, e a leitura do site mudaria de tipo.
 */
export class ValorCru {
  constructor(readonly valor: Record<string, unknown>) {}
}

type ValorRest = Record<string, unknown>;

export function paraRest(v: unknown): ValorRest {
  if (v instanceof ValorCru) return v.valor;
  if (v === null) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') {
    // como o SDK web: inteiro seguro vira integerValue, o resto doubleValue
    return Number.isSafeInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) {
    return { arrayValue: { values: v.filter((x) => x !== undefined).map(paraRest) } };
  }
  if (typeof v === 'object') return { mapValue: { fields: camposParaRest(v as Record<string, unknown>) } };
  throw new Error(`valor sem tipo no Firestore: ${typeof v}`);
}

/** Campos de um documento; `undefined` fica de fora (o site faz o mesmo com removeUndefinedFields). */
export function camposParaRest(o: Record<string, unknown>): Record<string, ValorRest> {
  const out: Record<string, ValorRest> = {};
  for (const [k, x] of Object.entries(o)) {
    if (x !== undefined) out[k] = paraRest(x);
  }
  return out;
}

export function deRest(v: ValorRest | undefined): unknown {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('mapValue' in v) return camposDeRest(((v.mapValue as { fields?: Record<string, ValorRest> }) ?? {}).fields ?? {});
  if ('arrayValue' in v) return (((v.arrayValue as { values?: ValorRest[] }) ?? {}).values ?? []).map(deRest);
  return new ValorCru(v);
}

export function camposDeRest(campos: Record<string, ValorRest>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, x] of Object.entries(campos)) out[k] = deRest(x);
  return out;
}

export interface Lido {
  status: number;
  dados?: Record<string, unknown>;
  /** Para a gravação só valer se ninguém mexeu entre ler e gravar. */
  updateTime?: string;
}

function url(projeto: string, caminho: string): string {
  return `${BASE}/projects/${projeto}/databases/(default)/documents/${caminho}`;
}

export async function lerDocumento(projeto: string, caminho: string, token: string): Promise<Lido> {
  const r = await fetch(url(projeto, caminho), { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!r.ok) return { status: r.status };
  const doc = (await r.json()) as { fields?: Record<string, ValorRest>; updateTime?: string };
  return { status: 200, dados: camposDeRest(doc.fields ?? {}), updateTime: doc.updateTime };
}

/**
 * Grava o documento inteiro (como o setDoc do site). Com `seNaoMudouDesde`, só grava
 * se o documento ainda estiver na versão lida; senão volta `conflito` (409/400 do
 * Firestore: FAILED_PRECONDITION) e quem chamou lê de novo.
 */
export async function gravarDocumento(
  projeto: string,
  caminho: string,
  dados: Record<string, unknown>,
  token: string,
  seNaoMudouDesde?: string,
): Promise<{ status: number; conflito: boolean }> {
  const cond = seNaoMudouDesde ? `?currentDocument.updateTime=${encodeURIComponent(seNaoMudouDesde)}` : '';
  const r = await fetch(url(projeto, caminho) + cond, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: camposParaRest(dados) }),
    cache: 'no-store',
  });
  if (r.ok) return { status: r.status, conflito: false };
  let texto = '';
  try {
    texto = await r.text();
  } catch {
    texto = '';
  }
  return { status: r.status, conflito: r.status === 409 || texto.includes('FAILED_PRECONDITION') };
}

/**
 * O uid do idToken do Firebase, SEM conferir a assinatura: só para montar o caminho
 * `users/{uid}/...`. Quem confere o token é o Firestore, na leitura; um token
 * forjado com o uid de outro é recusado lá.
 */
export function uidDoToken(token: string): string | null {
  const partes = token.split('.');
  if (partes.length !== 3) return null;
  try {
    const json = JSON.parse(Buffer.from(partes[1], 'base64url').toString('utf8')) as { user_id?: unknown; sub?: unknown };
    const uid = typeof json.user_id === 'string' ? json.user_id : typeof json.sub === 'string' ? json.sub : '';
    return /^[A-Za-z0-9_-]{1,128}$/.test(uid) ? uid : null;
  } catch {
    return null;
  }
}
