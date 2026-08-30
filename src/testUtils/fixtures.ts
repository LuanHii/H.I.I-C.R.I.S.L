import type { Atributos, ClasseName, Origem, PericiaName, Personagem } from '@/core/types';
import { ORIGENS } from '@/data/character/origins';
import { gerarFicha, type CriacaoInput } from '@/logic/rulesEngine';

export const NEX_LADDER = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99] as const;

export const CLASSES_AGENTE: ClasseName[] = ['Combatente', 'Especialista', 'Ocultista'];
export const CLASSES_TODAS: ClasseName[] = [...CLASSES_AGENTE, 'Sobrevivente'];

export const ATRIBUTOS_UNIFORMES: Atributos = { AGI: 2, FOR: 2, INT: 2, PRE: 2, VIG: 1 };

export const ATRIBUTOS_POR_CLASSE: Record<ClasseName, Atributos> = {
  Combatente: { AGI: 2, FOR: 3, INT: 1, PRE: 1, VIG: 2 },
  Especialista: { AGI: 2, FOR: 1, INT: 3, PRE: 1, VIG: 2 },
  Ocultista: { AGI: 1, FOR: 1, INT: 2, PRE: 3, VIG: 2 },
  Sobrevivente: { AGI: 2, FOR: 2, INT: 2, PRE: 1, VIG: 1 },
};

export const ATRIBUTOS_SOBREVIVENTE_UNIFORME: Atributos = { AGI: 2, FOR: 2, INT: 1, PRE: 2, VIG: 1 };

export const ORIGENS_TESTE = ['Desgarrado', 'Universitário', 'Policial'] as const;

export const TRILHA_POR_CLASSE: Record<ClasseName, string> = {
  Combatente: 'Aniquilador',
  Especialista: 'Técnico',
  Ocultista: 'Graduado',
  Sobrevivente: 'Durão',
};

export function origem(nome: string): Origem {
  const encontrada = ORIGENS.find((o) => o.nome === nome);
  if (!encontrada) throw new Error(`Origem de fixture inexistente: ${nome}`);
  return encontrada;
}

const PERICIAS_RESERVA: PericiaName[] = [
  'Atletismo', 'Acrobacia', 'Furtividade', 'Iniciativa', 'Percepção',
  'Intuição', 'Vontade', 'Fortitude', 'Reflexos', 'Luta',
  'Pontaria', 'Crime', 'Tecnologia', 'Ciências', 'Medicina',
  'Diplomacia', 'Enganação', 'Intimidação', 'Investigação', 'Ocultismo',
  'Tática', 'Sobrevivência', 'Adestramento', 'Artes', 'Atualidades',
  'Pilotagem', 'Profissão', 'Religião',
];

export function periciasLivres(quantidade: number, excluir: PericiaName[] = []): PericiaName[] {
  const bloqueadas = new Set(excluir);
  return PERICIAS_RESERVA.filter((p) => !bloqueadas.has(p)).slice(0, Math.max(0, quantidade));
}

export function slotsLivresDe(classe: ClasseName, intelecto: number, org: Origem): number {
  const base =
    classe === 'Especialista' ? 7 + intelecto
      : classe === 'Ocultista' ? 3 + intelecto
        : 1 + intelecto;

  const vistas = new Set<PericiaName>();
  let devolvidos = 0;

  for (const pericia of org.pericias ?? []) {
    if (vistas.has(pericia)) devolvidos += 1;
    else vistas.add(pericia);
  }

  return Math.max(1, base) + devolvidos;
}

export function periciasTreinadasNaCriacao(org: Origem, classe: ClasseName): PericiaName[] {
  const obrigatorias: PericiaName[] =
    classe === 'Combatente' ? ['Luta', 'Fortitude']
      : classe === 'Ocultista' ? ['Ocultismo', 'Vontade']
        : [];
  return [...(org.pericias ?? []), ...obrigatorias];
}

export interface OpcoesFicha {
  classe: ClasseName;
  nex?: number;
  estagio?: number;
  origemNome?: string;
  atributos?: Atributos;
  trilha?: string;
  usarPd?: boolean;
  nome?: string;
  qtdPericiasLivres?: number;
}

export function criarFicha(opcoes: OpcoesFicha): Personagem {
  const {
    classe,
    nex,
    estagio,
    origemNome = 'Desgarrado',
    atributos = ATRIBUTOS_POR_CLASSE[classe],
    trilha,
    usarPd = false,
    nome = `${classe} de Teste`,
    qtdPericiasLivres,
  } = opcoes;

  const org = origem(origemNome);
  const quantidade = qtdPericiasLivres ?? slotsLivresDe(classe, atributos.INT, org);

  const input: CriacaoInput = {
    nome,
    classe,
    atributos,
    origem: org,
    periciasLivres: periciasLivres(quantidade, periciasTreinadasNaCriacao(org, classe)),
    usarPd,
    ...(classe === 'Combatente' ? { preferenciasClasse: { ofensiva: 'Luta', defensiva: 'Fortitude' } as const } : {}),
    ...(nex !== undefined ? { nex } : {}),
    ...(estagio !== undefined ? { estagio } : {}),
    ...(trilha !== undefined ? { trilha } : {}),
  };

  return gerarFicha(input);
}

export function fichaNex5(classe: ClasseName, origemNome = 'Desgarrado'): Personagem {
  return classe === 'Sobrevivente'
    ? criarFicha({ classe, estagio: 1, origemNome })
    : criarFicha({ classe, nex: 5, origemNome });
}

export function proximoNexAtual(personagem: Personagem): number {
  return personagem.classe === 'Sobrevivente'
    ? (personagem.estagio || 1) + 1
    : Math.min(99, personagem.nex + (personagem.nex === 95 ? 4 : 5));
}
