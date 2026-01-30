import { ClasseName } from '../core/types';

export interface ClassAbility {
  nome: string;
  descricao: string;
  nex: number;
  custo?: string;
  acao?: string;
}

export const CLASS_ABILITIES: Record<ClasseName, ClassAbility[]> = {
  'Combatente': [
    {
      nex: 10,
      nome: 'Ataque Especial',
      descricao: 'Gaste 2 PE para receber +5 no teste de ataque ou na rolagem de dano. Você pode gastar +PE para aumentar o bônus.',
      custo: '2 PE',
      acao: 'Livre'
    },
    {
      nex: 40,
      nome: 'Ataque Especial (+10)',
      descricao: 'O bônus do Ataque Especial aumenta para +10 (ou +5/+5).',
      custo: '2 PE+',
      acao: 'Livre'
    },
    {
      nex: 65,
      nome: 'Ataque Especial (+15)',
      descricao: 'O bônus do Ataque Especial aumenta para +15.',
      custo: '2 PE+',
      acao: 'Livre'
    },
    {
      nex: 99,
      nome: 'Ataque Especial (+20)',
      descricao: 'O bônus do Ataque Especial aumenta para +20.',
      custo: '2 PE+',
      acao: 'Livre'
    }
  ],
  'Especialista': [
    {
      nex: 10,
      nome: 'Eclético',
      descricao: 'Gaste 2 PE para receber os benefícios de ser treinado em uma perícia que não possui treinamento.',
      custo: '2 PE',
      acao: 'Livre'
    },
    {
      nex: 10,
      nome: 'Perito',
      descricao: 'Escolha duas perícias. Gaste 2 PE (ou PD) para somar +1d6 no teste dessas perícias. A cada novo círculo (40%, 65%, 99%), o custo aumenta e o dado aumenta.',
      custo: '2 PE',
      acao: 'Livre'
    },
    {
      nex: 40,
      nome: 'Engenhosidade',
      descricao: 'Gaste 2 PE para receber os benefícios de ser Veterano em uma perícia.',
      custo: '2 PE',
      acao: 'Livre'
    }
  ],
  'Ocultista': [
    {
      nex: 10,
      nome: 'Escolhido pelo Outro Lado',
      descricao: 'Você pode lançar rituais de 1º Círculo.',
      custo: 'Varia',
      acao: 'Varia'
    },
    {
      nex: 40,
      nome: 'Escolhido pelo Outro Lado (2º Círculo)',
      descricao: 'Você pode lançar rituais de 2º Círculo.',
      custo: 'Varia',
      acao: 'Varia'
    }
  ],
  'Sobrevivente': [
    {
      nex: 10,
      nome: 'Instinto de Sobrevivência',
      descricao: 'Você pode gastar 1 PE para rerrolar um teste de resistência.',
      custo: '1 PE',
      acao: 'Reação'
    }
  ]
};
