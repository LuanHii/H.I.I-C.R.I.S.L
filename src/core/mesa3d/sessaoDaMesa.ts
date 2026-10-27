/**
 * O que a Mesa 3D muda numa ficha durante a sessão, aplicado no registro do site.
 *
 * A mesa manda o ESTADO (não a diferença): os recursos atuais, as condições e o
 * inventário como estão lá. Mandar estado e não "PV −5" é o que deixa a fila da mesa
 * sobreviver sem internet: repetir o envio dá o mesmo resultado, e duas mudanças
 * seguidas não se somam duas vezes.
 *
 * Quem grava é o código do site (`prepararGravacao`), o mesmo do botão salvar: a mesa
 * não tem uma segunda cópia do motor. Nada de construção passa por aqui — atributos,
 * NEX, poderes, máximos são do site.
 */
import type { Item, Personagem } from '../types';
import { prepararGravacao, type RegistroComDocumento } from '../storage/gravacaoDeSessao';
import { ehCondicao } from '../rules/condicoes';
import { calcularCarga } from '../../logic/rulesEngine';

export type RecursoDaMesa = 'pv' | 'san' | 'pe' | 'pd';

export interface ItemDaMesa {
  nome: string;
  tipo?: string;
  categoria?: number;
  espaco?: number;
  descricao?: string;
  qtd?: number;
  /** Arma criada na mesa: o ataque dela vira `stats`. */
  ataque?: { dano?: string; critico?: string; alcance?: string; tipo_dano?: string };
}

export interface MudancaDaMesa {
  recursos?: Partial<Record<RecursoDaMesa, { atual: number; temp?: number }>>;
  condicoes?: string[];
  itens?: ItemDaMesa[];
}

export interface RegistroDaMesa extends RegistroComDocumento {
  personagem: Personagem;
  atualizadoEm?: string;
  [campo: string]: unknown;
}

export interface Aplicado {
  registro: RegistroDaMesa;
  estrutural: boolean;
  divergiu: string[];
}

const LIMITE_ITENS = 500;

/** Confere o corpo do pedido. Volta o motivo da recusa, ou null. */
export function validarMudanca(m: unknown): string | null {
  if (!m || typeof m !== 'object') return 'corpo sem mudança';
  const x = m as MudancaDaMesa;
  if (x.recursos !== undefined) {
    if (typeof x.recursos !== 'object' || x.recursos === null) return 'recursos inválidos';
    for (const [k, v] of Object.entries(x.recursos)) {
      if (!['pv', 'san', 'pe', 'pd'].includes(k)) return `recurso desconhecido: ${k}`;
      if (!v || !Number.isFinite(v.atual)) return `${k} sem valor`;
    }
  }
  if (x.condicoes !== undefined && (!Array.isArray(x.condicoes) || x.condicoes.some((c) => typeof c !== 'string'))) {
    return 'condições inválidas';
  }
  if (x.itens !== undefined) {
    if (!Array.isArray(x.itens) || x.itens.length > LIMITE_ITENS) return 'itens inválidos';
    if (x.itens.some((i) => !i || typeof i.nome !== 'string' || i.nome.trim() === '')) return 'item sem nome';
  }
  return null;
}

const limitar = (v: number, max: number) => Math.min(Math.max(0, Math.round(v)), Math.max(0, max));

/**
 * O inventário da mesa como `equipamentos` do site. Cada item da mesa reaproveita o
 * objeto que o site já tinha com o mesmo nome (e tipo), para não perder o que a mesa
 * não guarda (modificações, livro, stats completos); o item novo é montado com o que
 * a mesa sabe. A mesa conta quantidade (`qtd`); o site guarda um por entrada.
 */
export function paraEquipamentos(itens: ItemDaMesa[], existentes: Item[]): Item[] {
  const sobra = [...existentes];
  const out: Item[] = [];
  const mesmo = (it: ItemDaMesa) => (e: Item) => e.nome === it.nome && (!it.tipo || e.tipo === it.tipo);
  for (const it of itens) {
    const qtd = Math.min(99, Math.max(1, Math.round(it.qtd ?? 1)));
    for (let k = 0; k < qtd; k++) {
      const i = sobra.findIndex(mesmo(it));
      if (i >= 0) {
        out.push(sobra.splice(i, 1)[0]);
        continue;
      }
      // a mesa tem mais unidades que o site: a nova é cópia de uma que o site já tem
      const modelo = existentes.find(mesmo(it));
      out.push(modelo ? clonar(modelo) : itemNovo(it));
    }
  }
  return out;
}

function itemNovo(it: ItemDaMesa): Item {
  const categoria = Math.min(4, Math.max(0, Math.round(it.categoria ?? 0))) as Item['categoria'];
  const item: Item = {
    nome: it.nome.trim(),
    categoria,
    espaco: Number.isFinite(it.espaco) ? Number(it.espaco) : 0,
    tipo: (it.tipo || 'Geral') as Item['tipo'],
    descricao: it.descricao ?? '',
    livro: 'Regras Básicas',
  };
  if (it.ataque?.dano) {
    item.stats = {
      dano: it.ataque.dano,
      critico: it.ataque.critico || 'x2',
      alcance: it.ataque.alcance || undefined,
      tipoDano: it.ataque.tipo_dano || undefined,
    };
  }
  return item;
}

/**
 * Cópia funda só de objetos e listas simples. Não é structuredClone porque o
 * registro lido do Firestore pode trazer valores com tipo próprio (ValorCru, um
 * timestamp), e o structuredClone tira a classe deles: na regravação, o timestamp
 * viraria um mapa.
 */
function clonar<T>(v: T): T {
  if (Array.isArray(v)) return v.map(clonar) as T;
  if (v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) out[k] = clonar(x);
    return out as T;
  }
  return v;
}

export function aplicarSessaoDaMesa(registro: RegistroDaMesa, mudanca: MudancaDaMesa, agora: string): Aplicado {
  const p: Personagem = clonar(registro.personagem);

  for (const [k, v] of Object.entries(mudanca.recursos ?? {}) as [RecursoDaMesa, { atual: number; temp?: number }][]) {
    const r = p[k];
    if (!r) continue;                      // a ficha não usa PD: a mesa não cria
    r.atual = limitar(v.atual, r.max);
    if (k === 'pv' && v.temp !== undefined && Number.isFinite(v.temp)) {
      p.pv.temp = Math.max(0, Math.round(v.temp));
    }
  }

  if (mudanca.condicoes) {
    // efeitosAtivos mistura condições e outros efeitos; a mesa só manda nas condições
    const outros = (p.efeitosAtivos ?? []).filter((e) => !ehCondicao(e));
    const condicoes = mudanca.condicoes.filter((c, i, todas) => ehCondicao(c) && todas.indexOf(c) === i);
    p.efeitosAtivos = [...outros, ...condicoes];
  }

  if (mudanca.itens) {
    p.equipamentos = paraEquipamentos(mudanca.itens, p.equipamentos ?? []);
    // ficha sem o documento novo: a carga não é refeita pelo paraPersonagem
    const c = calcularCarga({ atributos: p.atributos, itens: p.equipamentos, poderes: p.poderes ?? [] });
    p.carga = { ...p.carga, atual: c.atual, maxima: p.carga?.maxima ?? c.maxima };
  }

  const gravacao = prepararGravacao(registro, p, agora);
  const camposV2 = registro.ficha ? { ficha: gravacao.ficha, fichaMigradaDe: gravacao.fichaMigradaDe } : {};
  return {
    registro: { ...registro, ...camposV2, personagem: gravacao.personagem, atualizadoEm: agora },
    estrutural: gravacao.estrutural,
    divergiu: gravacao.divergiu,
  };
}
