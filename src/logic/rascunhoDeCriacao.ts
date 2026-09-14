import type { Atributos, ClasseName, Item, Origem, Patente, PericiaName, Personagem, Trilha, Weapow } from '../core/types';
import { ORIGENS } from '../data/character/origins';
import { TRILHAS } from '../data/character/tracks';
import { RITUAIS } from '../data/magic/rituals';
import { PODERES } from '../data/character/powers';
import { validateAttributes } from '../core/rules/attributes';
import { TODAS_PERICIAS } from '../core/rules/pericias';
import { buildFicha, type BuildResultado } from '../core/ficha/buildFicha';
import { criarFicha, type DadosDeCriacao } from '../core/ficha/criacao';
import { pendenciasResolviveis } from '../core/ficha/pendencias';
import type { FichaPersistida } from '../core/ficha/tipos';
import { calcularPericiasDisponiveis, type ClassePreferencias } from './rulesEngine';
import { INITIAL_STATE, finalizarCriacao, type CreationState } from './creationWorkflow';
import type { RecreateDraft } from './recreateFromPersonagem';

export type EtapaId = 'identidade' | 'atributos' | 'origem' | 'classe' | 'pericias' | 'rituais' | 'equipamento' | 'revisao';

export type TipoDePersonagem = 'Agente' | 'Sobrevivente';

export interface Rascunho {
  tipo?: TipoDePersonagem;
  nome: string;
  conceito: string;
  usarPd: boolean;
  atributos: Atributos;
  origem?: string;
  decisaoDeOrigem?: string;
  classe?: ClasseName;
  preferenciasClasse: ClassePreferencias;
  nex: number;
  estagio: number;
  patente: Patente;
  trilha?: string;
  decisoesDeTrilha: Record<string, string>;
  periciasLivres: PericiaName[];
  rituais: string[];
  equipamentos: Item[];
  modificacoes: Record<string, string[]>;
}

export const RASCUNHO_INICIAL: Rascunho = {
  nome: '',
  conceito: '',
  usarPd: false,
  atributos: { AGI: 1, FOR: 1, INT: 1, PRE: 1, VIG: 1 },
  preferenciasClasse: { ofensiva: 'Luta', defensiva: 'Fortitude' },
  nex: 5,
  estagio: 1,
  patente: 'Recruta',
  decisoesDeTrilha: {},
  periciasLivres: [],
  rituais: [],
  equipamentos: [],
  modificacoes: {},
};

export const RITUAIS_INICIAIS = 3;

export function classeDe(r: Rascunho): ClasseName | undefined {
  return r.tipo === 'Sobrevivente' ? 'Sobrevivente' : r.classe;
}

export function nivelDe(r: Rascunho): number {
  return r.tipo === 'Sobrevivente' ? r.estagio : r.nex;
}

export function origemDe(r: Rascunho): Origem | undefined {
  return ORIGENS.find((o) => o.nome === r.origem);
}

export function etapasDe(r: Rascunho): EtapaId[] {
  const etapas: EtapaId[] = ['identidade', 'atributos', 'origem', 'classe', 'pericias'];
  if (classeDe(r) === 'Ocultista') etapas.push('rituais');
  etapas.push('equipamento', 'revisao');
  return etapas;
}

export interface OrcamentoDeAtributos {
  total: number;
  gastos: number;
  restantes: number;
  zeros: number;
  valido: boolean;
  mensagem?: string;
}

export function orcamentoDeAtributos(r: Rascunho): OrcamentoDeAtributos {
  const valores = Object.values(r.atributos);
  const zeros = valores.filter((v) => v === 0).length;
  const base = r.tipo === 'Sobrevivente' ? 3 : 4;
  const total = base + Math.min(1, zeros);
  const gastos = valores.reduce((acc, v) => acc + v, 0) - 5 + zeros;
  const validacao = validateAttributes(r.atributos, classeDe(r) ?? 'Combatente');
  return { total, gastos, restantes: total - gastos, zeros, valido: validacao.valid, mensagem: validacao.message };
}

export function ajustarAtributo(r: Rascunho, atributo: keyof Atributos, delta: 1 | -1): Rascunho {
  const novo = r.atributos[atributo] + delta;
  if (novo < 0 || novo > 3) return r;
  const proposto = { ...r.atributos, [atributo]: novo };
  const zeros = Object.values(proposto).filter((v) => v === 0).length;
  if (zeros > 1) return r;
  const orcamento = orcamentoDeAtributos({ ...r, atributos: proposto });
  if (orcamento.restantes < 0) return r;
  return { ...r, atributos: proposto };
}

export function desbloqueiaTrilha(r: Rascunho): boolean {
  if (r.tipo === 'Sobrevivente') return r.estagio >= 2;
  return r.tipo === 'Agente' && r.nex >= 10;
}

export function trilhasDe(r: Rascunho): Trilha[] {
  const classe = classeDe(r);
  return classe ? TRILHAS.filter((t) => t.classe === classe) : [];
}

export function habilidadesDesbloqueadas(r: Rascunho): Trilha['habilidades'] {
  const trilha = trilhasDe(r).find((t) => t.nome === r.trilha);
  if (!trilha) return [];
  return trilha.habilidades.filter((h) => h.nex <= nivelDe(r));
}

export function habilidadesComDecisao(r: Rascunho): Trilha['habilidades'] {
  return habilidadesDesbloqueadas(r).filter((h) => (h.escolha?.opcoes?.length ?? 0) > 0);
}

export interface MetaDePericias {
  qtdEscolhaLivre: number;
  qtdEscolhaOrigem: number;
  total: number;
  obrigatorias: PericiaName[];
  escolhiveis: PericiaName[];
  sugestao: PericiaName[];
}

export function metaDePericias(r: Rascunho): MetaDePericias | null {
  const classe = classeDe(r);
  const origem = origemDe(r);
  if (!classe || !origem) return null;
  const meta = calcularPericiasDisponiveis(classe, r.atributos.INT, origem, classe === 'Combatente' ? r.preferenciasClasse : undefined);
  const obrigatorias = new Set(meta.obrigatorias);
  const escolhiveis = TODAS_PERICIAS.filter((p) => !obrigatorias.has(p));
  const total = meta.qtdEscolhaLivre + (meta.qtdEscolhaOrigem ?? 0);
  return {
    qtdEscolhaLivre: meta.qtdEscolhaLivre,
    qtdEscolhaOrigem: meta.qtdEscolhaOrigem ?? 0,
    total,
    obrigatorias: meta.obrigatorias,
    escolhiveis,
    sugestao: escolhiveis.slice(0, total),
  };
}

export interface EscolhaDaOrigem {
  poder: string;
  rotulo: string;
  opcoes: { nome: string; descricao: string }[];
}

export function escolhaDaOrigem(r: Rascunho): EscolhaDaOrigem | null {
  const origem = origemDe(r);
  if (!origem?.poder.escolha) return null;

  const provisorio: Rascunho = { ...r, classe: classeDe(r) ?? 'Especialista', decisaoDeOrigem: undefined, periciasLivres: [] };
  let ficha: FichaPersistida;
  try {
    ficha = criarFicha(dadosDe(provisorio)).ficha;
  } catch {
    return null;
  }
  const pendencia = pendenciasResolviveis(ficha).find((p) => p.slot.poderPai === origem.poder.nome);
  if (!pendencia) return null;

  const opcoes = pendencia.opcoes
    .filter((o) => o.elegivel && o.valor.tipo === 'poder')
    .map((o) => {
      const nome = o.valor.tipo === 'poder' ? o.valor.poder : o.rotulo;
      return { nome, descricao: PODERES.find((p) => p.nome === nome)?.descricao ?? '' };
    });

  return { poder: origem.poder.nome, rotulo: pendencia.slot.rotulo, opcoes };
}

export function problemasDaEtapa(r: Rascunho, etapa: EtapaId): string[] {
  const problemas: string[] = [];
  switch (etapa) {
    case 'identidade':
      if (!r.tipo) problemas.push('Escolha o tipo de personagem.');
      if (!r.nome.trim()) problemas.push('Informe o nome.');
      break;
    case 'atributos': {
      const o = orcamentoDeAtributos(r);
      if (!o.valido) problemas.push(o.mensagem ?? 'Distribuição de atributos inválida.');
      break;
    }
    case 'origem': {
      if (!origemDe(r)) {
        problemas.push('Escolha uma origem.');
        break;
      }
      const escolha = escolhaDaOrigem(r);
      if (escolha && !r.decisaoDeOrigem) problemas.push(`${escolha.poder}: escolha o poder que a origem concede.`);
      break;
    }
    case 'classe': {
      if (!classeDe(r)) {
        problemas.push('Escolha uma classe.');
        break;
      }
      if (desbloqueiaTrilha(r) && trilhasDe(r).length > 0 && !r.trilha) problemas.push('Escolha uma trilha.');
      for (const hab of habilidadesComDecisao(r)) {
        if (!r.decisoesDeTrilha[hab.nome]) problemas.push(`Decida "${hab.nome}".`);
      }
      break;
    }
    case 'pericias': {
      const meta = metaDePericias(r);
      if (!meta) {
        problemas.push('Escolha classe e origem antes das perícias.');
        break;
      }
      if (r.periciasLivres.length !== meta.total) {
        problemas.push(`Escolha ${meta.total} perícia(s) — ${r.periciasLivres.length} selecionada(s).`);
      }
      break;
    }
    case 'rituais':
      if (classeDe(r) === 'Ocultista' && r.rituais.length !== RITUAIS_INICIAIS) {
        problemas.push(`Ocultista começa com ${RITUAIS_INICIAIS} rituais de 1º círculo — ${r.rituais.length} selecionado(s).`);
      }
      break;
    case 'equipamento':
    case 'revisao':
      break;
  }
  return problemas;
}

export function dadosDe(r: Rascunho): DadosDeCriacao {
  const classe = classeDe(r);
  if (!r.tipo || !classe || !r.origem) throw new Error('Rascunho incompleto: tipo, classe e origem são obrigatórios.');
  const meta = metaDePericias(r);
  return {
    tipo: r.tipo,
    nome: r.nome,
    conceito: r.conceito,
    classe,
    origem: r.origem,
    atributos: r.atributos,
    periciasTreinadas: [...(meta?.obrigatorias ?? []), ...r.periciasLivres],
    nex: r.tipo === 'Agente' ? r.nex : undefined,
    estagio: r.tipo === 'Sobrevivente' ? r.estagio : undefined,
    usarPd: r.usarPd,
    rituais: r.rituais,
    ...(r.trilha && desbloqueiaTrilha(r) ? { trilha: r.trilha } : {}),
    ...(r.trilha && Object.keys(r.decisoesDeTrilha).length > 0 ? { decisoesDeTrilha: r.decisoesDeTrilha } : {}),
    ...(r.decisaoDeOrigem ? { decisaoDeOrigem: r.decisaoDeOrigem } : {}),
    patente: r.tipo === 'Agente' ? r.patente : undefined,
  };
}

export interface Previa {
  ficha?: FichaPersistida;
  build?: BuildResultado;
  erros: string[];
}

export function previaDe(r: Rascunho): Previa {
  if (!r.tipo || !classeDe(r) || !origemDe(r)) return { erros: [] };
  try {
    const res = criarFicha(dadosDe(r));
    return {
      ficha: res.ficha,
      build: buildFicha({ ficha: res.ficha }),
      erros: res.problemas.filter((p) => p.gravidade === 'erro').map((p) => p.mensagem),
    };
  } catch (e) {
    return { erros: [e instanceof Error ? e.message : 'Falha ao montar a prévia.'] };
  }
}

export function armaComoItem(arma: Weapow): Item {
  const stat = (v: string) => (v && v !== '—' ? v : undefined);
  return {
    nome: arma.nome,
    categoria: arma.categoria,
    espaco: arma.espaco,
    tipo: arma.tipo === 'Munição' ? 'Geral' : 'Arma',
    descricao: `${arma.descricao}${arma.proficiencia !== 'N/A' ? ` [${arma.proficiencia}]` : ''}`,
    stats: {
      dano: stat(arma.stats.Dano_Base),
      tipoDano: stat(arma.stats.Dano_Tipo),
      critico: stat(arma.stats.Critico),
      alcance: stat(arma.stats.Alcance),
    },
    livro: arma.livro as Item['livro'],
  };
}

export function comModificacoes(item: Item, nomes: readonly string[]): Item {
  if (nomes.length === 0) return item;
  const categoriaBase = item.categoriaBase ?? item.categoria;
  return {
    ...item,
    categoriaBase,
    categoria: Math.min(4, categoriaBase + nomes.length) as Item['categoria'],
    modificacoes: [...nomes],
    stats: { ...item.stats, ...(item.stats?.dano && !item.stats.danoBase ? { danoBase: item.stats.dano } : {}) },
  };
}

export function equipamentosFinais(r: Rascunho): Item[] {
  return r.equipamentos.map((item) => comModificacoes(item, r.modificacoes[item.nome] ?? []));
}

export function estadoDe(r: Rascunho): CreationState {
  const classe = classeDe(r);
  const origem = origemDe(r);
  const meta = metaDePericias(r);
  return {
    ...INITIAL_STATE,
    step: 6,
    data: {
      ...INITIAL_STATE.data,
      tipo: r.tipo,
      nome: r.nome.trim(),
      conceito: r.conceito.trim(),
      classe,
      origem,
      nex: r.tipo === 'Agente' ? r.nex : undefined,
      estagio: r.tipo === 'Sobrevivente' ? r.estagio : undefined,
      usarPd: r.usarPd,
      preferenciasClasse: classe === 'Combatente' ? r.preferenciasClasse : undefined,
      atributos: { ...r.atributos },
      periciasTreinadas: [...(meta?.obrigatorias ?? []), ...r.periciasLivres],
      periciasSelecionadas: [...r.periciasLivres],
      rituais: r.rituais.map((nome) => RITUAIS.find((x) => x.nome === nome)).filter((x): x is NonNullable<typeof x> => Boolean(x)),
      equipamentos: equipamentosFinais(r),
    },
  };
}

export function esqueletoDe(r: Rascunho): Personagem {
  const personagem = finalizarCriacao(estadoDe(r));
  if (r.tipo === 'Agente') personagem.patente = r.patente;
  return personagem;
}

export function rascunhoDeDraft(draft: RecreateDraft): Rascunho {
  const modificacoes: Record<string, string[]> = {};
  const equipamentos = (draft.equipamentosIniciais ?? []).map((item) => {
    if (!item.modificacoes?.length) return item;
    modificacoes[item.nome] = [...item.modificacoes];
    const { modificacoes: _mods, categoriaBase, ...base } = item;
    return { ...base, categoria: categoriaBase ?? item.categoria };
  });
  return {
    ...RASCUNHO_INICIAL,
    tipo: draft.tipo,
    nome: draft.nome,
    conceito: draft.conceito ?? '',
    usarPd: draft.usarPd === true,
    atributos: { ...draft.atributosBase },
    origem: draft.origemNome,
    classe: draft.classe,
    preferenciasClasse: draft.preferenciasClasse ?? RASCUNHO_INICIAL.preferenciasClasse,
    nex: draft.tipo === 'Agente' ? draft.nexOrEstagio : RASCUNHO_INICIAL.nex,
    estagio: draft.tipo === 'Sobrevivente' ? draft.nexOrEstagio : RASCUNHO_INICIAL.estagio,
    periciasLivres: [...(draft.periciasLivres ?? [])],
    trilha: draft.trilha,
    rituais: (draft.rituaisIniciais ?? []).map((x) => x.nome),
    equipamentos,
    modificacoes,
  };
}
