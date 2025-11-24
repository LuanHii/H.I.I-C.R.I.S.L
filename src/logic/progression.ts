import { Personagem, AtributoKey, Trilha, Poder } from '../core/types';
import { calculateDerivedStats } from '../core/rules/derivedStats';
import { TRILHAS } from '../data/tracks';

const NEX_ATRIBUTO = [20, 50, 80, 95];
const ESTAGIO_ATRIBUTO = [3];

const NEX_HABILIDADE = [10, 40, 65, 99];
const ESTAGIO_HABILIDADE = [2, 4];

export function levelUp(character: Personagem): Personagem {
  const newChar = { ...character };
  
  if (newChar.classe === 'Sobrevivente') {
    const currentStage = newChar.estagio || 1;
    const newStage = currentStage + 1;
    newChar.estagio = newStage;

    if (ESTAGIO_ATRIBUTO.includes(newStage)) {
      newChar.pontosAtributoPendentes = (newChar.pontosAtributoPendentes || 0) + 1;
    }

    if (ESTAGIO_HABILIDADE.includes(newStage)) {
      if (!newChar.trilha && newStage === 2) {
          newChar.escolhaTrilhaPendente = true;
      } else if (newChar.trilha) {
          addTrackAbility(newChar, newStage, true);
      }
    }

  } else {
    const currentNex = newChar.nex;
    const newNex = currentNex + 5;
    newChar.nex = newNex;

    if (NEX_ATRIBUTO.includes(newNex)) {
      newChar.pontosAtributoPendentes = (newChar.pontosAtributoPendentes || 0) + 1;
    }

    if (NEX_HABILIDADE.includes(newNex)) {
      if (!newChar.trilha && newNex === 10) {
          newChar.escolhaTrilhaPendente = true;
      } else if (newChar.trilha) {
          addTrackAbility(newChar, newNex, false);
      }
    }
  }

  recalculateStats(newChar);

  return newChar;
}

export function levelDown(character: Personagem): Personagem {
  const newChar = { ...character };

  if (newChar.classe === 'Sobrevivente') {
    const currentStage = newChar.estagio || 1;
    if (currentStage <= 1) return newChar;

    const oldStage = currentStage;
    newChar.estagio = currentStage - 1;

    if (ESTAGIO_ATRIBUTO.includes(oldStage)) {
      newChar.pontosAtributoPendentes = (newChar.pontosAtributoPendentes || 0) - 1;
    }

    if (ESTAGIO_HABILIDADE.includes(oldStage) && newChar.trilha) {
       removeTrackAbility(newChar, oldStage, true);
    }

  } else {
    const currentNex = newChar.nex;
    if (currentNex <= 5) return newChar;

    const oldNex = currentNex;
    newChar.nex = currentNex - 5;

    if (NEX_ATRIBUTO.includes(oldNex)) {
      newChar.pontosAtributoPendentes = (newChar.pontosAtributoPendentes || 0) - 1;
    }

    if (NEX_HABILIDADE.includes(oldNex) && newChar.trilha) {
      removeTrackAbility(newChar, oldNex, false);
    }
  }

  recalculateStats(newChar);

  return newChar;
}

export function applyAttributePoint(character: Personagem, attribute: AtributoKey): Personagem {
  if (!character.pontosAtributoPendentes || character.pontosAtributoPendentes <= 0) {
    return character;
  }

  // Regra de Sobrevivente: Não pode aumentar atributo além de 3 via progressão
  if (character.classe === 'Sobrevivente' && character.atributos[attribute] >= 3) {
    return character;
  }

  const newChar = { ...character };
  newChar.atributos = { ...newChar.atributos };
  newChar.atributos[attribute] += 1;
  newChar.pontosAtributoPendentes = (newChar.pontosAtributoPendentes || 0) - 1;

  if (attribute === 'INT') {
      newChar.periciasTreinadasPendentes = (newChar.periciasTreinadasPendentes || 0) + 1;
  }

  recalculateStats(newChar);
  return newChar;
}

export function removeAttributePoint(character: Personagem, attribute: AtributoKey): Personagem {
    const newChar = { ...character };
    newChar.atributos = { ...newChar.atributos };
    
    if (newChar.atributos[attribute] > 0) { // Evita atributo negativo
        newChar.atributos[attribute] -= 1;
        newChar.pontosAtributoPendentes = (newChar.pontosAtributoPendentes || 0) + 1;
        recalculateStats(newChar);
    }
    
    return newChar;
}

export function chooseTrack(character: Personagem, trackName: string): Personagem {
  const newChar = { ...character };
  newChar.trilha = trackName;
  newChar.escolhaTrilhaPendente = false;

  const currentLevel = newChar.classe === 'Sobrevivente' ? (newChar.estagio || 0) : newChar.nex;
  const isStage = newChar.classe === 'Sobrevivente';
  
  const trilhaData = TRILHAS.find(t => t.nome === trackName);
  if (trilhaData) {
      trilhaData.habilidades.forEach(h => {
          if (h.nex <= currentLevel) {
              addTrackAbility(newChar, h.nex, isStage);
          }
      });
  }

  return newChar;
}

function recalculateStats(char: Personagem) {
  const derived = calculateDerivedStats(char.classe, char.atributos, char.nex, char.estagio);
  
  const diffPV = derived.pvMax - char.pv.max;
  const diffPE = derived.peMax - char.pe.max;
  const diffSAN = derived.sanMax - char.san.max;

  char.pv.max = derived.pvMax;
  char.pv.atual += diffPV;

  char.pe.max = derived.peMax;
  char.pe.atual += diffPE;
  char.pe.rodada = derived.peRodada;

  char.san.max = derived.sanMax;
  char.san.atual += diffSAN;
  
  if (char.usarPd) {
      if (!char.pd) {
          char.pd = { atual: derived.pdMax, max: derived.pdMax };
      } else {
          const diffPD = derived.pdMax - char.pd.max;
          char.pd.max = derived.pdMax;
          char.pd.atual += diffPD;
      }
  }
}

function addTrackAbility(char: Personagem, level: number, isStage: boolean) {
  const trilhaData = TRILHAS.find(t => t.nome === char.trilha);
  if (!trilhaData) return;

  const habilidade = trilhaData.habilidades.find(h => h.nex === level);
  if (habilidade) {
    const exists = char.poderes.some(p => p.nome === habilidade.nome);
    if (!exists) {
      const novoPoder: Poder = {
        nome: habilidade.nome,
        descricao: habilidade.descricao,
        tipo: 'Trilha',
        livro: trilhaData.livro as any 
      };
      char.poderes = [...char.poderes, novoPoder];

      if (habilidade.escolha) {
        if (!char.habilidadesTrilhaPendentes) char.habilidadesTrilhaPendentes = [];
        const isPending = char.habilidadesTrilhaPendentes.some(p => p.habilidade === habilidade.nome);
        if (!isPending) {
            char.habilidadesTrilhaPendentes.push({
                trilha: trilhaData.nome,
                habilidade: habilidade.nome,
                escolha: habilidade.escolha
            });
        }
     }
    }
  }
}

function removeTrackAbility(char: Personagem, level: number, isStage: boolean) {
    const trilhaData = TRILHAS.find(t => t.nome === char.trilha);
    if (!trilhaData) return;
  
    const habilidade = trilhaData.habilidades.find(h => h.nex === level);
    if (habilidade) {
      char.poderes = char.poderes.filter(p => p.nome !== habilidade.nome);
      if (char.habilidadesTrilhaPendentes) {
        char.habilidadesTrilhaPendentes = char.habilidadesTrilhaPendentes.filter(p => p.habilidade !== habilidade.nome);
      }
    }
}
