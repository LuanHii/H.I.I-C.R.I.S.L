import { Personagem, AtributoKey, Poder, PericiaName } from '../core/types';
import { calculateDerivedStats } from '../core/rules/derivedStats';
import { TRILHAS } from '../data/tracks';
import { PODERES, verificarRequisitos } from '../data/powers';
import { calcularPericiasDetalhadas, calcularCarga } from './rulesEngine';

export function applyAttributePoint(character: Personagem, attribute: AtributoKey): Personagem {
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

  if (newChar.atributos[attribute] > 0) {
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

  const trilhaData = TRILHAS.find(t => t.nome === trackName);
  if (trilhaData) {
    trilhaData.habilidades.forEach(h => {
      if (h.nex <= currentLevel) {
        addTrackAbility(newChar, h.nex);
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

  const extrasFixos: Partial<Record<PericiaName, number>> = {};
  if (derived.furtividadeBonus) extrasFixos.Furtividade = (extrasFixos.Furtividade || 0) + derived.furtividadeBonus;
  if (derived.percepcaoBonus) extrasFixos.Percepção = (extrasFixos.Percepção || 0) + derived.percepcaoBonus;
  if (derived.iniciativaBonus) extrasFixos.Iniciativa = (extrasFixos.Iniciativa || 0) + derived.iniciativaBonus;
  if (derived.enganacaoBonus) extrasFixos.Enganação = (extrasFixos.Enganação || 0) + derived.enganacaoBonus;
  if (derived.diplomaciaBonus) extrasFixos.Diplomacia = (extrasFixos.Diplomacia || 0) + derived.diplomaciaBonus;
  if (derived.fortitudeBonus) extrasFixos.Fortitude = (extrasFixos.Fortitude || 0) + derived.fortitudeBonus;

  const overridesFixos = char.overrides?.periciaFixos || {};

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

      dados: char.bonus?.periciaDados
    }
  );
}

export function recalcularRecursosPersonagem(personagem: Personagem): Personagem {
  const char = { ...personagem };
  recalculateStats(char);
  return char;
}

function addTrackAbility(char: Personagem, level: number) {
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

export function choosePower(character: Personagem, poderNome: string): Personagem {
  const newChar = { ...character };

  if (!newChar.poderesClassePendentes || newChar.poderesClassePendentes <= 0) {
    throw new Error('Não há poderes de classe pendentes para escolher.');
  }

  const poder = PODERES.find(p => p.nome === poderNome);
  if (!poder) {
    throw new Error(`Poder "${poderNome}" não encontrado.`);
  }

  if (newChar.poderes.some(p => p.nome === poderNome)) {
    throw new Error(`Você já possui o poder "${poderNome}".`);
  }

  const { elegivel, motivo } = verificarRequisitos(poder, newChar);
  if (!elegivel) {
    throw new Error(`Requisito não atendido: ${motivo}`);
  }

  newChar.poderes = [...newChar.poderes, poder];

  newChar.poderesClassePendentes = (newChar.poderesClassePendentes || 1) - 1;
  if (newChar.poderesClassePendentes <= 0) {
    newChar.poderesClassePendentes = undefined;
  }

  return newChar;
}
