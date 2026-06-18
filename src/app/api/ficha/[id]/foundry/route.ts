import { NextRequest, NextResponse } from 'next/server';
import { getAgentFromCloud } from '@/core/firebase/firestore';
import type { PericiaName, Personagem } from '@/core/types';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store',
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...corsHeaders,
      ...(init?.headers ?? {}),
    },
  });
}

function buildSheetUrls(request: NextRequest, agentId: string) {
  const sheetUrl = new URL(`/ficha/${agentId}`, request.url);
  const embedUrl = new URL(`/ficha/${agentId}`, request.url);
  const compactUrl = new URL(`/ficha/${agentId}`, request.url);

  embedUrl.searchParams.set('embed', 'foundry');
  embedUrl.searchParams.set('view', 'full');
  compactUrl.searchParams.set('overlay', 'true');
  compactUrl.searchParams.set('overlayMode', 'mini');

  return {
    sheetUrl: sheetUrl.toString(),
    embedUrl: embedUrl.toString(),
    compactUrl: compactUrl.toString(),
  };
}

function buildFoundryPayload(request: NextRequest, agentId: string, agent: Personagem) {
  const withMeta = agent as Personagem & { updatedAt?: string };
  const skills = Object.entries(agent.periciasDetalhadas ?? {})
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
    .map(([name, detail]) => ({
      name: name as PericiaName,
      attribute: detail.atributoBase,
      dice: detail.dados,
      criterion: detail.criterio,
      fixedBonus: detail.bonusFixo,
      diceBonus: detail.bonusO,
      training: detail.grau,
    }));

  return {
    schemaVersion: 1,
    agentId,
    fetchedAt: new Date().toISOString(),
    updatedAt: withMeta.updatedAt ?? null,
    source: buildSheetUrls(request, agentId),
    character: {
      name: agent.nome,
      concept: agent.conceito ?? '',
      class: agent.classe,
      origin: agent.origem,
      path: agent.trilha ?? '',
      nex: agent.nex,
      stage: agent.estagio ?? null,
      patent: agent.patente ?? '',
      defense: agent.defesa,
      movement: agent.deslocamento,
      usesDetermination: agent.usarPd === true,
    },
    resources: {
      pv: agent.pv,
      pe: agent.pe,
      san: agent.san,
      pd: agent.pd ?? null,
      load: agent.carga,
    },
    attributes: agent.atributos,
    skills,
    equipment: (agent.equipamentos ?? []).map((item) => ({
      name: item.nome,
      type: item.tipo,
      category: item.categoria,
      space: item.espaco,
      stats: item.stats ?? null,
    })),
    powers: (agent.poderes ?? []).map((power) => ({
      name: power.nome,
      type: power.tipo,
    })),
    rituals: (agent.rituais ?? []).map((ritual) => ({
      name: ritual.nome,
      element: ritual.elemento,
      circle: ritual.circulo,
    })),
  };
}

function sanitizeRawPersonagem(agent: Personagem) {
  const { ownerId: _ownerId, updatedAt: _updatedAt, ...personagem } = agent as Personagem & {
    ownerId?: string;
    updatedAt?: string;
  };
  return personagem;
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const agentId = decodeURIComponent(id ?? '').trim();

  if (!agentId) {
    return json({ error: 'missing_agent_id' }, { status: 400 });
  }

  const agent = await getAgentFromCloud(agentId);

  if (!agent) {
    return json({ error: 'agent_not_found', agentId }, { status: 404 });
  }

  const url = new URL(request.url);
  const includeRaw = url.searchParams.get('includeRaw') === 'true' || url.searchParams.get('include') === 'full';
  const payload = buildFoundryPayload(request, agentId, agent);

  return json({
    ...payload,
    personagem: includeRaw ? sanitizeRawPersonagem(agent) : undefined,
  });
}
