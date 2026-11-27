import type { Ameaca, Atributos } from '@/core/types';
import { AMEACAS } from '@/data/combat/monsters';

export interface EntradaCatalogoAmeaca {
  chave: string;
  ameaca: Ameaca;
  origem: string;
  registroId?: string;
}

export interface ResultadoImportacaoAmeacas {
  ameacas: Ameaca[];
  erro?: string;
}

export function normalizarBusca(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR').trim();
}

// O antigo cadastro rápido salvava PV e ações com os campos usados no combate.
type AmeacaSalva = Ameaca & { pv?: number; abilities?: { name: string; description: string; type?: string }[] };

function normalizarAmeacaSalva(ameaca: AmeacaSalva): Ameaca {
  return {
    ...ameaca,
    vida: ameaca.vida ?? ameaca.pv ?? 0,
    acoes: ameaca.acoes?.length ? ameaca.acoes : (ameaca.abilities ?? []).map(acao => ({
      nome: acao.name, descricao: acao.description, tipo: acao.type,
    })),
    habilidades: ameaca.habilidades ?? [],
  };
}

function numeroValido(valor: unknown, padrao: number): number {
  const n = typeof valor === 'number' ? valor : Number(valor);
  return Number.isFinite(n) ? n : padrao;
}

function textoOpcional(valor: unknown): string | undefined {
  if (typeof valor !== 'string') return undefined;
  const limpo = valor.trim();
  return limpo ? limpo : undefined;
}

function listaTextos(valor: unknown): string[] | undefined {
  if (!Array.isArray(valor)) return undefined;
  return valor.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).map(item => item.trim());
}

function normalizarAtributos(valor: unknown): Atributos {
  const bruto = (valor && typeof valor === 'object' ? valor : {}) as Partial<Record<keyof Atributos, unknown>>;
  return {
    AGI: numeroValido(bruto.AGI, 1),
    FOR: numeroValido(bruto.FOR, 1),
    INT: numeroValido(bruto.INT, 1),
    PRE: numeroValido(bruto.PRE, 1),
    VIG: numeroValido(bruto.VIG, 1),
  };
}

function normalizarAmeacaImportada(bruto: unknown): Ameaca | null {
  if (!bruto || typeof bruto !== 'object') return null;
  const obj = bruto as Record<string, unknown>;
  const candidato = (obj.ameaca && typeof obj.ameaca === 'object' ? obj.ameaca : obj) as Record<string, unknown>;

  const nome = textoOpcional(candidato.nome);
  if (!nome) return null;

  const acoesBrutas = Array.isArray(candidato.acoes) && candidato.acoes.length > 0
    ? candidato.acoes
    : Array.isArray(candidato.abilities)
      ? candidato.abilities
      : [];

  const acoes = acoesBrutas
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map(item => {
      const acaoNome = textoOpcional(item.nome) ?? textoOpcional(item.name) ?? 'Ação';
      const acaoDesc = textoOpcional(item.descricao) ?? textoOpcional(item.description) ?? '';
      const acaoTipo = textoOpcional(item.tipo) ?? textoOpcional(item.type);
      const acaoTeste = textoOpcional(item.teste);
      const acaoDano = textoOpcional(item.dano);
      return {
        nome: acaoNome,
        descricao: acaoDesc,
        ...(acaoTipo ? { tipo: acaoTipo } : {}),
        ...(acaoTeste ? { teste: acaoTeste } : {}),
        ...(acaoDano ? { dano: acaoDano } : {}),
      };
    });

  const habilidadesBrutas = Array.isArray(candidato.habilidades) ? candidato.habilidades : [];
  const habilidades = habilidadesBrutas
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map(item => ({
      nome: textoOpcional(item.nome) ?? textoOpcional(item.name) ?? 'Habilidade',
      descricao: textoOpcional(item.descricao) ?? textoOpcional(item.description) ?? '',
    }));

  const pericias: Record<string, string> = {};
  if (candidato.pericias && typeof candidato.pericias === 'object' && !Array.isArray(candidato.pericias)) {
    for (const [chave, valor] of Object.entries(candidato.pericias as Record<string, unknown>)) {
      if (typeof valor === 'string' && valor.trim()) pericias[chave] = valor.trim();
    }
  }

  const presencaBruta = candidato.presencaPerturbadora;
  let presencaPerturbadora: Ameaca['presencaPerturbadora'];
  if (presencaBruta && typeof presencaBruta === 'object') {
    const p = presencaBruta as Record<string, unknown>;
    const dano = textoOpcional(p.dano);
    if (dano) {
      presencaPerturbadora = {
        dt: numeroValido(p.dt, 15),
        dano,
        ...(p.nexImune !== undefined ? { nexImune: numeroValido(p.nexImune, 0) } : {}),
      };
    }
  }

  const livro: Ameaca['livro'] = candidato.livro === 'Sobrevivendo ao Horror'
    ? 'Sobrevivendo ao Horror'
    : 'Regras Básicas';

  const sentidos = textoOpcional(candidato.sentidos);
  const fortitude = textoOpcional(candidato.fortitude);
  const reflexos = textoOpcional(candidato.reflexos);
  const vontade = textoOpcional(candidato.vontade);
  const deslocamento = textoOpcional(candidato.deslocamento);
  const enigmaDeMedo = textoOpcional(candidato.enigmaDeMedo);

  return {
    nome,
    vd: Math.max(0, numeroValido(candidato.vd, 0)),
    tipo: textoOpcional(candidato.tipo) ?? 'Sangue',
    tamanho: textoOpcional(candidato.tamanho) ?? 'Médio',
    atributos: normalizarAtributos(candidato.atributos),
    pericias: pericias as Ameaca['pericias'],
    defesa: Math.max(0, numeroValido(candidato.defesa, 10)),
    vida: Math.max(0, numeroValido(candidato.vida ?? candidato.pv, 10)),
    ...(sentidos ? { sentidos } : {}),
    ...(fortitude ? { fortitude } : {}),
    ...(reflexos ? { reflexos } : {}),
    ...(vontade ? { vontade } : {}),
    ...(deslocamento ? { deslocamento } : {}),
    ...(enigmaDeMedo ? { enigmaDeMedo } : {}),
    ...(presencaPerturbadora ? { presencaPerturbadora } : {}),
    resistencias: listaTextos(candidato.resistencias) ?? [],
    imunidades: listaTextos(candidato.imunidades) ?? [],
    vulnerabilidades: listaTextos(candidato.vulnerabilidades) ?? [],
    acoes,
    habilidades,
    livro,
  };
}

export function lerAmeacasImportadas(conteudoJson: string): ResultadoImportacaoAmeacas {
  let parsed: unknown;
  try {
    parsed = JSON.parse(conteudoJson);
  } catch {
    return { ameacas: [], erro: 'Arquivo JSON inválido. Verifique a formatação do arquivo.' };
  }

  let listaBruta: unknown[] = [];
  if (Array.isArray(parsed)) {
    listaBruta = parsed;
  } else if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.monstros)) listaBruta = obj.monstros;
    else if (Array.isArray(obj.ameacas)) listaBruta = obj.ameacas;
    else listaBruta = [parsed];
  } else {
    return { ameacas: [], erro: 'Estrutura JSON não reconhecida para ameaças.' };
  }

  const ameacas = listaBruta
    .map(normalizarAmeacaImportada)
    .filter((item): item is Ameaca => item !== null);

  if (ameacas.length === 0) {
    return { ameacas: [], erro: 'Nenhuma ameaça válida encontrada no arquivo (campo "nome" obrigatório).' };
  }

  return { ameacas };
}

const ENTRADAS_OFICIAIS = AMEACAS.map((ameaca): EntradaCatalogoAmeaca => ({
  chave: ['livro', ameaca.livro, ameaca.nome].join(':'),
  ameaca,
  origem: ameaca.livro,
}));

export function montarCatalogoAmeacas(personalizadas: readonly { id: string; ameaca: AmeacaSalva }[]): EntradaCatalogoAmeaca[] {
  return [
    ...personalizadas.map(({ id, ameaca }) => ({ chave: 'personalizada:' + id, ameaca: normalizarAmeacaSalva(ameaca), origem: 'Personalizada', registroId: id })),
    ...ENTRADAS_OFICIAIS,
  ];
}
