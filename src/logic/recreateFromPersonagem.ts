import { ORIGENS } from '../data/origins';
import { RITUAIS } from '../data/rituals';
import type { Atributos, ClasseName, PericiaName, Personagem, Ritual } from '../core/types';
import type { ClassePreferencias } from './rulesEngine';
import { calcularPericiasIniciais, TODAS_PERICIAS } from './characterUtils';
import { INITIAL_STATE, type CreationState } from './creationWorkflow';

export interface RecreateDraft {
  // Campos do formulário
  tipo: 'Agente' | 'Sobrevivente';
  nome: string;
  conceito: string;
  usarPd: boolean;
  classe: ClasseName;
  nexOrEstagio: number;
  origemNome: string;
  preferenciasClasse?: ClassePreferencias;
  atributosBase: Atributos;
  periciasLivres: PericiaName[];
  rituaisIniciais: Ritual[];
  equipamentosIniciais: Personagem['equipamentos'];
}

function inferCombatentePreferencias(p: Personagem): ClassePreferencias {
  const ofensiva: ClassePreferencias['ofensiva'] = p.pericias?.Luta && p.pericias.Luta !== 'Destreinado' ? 'Luta' : 'Pontaria';
  const defensiva: ClassePreferencias['defensiva'] =
    p.pericias?.Fortitude && p.pericias.Fortitude !== 'Destreinado' ? 'Fortitude' : 'Reflexos';
  return { ofensiva, defensiva };
}

function buildAtributosBaseFromCurrent(current: Atributos, tipo: 'Agente' | 'Sobrevivente'): Atributos {
  // A criação inicial limita 0..3, soma alvo (Agente=9, Sobrevivente=8) e no máx 1 atributo em 0.
  const targetSum = tipo === 'Sobrevivente' ? 8 : 9;
  const base: Atributos = { AGI: 1, FOR: 1, INT: 1, PRE: 1, VIG: 1 };
  const ranking = (Object.keys(base) as Array<keyof Atributos>).sort((a, b) => (current[b] ?? 0) - (current[a] ?? 0));

  let points = targetSum - Object.values(base).reduce((acc, v) => acc + v, 0);
  for (const key of ranking) {
    while (points > 0 && base[key] < 3) {
      base[key] += 1;
      points -= 1;
    }
    if (points <= 0) break;
  }

  // Se o personagem tiver vários atributos 0 no atual, tentamos refletir 1 zero no base (o máximo permitido)
  const zeros = (Object.keys(current) as Array<keyof Atributos>).filter((k) => (current[k] ?? 0) === 0);
  if (zeros.length > 0) {
    const chosenZero = zeros[0];
    // só aplica se não quebrar a soma/limites
    if (base[chosenZero] > 0) {
      base[chosenZero] -= 1;
      // redistribui 1 ponto para o maior atributo ainda < 3
      const recipient = ranking.find((k) => k !== chosenZero && base[k] < 3);
      if (recipient) base[recipient] += 1;
    }
  }

  return base;
}

function clampLevel(tipo: 'Agente' | 'Sobrevivente', value: number): number {
  if (tipo === 'Sobrevivente') return Math.max(1, Math.min(10, value || 1));
  if (value === 99) return 99;
  return Math.max(5, Math.min(99, value || 5));
}

function pickRituaisIniciais(p: Personagem): Ritual[] {
  if (p.classe !== 'Ocultista') return [];
  // UI atual de criação trabalha com círculo 1 (até 3).
  const nomes = new Set((p.rituais ?? []).map((r) => r.nome));
  return RITUAIS.filter((r) => r.circulo === 1 && nomes.has(r.nome)).slice(0, 3);
}

export function buildRecreateDraftFromPersonagem(p: Personagem): RecreateDraft {
  const tipo: RecreateDraft['tipo'] = p.classe === 'Sobrevivente' ? 'Sobrevivente' : 'Agente';
  const classe: ClasseName = (p.classe === 'Sobrevivente' ? 'Sobrevivente' : p.classe) as ClasseName;
  const preferenciasClasse = classe === 'Combatente' ? inferCombatentePreferencias(p) : undefined;
  const nexOrEstagio = clampLevel(tipo, tipo === 'Sobrevivente' ? (p.estagio ?? 1) : (p.nex ?? 5));
  const origemNome = p.origem;
  const atributosBase = buildAtributosBaseFromCurrent(p.atributos, tipo);

  // Inferir perícias livres iniciais (melhor esforço).
  let periciasLivres: PericiaName[] = [];
  const origemObj = ORIGENS.find((o) => o.nome === origemNome);
  if (origemObj && classe) {
    const meta = calcularPericiasIniciais(classe, atributosBase.INT, origemObj, preferenciasClasse);
    const obrigatorias = new Set<PericiaName>(meta.obrigatorias);
    const treinadas = Object.entries(p.pericias)
      .filter(([_, grau]) => grau && grau !== 'Destreinado')
      .map(([nome]) => nome as PericiaName);
    periciasLivres = treinadas.filter((n) => !obrigatorias.has(n)).slice(0, meta.qtdEscolhaLivre);

    // Se faltar, preenche automaticamente para evitar "pendências" na ficha recriada.
    if (periciasLivres.length < meta.qtdEscolhaLivre) {
      const escolhidas = new Set<PericiaName>([...periciasLivres, ...meta.obrigatorias]);
      for (const pNome of TODAS_PERICIAS) {
        if (periciasLivres.length >= meta.qtdEscolhaLivre) break;
        if (escolhidas.has(pNome)) continue;
        periciasLivres.push(pNome);
        escolhidas.add(pNome);
      }
    }
  }

  return {
    tipo,
    nome: `${p.nome} (recriado)`,
    conceito: p.conceito ?? '',
    usarPd: p.usarPd === true,
    classe,
    nexOrEstagio,
    origemNome,
    preferenciasClasse,
    atributosBase,
    periciasLivres,
    rituaisIniciais: pickRituaisIniciais(p),
    equipamentosIniciais: p.equipamentos ?? [],
  };
}

export function buildCreationStateFromDraft(draft: RecreateDraft): CreationState {
  // Preenche o estado (dados completos), mas o componente pode escolher o step inicial.
  const origemObj = ORIGENS.find((o) => o.nome === draft.origemNome);
  const s: CreationState = {
    ...INITIAL_STATE,
    data: {
      ...INITIAL_STATE.data,
      tipo: draft.tipo,
      nome: draft.nome,
      conceito: draft.conceito,
      classe: draft.classe,
      origem: (origemObj ?? ORIGENS[0]) as any,
      nex: draft.tipo === 'Agente' ? draft.nexOrEstagio : undefined,
      estagio: draft.tipo === 'Sobrevivente' ? draft.nexOrEstagio : undefined,
      usarPd: draft.usarPd,
      preferenciasClasse: draft.preferenciasClasse,
      atributos: draft.atributosBase,
      periciasTreinadas: [],
      periciasSelecionadas: draft.periciasLivres,
      rituais: draft.rituaisIniciais,
      equipamentos: draft.equipamentosIniciais,
    },
  };
  return s;
}


