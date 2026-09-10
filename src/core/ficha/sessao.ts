import type { Personagem } from '../types';
import { buildFicha } from './buildFicha';
import type { FichaPersistida } from './tipos';

export interface ResultadoSessao {
  ficha: FichaPersistida;
  estrutural: boolean;
  divergiu: string[];
}

export function atualizarSessao(
  ficha: FichaPersistida,
  personagem: Personagem,
): ResultadoSessao {
  const build = buildFicha({ ficha });
  const divergiu: string[] = [];

  for (const atributo of ['AGI', 'FOR', 'INT', 'PRE', 'VIG'] as const) {
    if (personagem.atributos[atributo] !== build.atributos[atributo]) {
      divergiu.push(`atributo ${atributo}`);
    }
  }

  const nivelV0 = personagem.classe === 'Sobrevivente' ? (personagem.estagio ?? 1) : personagem.nex;
  if (nivelV0 !== build.nivel) divergiu.push(personagem.classe === 'Sobrevivente' ? 'estágio' : 'NEX');

  if ((personagem.trilha ?? undefined) !== (build.trilha ?? undefined)) divergiu.push('trilha');
  if ((personagem.afinidade ?? undefined) !== (build.afinidade ?? undefined)) divergiu.push('afinidade');

  const poderesV0 = new Set((personagem.poderes ?? []).map((p) => p.nome));
  const poderesV2 = new Set(build.poderes.map((p) => p.nome));
  if (poderesV0.size !== poderesV2.size || build.poderes.some((p) => !poderesV0.has(p.nome))) {
    divergiu.push('poderes');
  }

  for (const [pericia, grau] of Object.entries(personagem.pericias)) {
    if (build.derivados.graus[pericia as keyof typeof build.derivados.graus] !== grau) {
      divergiu.push(`perícia ${pericia}`);
      break;
    }
  }

  const sessao: FichaPersistida['sessao'] = {
    ...ficha.sessao,
    pvDano: Math.max(0, personagem.pv.max - personagem.pv.atual),
    peGasto: Math.max(0, personagem.pe.max - personagem.pe.atual),
    sanPerdida: Math.max(0, personagem.san.max - personagem.san.atual),
    ...(personagem.pd ? { pdGasto: Math.max(0, personagem.pd.max - personagem.pd.atual) } : {}),
    ...(personagem.pp !== undefined ? { pontosPrestigio: personagem.pp } : {}),
    ...(personagem.marcas ? { marcas: personagem.marcas } : {}),
  };

  return {
    ficha: { ...ficha, sessao },
    estrutural: divergiu.length > 0,
    divergiu,
  };
}
