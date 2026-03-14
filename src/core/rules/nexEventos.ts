import type { NexEvento } from '../types';

/**
 * Tabela canonical de eventos de NEX para personagens Agentes (5%-99%).
 *
 * FONTE DE VERDADE ÚNICA — importar daqui em vez de duplicar.
 * Usada por:
 *   - src/logic/rulesEngine.ts  (listagem/exibição de eventos na UI)
 *   - src/logic/levelUp.ts      (controle real do level-up)
 */
export const NEX_EVENTOS: { requisito: number; tipo: NexEvento['tipo']; descricao: string }[] = [
  { requisito: 5,  tipo: 'Ritual',       descricao: 'Ocultista: aprende 1 ritual de 1º círculo (Escolhido pelo Outro Lado)' },
  { requisito: 10, tipo: 'Trilha',       descricao: 'Escolha de Trilha e 1ª habilidade' },
  { requisito: 15, tipo: 'Poder',        descricao: 'Desbloqueia um Poder de Classe' },
  { requisito: 20, tipo: 'Atributo',     descricao: '+1 em qualquer atributo' },
  { requisito: 25, tipo: 'Ritual',       descricao: 'Ocultista: desbloqueia 2º círculo e aprende 1 ritual (Escolhido pelo Outro Lado)' },
  { requisito: 30, tipo: 'Poder',        descricao: 'Desbloqueia um Poder de Classe' },
  { requisito: 35, tipo: 'Pericia',      descricao: 'Promove perícias em um grau (2+INT para Combatente/Ocultista; 5+INT para Especialista)' },
  { requisito: 40, tipo: 'Trilha',       descricao: '2ª habilidade da Trilha' },
  { requisito: 45, tipo: 'Poder',        descricao: 'Desbloqueia um Poder de Classe' },
  { requisito: 50, tipo: 'Atributo',     descricao: '+1 em qualquer atributo' },
  { requisito: 50, tipo: 'Versatilidade', descricao: 'Ganha Versatilidade' },
  { requisito: 50, tipo: 'Afinidade',    descricao: 'Escolhe Afinidade elemental (Ocultista)' },
  { requisito: 55, tipo: 'Ritual',       descricao: 'Ocultista: desbloqueia 3º círculo e aprende 1 ritual (Escolhido pelo Outro Lado)' },
  { requisito: 60, tipo: 'Poder',        descricao: 'Desbloqueia um Poder de Classe' },
  { requisito: 65, tipo: 'Trilha',       descricao: '3ª habilidade da Trilha' },
  { requisito: 70, tipo: 'Pericia',      descricao: 'Promove perícias em um grau (2+INT para Combatente/Ocultista; 5+INT para Especialista)' },
  { requisito: 75, tipo: 'Poder',        descricao: 'Desbloqueia um Poder de Classe' },
  { requisito: 80, tipo: 'Atributo',     descricao: '+1 em qualquer atributo' },
  { requisito: 85, tipo: 'Ritual',       descricao: 'Ocultista: desbloqueia 4º círculo e aprende 1 ritual (Escolhido pelo Outro Lado)' },
  { requisito: 90, tipo: 'Poder',        descricao: 'Desbloqueia um Poder de Classe' },
  { requisito: 95, tipo: 'Atributo',     descricao: '+1 em qualquer atributo' },
  { requisito: 99, tipo: 'Trilha',       descricao: '4ª habilidade da Trilha' },
];
