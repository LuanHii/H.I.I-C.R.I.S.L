import { Personagem } from '../types';
import { calculateDerivedStats } from '../rules/derivedStats';
import { calcularCarga } from '../../logic/rulesEngine';

export type PersonagemIssueSeverity = 'erro' | 'aviso';

export interface PersonagemIssue {
  severity: PersonagemIssueSeverity;
  code: string;
  message: string;
}

function allowedNexValues(): Set<number> {
  const s = new Set<number>();
  for (let n = 5; n <= 95; n += 5) s.add(n);
  s.add(99);
  return s;
}

function expectedPeRodada(personagem: Personagem): number {
  if (personagem.classe === 'Sobrevivente') return 1;
  const nivel = Math.min(20, Math.max(1, Math.ceil(Math.max(personagem.nex, 0) / 5)));
  return nivel;
}

export function auditPersonagem(personagem: Personagem): PersonagemIssue[] {
  const issues: PersonagemIssue[] = [];

  // Campos básicos
  if (!personagem.nome || personagem.nome.trim().length === 0) {
    issues.push({ severity: 'erro', code: 'missing_name', message: 'Nome ausente.' });
  }
  if (!personagem.classe) {
    issues.push({ severity: 'erro', code: 'missing_class', message: 'Classe ausente.' });
  }
  if (!personagem.origem) {
    issues.push({ severity: 'aviso', code: 'missing_origin', message: 'Origem ausente.' });
  }
  if (!personagem.atributos) {
    issues.push({ severity: 'erro', code: 'missing_attributes', message: 'Atributos ausentes.' });
    return issues;
  }

  // NEX / estágio
  if (personagem.classe === 'Sobrevivente') {
    if (personagem.nex !== 0) {
      issues.push({
        severity: 'aviso',
        code: 'survivor_nex_not_zero',
        message: `Sobrevivente deveria estar com NEX 0% (atual: ${personagem.nex}%).`,
      });
    }
    if (!personagem.estagio || personagem.estagio < 1) {
      issues.push({
        severity: 'erro',
        code: 'survivor_missing_stage',
        message: 'Sobrevivente sem estágio válido (mínimo: 1).',
      });
    }
  } else {
    const allowed = allowedNexValues();
    if (!allowed.has(personagem.nex)) {
      issues.push({
        severity: 'aviso',
        code: 'invalid_nex_step',
        message: `NEX fora dos degraus padrão (esperado: 5,10,...,95,99). Atual: ${personagem.nex}%.`,
      });
    }
  }

  // Limite de PE por turno (Tabela 1.2)
  const rodadaEsperada = expectedPeRodada(personagem);
  if (personagem.pe?.rodada !== rodadaEsperada) {
    issues.push({
      severity: 'aviso',
      code: 'pe_rodada_mismatch',
      message: `Limite de PE por turno divergente. Atual: ${personagem.pe?.rodada ?? '?'}; esperado: ${rodadaEsperada}.`,
    });
  }

  // Recursos máximos (regra vs override)
  const derived = calculateDerivedStats(personagem.classe, personagem.atributos, personagem.nex, personagem.estagio);
  const expectedPvMax = personagem.overrides?.pvMax ?? derived.pvMax;
  const expectedPeMax = personagem.overrides?.peMax ?? derived.peMax;
  const expectedSanMax = personagem.overrides?.sanMax ?? derived.sanMax;
  const expectedPdMax = personagem.overrides?.pdMax ?? derived.pdMax;

  if (personagem.pv?.max !== expectedPvMax) {
    issues.push({
      severity: 'aviso',
      code: 'pv_max_mismatch',
      message: `PV máximo diverge do esperado. Atual: ${personagem.pv?.max ?? '?'}; esperado: ${expectedPvMax}.`,
    });
  }

  const usarPd = personagem.usarPd === true;
  if (!usarPd) {
    if (personagem.pe?.max !== expectedPeMax) {
      issues.push({
        severity: 'aviso',
        code: 'pe_max_mismatch',
        message: `PE máximo diverge do esperado. Atual: ${personagem.pe?.max ?? '?'}; esperado: ${expectedPeMax}.`,
      });
    }
    if (personagem.san?.max !== expectedSanMax) {
      issues.push({
        severity: 'aviso',
        code: 'san_max_mismatch',
        message: `SAN máximo diverge do esperado. Atual: ${personagem.san?.max ?? '?'}; esperado: ${expectedSanMax}.`,
      });
    }
  } else {
    if (!personagem.pd) {
      issues.push({
        severity: 'erro',
        code: 'pd_missing',
        message: 'Regra de Determinação ativa, mas PD está ausente.',
      });
    } else if (personagem.pd.max !== expectedPdMax) {
      issues.push({
        severity: 'aviso',
        code: 'pd_max_mismatch',
        message: `PD máximo diverge do esperado. Atual: ${personagem.pd.max}; esperado: ${expectedPdMax}.`,
      });
    }
    if ((personagem.pe?.max ?? 0) > 0 || (personagem.san?.max ?? 0) > 0) {
      issues.push({
        severity: 'aviso',
        code: 'pe_san_present_with_pd',
        message: 'Determinação ativa: normalmente PE/SAN ficam zerados (esta ficha mantém valores).',
      });
    }
  }

  if (!usarPd && personagem.pd) {
    issues.push({
      severity: 'aviso',
      code: 'pd_present_without_rule',
      message: 'PD existe, mas a regra de Determinação não está marcada como ativa.',
    });
  }

  // Valores atuais fora dos limites
  if (personagem.pv && (personagem.pv.atual < 0 || personagem.pv.atual > personagem.pv.max)) {
    issues.push({
      severity: 'erro',
      code: 'pv_out_of_bounds',
      message: `PV atual fora do limite (atual: ${personagem.pv.atual}, max: ${personagem.pv.max}).`,
    });
  }
  if (!usarPd) {
    if (personagem.pe && (personagem.pe.atual < 0 || personagem.pe.atual > personagem.pe.max)) {
      issues.push({
        severity: 'erro',
        code: 'pe_out_of_bounds',
        message: `PE atual fora do limite (atual: ${personagem.pe.atual}, max: ${personagem.pe.max}).`,
      });
    }
    if (personagem.san && (personagem.san.atual < 0 || personagem.san.atual > personagem.san.max)) {
      issues.push({
        severity: 'erro',
        code: 'san_out_of_bounds',
        message: `SAN atual fora do limite (atual: ${personagem.san.atual}, max: ${personagem.san.max}).`,
      });
    }
  } else if (personagem.pd && (personagem.pd.atual < 0 || personagem.pd.atual > personagem.pd.max)) {
    issues.push({
      severity: 'erro',
      code: 'pd_out_of_bounds',
      message: `PD atual fora do limite (atual: ${personagem.pd.atual}, max: ${personagem.pd.max}).`,
    });
  }

  // Perícias detalhadas
  if (!personagem.periciasDetalhadas || Object.keys(personagem.periciasDetalhadas).length === 0) {
    issues.push({
      severity: 'aviso',
      code: 'missing_pericias_detalhadas',
      message: 'Perícias detalhadas ausentes (pode indicar ficha antiga/normalização pendente).',
    });
  }

  // Carga
  try {
    const cargaCalc = calcularCarga({
      atributos: personagem.atributos,
      itens: personagem.equipamentos ?? [],
      poderes: personagem.poderes ?? [],
    });
    if (personagem.carga?.maxima !== cargaCalc.maxima) {
      issues.push({
        severity: 'aviso',
        code: 'carga_max_mismatch',
        message: `Carga máxima diverge do esperado. Atual: ${personagem.carga?.maxima ?? '?'}; esperado: ${cargaCalc.maxima}.`,
      });
    }
    if (personagem.carga && personagem.carga.atual > personagem.carga.maxima) {
      issues.push({
        severity: 'aviso',
        code: 'carga_over',
        message: `Carga atual acima da máxima (atual: ${personagem.carga.atual}, max: ${personagem.carga.maxima}).`,
      });
    }
  } catch {
    // não interrompe a UI em fichas corrompidas
  }

  // Pendências
  if (personagem.periciasTreinadasPendentes && personagem.periciasTreinadasPendentes > 0) {
    issues.push({
      severity: 'aviso',
      code: 'pending_skills',
      message: `Faltam escolher ${personagem.periciasTreinadasPendentes} perícia(s) treinada(s).`,
    });
  }
  if (personagem.escolhaTrilhaPendente) {
    issues.push({
      severity: 'aviso',
      code: 'pending_track',
      message: 'Trilha pendente de escolha.',
    });
  }
  if (personagem.habilidadesTrilhaPendentes && personagem.habilidadesTrilhaPendentes.length > 0) {
    issues.push({
      severity: 'aviso',
      code: 'pending_track_choices',
      message: `Há ${personagem.habilidadesTrilhaPendentes.length} escolha(s) pendente(s) de trilha.`,
    });
  }
  if (personagem.periciasPromocaoPendentes && personagem.periciasPromocaoPendentes.restante > 0) {
    issues.push({
      severity: 'aviso',
      code: 'pending_skill_promotion',
      message: `Promoção de perícia pendente: ${personagem.periciasPromocaoPendentes.restante}x para ${personagem.periciasPromocaoPendentes.alvo}.`,
    });
  }
  if (personagem.poderesClassePendentes && personagem.poderesClassePendentes > 0) {
    issues.push({
      severity: 'aviso',
      code: 'pending_class_powers',
      message: `Faltam escolher ${personagem.poderesClassePendentes} poder(es) de classe.`,
    });
  }

  return issues;
}

export function summarizeIssues(issues: PersonagemIssue[]) {
  const errors = issues.filter((i) => i.severity === 'erro').length;
  const warns = issues.filter((i) => i.severity === 'aviso').length;
  return { errors, warns, total: errors + warns };
}



