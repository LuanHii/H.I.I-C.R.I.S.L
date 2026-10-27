import { NextResponse } from 'next/server';
import { gravarDocumento, lerDocumento, uidDoToken } from '@/core/mesa3d/firestoreRest';
import { aplicarSessaoDaMesa, validarMudanca, type MudancaDaMesa, type RegistroDaMesa } from '@/core/mesa3d/sessaoDaMesa';

export const dynamic = 'force-dynamic';

const cabecalhos = { 'Cache-Control': 'no-store' };
const TENTATIVAS = 3;

function erro(codigo: string, status: number) {
  return NextResponse.json({ ok: false, error: codigo }, { status, headers: cabecalhos });
}

/**
 * A Mesa 3D grava o que mudou na sessão (recursos, condições, inventário) numa ficha
 * do mestre. Só o PC do mestre chama, com o idToken dele (o login da mesa).
 *
 * Corpo: { fichaId, recursos?, condicoes?, itens? } (sessaoDaMesa.ts).
 * Resposta: { ok, atualizadoEm, personagem, estrutural } — a mesa usa o `atualizadoEm`
 * para não tratar a própria gravação como novidade do site quando ela voltar.
 *
 * Lê e grava pelo Firestore com o token do mestre: as regras do banco valem, e a
 * rota não tem segredo nenhum. A gravação só vale se a ficha não mudou entre ler e
 * gravar (o mestre salvando no site ao mesmo tempo); senão lê de novo.
 */
export async function POST(request: Request) {
  const projeto = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projeto) return erro('site_sem_firebase', 503);

  const token = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
  const uid = token ? uidDoToken(token) : null;
  if (!uid) return erro('sem_login', 401);

  let corpo: (MudancaDaMesa & { fichaId?: unknown }) | null = null;
  try {
    corpo = await request.json();
  } catch {
    corpo = null;
  }
  const fichaId = typeof corpo?.fichaId === 'string' ? corpo.fichaId : '';
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(fichaId)) return erro('ficha_invalida', 400);
  const motivo = validarMudanca(corpo);
  if (motivo) return NextResponse.json({ ok: false, error: 'mudanca_invalida', motivo }, { status: 400, headers: cabecalhos });
  const mudanca: MudancaDaMesa = { recursos: corpo!.recursos, condicoes: corpo!.condicoes, itens: corpo!.itens };

  const caminho = `users/${uid}/fichas/${fichaId}`;
  for (let tentativa = 0; tentativa < TENTATIVAS; tentativa++) {
    const lido = await lerDocumento(projeto, caminho, token);
    if (lido.status === 401 || lido.status === 403) return erro('sem_permissao', lido.status);
    if (lido.status === 404) return erro('ficha_nao_encontrada', 404);
    if (lido.status !== 200 || !lido.dados?.personagem) return erro('falha_no_banco', 502);

    const registro = lido.dados as RegistroDaMesa;
    // sempre depois do que estava lá: a mesa pergunta "mudou desde T?" por esse campo
    let agora = new Date().toISOString();
    if (typeof registro.atualizadoEm === 'string' && agora <= registro.atualizadoEm) {
      agora = new Date(Date.parse(registro.atualizadoEm) + 1).toISOString();
    }
    const r = aplicarSessaoDaMesa(registro, mudanca, agora);

    const gravado = await gravarDocumento(projeto, caminho, r.registro, token, lido.updateTime);
    if (gravado.conflito) continue;
    if (gravado.status === 401 || gravado.status === 403) return erro('sem_permissao', gravado.status);
    if (gravado.status >= 300) return erro('falha_no_banco', 502);

    // a cópia pública (o link dos jogadores, o Foundry), como o saveAgentToCloud do site
    const espelho = await gravarDocumento(projeto, `agentes/${fichaId}`,
      { ...r.registro.personagem, ownerId: uid, updatedAt: agora }, token);
    if (espelho.status >= 300) console.error('Mesa 3D: a ficha gravou, a cópia pública não', espelho.status);

    return NextResponse.json(
      { ok: true, atualizadoEm: agora, personagem: r.registro.personagem, estrutural: r.estrutural },
      { headers: cabecalhos },
    );
  }
  return erro('conflito', 409);
}
