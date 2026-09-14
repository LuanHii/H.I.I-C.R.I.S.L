import type { Atributos, ClasseName, Patente, PericiaName } from '../types';
import { CLASSES } from '../../data/character/classes';
import { TRILHAS } from '../../data/character/tracks';
import { getPatenteConfig } from '../../logic/rulesEngine';
import { buildFicha } from './buildFicha';
import { registrarEscolha } from './registrarEscolha';
import type { FichaPersistida, Problema } from './tipos';

export interface DadosDeCriacao {
  tipo: 'Agente' | 'Sobrevivente';
  nome: string;
  conceito?: string;
  classe: ClasseName;
  origem: string;
  atributos: Atributos;
  periciasTreinadas: readonly PericiaName[];
  nex?: number;
  estagio?: number;
  usarPd?: boolean;
  rituais?: readonly string[];
  trilha?: string;
  decisoesDeTrilha?: Readonly<Record<string, string>>;
  patente?: Patente;
}

export interface ResultadoCriacao {
  ficha: FichaPersistida;
  problemas: Problema[];
}

function periciasLivresDe(classe: ClasseName, treinadas: readonly PericiaName[]): PericiaName[] {
  const fixas = new Set(CLASSES[classe].periciasObrigatorias);
  return Array.from(new Set(treinadas)).filter((p) => !fixas.has(p));
}

function paresIncompletos(classe: ClasseName, treinadas: readonly PericiaName[]): Problema[] {
  const tem = new Set(treinadas);
  return (CLASSES[classe].periciasEmPar ?? [])
    .filter(([a, b]) => !tem.has(a) && !tem.has(b))
    .map(([a, b]) => ({
      gravidade: 'erro' as const,
      codigo: 'pericia_de_par_ausente',
      mensagem: `${classe} precisa ser treinado em ${a} ou ${b} (Ordem:705).`,
    }));
}

export function criarFicha(dados: DadosDeCriacao): ResultadoCriacao {
  const problemas: Problema[] = [...paresIncompletos(dados.classe, dados.periciasTreinadas)];
  const sobrevivente = dados.tipo === 'Sobrevivente' || dados.classe === 'Sobrevivente';

  let ficha: FichaPersistida = {
    versao: 2,
    identidade: {
      nome: dados.nome.trim(),
      ...(dados.conceito?.trim() ? { conceito: dados.conceito.trim() } : {}),
      classe: dados.classe,
      origem: dados.origem,
      atributosBase: { ...dados.atributos },
      periciasLivres: periciasLivresDe(dados.classe, dados.periciasTreinadas),
      beneficioOrigem: 'ambos',
    },
    progressao: sobrevivente
      ? { nex: 0, estagio: Math.max(1, Math.trunc(dados.estagio ?? 1)) }
      : { nex: Math.min(99, Math.max(5, Math.trunc(dados.nex ?? 5))) },
    escolhas: [],
    sessao: {
      pvDano: 0,
      peGasto: 0,
      sanPerdida: 0,
      pontosPrestigio: getPatenteConfig(dados.patente ?? 'Recruta').ppMin,
      ...(dados.usarPd ? { pdGasto: 0 } : {}),
    },
    ajustes: {},
  };

  const responder = (id: string, valor: Parameters<typeof registrarEscolha>[2]) => {
    const r = registrarEscolha(ficha, id, valor);
    problemas.push(...r.problemas.filter((p) => p.gravidade === 'erro'));
    if (r.aplicada) ficha = r.ficha;
  };

  const rituais = (dados.rituais ?? []).map((r) => r.trim()).filter(Boolean);
  if (rituais.length > 0) {
    const vagas = buildFicha({ ficha }).pendencias
      .map((p) => p.slot)
      .filter((s) => s.kind === 'ritual' && s.nivel === 5);
    rituais.slice(0, vagas.length).forEach((ritual, i) => {
      responder(vagas[i].id, { tipo: 'ritual', ritual });
    });
    if (rituais.length > vagas.length) {
      problemas.push({
        gravidade: 'erro',
        codigo: 'rituais_iniciais_excedidos',
        mensagem: `${dados.classe} começa com ${vagas.length} ritual(is); ${rituais.length} foram informados.`,
      });
    }
  }

  if (dados.trilha) {
    const vaga = buildFicha({ ficha }).pendencias.find((p) => p.slot.kind === 'trilha');
    if (vaga) {
      responder(vaga.slot.id, { tipo: 'trilha', trilha: dados.trilha });
      responderDecisoesDeTrilha(dados.trilha, dados.decisoesDeTrilha ?? {});
    } else {
      problemas.push({
        gravidade: 'erro',
        codigo: 'trilha_sem_marco',
        mensagem: 'Trilha informada, mas este nível ainda não abre a escolha de trilha.',
      });
    }
  }

  function responderDecisoesDeTrilha(nomeTrilha: string, decisoes: Readonly<Record<string, string>>) {
    const trilha = TRILHAS.find((t) => t.nome === nomeTrilha);
    for (const [habilidade, valor] of Object.entries(decisoes)) {
      const hab = trilha?.habilidades.find((h) => h.nome === habilidade);
      if (!hab) {
        problemas.push({
          gravidade: 'erro',
          codigo: 'decisao_de_trilha_sem_habilidade',
          mensagem: `"${habilidade}" não é uma habilidade da trilha ${nomeTrilha}.`,
        });
        continue;
      }
      const vaga = buildFicha({ ficha }).pendencias.find((p) => p.slot.kind === 'trilhaHabilidade' && p.slot.nivel === hab.nex);
      if (!vaga) {
        problemas.push({
          gravidade: 'erro',
          codigo: 'decisao_de_trilha_sem_vaga',
          mensagem: `"${habilidade}" não abre decisão neste nível.`,
        });
        continue;
      }
      responder(vaga.slot.id, { tipo: 'habilidadeTrilha', habilidade, escolhaInterna: valor });
    }
  }

  const build = buildFicha({ ficha });
  for (const p of build.problemas) {
    if (p.gravidade === 'erro' && !problemas.some((q) => q.codigo === p.codigo && q.mensagem === p.mensagem)) {
      problemas.push(p);
    }
  }

  return { ficha, problemas };
}

export function criacaoValida(resultado: ResultadoCriacao): boolean {
  return resultado.problemas.every((p) => p.gravidade !== 'erro');
}
