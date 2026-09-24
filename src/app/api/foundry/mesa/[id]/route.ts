import { NextResponse } from 'next/server';
import { lerMesa } from '@/core/firebase/mesasService';
import { respostaDeFalha } from '../../falhas';

export const dynamic = 'force-dynamic';

const cabecalhos = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Accept, Content-Type',
  'Cache-Control': 'no-store',
};

type Contexto = { params: Promise<{ id: string }> };

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: cabecalhos });
}

/** Lista de fichas da mesa, para o seletor "Fichar" do Foundry. Sem `ownerId`. */
export async function GET(_request: Request, context: Contexto) {
  const { id } = await context.params;
  const mesaId = decodeURIComponent(id ?? '').trim();
  if (!mesaId) {
    return NextResponse.json({ error: 'mesa_ausente' }, { status: 400, headers: cabecalhos });
  }

  let mesa;
  try {
    mesa = await lerMesa(mesaId);
  } catch (erro) {
    return respostaDeFalha(erro);
  }
  if (!mesa) {
    return NextResponse.json({ error: 'mesa_nao_encontrada' }, { status: 404, headers: cabecalhos });
  }

  return NextResponse.json(
    {
      id: mesa.id,
      nome: mesa.nome,
      fichas: mesa.fichas ?? [],
      atualizadoEm: mesa.atualizadoEm,
    },
    { headers: cabecalhos },
  );
}
