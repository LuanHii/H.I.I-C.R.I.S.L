import type {
  Atributos,
  ClasseName,
  GrauTreinamento,
  PericiaName,
  PericiaDetalhada,
} from '../../types';
import { CLASSES } from '../../../data/character/classes';
import { ORIGENS } from '../../../data/character/origins';
import { TODAS_PERICIAS } from '../../rules/pericias';
import { grauAlvoPromocao } from '../../rules/progressao';
import { calcularPericiasDetalhadas } from '../../../logic/rulesEngine';
import { calcularRecursosClasse } from '../../../logic/progression';
import type { EstadoParcial } from '../slots';
import type { AjustesGm, EstadoSessao, FichaIdentidade, Escolha, PoderDerivado } from '../tipos';

/**
 * Etapa de derivação: transforma o resultado do fold em números da ficha.
 *
 * Reaproveita `calculateDerivedStats` e `calcularPericiasDetalhadas` do motor
 * existente de propósito. São as funções puras boas do repo, já cobertas por
 * tabela golden — reescrevê-las criaria uma terceira fonte de verdade para as
 * mesmas fórmulas, que é exatamente o problema que este plano combate.
 *
 * O que muda aqui é a ORDEM e a PROCEDÊNCIA das entradas: tudo vem de
 * `(identidade, progressao, escolhas, ajustes)`, nunca de um campo persistido
 * que precise ser reconciliado depois.
 */

export interface EntradaDerivacao {
  identidade: FichaIdentidade;
  atributos: Atributos;
  nivel: number;
  parcial: EstadoParcial;
  escolhas: readonly Escolha[];
  sessao: EstadoSessao;
  ajustes: AjustesGm;
  patente: string;
  poderes: readonly PoderDerivado[];
}

export interface Derivados {
  graus: Record<PericiaName, GrauTreinamento>;
  periciasDetalhadas: Record<PericiaName, PericiaDetalhada>;
  pv: { atual: number; max: number; machucado: number };
  pe: { atual: number; max: number };
  san: { atual: number; max: number; perturbado: boolean };
  pd?: { atual: number; max: number };
  patente: string;
  defesa: number;
  deslocamento: number;
  /** Limite de PE por rodada (NEX ÷ 5). */
  peRodada: number;
}

function grausIniciais(
  classe: ClasseName,
  periciasLivres: readonly PericiaName[],
): Record<PericiaName, GrauTreinamento> {
  const graus = Object.fromEntries(
    TODAS_PERICIAS.map((p) => [p, 'Destreinado' as GrauTreinamento]),
  ) as Record<PericiaName, GrauTreinamento>;

  for (const pericia of CLASSES[classe].periciasObrigatorias) graus[pericia] = 'Treinado';
  for (const pericia of periciasLivres) graus[pericia] = 'Treinado';
  return graus;
}

/**
 * Aplica as promoções de grau vindas das escolhas de perícia.
 *
 * Cada escolha carrega o nível no id, então o grau-alvo é o daquele marco —
 * NEX 35 promove para veterano, NEX 70 para expert. Uma perícia destreinada não
 * é promovida (a enumeração já a marca inelegível, mas um documento migrado
 * pode conter a escolha inválida).
 */
function aplicarPromocoes(
  graus: Record<PericiaName, GrauTreinamento>,
  escolhas: readonly Escolha[],
): void {
  const dePericia = escolhas.filter((e) => e.valor.tipo === 'pericias');

  for (const escolha of dePericia) {
    if (escolha.valor.tipo !== 'pericias') continue;
    const nivel = Number(escolha.id.match(/@(?:nex|est):(\d+)#/)?.[1] ?? 0);
    const alvo = grauAlvoPromocao(nivel);

    for (const pericia of escolha.valor.pericias) {
      if (graus[pericia] === 'Destreinado') continue;
      // Nunca rebaixa: se já está acima do alvo do marco, mantém.
      if (ordem(graus[pericia]) >= ordem(alvo)) continue;
      graus[pericia] = alvo;
    }
  }
}

const ORDEM_GRAU: GrauTreinamento[] = ['Destreinado', 'Treinado', 'Veterano', 'Expert'];
const ordem = (g: GrauTreinamento) => ORDEM_GRAU.indexOf(g);

export function derivar(entrada: EntradaDerivacao): Derivados {
  const { identidade, atributos, nivel, escolhas, sessao, ajustes } = entrada;

  const graus = grausIniciais(identidade.classe, identidade.periciasLivres);
  aplicarPromocoes(graus, escolhas);

  const origem = ORIGENS.find((o) => o.nome === identidade.origem);

  const recursos = calcularRecursosClasse({
    classe: identidade.classe,
    atributos,
    nex: identidade.classe === 'Sobrevivente' ? 0 : nivel,
    estagio: identidade.classe === 'Sobrevivente' ? nivel : undefined,
    patente: entrada.patente as never,
    usarPd: sessao.pdGasto !== undefined,
    origemNome: origem?.nome,
    trilhaNome: entrada.parcial.trilha,
    marcas: sessao.marcas,
    poderes: entrada.poderes.map((p) => ({ nome: p.nome })),
    periciasTreinadas: (Object.entries(graus) as [PericiaName, GrauTreinamento][])
      .filter(([, g]) => g !== 'Destreinado')
      .map(([nome]) => nome),
  });

  const somar = (
    base: Partial<Record<PericiaName, number>> | undefined,
    extra: Partial<Record<PericiaName, number>>,
  ) => {
    const saida: Partial<Record<PericiaName, number>> = { ...(base ?? {}) };
    for (const [pericia, valor] of Object.entries(extra) as [PericiaName, number][]) {
      saida[pericia] = (saida[pericia] ?? 0) + valor;
    }
    return saida;
  };

  const periciasDetalhadas = calcularPericiasDetalhadas(atributos, graus, {
    fixos: somar(ajustes.periciaFixos, recursos.periciaBonus),
    dados: recursos.periciaDados,
  });

  /*
   * Ajustes do mestre entram como DELTA.
   *
   * No motor antigo `overrides.pvMax` é absoluto, então quem ajusta PV uma vez
   * para de ganhar PV para sempre. Em delta o ajuste compõe com a progressão.
   */
  const pvMax = Math.max(1, recursos.pv + (ajustes.pvMaxDelta ?? 0));
  const peMax = Math.max(0, recursos.pe + (ajustes.peMaxDelta ?? 0));
  const sanMax = Math.max(0, recursos.san + (ajustes.sanMaxDelta ?? 0));
  const pdMax = recursos.pd === undefined
    ? undefined
    : Math.max(0, recursos.pd + (ajustes.pdMaxDelta ?? 0));

  /*
   * Guardamos DANO, não valor atual. As cinco reconciliações divergentes do
   * motor antigo colapsam nesta linha, e `machucado`/`perturbado` caem de graça.
   */
  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

  return {
    graus,
    periciasDetalhadas,
    pv: {
      max: pvMax,
      atual: clamp(pvMax - sessao.pvDano, 0, pvMax),
      machucado: Math.floor(pvMax / 2),
    },
    pe: { max: peMax, atual: clamp(peMax - sessao.peGasto, 0, peMax) },
    san: {
      max: sanMax,
      atual: clamp(sanMax - sessao.sanPerdida, 0, sanMax),
      perturbado: clamp(sanMax - sessao.sanPerdida, 0, sanMax) <= Math.floor(sanMax / 2),
    },
    pd: pdMax === undefined ? undefined : {
      max: pdMax,
      atual: clamp(pdMax - (sessao.pdGasto ?? 0), 0, pdMax),
    },
    patente: entrada.patente,
    defesa: recursos.defesa + (ajustes.defesaDelta ?? 0),
    deslocamento: recursos.deslocamento,
    peRodada: recursos.limitePeRodada,
  };
}
