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
import { calcularRecursosClasse } from '../../rules/recursos';
import type { EstadoParcial } from '../slots';
import type { AjustesGm, EstadoSessao, FichaIdentidade, Escolha, PoderDerivado } from '../tipos';

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
    beneficioOrigem: identidade.beneficioOrigem,
    trilhaNome: entrada.parcial.trilha,
    marcas: sessao.marcas,
    poderes: entrada.poderes.map((p) => ({ nome: p.nome })),
    qtdTranscender: entrada.poderes.filter((p) => p.nome === 'Transcender').length,
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

  const pvMax = Math.max(1, recursos.pv + (ajustes.pvMaxDelta ?? 0));
  const peMax = Math.max(0, recursos.pe + (ajustes.peMaxDelta ?? 0));
  const sanMax = Math.max(0, recursos.san + (ajustes.sanMaxDelta ?? 0));
  const pdMax = recursos.pd === undefined
    ? undefined
    : Math.max(0, recursos.pd + (ajustes.pdMaxDelta ?? 0));

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
