import { Personagem, ClasseName, Origem, Atributos, PericiaName, Ritual, Item } from '../core/types';
import {
  validarDistribuicaoAtributos,
  calcularPericiasIniciais,
  gerarFicha,
} from './characterUtils';
import { ORIGENS } from '../data/origins';
import { levelUp } from './progression';

export interface CreationState {
  step: number;
  data: {
    tipo?: 'Agente' | 'Sobrevivente';
    nome?: string;
    conceito?: string;
    classe?: ClasseName;
    origem?: Origem;
    nex?: number;
    estagio?: number;
    usarPd?: boolean;
    atributos: Atributos;
    periciasTreinadas: PericiaName[];
    periciasSelecionadas?: PericiaName[];
    rituais?: Ritual[];
    equipamentos?: Item[];
  };
}

export const INITIAL_STATE: CreationState = {
  step: 0,
  data: {
    atributos: { AGI: 1, FOR: 1, INT: 1, PRE: 1, VIG: 1 },
    periciasTreinadas: [],
    periciasSelecionadas: [],
    rituais: [],
    equipamentos: [],
  }
};


export function setTipo(state: CreationState, tipo: 'Agente' | 'Sobrevivente'): CreationState {
  return {
    ...state,
    data: { ...state.data, tipo },
    step: 1
  };
}


export function setConceitoClasse(
  state: CreationState, 
  nome: string, 
  conceito: string, 
  classe: ClasseName,
  nex?: number,
  estagio?: number,
  usarPd?: boolean
): CreationState {
  return {
    ...state,
    data: { ...state.data, nome, conceito, classe, nex, estagio, usarPd },
    step: 2
  };
}


export function setAtributos(
  state: CreationState, 
  atributos: Atributos
): CreationState {
  if (!state.data.classe) throw new Error("Classe não definida.");
  
  const validacao = validarDistribuicaoAtributos(atributos, state.data.classe);
  if (!validacao.valido) {
    throw new Error(validacao.mensagem);
  }

  return {
    ...state,
    data: { ...state.data, atributos },
    step: 3
  };
}


export function setOrigem(
  state: CreationState, 
  origemNome: string
): CreationState {
  const origem = ORIGENS.find(o => o.nome === origemNome);
  if (!origem) throw new Error("Origem não encontrada.");

  return {
    ...state,
    data: { ...state.data, origem },
    step: 4
  };
}

export function setPericias(
  state: CreationState, 
  periciasEscolhidas: PericiaName[]
): CreationState {
  const { classe, atributos, origem } = state.data;
  if (!classe || !atributos || !origem) throw new Error("Dados incompletos.");

  const { qtdEscolhaLivre, obrigatorias } = calcularPericiasIniciais(classe, atributos.INT, origem);
  
  if (periciasEscolhidas.length > qtdEscolhaLivre) {
    throw new Error(`Você escolheu ${periciasEscolhidas.length} perícias, mas só pode escolher ${qtdEscolhaLivre}.`);
  }

  const conjunto = new Set<PericiaName>([...obrigatorias, ...periciasEscolhidas]);
  const todasPericias = Array.from(conjunto);

  return {
    ...state,
    data: {
      ...state.data,
      periciasTreinadas: todasPericias,
      periciasSelecionadas: periciasEscolhidas,
    },
    step: 5,
  };
}

export function setRituais(state: CreationState, rituais: Ritual[]): CreationState {
  if (state.data.classe !== 'Ocultista') return state;
  if (rituais.length > 3) throw new Error("Máximo de 3 rituais iniciais.");
  
  return {
    ...state,
    data: { ...state.data, rituais },
    step: 6
  };
}

export function setEquipamento(state: CreationState, equipamentos: Item[]): CreationState {
  return {
    ...state,
    data: { ...state.data, equipamentos },
    step: 7
  };
}

export function finalizarCriacao(state: CreationState): Personagem {
  const { nome, conceito, classe, origem, atributos, periciasSelecionadas, rituais, equipamentos, nex, estagio } = state.data;
  
  if (!nome || !classe || !origem) throw new Error("Dados incompletos para finalizar.");

  const nexBase = state.data.tipo === 'Sobrevivente' ? 0 : 5;
  const estagioBase = state.data.tipo === 'Sobrevivente' ? 1 : undefined;

  let personagem = gerarFicha({
    nome,
    conceito,
    classe,
    origem,
    atributos,
    periciasLivres: periciasSelecionadas ?? [],
    nex: nexBase,
    estagio: estagioBase,
    rituais,
    equipamentos
  });

  const targetNex = nex || 5;
  const targetEstagio = estagio || 1;

  if (personagem.classe === 'Sobrevivente') {
      for (let i = 1; i < targetEstagio; i++) {
          personagem = levelUp(personagem);
      }
  } else {
      const safeTarget = Math.min(99, Math.max(5, targetNex));
      // NEX sobe em degraus (inclui 99%). Evitamos aritmética de +5 aqui para não cair em 100%.
      while (personagem.nex < safeTarget) {
          personagem = levelUp(personagem);
      }
  }

  return personagem;
}
