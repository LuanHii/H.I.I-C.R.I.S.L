import type { Personagem } from '../types';

/**
 * Uma "mesa" e o que um mundo do Foundry enxerga das fichas do mestre.
 *
 * Existe porque o Foundry nao consegue logar no H.I.I-C.R.I.S: o login e so
 * Google por popup, e o Google recusa popups vindos de `localhost`, de IP da
 * rede ou do app desktop do Foundry. Entao o site publica, num documento de
 * leitura publica e id impossivel de adivinhar, a lista de fichas que aquele
 * mundo pode vincular. O Foundry so le.
 */
export interface MesaFoundry {
  id: string;
  ownerId: string;
  nome: string;
  /** Inclui toda campanha, inclusive as criadas depois, e fichas sem campanha. */
  todasAsCampanhas: boolean;
  campanhas: string[];
  /** Fichas de jogadores que o mestre acompanha (`watchedFichas`). */
  incluirAcompanhadas: boolean;
  fichas: FichaDaMesa[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface FichaDaMesa {
  agentId: string;
  nome: string;
  classe: string;
  nex: number;
  campanhaId: string | null;
  campanhaNome: string | null;
  origem: 'propria' | 'acompanhada';
}

export type ConfiguracaoDaMesa = Pick<MesaFoundry, 'todasAsCampanhas' | 'campanhas' | 'incluirAcompanhadas'>;

export interface FichaPropria {
  id: string;
  personagem: Pick<Personagem, 'nome' | 'classe' | 'nex'>;
  campanha?: string;
}

export interface CampanhaDaMesa {
  id: string;
  nome: string;
  ordem: number;
}

export interface FichaAcompanhada {
  agentId: string;
  nome: string;
  classe: string;
  nex: number;
}

/** Rotulo do grupo das fichas acompanhadas na lista do Foundry. */
export const GRUPO_ACOMPANHADAS = 'Jogadores acompanhados';

/**
 * Lista de fichas que a mesa publica, em ordem de exibicao: campanhas na ordem
 * do mestre, fichas sem campanha, depois as acompanhadas; nome dentro do grupo.
 *
 * Ficha propria que o mestre tambem acompanha aparece uma vez so, como propria:
 * vincular duas vezes o mesmo `agentId` criaria dois Actors para a mesma ficha.
 */
export function montarFichasDaMesa(
  config: ConfiguracaoDaMesa,
  fichas: FichaPropria[],
  campanhas: CampanhaDaMesa[],
  acompanhadas: FichaAcompanhada[],
): FichaDaMesa[] {
  const campanhaPorId = new Map(campanhas.map((c) => [c.id, c]));
  const selecionadas = new Set(config.campanhas);

  const proprias: (FichaDaMesa & { ordem: number })[] = fichas
    .filter((f) => {
      if (config.todasAsCampanhas) return true;
      return f.campanha !== undefined && selecionadas.has(f.campanha);
    })
    .map((f) => {
      const campanha = f.campanha ? campanhaPorId.get(f.campanha) : undefined;
      return {
        agentId: f.id,
        nome: f.personagem.nome || 'Agente sem nome',
        classe: f.personagem.classe ?? '',
        nex: Number(f.personagem.nex) || 0,
        campanhaId: campanha?.id ?? null,
        campanhaNome: campanha?.nome ?? null,
        origem: 'propria' as const,
        // Ficha cuja campanha foi apagada cai junto das sem campanha.
        ordem: campanha ? campanha.ordem : Number.MAX_SAFE_INTEGER - 1,
      };
    });

  const idsProprios = new Set(proprias.map((f) => f.agentId));
  const deJogadores = config.incluirAcompanhadas
    ? acompanhadas
      .filter((f) => !idsProprios.has(f.agentId))
      .map((f) => ({
        agentId: f.agentId,
        nome: f.nome || 'Agente sem nome',
        classe: f.classe ?? '',
        nex: Number(f.nex) || 0,
        campanhaId: null,
        campanhaNome: GRUPO_ACOMPANHADAS,
        origem: 'acompanhada' as const,
        ordem: Number.MAX_SAFE_INTEGER,
      }))
    : [];

  return [...proprias, ...deJogadores]
    .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, 'pt-BR'))
    .map(({ ordem: _ordem, ...ficha }) => ficha);
}

const CAMPOS_DA_FICHA: (keyof FichaDaMesa)[] = [
  'agentId', 'nome', 'classe', 'nex', 'campanhaId', 'campanhaNome', 'origem',
];

/**
 * Igualdade campo a campo. O Firestore nao preserva a ordem das chaves, entao
 * comparar por `JSON.stringify` daria "diferente" para sempre e o publicador
 * regravaria a mesa a cada escuta, em laco.
 */
export function mesmasFichas(a: FichaDaMesa[], b: FichaDaMesa[]): boolean {
  return a.length === b.length
    && a.every((ficha, i) => CAMPOS_DA_FICHA.every((campo) => (ficha[campo] ?? null) === (b[i][campo] ?? null)));
}

/**
 * Codigo de pareamento gerado pelo Foundry. Alfabeto sem 0/O/1/I para poder ser
 * lido em voz alta ou digitado sem ambiguidade se o link nao abrir sozinho.
 */
export const ALFABETO_DO_CODIGO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const TAMANHO_DO_CODIGO = 10;

export function codigoDePareamentoValido(codigo: unknown): codigo is string {
  return typeof codigo === 'string'
    && codigo.length === TAMANHO_DO_CODIGO
    && codigo.split('').every((c) => ALFABETO_DO_CODIGO.includes(c));
}

/** Aceita o codigo como o usuario digitar: minusculas, espacos e hifens. */
export function normalizarCodigo(entrada: string): string {
  return entrada.toUpperCase().replace(/[\s-]/g, '');
}
