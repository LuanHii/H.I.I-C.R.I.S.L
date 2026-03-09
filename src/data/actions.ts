import { PericiaName } from '../core/types';

export type TipoAcao = 'Padrão' | 'Movimento' | 'Completa' | 'Livre' | 'Reação';

export interface ActionDefinition {
  nome: string;
  tipo: 'Universal' | 'Investigação' | 'Perseguição' | 'Furtividade' | 'Manobra';
  tipoAcao: TipoAcao;
  custo?: string;
  descricao: string;
  pericia?: PericiaName;
  dt?: number;
  requisito?: string;
}

export const ACAO_BADGE: Record<TipoAcao, { label: string; icon: string; color: string; bg: string; border: string }> = {
  'Padrão': { label: 'Padrão', icon: '⚔️', color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30' },
  'Movimento': { label: 'Movimento', icon: '🏃', color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
  'Completa': { label: 'Completa', icon: '💥', color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30' },
  'Livre': { label: 'Livre', icon: '⚡', color: 'text-gray-400', bg: 'bg-gray-500/15', border: 'border-gray-500/30' },
  'Reação': { label: 'Reação', icon: '🛡️', color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30' },
};

export const UNIVERSAL_ACTIONS: ActionDefinition[] = [

  {
    nome: 'Agredir',
    tipo: 'Universal',
    tipoAcao: 'Padrão',
    descricao: 'Ataque corpo a corpo (Luta) ou à distância (Pontaria) contra a Defesa do alvo.',
    pericia: 'Luta',
  },
  {
    nome: 'Fintar',
    tipo: 'Universal',
    tipoAcao: 'Padrão',
    descricao: 'Enganação vs Reflexos do alvo. Sucesso: alvo fica desprevenido contra seu próximo ataque.',
    pericia: 'Enganação',
  },
  {
    nome: 'Preparar Ação',
    tipo: 'Universal',
    tipoAcao: 'Padrão',
    descricao: 'Declara uma ação padrão e uma circunstância. Quando a circunstância ocorrer, executa como reação.',
  },
  {
    nome: 'Usar Habilidade',
    tipo: 'Universal',
    tipoAcao: 'Padrão',
    descricao: 'Usar uma habilidade de classe, poder ou item que exija ação padrão.',
  },

  {
    nome: 'Movimentar-se',
    tipo: 'Universal',
    tipoAcao: 'Movimento',
    descricao: 'Percorre seu deslocamento (padrão: 9m / 6 quadrados). Diagonal custa o dobro. Terreno difícil custa o dobro.',
    pericia: 'Atletismo',
  },
  {
    nome: 'Levantar-se',
    tipo: 'Universal',
    tipoAcao: 'Movimento',
    descricao: 'Levanta do chão, cama, cadeira ou qualquer posição prostrada.',
  },
  {
    nome: 'Sacar / Guardar',
    tipo: 'Universal',
    tipoAcao: 'Movimento',
    descricao: 'Sacar ou guardar uma arma ou item acessível. Trocar armas = 2 ações de movimento.',
  },
  {
    nome: 'Manipular Item',
    tipo: 'Universal',
    tipoAcao: 'Movimento',
    descricao: 'Pegar item da mochila, abrir porta, atirar corda para aliado ou similar.',
  },
  {
    nome: 'Mirar',
    tipo: 'Universal',
    tipoAcao: 'Movimento',
    descricao: 'Anula a penalidade de -1d20 em Pontaria contra alvo engajado em corpo a corpo. Requer treinamento.',
    pericia: 'Pontaria',
    requisito: 'Treinado em Pontaria',
  },

  {
    nome: 'Investida',
    tipo: 'Universal',
    tipoAcao: 'Completa',
    descricao: 'Move até 2x deslocamento em linha reta + ataque. +1d20 no ataque, mas -5 na Defesa até próximo turno.',
  },
  {
    nome: 'Corrida',
    tipo: 'Universal',
    tipoAcao: 'Completa',
    descricao: 'Move mais que deslocamento normal. Distância depende de Atletismo.',
    pericia: 'Atletismo',
  },
  {
    nome: 'Golpe de Misericórdia',
    tipo: 'Universal',
    tipoAcao: 'Completa',
    descricao: 'Contra alvo adjacente e indefeso. Crítico automático. Morte instantânea: 25% (PCs) / 75% (NPCs).',
  },

  {
    nome: 'Atrasar',
    tipo: 'Universal',
    tipoAcao: 'Livre',
    descricao: 'Adia turno voluntariamente. Limite: posição 0 - bônus de Iniciativa. Fica fixa até o fim do combate.',
  },
  {
    nome: 'Falar',
    tipo: 'Universal',
    tipoAcao: 'Livre',
    descricao: 'Falar ~20 palavras. Rituais por voz NÃO são ação livre.',
  },
  {
    nome: 'Jogar-se no Chão',
    tipo: 'Universal',
    tipoAcao: 'Livre',
    descricao: 'Ganha efeitos de caído sem sofrer dano de queda.',
  },
  {
    nome: 'Largar Item',
    tipo: 'Universal',
    tipoAcao: 'Livre',
    descricao: 'Deixar cair item no chão. Jogar para acertar alguém = ação padrão com improviso.',
  },

  {
    nome: 'Bloqueio',
    tipo: 'Universal',
    tipoAcao: 'Reação',
    descricao: 'Reduz dano de ataque corpo a corpo. RD = bônus de Fortitude. 1x/rodada. Declarar ANTES do teste.',
    pericia: 'Fortitude',
    requisito: 'Treinado em Fortitude',
  },
  {
    nome: 'Esquiva',
    tipo: 'Universal',
    tipoAcao: 'Reação',
    descricao: 'Adiciona bônus de Reflexos na Defesa contra um ataque. 1x/rodada. Declarar ANTES do teste.',
    pericia: 'Reflexos',
    requisito: 'Treinado em Reflexos',
  },
  {
    nome: 'Contra-ataque',
    tipo: 'Universal',
    tipoAcao: 'Reação',
    descricao: 'Quando inimigo ERRA ataque corpo a corpo contra você, faz um ataque corpo a corpo contra ele.',
    pericia: 'Luta',
    requisito: 'Treinado em Luta',
  },
];

export const INVESTIGATION_ACTIONS: ActionDefinition[] = [
  {
    nome: 'Procurar Pistas',
    tipo: 'Investigação',
    tipoAcao: 'Padrão',
    descricao: 'Procura pistas usando perícia apropriada.',
    pericia: 'Investigação',
  },
  {
    nome: 'Busca Obstinada',
    tipo: 'Investigação',
    tipoAcao: 'Padrão',
    custo: '1d4 SAN',
    descricao: 'Como procurar pistas, mas recebe +1d20 no teste (Custo cumulativo).',
    pericia: 'Investigação',
  },
  {
    nome: 'Facilitar Investigação',
    tipo: 'Investigação',
    tipoAcao: 'Padrão',
    descricao: 'Usa perícia para fornecer +2 nos testes dos aliados.',
  },
  {
    nome: 'Recapitular',
    tipo: 'Investigação',
    tipoAcao: 'Padrão',
    descricao: 'Encontrar uma pista esquecida (1x/cena).',
    dt: 15,
    pericia: 'Atualidades',
  },
];

export const CHASE_ACTIONS: ActionDefinition[] = [
  {
    nome: 'Esforço Extra',
    tipo: 'Perseguição',
    tipoAcao: 'Padrão',
    custo: '1d4 PV',
    descricao: 'Recebe +1d20 no teste de Atletismo. (Pode pagar 2 PE com Sacrificar os Joelhos).',
    pericia: 'Atletismo',
  },
  {
    nome: 'Criar Obstáculo',
    tipo: 'Perseguição',
    tipoAcao: 'Padrão',
    descricao: 'Cria um obstáculo para caçadores (DT 15).',
    pericia: 'Atletismo',
  },
  {
    nome: 'Despistar',
    tipo: 'Perseguição',
    tipoAcao: 'Padrão',
    descricao: 'Substitui teste de Atletismo por Furtividade (Alto Risco).',
    pericia: 'Furtividade',
  },
  {
    nome: 'Sacrifício',
    tipo: 'Perseguição',
    tipoAcao: 'Padrão',
    descricao: 'Deixa de correr para atrapalhar adversários (+1d20 no teste dos outros).',
  },
];

export const STEALTH_ACTIONS: ActionDefinition[] = [
  {
    nome: 'Ação Discreta',
    tipo: 'Furtividade',
    tipoAcao: 'Padrão',
    descricao: 'Camufla a ação, Visibilidade +1d20. Sofre -1d20 no teste.',
    pericia: 'Furtividade',
  },
  {
    nome: 'Esconder-se',
    tipo: 'Furtividade',
    tipoAcao: 'Padrão',
    descricao: 'Diminuir Visibilidade em -1 (DT 15).',
    pericia: 'Furtividade',
  },
  {
    nome: 'Distrair',
    tipo: 'Furtividade',
    tipoAcao: 'Padrão',
    descricao: 'Diminuir Visibilidade (-1 própria ou aliado). DT aumenta por uso.',
    pericia: 'Enganação',
  },
  {
    nome: 'Chamar Atenção',
    tipo: 'Furtividade',
    tipoAcao: 'Padrão',
    descricao: 'Aumenta Visibilidade em +2 para diminuir a de um aliado em -1.',
  },
];

export const MANEUVER_ACTIONS: ActionDefinition[] = [
  {
    nome: 'Agarrar',
    tipo: 'Manobra',
    tipoAcao: 'Padrão',
    descricao: 'Substitui 1 ataque. Luta vs Luta/Acrobacia do alvo. Sucesso: alvo fica agarrado. Alvo pode tentar escapar como ação padrão (Luta/Acrobacia vs DT 10 + resultado seu).',
    pericia: 'Luta',
  },
  {
    nome: 'Derrubar',
    tipo: 'Manobra',
    tipoAcao: 'Padrão',
    descricao: 'Substitui 1 ataque. Teste de ataque vs DT = Defesa do alvo. Sucesso: alvo fica caído. Se falhar por 5+, você cai. Alvo Grande: penalidade de -2, Enorme: -5, Colossal: impossível.',
    pericia: 'Luta',
  },
  {
    nome: 'Desarmar',
    tipo: 'Manobra',
    tipoAcao: 'Padrão',
    descricao: 'Substitui 1 ataque. Teste de ataque vs DT = Defesa do alvo. Sucesso: item derrubado no chão. Se falhar por 5+, VOCÊ é desarmado. Precisa estar adjacente.',
    pericia: 'Luta',
  },
  {
    nome: 'Empurrar',
    tipo: 'Manobra',
    tipoAcao: 'Padrão',
    descricao: 'Substitui 1 ataque. Teste de ataque vs DT = Defesa do alvo. Sucesso: empurra alvo 1,5m. Para cada 5 além da DT, empurra +1,5m. Pode avançar junto (opcional).',
    pericia: 'Luta',
  },
  {
    nome: 'Quebrar',
    tipo: 'Manobra',
    tipoAcao: 'Padrão',
    descricao: 'Ataca um objeto (arma, escudo, etc.). Teste de ataque vs Defesa 10 (ou do portador). Causa dano normalmente. Objetos têm PV (5–30) e podem ter RD.',
    pericia: 'Luta',
  },
  {
    nome: 'Atropelar',
    tipo: 'Manobra',
    tipoAcao: 'Padrão',
    descricao: 'Durante investida, tenta passar pelo espaço do alvo. Teste de ataque vs DT = Defesa do alvo. Sucesso: alvo fica caído e pode continuar investida. Falha: para no espaço anterior.',
    pericia: 'Luta',
  },
];
