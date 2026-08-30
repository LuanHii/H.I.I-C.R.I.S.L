import type { AtributoKey, Atributos, Elemento, GrauTreinamento, PericiaName, Poder } from '../types';
import { chaveDeComparacao, normalizarElemento, normalizarPericia } from './pericias';
import { RITUAIS } from '../../data/magic/rituals';

export type Requisito =
  | { tipo: 'atributo'; atributo: AtributoKey; minimo: number }
  | { tipo: 'nex'; minimo: number }
  | { tipo: 'pericia'; pericias: PericiaName[]; modo: 'todas' | 'qualquer' }
  | { tipo: 'proficiencia'; proficiencia: string }
  | { tipo: 'poder'; poder: string }
  | { tipo: 'elemento'; elemento: Elemento; quantidade: number }
  | { tipo: 'periciaEscolhida' };

export interface EstadoParaRequisitos {
  nex: number;
  atributos: Atributos;
  pericias: Record<PericiaName, GrauTreinamento>;
  poderes: Poder[];
  proficiencias?: string[];
}

export interface ResultadoRequisitos {
  elegivel: boolean;
  motivo?: string;
  motivos: string[];
  indeterminados: string[];
}

export const ELEGIVEL: ResultadoRequisitos = { elegivel: true, motivos: [], indeterminados: [] };

const SIGLAS_ATRIBUTO: Record<string, AtributoKey> = {
  for: 'FOR',
  agi: 'AGI',
  vig: 'VIG',
  int: 'INT',
  pre: 'PRE',
};

const RE_NEX = /\bnex\s*(\d+)\s*%?/gi;
const RE_ATRIBUTO = /\b(for|agi|vig|int|pre)\s*(\d+)/gi;
const RE_PERICIA_ESCOLHIDA = /\btreinad[oa]\s+n[ao]\s+per[íi]cia\s+escolhida/gi;
const RE_TREINADO = /\btreinad[oa]\s+em\s+([^,;]+(?:\s*,\s*[^,;]+)*)/gi;
const RE_PROFICIENCIA = /\bprofici[êe]ncia\s+em\s+([^,;]+)/gi;
const RE_ELEMENTO = /\b(morte|sangue|conhecimento|energia|medo)\s*(\d+)/gi;
const RE_PODER = /^\s*([A-ZÀ-Ý][^,;()]*?)(?:\s*\([^)]*\))?\s*$/;

function listarPericias(bruto: string): { pericias: PericiaName[]; modo: 'todas' | 'qualquer'; resto: string } {
  const partes = bruto
    .split(/\s*,\s*|\s+ou\s+|\s+e\s+/i)
    .map((parte) => parte.trim())
    .filter(Boolean);

  const pericias: PericiaName[] = [];
  const naoReconhecidas: string[] = [];

  for (const parte of partes) {
    const pericia = normalizarPericia(parte);
    if (pericia) pericias.push(pericia);
    else naoReconhecidas.push(parte);
  }

  const temOu = /\s+ou\s+/i.test(bruto);
  const temVirgula = /,/.test(bruto);
  const modo: 'todas' | 'qualquer' = temOu || (temVirgula && pericias.length > 1 && !/\s+e\s+/i.test(bruto))
    ? 'qualquer'
    : 'todas';

  return { pericias, modo, resto: naoReconhecidas.join(', ') };
}

export function parseRequisitos(texto?: string): { requisitos: Requisito[]; naoInterpretado: string[] } {
  if (!texto || texto.trim().length === 0) return { requisitos: [], naoInterpretado: [] };

  const requisitos: Requisito[] = [];
  let restante = texto;

  const consumir = (regex: RegExp, aoCasar: (m: RegExpExecArray) => void) => {
    const encontrados: string[] = [];
    regex.lastIndex = 0;
    let m = regex.exec(restante);
    while (m !== null) {
      aoCasar(m);
      encontrados.push(m[0]);
      m = regex.exec(restante);
    }
    for (const trecho of encontrados) restante = restante.replace(trecho, ' ');
  };

  consumir(RE_PERICIA_ESCOLHIDA, () => {
    requisitos.push({ tipo: 'periciaEscolhida' });
  });

  consumir(RE_NEX, (m) => {
    requisitos.push({ tipo: 'nex', minimo: parseInt(m[1], 10) });
  });

  consumir(RE_ELEMENTO, (m) => {
    const elemento = normalizarElemento(m[1]);
    if (elemento) requisitos.push({ tipo: 'elemento', elemento, quantidade: parseInt(m[2], 10) });
  });

  consumir(RE_ATRIBUTO, (m) => {
    const atributo = SIGLAS_ATRIBUTO[m[1].toLowerCase()];
    if (atributo) requisitos.push({ tipo: 'atributo', atributo, minimo: parseInt(m[2], 10) });
  });

  consumir(RE_PROFICIENCIA, (m) => {
    requisitos.push({ tipo: 'proficiencia', proficiencia: m[1].trim() });
  });

  consumir(RE_TREINADO, (m) => {
    const { pericias, modo, resto } = listarPericias(m[1]);
    if (pericias.length > 0) requisitos.push({ tipo: 'pericia', pericias, modo });
    if (resto.length > 0) restante += `, ${resto}`;
  });

  const naoInterpretado: string[] = [];
  for (const segmento of restante.split(/[,;]/)) {
    const limpo = segmento.trim();
    if (limpo.length === 0) continue;
    const comoPoder = limpo.match(RE_PODER);
    if (comoPoder) requisitos.push({ tipo: 'poder', poder: comoPoder[1].trim() });
    else naoInterpretado.push(limpo);
  }

  return { requisitos, naoInterpretado };
}

function grauDe(estado: EstadoParaRequisitos, pericia: PericiaName): GrauTreinamento {
  return estado.pericias?.[pericia] ?? 'Destreinado';
}

function temPericia(estado: EstadoParaRequisitos, pericia: PericiaName): boolean {
  return grauDe(estado, pericia) !== 'Destreinado';
}

/**
 * Elemento efetivo de um poder paranormal.
 *
 * Quase todos declaram `elemento` no catálogo. Aprender Ritual é a exceção, e o
 * livro resolve a exceção explicitamente (Ordem:4156): "Este poder conta como um
 * poder do elemento do ritual escolhido." O elemento vem, então, do ritual que o
 * jogador escolheu — registrado em `escolhaInterna` na instância da ficha.
 *
 * Exportada porque `contarPoderesElemento` em `data/character/powers.ts`
 * respondia à mesma pergunta com outra regra (sem sequer checar
 * `tipo === 'Paranormal'`), e duas contagens divergentes de elemento é como um
 * poder fica elegível numa tela e bloqueado na outra.
 */
export function elementoEfetivo(poder: Poder): Elemento | undefined {
  if (poder.tipo !== 'Paranormal') return undefined;
  if (poder.elemento) return poder.elemento;
  if (!poder.escolhaInterna) return undefined;
  return RITUAIS.find((r) => r.nome === poder.escolhaInterna)?.elemento;
}

function contarPoderesDeElemento(estado: EstadoParaRequisitos, elemento: Elemento): number {
  return (estado.poderes ?? []).filter((poder) => elementoEfetivo(poder) === elemento).length;
}

function possuiPoder(estado: EstadoParaRequisitos, nome: string): boolean {
  const alvo = chaveDeComparacao(nome);
  return (estado.poderes ?? []).some((poder) => chaveDeComparacao(poder.nome) === alvo);
}

function possuiProficiencia(estado: EstadoParaRequisitos, proficiencia: string): boolean {
  const alvo = chaveDeComparacao(proficiencia);
  return (estado.proficiencias ?? []).some((atual) => chaveDeComparacao(atual) === alvo);
}

export function avaliarRequisitos(
  requisitos: readonly Requisito[],
  estado: EstadoParaRequisitos,
): ResultadoRequisitos {
  const motivos: string[] = [];
  const indeterminados: string[] = [];

  for (const requisito of requisitos) {
    switch (requisito.tipo) {
      case 'atributo': {
        const atual = estado.atributos?.[requisito.atributo] ?? 0;
        if (atual < requisito.minimo) {
          motivos.push(`Requer ${requisito.atributo} ${requisito.minimo} (você tem ${atual})`);
        }
        break;
      }
      case 'nex': {
        if ((estado.nex ?? 0) < requisito.minimo) {
          motivos.push(`Requer NEX ${requisito.minimo}% (você tem ${estado.nex ?? 0}%)`);
        }
        break;
      }
      case 'pericia': {
        if (requisito.modo === 'todas') {
          const faltando = requisito.pericias.filter((pericia) => !temPericia(estado, pericia));
          if (faltando.length > 0) {
            motivos.push(`Requer treinamento em ${faltando.join(' e ')}`);
          }
        } else if (!requisito.pericias.some((pericia) => temPericia(estado, pericia))) {
          motivos.push(`Requer treinamento em ${requisito.pericias.join(' ou ')}`);
        }
        break;
      }
      case 'proficiencia': {
        if (!possuiProficiencia(estado, requisito.proficiencia)) {
          motivos.push(`Requer proficiência em ${requisito.proficiencia}`);
        }
        break;
      }
      case 'poder': {
        if (!possuiPoder(estado, requisito.poder)) {
          motivos.push(`Requer o poder ${requisito.poder}`);
        }
        break;
      }
      case 'elemento': {
        const atual = contarPoderesDeElemento(estado, requisito.elemento);
        if (atual < requisito.quantidade) {
          motivos.push(`Requer ${requisito.quantidade} poder(es) de ${requisito.elemento} (você tem ${atual})`);
        }
        break;
      }
      case 'periciaEscolhida': {
        indeterminados.push('Requer treinamento na perícia escolhida por outro poder');
        break;
      }
    }
  }

  return {
    elegivel: motivos.length === 0,
    motivo: motivos[0],
    motivos,
    indeterminados,
  };
}

export function requisitosDoPoder(poder: Poder): Requisito[] {
  if (poder.preRequisitos && poder.preRequisitos.length > 0) return poder.preRequisitos;
  return parseRequisitos(poder.requisitos).requisitos;
}

export function avaliarPoder(poder: Poder, estado: EstadoParaRequisitos): ResultadoRequisitos {
  return avaliarRequisitos(requisitosDoPoder(poder), estado);
}
