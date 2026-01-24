import { Personagem, AtributoKey, Trilha, Poder, PericiaName } from '../core/types';
import { calculateDerivedStats } from '../core/rules/derivedStats';
import { TRILHAS } from '../data/tracks';
import { PODERES, verificarRequisitos } from '../data/powers';
import { calcularPericiasDetalhadas, calcularCarga } from './rulesEngine';

const NEX_ATRIBUTO = [20, 50, 80, 95];
const ESTAGIO_ATRIBUTO = [3];

const NEX_HABILIDADE = [10, 40, 65, 99];
const ESTAGIO_HABILIDADE = [2, 4];

// Marcos de NEX para poderes de classe
const NEX_PODER = [15, 30, 45, 60, 75, 90];

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
    // NEX avança em degraus de 5% até 95%, e o último degrau é 99% (OPRPG).
    // Portanto 95% -> 99% (não 100%).
    if (currentNex >= 99) return newChar;
    const newNex = currentNex === 95 ? 99 : currentNex + 5;
    newChar.nex = newNex;

    // Grau de Treinamento (OPRPG): em NEX 35% e 70% promove perícias (escolha do jogador).
    if (newNex === 35 || newNex === 70) {
      const basePorClasse: Record<string, number> = {
        Combatente: 2,
        Especialista: 5,
        Ocultista: 3,
      };
      const base = basePorClasse[newChar.classe] ?? 0;
      const qtd = Math.max(0, base + newChar.atributos.INT);
      if (qtd > 0) {
        const alvo = newNex === 35 ? 'Veterano' : 'Expert';
        const atual = newChar.periciasPromocaoPendentes;
        newChar.periciasPromocaoPendentes = {
          alvo,
          restante: (atual && atual.alvo === alvo ? atual.restante : 0) + qtd,
        };
      }
    }

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

    // Poder de classe nos marcos 15/30/45/60/75/90
    if (NEX_PODER.includes(newNex)) {
      newChar.poderesClassePendentes = (newChar.poderesClassePendentes || 0) + 1;
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
    // Degrau especial: 99% volta para 95%.
    newChar.nex = currentNex === 99 ? 95 : currentNex - 5;

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
  const derived = calculateDerivedStats({
    classe: char.classe,
    atributos: char.atributos,
    nex: char.nex,
    estagio: char.estagio,
    origemNome: char.origem,
    trilhaNome: char.trilha,
    qtdTranscender: char.qtdTranscender,
  });

  const targetPvMax = char.overrides?.pvMax ?? derived.pvMax;
  const targetPeMax = char.overrides?.peMax ?? derived.peMax;
  const targetSanMax = char.overrides?.sanMax ?? derived.sanMax;

  const diffPV = targetPvMax - char.pv.max;
  const diffPE = targetPeMax - char.pe.max;
  const diffSAN = targetSanMax - char.san.max;

  char.pv.max = targetPvMax;
  char.pv.atual = Math.min(char.pv.max, Math.max(0, char.pv.atual + diffPV));
  char.pv.machucado = Math.floor(char.pv.max / 2);

  char.pe.max = targetPeMax;
  char.pe.atual = Math.min(char.pe.max, Math.max(0, char.pe.atual + diffPE));
  char.pe.rodada = derived.peRodada;

  char.san.max = targetSanMax;
  char.san.atual = Math.min(char.san.max, Math.max(0, char.san.atual + diffSAN));

  // Atualizar defesa se derivado do cálculo
  if (char.defesa !== undefined && !char.overrides?.defesa) {
    char.defesa = derived.defesa;
  }

  if (char.usarPd) {
    if (!char.pd) {
      const targetPdMax = char.overrides?.pdMax ?? derived.pdMax;
      char.pd = { atual: targetPdMax, max: targetPdMax };
    } else {
      const targetPdMax = char.overrides?.pdMax ?? derived.pdMax;
      const diffPD = targetPdMax - char.pd.max;
      char.pd.max = targetPdMax;
      char.pd.atual = Math.min(char.pd.max, Math.max(0, char.pd.atual + diffPD));
    }
  }

  // Atualizar Carga
  const cargaInfo = calcularCarga({
    atributos: char.atributos,
    itens: char.equipamentos,
    poderes: char.poderes,
    bonusCarga: char.bonus?.carga
  });
  char.carga = {
    atual: cargaInfo.atual,
    maxima: cargaInfo.maxima
  };

  // Atualizar Perícias Detalhadas com bônus vindos de trilha/origem (derived stats)
  // Montamos um objeto de bônus fixos baseado no que veio do derived stats
  const extrasFixos: Partial<Record<PericiaName, number>> = {};
  if (derived.furtividadeBonus) extrasFixos.Furtividade = (extrasFixos.Furtividade || 0) + derived.furtividadeBonus;
  if (derived.percepcaoBonus) extrasFixos.Percepção = (extrasFixos.Percepção || 0) + derived.percepcaoBonus;
  if (derived.iniciativaBonus) extrasFixos.Iniciativa = (extrasFixos.Iniciativa || 0) + derived.iniciativaBonus;
  if (derived.enganacaoBonus) extrasFixos.Enganação = (extrasFixos.Enganação || 0) + derived.enganacaoBonus;
  if (derived.diplomaciaBonus) extrasFixos.Diplomacia = (extrasFixos.Diplomacia || 0) + derived.diplomaciaBonus;
  if (derived.fortitudeBonus) extrasFixos.Fortitude = (extrasFixos.Fortitude || 0) + derived.fortitudeBonus;

  // Preserva overrides manuais de perícias se houver
  const overridesFixos = char.overrides?.periciaFixos || {};

  // Merge dos bônus: derived + overrides
  const finalExtrasFixos: Partial<Record<PericiaName, number>> = { ...extrasFixos };
  for (const [key, val] of Object.entries(overridesFixos)) {
    const k = key as PericiaName;
    finalExtrasFixos[k] = (finalExtrasFixos[k] || 0) + (val as number);
  }

  char.periciasDetalhadas = calcularPericiasDetalhadas(
    char.atributos,
    char.pericias,
    {
      fixos: finalExtrasFixos,
      // Se tiver bônus de dados também, deveria vir aqui. Por enquanto derivados só dão bônus numérico fixo.
      dados: char.bonus?.periciaDados
    }
  );
}

/**
 * Recalcula todos os recursos de um personagem existente, aplicando os bônus de origem e trilha.
 * Use esta função para atualizar personagens criados antes da implementação dos bônus automáticos.
 * 
 * @param personagem - O personagem a ser recalculado
 * @returns O personagem com os recursos atualizados
 */
export function recalcularRecursosPersonagem(personagem: Personagem): Personagem {
  const char = { ...personagem };
  recalculateStats(char);
  return char;
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

/**
 * Aplica a escolha de um poder de classe ao personagem.
 * Verifica requisitos e decrementa a contagem de poderes pendentes.
 */
export function choosePower(character: Personagem, poderNome: string): Personagem {
  const newChar = { ...character };

  // Verifica se tem poderes pendentes
  if (!newChar.poderesClassePendentes || newChar.poderesClassePendentes <= 0) {
    throw new Error('Não há poderes de classe pendentes para escolher.');
  }

  // Busca o poder no catálogo
  const poder = PODERES.find(p => p.nome === poderNome);
  if (!poder) {
    throw new Error(`Poder "${poderNome}" não encontrado.`);
  }

  // Verifica se já possui o poder
  if (newChar.poderes.some(p => p.nome === poderNome)) {
    throw new Error(`Você já possui o poder "${poderNome}".`);
  }

  // Verifica requisitos
  const { elegivel, motivo } = verificarRequisitos(poder, newChar);
  if (!elegivel) {
    throw new Error(`Requisito não atendido: ${motivo}`);
  }

  // Adiciona o poder
  newChar.poderes = [...newChar.poderes, poder];

  // Decrementa pendência
  newChar.poderesClassePendentes = (newChar.poderesClassePendentes || 1) - 1;
  if (newChar.poderesClassePendentes <= 0) {
    newChar.poderesClassePendentes = undefined;
  }

  return newChar;
}
