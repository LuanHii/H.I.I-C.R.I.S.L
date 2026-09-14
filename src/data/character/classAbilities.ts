import { ClasseName } from '../../core/types';

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
      nex: 5,
      nome: 'Ataque Especial',
      descricao: 'Quando faz um ataque, você pode gastar 2 PE para receber +5 no teste de ataque ou na rolagem de dano. Conforme avança de NEX, você pode gastar +1 PE para receber mais bônus de +5. Você pode aplicar cada bônus de +5 em ataque ou dano. Por exemplo, em NEX 55%, você pode gastar 4 PE para receber +5 no teste de ataque e +10 na rolagem de dano.',
      custo: '2 PE',
    },
    {
      nex: 25,
      nome: 'Ataque Especial (3 PE, +10)',
      descricao: 'Você pode gastar até 3 PE no Ataque Especial, para um bônus total de +10, distribuído entre ataque e dano em parcelas de +5.',
      custo: '3 PE',
    },
    {
      nex: 55,
      nome: 'Ataque Especial (4 PE, +15)',
      descricao: 'Você pode gastar até 4 PE no Ataque Especial, para um bônus total de +15, distribuído entre ataque e dano em parcelas de +5.',
      custo: '4 PE',
    },
    {
      nex: 85,
      nome: 'Ataque Especial (5 PE, +20)',
      descricao: 'Você pode gastar até 5 PE no Ataque Especial, para um bônus total de +20, distribuído entre ataque e dano em parcelas de +5.',
      custo: '5 PE',
    },
  ],
  'Especialista': [
    {
      nex: 5,
      nome: 'Eclético',
      descricao: 'Quando faz um teste de uma perícia, você pode gastar 2 PE para receber os benefícios de ser treinado nesta perícia.',
      custo: '2 PE',
    },
    {
      nex: 5,
      nome: 'Perito',
      descricao: 'Escolha duas perícias nas quais você é treinado (exceto Luta e Pontaria). Quando faz um teste de uma dessas perícias, você pode gastar 2 PE para somar +1d6 no resultado do teste. Conforme avança de NEX, você pode gastar +1 PE para aumentar o dado de bônus. Por exemplo, em NEX 55%, pode gastar 4 PE para receber +1d10 no teste.',
      custo: '2 PE',
    },
    {
      nex: 25,
      nome: 'Perito (3 PE, +1d8)',
      descricao: 'Você pode gastar 3 PE no Perito para somar +1d8 no teste.',
      custo: '3 PE',
    },
    {
      nex: 40,
      nome: 'Engenhosidade (veterano)',
      descricao: 'Quando usa sua habilidade Eclético, você pode gastar 2 PE adicionais para receber os benefícios de ser veterano na perícia.',
      custo: '2 PE adicionais',
    },
    {
      nex: 55,
      nome: 'Perito (4 PE, +1d10)',
      descricao: 'Você pode gastar 4 PE no Perito para somar +1d10 no teste.',
      custo: '4 PE',
    },
    {
      nex: 75,
      nome: 'Engenhosidade (expert)',
      descricao: 'Quando usa sua habilidade Eclético, você pode gastar 4 PE adicionais para receber os benefícios de ser expert na perícia.',
      custo: '4 PE adicionais',
    },
    {
      nex: 85,
      nome: 'Perito (5 PE, +1d12)',
      descricao: 'Você pode gastar 5 PE no Perito para somar +1d12 no teste.',
      custo: '5 PE',
    },
  ],
  'Ocultista': [
    {
      nex: 5,
      nome: 'Escolhido pelo Outro Lado',
      descricao: 'Você teve uma experiência paranormal e foi marcado pelo Outro Lado, absorvendo o conhecimento e poder necessários para realizar rituais. Você pode lançar rituais de 1º círculo. À medida que aumenta seu NEX, pode lançar rituais de círculos maiores: 2º círculo em NEX 25%, 3º em 55% e 4º em 85%.',
    },
    {
      nex: 25,
      nome: 'Escolhido pelo Outro Lado (2º círculo)',
      descricao: 'Você pode lançar rituais de 2º círculo.',
    },
    {
      nex: 55,
      nome: 'Escolhido pelo Outro Lado (3º círculo)',
      descricao: 'Você pode lançar rituais de 3º círculo.',
    },
    {
      nex: 85,
      nome: 'Escolhido pelo Outro Lado (4º círculo)',
      descricao: 'Você pode lançar rituais de 4º círculo.',
    },
  ],
  'Sobrevivente': [
    {
      nex: 1,
      nome: 'Empenho',
      descricao: 'Você pode não ter treinamento especial, mas compensa com dedicação e esforço. Quando faz um teste de perícia, você pode gastar 1 PE para receber +2 nesse teste.',
      custo: '1 PE',
    },
    {
      nex: 5,
      nome: 'Cicatrizado',
      descricao: 'Escolha um tipo de perigo paranormal de um elemento específico que já enfrentou. Você tem trauma em relação a ele e sofre –1d20 em testes de resistência contra esse perigo. Em contrapartida, uma vez por sessão, como reação, pode sacrificar 1 PV permanentemente para ignorar um dano mental ou um gasto de PE, ou sacrificar 1 PE permanentemente para reduzir um dano físico à metade.',
      acao: 'Reação',
    },
  ],
};
