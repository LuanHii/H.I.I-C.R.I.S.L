import { NextRequest, NextResponse } from 'next/server';
import { getAgentFromCloud } from '@/core/firebase/firestore';
import { ehCampoDeOverlay, ehFormatoDeOverlay, textoDoValor, valoresDeOverlay } from '@/core/overlay/valores';

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

export async function GET(request: NextRequest, context: Contexto) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ erro: 'id ausente' }, { status: 400, headers: cabecalhos });
  }

  const personagem = await getAgentFromCloud(id);
  if (!personagem) {
    return NextResponse.json({ erro: 'ficha não encontrada' }, { status: 404, headers: cabecalhos });
  }

  const valores = valoresDeOverlay(personagem);
  const campo = request.nextUrl.searchParams.get('campo');
  const formato = request.nextUrl.searchParams.get('formato');

  if (campo !== null) {
    if (!ehCampoDeOverlay(campo)) {
      return NextResponse.json({ erro: `campo desconhecido: ${campo}` }, { status: 400, headers: cabecalhos });
    }
    const texto = textoDoValor(valores, campo, ehFormatoDeOverlay(formato) ? formato : 'atual');
    return new Response(texto, {
      status: 200,
      headers: { ...cabecalhos, 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return NextResponse.json(valores, { headers: cabecalhos });
}
