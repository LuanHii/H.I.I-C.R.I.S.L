import { PericiaName } from '../core/types';

export interface ActionDefinition {
  nome: string;
  tipo: 'Universal' | 'Investigação' | 'Perseguição' | 'Furtividade' | 'Reação' | 'Movimento';
  custo?: string;
  descricao: string;
  pericia?: PericiaName;
  dt?: number;
}

export const UNIVERSAL_ACTIONS: ActionDefinition[] = [
  {
    nome: 'Agredir',
    tipo: 'Universal',
    descricao: 'Fazer um ataque corpo a corpo ou à distância (Ação Padrão).',
    pericia: 'Luta'
  },
  {
    nome: 'Bloqueio',
    tipo: 'Reação',
    descricao: 'Reduz dano de ataque corpo a corpo.',
    pericia: 'Fortitude'
  },
  {
    nome: 'Contra-ataque',
    tipo: 'Reação',
    descricao: 'Realizar um ataque após um ataque corpo a corpo errado do inimigo.',
    pericia: 'Luta'
  },
  {
    nome: 'Esquiva',
    tipo: 'Reação',
    descricao: 'Adiciona bônus de Reflexos na Defesa contra um ataque.',
    pericia: 'Reflexos'
  },
  {
    nome: 'Mirar',
    tipo: 'Movimento',
    descricao: 'Anula a penalidade de -1d20 no teste de Pontaria contra alvo engajado.',
    pericia: 'Pontaria'
  },
  {
    nome: 'Fintar',
    tipo: 'Universal',
    descricao: 'Deixa o alvo desprevenido contra o próximo ataque (Ação Padrão).',
    pericia: 'Enganação'
  }
];

export const INVESTIGATION_ACTIONS: ActionDefinition[] = [
  {
    nome: 'Procurar Pistas',
    tipo: 'Investigação',
    descricao: 'Procura pistas usando perícia apropriada.',
    pericia: 'Investigação'
  },
  {
    nome: 'Busca Obstinada',
    tipo: 'Investigação',
    custo: '1d4 SAN',
    descricao: 'Como procurar pistas, mas recebe +1d20 no teste (Custo cumulativo).',
    pericia: 'Investigação'
  },
  {
    nome: 'Facilitar Investigação',
    tipo: 'Investigação',
    descricao: 'Usa perícia para fornecer +2 nos testes dos aliados.',
  },
  {
    nome: 'Recapitular',
    tipo: 'Investigação',
    descricao: 'Encontrar uma pista esquecida (1x/cena).',
    dt: 15,
    pericia: 'Atualidades'
  }
];

export const CHASE_ACTIONS: ActionDefinition[] = [
  {
    nome: 'Esforço Extra',
    tipo: 'Perseguição',
    custo: '1d4 PV',
    descricao: 'Recebe +1d20 no teste de Atletismo. (Pode pagar 2 PE com Sacrificar os Joelhos).',
    pericia: 'Atletismo'
  },
  {
    nome: 'Criar Obstáculo',
    tipo: 'Perseguição',
    descricao: 'Cria um obstáculo para caçadores (DT 15).',
    pericia: 'Atletismo'
  },
  {
    nome: 'Despistar',
    tipo: 'Perseguição',
    descricao: 'Substitui teste de Atletismo por Furtividade (Alto Risco).',
    pericia: 'Furtividade'
  },
  {
    nome: 'Sacrifício',
    tipo: 'Perseguição',
    descricao: 'Deixa de correr para atrapalhar adversários (+1d20 no teste dos outros).',
  }
];

export const STEALTH_ACTIONS: ActionDefinition[] = [
  {
    nome: 'Ação Discreta',
    tipo: 'Furtividade',
    descricao: 'Camufla a ação, Visibilidade +1d20. Sofre -1d20 no teste.',
    pericia: 'Furtividade'
  },
  {
    nome: 'Esconder-se',
    tipo: 'Furtividade',
    descricao: 'Diminuir Visibilidade em -1 (DT 15).',
    pericia: 'Furtividade'
  },
  {
    nome: 'Distrair',
    tipo: 'Furtividade',
    descricao: 'Diminuir Visibilidade (-1 própria ou aliado). DT aumenta por uso.',
    pericia: 'Enganação'
  },
  {
    nome: 'Chamar Atenção',
    tipo: 'Furtividade',
    descricao: 'Aumenta Visibilidade em +2 para diminuir a de um aliado em -1.',
  }
];
