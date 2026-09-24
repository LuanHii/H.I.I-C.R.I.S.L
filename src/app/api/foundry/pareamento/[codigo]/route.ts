import { NextResponse } from 'next/server';
import { lerMesa, lerPareamento } from '@/core/firebase/mesasService';
import { codigoDePareamentoValido } from '@/core/foundry/mesa';
import { respostaDeFalha } from '../../falhas';

export const dynamic = 'force-dynamic';

const cabecalhos = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Accept, Content-Type',
  'Cache-Control': 'no-store',
};

type Contexto = { params: Promise<{ codigo: string }> };

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: cabecalhos });
}

/**
 * Consultada pelo Foundry a cada poucos segundos enquanto o mestre confirma o
 * pareamento no site. "pendente" e resposta normal, nao erro.
 */
export async function GET(_request: Request, context: Contexto) {
  const { codigo } = await context.params;
  if (!codigoDePareamentoValido(codigo)) {
    return NextResponse.json({ error: 'codigo_invalido' }, { status: 400, headers: cabecalhos });
  }

  let pareamento;
  let mesa;
  try {
    pareamento = await lerPareamento(codigo);
    if (!pareamento) {
      return NextResponse.json({ status: 'pendente' }, { headers: cabecalhos });
    }
    mesa = await lerMesa(pareamento.mesaId);
  } catch (erro) {
    return respostaDeFalha(erro);
  }
  if (!mesa) {
    return NextResponse.json({ error: 'mesa_nao_encontrada' }, { status: 404, headers: cabecalhos });
  }

  return NextResponse.json(
    { status: 'confirmado', mesaId: mesa.id, nome: mesa.nome },
    { headers: cabecalhos },
  );
}
