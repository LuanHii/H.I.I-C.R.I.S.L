import type { Elemento, GrauTreinamento, PericiaName, Poder } from '../types';
import { avaliarPoder, type EstadoParaRequisitos } from '../rules/requisitos';
import { TODAS_PERICIAS } from '../rules/pericias';
import { PODERES, getPoderesClasse, getPoderesForaDaClasse, getPoderesGerais, getPoderesParanormais } from '../../data/character/powers';
import { TRILHAS } from '../../data/character/tracks';
import { ORIGENS } from '../../data/character/origins';
import { RITUAIS } from '../../data/magic/rituals';
import type { EstadoParcial } from './slots';
import type { FichaIdentidade, Slot, ValorEscolha } from './tipos';

export interface Opcao {
  rotulo: string;
  valor: ValorEscolha;
  elegivel: boolean;
  motivos: string[];
  indeterminados: string[];
}

const ELEMENTOS: Elemento[] = ['Conhecimento', 'Energia', 'Morte', 'Sangue'];

export function circuloMaximoPorNivel(nex: number): 1 | 2 | 3 | 4 {
  if (nex >= 85) return 4;
  if (nex >= 55) return 3;
  if (nex >= 25) return 2;
  return 1;
}

function estadoParaRequisitos(
  identidade: FichaIdentidade,
  parcial: EstadoParcial,
  nivel: number,
  graus: Record<PericiaName, GrauTreinamento>,
): EstadoParaRequisitos {
  const poderes: Poder[] = parcial.poderes
    .map((p) => PODERES.find((c) => c.nome === p.nome))
    .filter((p): p is Poder => Boolean(p));

  return {
    nex: nivel,
    atributos: identidade.atributosBase,
    pericias: graus,
    poderes,
  };
}

function grausVazios(): Record<PericiaName, GrauTreinamento> {
  const saida = {} as Record<PericiaName, GrauTreinamento>;
  for (const pericia of TODAS_PERICIAS) saida[pericia] = 'Destreinado';
  return saida;
}

export interface ContextoOpcoes {
  identidade: FichaIdentidade;
  parcial: EstadoParcial;
  graus?: Record<PericiaName, GrauTreinamento>;
}

function opcoesDePoder(
  candidatos: readonly Poder[],
  slot: Slot,
  ctx: ContextoOpcoes,
): Opcao[] {
  const graus = ctx.graus ?? grausVazios();
  const estado = estadoParaRequisitos(ctx.identidade, ctx.parcial, slot.nivel, graus);
  const possuidos = new Set(ctx.parcial.poderes.map((p) => p.nome));

  return candidatos.map((poder) => {
    const avaliacao = avaliarPoder(poder, estado);
    const motivos = [...avaliacao.motivos];

    if (possuidos.has(poder.nome) && !poder.repetivel) {
      motivos.push('Você já possui este poder');
    }

    return {
      rotulo: poder.nome,
      valor: { tipo: 'poder', poder: poder.nome },
      elegivel: avaliacao.elegivel && motivos.length === 0,
      motivos,
      indeterminados: avaliacao.indeterminados,
    };
  });
}

export function opcoesPara(slot: Slot, ctx: ContextoOpcoes): Opcao[] {
  const { identidade, parcial } = ctx;

  switch (slot.kind) {
    case 'trilha': {
      const candidatas = TRILHAS.filter((t) => t.classe === identidade.classe);
      return candidatas.map((t) => ({
        rotulo: t.nome,
        valor: { tipo: 'trilha', trilha: t.nome },
        elegivel: true,
        motivos: [],
        indeterminados: [],
      }));
    }

    case 'trilhaHabilidade': {
      const trilha = TRILHAS.find((t) => t.nome === parcial.trilha);
      const hab = trilha?.habilidades.find((h) => h.nex === slot.nivel);
      if (!hab) {
        return [];
      }
      const internas = hab.escolha?.opcoes ?? [];
      if (internas.length === 0) {
        return [{
          rotulo: hab.nome,
          valor: { tipo: 'habilidadeTrilha', habilidade: hab.nome },
          elegivel: true,
          motivos: [],
          indeterminados: [],
        }];
      }
      return internas.map((interna) => ({
        rotulo: `${hab.nome}: ${interna}`,
        valor: { tipo: 'habilidadeTrilha', habilidade: hab.nome, escolhaInterna: interna },
        elegivel: true,
        motivos: [],
        indeterminados: [],
      }));
    }

    case 'poderClasse':
      return opcoesDePoder(
        [...getPoderesClasse(identidade.classe), ...getPoderesGerais()],
        slot,
        ctx,
      );

    case 'atributo':
      return (['AGI', 'FOR', 'INT', 'PRE', 'VIG'] as const).map((atributo) => ({
        rotulo: atributo,
        valor: { tipo: 'atributo', atributo },
        elegivel: true,
        motivos: [],
        indeterminados: [],
      }));

    case 'afinidade':
      return ELEMENTOS.map((elemento) => ({
        rotulo: elemento,
        valor: { tipo: 'afinidade', elemento },
        elegivel: true,
        motivos: [],
        indeterminados: [],
      }));

    case 'versatilidade':
      return TRILHAS
        .filter((t) => t.classe === identidade.classe && t.nome !== parcial.trilha)
        .map((t) => {
          const primeira = t.habilidades.find((h) => h.nex === 10 || h.nex === 2);
          return {
            rotulo: primeira ? `${t.nome}: ${primeira.nome}` : t.nome,
            valor: { tipo: 'versatilidade' as const, trilha: t.nome },
            elegivel: true,
            motivos: [],
            indeterminados: [],
          };
        });

    case 'ritual': {
      const teto = circuloMaximoPorNivel(slot.nivel);
      const conhecidos = new Set(parcial.rituais);
      return RITUAIS.map((ritual) => {
        const motivos: string[] = [];
        if (ritual.circulo > teto) {
          motivos.push(`Círculo ${ritual.circulo} exige NEX maior (acessível até ${teto}º neste marco)`);
        }
        if (conhecidos.has(ritual.nome)) motivos.push('Você já conhece este ritual');
        if (ritual.elemento === 'Medo') motivos.push('Rituais de Medo não são concedidos por progressão');
        return {
          rotulo: `${ritual.nome} (${ritual.circulo}º, ${ritual.elemento})`,
          valor: { tipo: 'ritual', ritual: ritual.nome },
          elegivel: motivos.length === 0,
          motivos,
          indeterminados: [],
        };
      });
    }

    case 'poderParanormal':
      return opcoesDePoder(getPoderesParanormais(), slot, ctx);

    case 'poderDiletante':
      return opcoesDePoder(getPoderesForaDaClasse(identidade.classe), slot, ctx);

    case 'origem': {
      const possuidos = new Set(parcial.poderes.map((p) => p.nome));
      return ORIGENS
        .filter((o) => o.nome !== identidade.origem)
        .map((o) => {
          const motivos = possuidos.has(o.poder.nome)
            ? ['Você já possui este poder']
            : [];
          return {
            rotulo: `${o.nome}: ${o.poder.nome}`,
            valor: { tipo: 'origem' as const, origem: o.nome },
            elegivel: motivos.length === 0,
            motivos,
            indeterminados: [],
          };
        });
    }

    case 'escolhaInterna':
      return opcoesDeEscolhaInterna(slot, ctx);

    case 'pericia': {
      const graus = ctx.graus ?? grausVazios();
      return TODAS_PERICIAS.map((pericia) => {
        const grau = graus[pericia] ?? 'Destreinado';
        const motivos = grau === 'Destreinado'
          ? ['Só perícias já treinadas podem ser promovidas neste marco']
          : grau === 'Expert'
            ? ['Já está no grau máximo (expert)']
            : [];
        return {
          rotulo: `${pericia} (${grau})`,
          valor: { tipo: 'pericias', pericias: [pericia] },
          elegivel: motivos.length === 0,
          motivos,
          indeterminados: [],
        };
      });
    }
  }
}

export function opcoesElegiveis(slot: Slot, ctx: ContextoOpcoes): Opcao[] {
  return opcoesPara(slot, ctx).filter((o) => o.elegivel);
}

export function opcoesParanormais(slot: Slot, ctx: ContextoOpcoes): Opcao[] {
  return opcoesDePoder(getPoderesParanormais(), slot, ctx);
}

const simples = (rotulo: string, valor: string): Opcao => ({
  rotulo,
  valor: { tipo: 'escolhaInterna', valor },
  elegivel: true,
  motivos: [],
  indeterminados: [],
});

function opcoesDeEscolhaInterna(slot: Slot, ctx: ContextoOpcoes): Opcao[] {
  const poder = PODERES.find((p) => p.nome === slot.poderPai);
  const escolha = poder?.escolha;
  if (!escolha) return [];

  if (escolha.opcoes?.length) return escolha.opcoes.map((o) => simples(o, o));

  switch (escolha.tipo) {
    case 'ritual':
      return ctx.parcial.rituais.map((r) => simples(r, r));
    case 'elemento':
      return ELEMENTOS.filter((e) => e !== 'Medo').map((e) => simples(e, e));
    case 'atributo':
      return (['AGI', 'FOR', 'INT', 'PRE', 'VIG'] as const).map((a) => simples(a, a));
    case 'pericia': {
      const graus = ctx.graus ?? grausVazios();
      return TODAS_PERICIAS.map((pericia) => {
        const grau = graus[pericia] ?? 'Destreinado';
        return { ...simples(`${pericia} (${grau})`, pericia) };
      });
    }
    default:
      return [];
  }
}
