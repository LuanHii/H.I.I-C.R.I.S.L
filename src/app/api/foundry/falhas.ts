import { NextResponse } from 'next/server';

const cabecalhos = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-store',
};

/**
 * Falha do Firestore numa rota lida pelo Foundry. `permission-denied` aqui quase
 * sempre significa que as regras de `mesas`/`pareamentos` nao foram publicadas
 * (`firebase deploy --only firestore:rules`); o Foundry mostra isso ao mestre
 * em vez de um HTTP 500 sem explicacao.
 */
export function respostaDeFalha(erro: unknown) {
  const codigo = (erro as { code?: string })?.code;
  if (codigo === 'permission-denied') {
    return NextResponse.json({ error: 'regras_nao_publicadas' }, { status: 503, headers: cabecalhos });
  }
  console.error('Falha ao ler o Firestore para o Foundry:', erro);
  return NextResponse.json({ error: 'falha_no_banco' }, { status: 502, headers: cabecalhos });
}
