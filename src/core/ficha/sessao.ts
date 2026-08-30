import type { Personagem } from '../types';
import { buildFicha } from './buildFicha';
import type { FichaPersistida } from './tipos';

/**
 * Sincroniza o estado de SESSÃO do v0 para o documento v2.
 *
 * O problema que isto resolve: com a leitura virada, cada save do mestre grava o
 * `personagem` e faz `fichaMigradaDe` divergir de `atualizadoEm` — então a ficha
 * cai para o v0 no próximo render. Sem esta função, ler do motor novo duraria
 * exatamente até o primeiro clique em "-1 PV", que é inútil.
 *
 * A saída correta não é "reconverter automaticamente" — auto-migrar dentro de um
 * write-back é como se perde campanha no meio da sessão. É distinguir:
 *
 *  - **Mudança de sessão** (dano, PE gasto, sanidade, PP, condições, marcas):
 *    o documento v2 absorve e continua válido. É a esmagadora maioria dos saves
 *    durante o jogo.
 *  - **Mudança estrutural** (atributo, NEX, trilha, poder, perícia): o documento
 *    v2 NÃO tenta adivinhar o que aconteceu. Fica marcado como desatualizado, a
 *    ficha volta a ser lida do v0, e o mestre reconverte quando quiser.
 *
 * Recusar-se a adivinhar é a decisão de design aqui. Um motor que tentasse
 * inferir "ah, o FOR subiu 1, deve ter sido o marco de NEX 20" reintroduziria
 * exatamente a atribuição-por-palpite que o replay para frente existe para pegar.
 */

export interface ResultadoSessao {
  ficha: FichaPersistida;
  /**
   * Houve mudança que o estado de sessão não explica? Se sim, o documento v2
   * ficou para trás e a leitura deve cair para o v0.
   */
  estrutural: boolean;
  /** Quais campos divergiram — para dizer ao mestre o que reconverter. */
  divergiu: string[];
}

export function atualizarSessao(
  ficha: FichaPersistida,
  personagem: Personagem,
): ResultadoSessao {
  const build = buildFicha({ ficha });
  const divergiu: string[] = [];

  /*
   * A comparação é contra o BUILD, não contra o documento: é o build que a UI
   * mostrou e o mestre editou. Comparar com o documento cru acusaria diferença
   * em todo campo derivado.
   */
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

  /*
   * Dano, não valor atual. `max` vem do motor novo, então `atual` do v0 já está
   * na mesma escala — subtrair dá o dano diretamente.
   */
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
