import type { AtributoKey, Atributos, PericiaName, Personagem } from '../types';
import { CLASSES } from '../../data/character/classes';
import { ORIGENS } from '../../data/character/origins';
import { NEX_EVENTOS } from '../rules/nexEventos';
import { TRILHAS } from '../../data/character/tracks';
import { PODERES } from '../../data/character/powers';
import { buildFicha } from './buildFicha';
import { nomesAutomaticos } from './automaticos';
import { circuloMaximoPorNivel } from './opcoes';
import { RITUAIS } from '../../data/magic/rituals';
import { chaveEstagio, chaveNex, montarId, montarIdFilho, ordenarPorId } from './ids';
import { getPatenteConfig } from '../../logic/rulesEngine';
import type { Escolha, FichaPersistida, Problema, ValorEscolha } from './tipos';

export type Confianca = 'alta' | 'media' | 'baixa';

export interface EscolhaInferida extends Escolha {
  confianca: Confianca;
  nota: string;
}

export interface ResultadoInferencia {
  ficha: FichaPersistida;
  inferidas: EscolhaInferida[];
  problemas: Problema[];
  roundTripOk: boolean;
  divergencias: string[];
}

const ATRIBUTOS: AtributoKey[] = ['AGI', 'FOR', 'INT', 'PRE', 'VIG'];

const HABILIDADES_AUTOMATICAS = nomesAutomaticos();

function marcosDeAtributo(nex: number): number[] {
  return NEX_EVENTOS
    .filter((e) => e.tipo === 'Atributo' && e.requisito <= nex)
    .map((e) => e.requisito)
    .sort((a, b) => a - b);
}

function inferirAtributos(
  atributosFinais: Atributos,
  nex: number,
): { base: Atributos; escolhas: EscolhaInferida[] } {
  const marcos = marcosDeAtributo(nex);
  const base: Atributos = { ...atributosFinais };
  const escolhas: EscolhaInferida[] = [];

  for (const marco of marcos) {
    const candidato = [...ATRIBUTOS]
      .sort((a, b) => (base[b] - base[a]) || (ATRIBUTOS.indexOf(a) - ATRIBUTOS.indexOf(b)))
      .find((a) => base[a] > 1);

    if (!candidato) continue;

    base[candidato] -= 1;
    escolhas.push({
      id: montarId('atributo', chaveNex(marco)),
      valor: { tipo: 'atributo', atributo: candidato },
      confianca: 'media',
      nota: `Marco de NEX ${marco}%: qual atributo subiu não é registrado no v0. Distribuição inferida do total final.`,
    });
  }

  return { base, escolhas };
}

function inferirPericiasLivres(personagem: Personagem): PericiaName[] {
  const obrigatorias = new Set(CLASSES[personagem.classe].periciasObrigatorias);
  return (Object.entries(personagem.pericias) as [PericiaName, string][])
    .filter(([nome, grau]) => grau !== 'Destreinado' && !obrigatorias.has(nome))
    .map(([nome]) => nome);
}

export function inferirFicha(personagem: Personagem): ResultadoInferencia {
  const problemas: Problema[] = [];
  const inferidas: EscolhaInferida[] = [];

  const ehSobrevivente = personagem.classe === 'Sobrevivente';
  const nivel = ehSobrevivente ? (personagem.estagio ?? 1) : personagem.nex;

  const { base, escolhas: escolhasAtributo } = ehSobrevivente
    ? { base: personagem.atributos, escolhas: [] as EscolhaInferida[] }
    : inferirAtributos(personagem.atributos, personagem.nex);
  inferidas.push(...escolhasAtributo);

  if (personagem.trilha) {
    const existe = TRILHAS.some((t) => t.nome === personagem.trilha);
    if (existe) {
      inferidas.push({
        id: montarId('trilha', ehSobrevivente ? chaveEstagio(2) : chaveNex(10)),
        valor: { tipo: 'trilha', trilha: personagem.trilha },
        confianca: 'alta',
        nota: 'Trilha estava gravada na ficha.',
      });
    } else {
      problemas.push({
        gravidade: 'aviso',
        codigo: 'trilha_desconhecida',
        mensagem: `A trilha "${personagem.trilha}" não existe no catálogo. Mantida como ajuste manual.`,
      });
    }
  }

  if (personagem.afinidade && !ehSobrevivente && personagem.nex >= 50) {
    inferidas.push({
      id: montarId('afinidade', chaveNex(50)),
      valor: { tipo: 'afinidade', elemento: personagem.afinidade },
      confianca: 'alta',
      nota: 'Afinidade estava gravada na ficha.',
    });
  }

  const naoAtribuidos: string[] = [];
  const slotsPoder = NEX_EVENTOS
    .filter((e) => e.tipo === 'Poder' && e.requisito <= nivel)
    .map((e) => e.requisito)
    .sort((a, b) => a - b);

  let proximoSlot = 0;

  const trilhaDoPersonagem = TRILHAS.find((t) => t.nome === personagem.trilha);
  const habilidadesProprias = new Set(
    (trilhaDoPersonagem?.habilidades ?? [])
      .filter((h) => h.nex <= nivel)
      .map((h) => h.nome),
  );
  const origemCatalogo = ORIGENS.find((o) => o.nome === personagem.origem);
  const origemPoder = personagem.poderes.find(
    (p) => p.tipo === 'Origem' || p.nome === origemCatalogo?.poder.nome,
  )?.nome;
  const temPoderDeOrigem = origemPoder !== undefined;

  if (personagem.origem && !origemCatalogo) {
    problemas.push({
      gravidade: 'aviso',
      codigo: 'origem_fora_do_catalogo',
      mensagem: `A origem "${personagem.origem}" não existe no catálogo. `
        + 'O documento novo guarda o nome, mas o poder de origem não é concedido '
        + 'e nenhum efeito dela entra na ficha.',
    });
  }

  const paranormaisDaFicha = personagem.poderes.filter((poder) => {
    const doCatalogo = PODERES.find(
      (c) => c.nome === poder.nome || (c.apelidos ?? []).includes(poder.nome),
    );
    return doCatalogo?.tipo === 'Paranormal';
  });
  const nomesParanormais = new Set(paranormaisDaFicha.map((p) => p.nome));

  const porTranscender = [...paranormaisDaFicha];
  if (
    temPoderDeOrigem
    && origemCatalogo?.poder.escolha?.tipo === 'poderParanormal'
    && porTranscender.length > 0
  ) {
    const daOrigem = porTranscender.shift()!;
    const nivelInicial = ehSobrevivente ? 1 : 5;
    inferidas.push({
      id: montarId(
        'poderParanormal',
        ehSobrevivente ? chaveEstagio(nivelInicial) : chaveNex(nivelInicial),
        0,
      ),
      valor: { tipo: 'poder', poder: daOrigem.nome },
      confianca: 'media',
      nota: `"${origemCatalogo.poder.nome}" concede um poder paranormal na criação. `
        + `"${daOrigem.nome}" foi atribuído a ele, e não a um Transcender, que cobraria Sanidade que a origem não cobra.`,
    });
  }

  const transcendeu = personagem.qtdTranscender ?? 0;
  if (porTranscender.length > transcendeu) {
    for (const sobrando of porTranscender.slice(transcendeu)) {
      problemas.push({
        gravidade: 'aviso',
        codigo: 'paranormal_sem_transcender',
        mensagem: `"${sobrando.nome}" é um poder paranormal, mas a ficha registra `
          + `${transcendeu} Transcender. Sem saber por onde ele entrou, ele fica em `
          + 'ajustes.poderesManuais — nada foi descartado, e nenhuma Sanidade foi cobrada.',
      });
    }
    naoAtribuidos.push(...porTranscender.slice(transcendeu).map((x) => x.nome));
    porTranscender.length = transcendeu;
  }

  for (const paranormal of porTranscender) {
    if (proximoSlot >= slotsPoder.length) {
      naoAtribuidos.push(paranormal.nome);
      continue;
    }
    const marco = slotsPoder[proximoSlot];
    proximoSlot += 1;
    const paiId = montarId('poderClasse', chaveNex(marco));
    inferidas.push({
      id: paiId,
      valor: { tipo: 'poder', poder: 'Transcender' },
      confianca: 'media',
      nota: `O v0 não guarda Transcender na lista de poderes — só um contador. `
        + `"${paranormal.nome}" é paranormal, então veio por Transcender no marco de NEX ${marco}%.`,
    });
    inferidas.push({
      id: montarIdFilho(paiId, 'poderParanormal', 0),
      valor: { tipo: 'poder', poder: paranormal.nome },
      confianca: 'media',
      nota: `Poder paranormal concedido pelo Transcender de NEX ${marco}%.`,
    });
  }

  for (const poder of personagem.poderes) {
    if (poder.tipo === 'Origem' || poder.nome === origemPoder) continue;
    if (nomesParanormais.has(poder.nome)) continue;
    if (poder.nome === 'Transcender') continue;
    if (habilidadesProprias.has(poder.nome)) continue;
    if (HABILIDADES_AUTOMATICAS.has(poder.nome)) continue;

    const noCatalogo = PODERES.find((p) => p.nome === poder.nome || (p.apelidos ?? []).includes(poder.nome));
    if (!noCatalogo) {
      naoAtribuidos.push(poder.nome);
      continue;
    }

    if (proximoSlot >= slotsPoder.length) {
      naoAtribuidos.push(poder.nome);
      continue;
    }

    const marco = slotsPoder[proximoSlot];
    proximoSlot += 1;
    inferidas.push({
      id: montarId('poderClasse', chaveNex(marco)),
      valor: { tipo: 'poder', poder: noCatalogo.nome },
      confianca: 'media',
      nota: `Atribuído ao slot de poder mais cedo disponível (NEX ${marco}%). O v0 não registra em qual marco foi escolhido.`,
    });
  }

  for (const nome of naoAtribuidos) {
    problemas.push({
      gravidade: 'aviso',
      codigo: 'poder_sem_slot',
      mensagem: `"${nome}" não casou com nenhum slot. Mantido em ajustes.poderesManuais — nada foi descartado.`,
    });
  }

  const inferidasDeRitual: EscolhaInferida[] = [];
  if (personagem.classe === 'Ocultista') {
    const escadaRitual = [...Array.from({ length: 19 }, (_, i) => (i + 1) * 5), 99]
      .filter((n) => n <= nivel);

    const vagas: { nivel: number; ordinal: number }[] = escadaRitual.flatMap((n) =>
      Array.from({ length: n === 5 ? 3 : 1 }, (_, ordinal) => ({ nivel: n, ordinal })),
    );

    const doPersonagem = (personagem.rituais ?? [])
      .map((r) => RITUAIS.find((c) => c.nome === r.nome) ?? r)
      .slice()
      .sort((a, b) => (b.circulo ?? 1) - (a.circulo ?? 1));

    const usadas = new Set<string>();
    for (const ritual of doPersonagem) {
      const circulo = ritual.circulo ?? 1;
      const vaga = vagas.find(
        (v) => !usadas.has(`${v.nivel}#${v.ordinal}`) && circuloMaximoPorNivel(v.nivel) >= circulo,
      );
      if (!vaga) {
        naoAtribuidos.push(`Ritual: ${ritual.nome}`);
        continue;
      }
      usadas.add(`${vaga.nivel}#${vaga.ordinal}`);
      inferidasDeRitual.push({
        id: montarId('ritual', chaveNex(vaga.nivel), vaga.ordinal),
        valor: { tipo: 'ritual', ritual: ritual.nome },
        confianca: 'media',
        nota: `Atribuído ao marco de NEX ${vaga.nivel}% — o mais cedo que aceita um ritual de ${circulo}º círculo. O v0 não registra quando foi aprendido.`,
      });
    }
    inferidas.push(...inferidasDeRitual);
  }

  const ficha: FichaPersistida = {
    versao: 2,
    identidade: {
      nome: personagem.nome,
      conceito: personagem.conceito,
      classe: personagem.classe,
      origem: personagem.origem,
      atributosBase: base,
      periciasLivres: inferirPericiasLivres(personagem),
      beneficioOrigem: temPoderDeOrigem ? 'ambos' : 'pericias',
    },
    progressao: ehSobrevivente
      ? { nex: 0, estagio: nivel }
      : { nex: personagem.nex },
    escolhas: ordenarPorId(inferidas.map(({ id, valor }) => ({ id, valor } as Escolha))),
    sessao: {
      pvDano: Math.max(0, personagem.pv.max - personagem.pv.atual),
      peGasto: Math.max(0, personagem.pe.max - personagem.pe.atual),
      sanPerdida: Math.max(0, personagem.san.max - personagem.san.atual),
      pontosPrestigio: personagem.pp
        ?? getPatenteConfig(personagem.patente ?? 'Recruta').ppMin,
      marcas: personagem.marcas,
    },
    ajustes: {
      periciaFixos: personagem.overrides?.periciaFixos,
      poderesManuais: naoAtribuidos.length > 0 ? naoAtribuidos : undefined,
    },
  };

  const semAjuste = buildFicha({ ficha });
  const deltas: Record<string, number | undefined> = {
    pvMaxDelta: personagem.overrides?.pvMax === undefined
      ? undefined : personagem.overrides.pvMax - semAjuste.derivados.pv.max,
    peMaxDelta: personagem.overrides?.peMax === undefined
      ? undefined : personagem.overrides.peMax - semAjuste.derivados.pe.max,
    sanMaxDelta: personagem.overrides?.sanMax === undefined
      ? undefined : personagem.overrides.sanMax - semAjuste.derivados.san.max,
  };
  for (const [chave, valor] of Object.entries(deltas)) {
    if (valor !== undefined && valor !== 0) {
      (ficha.ajustes as Record<string, unknown>)[chave] = valor;
    }
  }

  const final = buildFicha({ ficha });
  const divergencias: string[] = [];

  const comparar = (rotulo: string, v0: number, v2: number) => {
    if (v0 !== v2) divergencias.push(`${rotulo}: v0=${v0} v2=${v2}`);
  };
  comparar('pv.max', personagem.pv.max, final.derivados.pv.max);
  comparar('pe.max', personagem.pe.max, final.derivados.pe.max);
  comparar('san.max', personagem.san.max, final.derivados.san.max);

  for (const atributo of ATRIBUTOS) {
    comparar(`atributo.${atributo}`, personagem.atributos[atributo], final.atributos[atributo]);
  }

  return {
    ficha,
    inferidas,
    problemas,
    roundTripOk: divergencias.length === 0,
    divergencias,
  };
}
