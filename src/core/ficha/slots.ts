import type { ClasseName } from '../types';
import { NEX_EVENTOS } from '../rules/nexEventos';
import { TRILHAS } from '../../data/character/tracks';
import { ORIGENS } from '../../data/character/origins';
import { PODERES } from '../../data/character/powers';
import { habilidadesAutomaticas } from './automaticos';
import { chaveEstagio, chaveNex, montarId, montarIdFilho, ordenarPorId, paiDoId } from './ids';
import type {
  ChaveNivel,
  Escolha,
  EscolhaId,
  FichaIdentidade,
  PoderDerivado,
  Progressao,
  Slot,
  SlotKind,
} from './tipos';

export interface EstadoParcial {
  nivel: number;
  trilha?: string;
  habilidadesTrilha: Map<number, string>;
  afinidade?: string;
  poderes: PoderDerivado[];
  rituais: string[];
  atributosGanhos: string[];
}

export function nomesDosPoderes(estado: EstadoParcial): string[] {
  return estado.poderes.map((p) => p.nome);
}

export interface ResultadoSlots {
  slots: Slot[];
  estadoFinal: EstadoParcial;
  inertes: Escolha[];
  orfas: Escolha[];
}

function quantidadePericiasPromovidas(classe: ClasseName, intelecto: number): number {
  const base = classe === 'Especialista' ? 5 : 2;
  return Math.max(0, base + intelecto);
}

function marcoSeAplica(tipo: string, classe: ClasseName): boolean {
  if (tipo === 'Ritual') return false;
  return true;
}

function niveisDeRitual(nex: number): number[] {
  const escada = [...Array.from({ length: 19 }, (_, i) => (i + 1) * 5), 99];
  return escada.filter((n) => n <= nex);
}

const TIPO_PARA_KIND: Record<string, SlotKind | undefined> = {
  Trilha: 'trilha',
  Poder: 'poderClasse',
  Atributo: 'atributo',
  Pericia: 'pericia',
  Afinidade: 'afinidade',
  Versatilidade: 'versatilidade',
  Ritual: 'ritual',
};

const MARCOS_SOBREVIVENTE: { estagio: number; kinds: SlotKind[] }[] = [
  { estagio: 2, kinds: ['trilha'] },
  { estagio: 3, kinds: ['atributo'] },
];

function respostaDe(escolhas: readonly Escolha[], id: EscolhaId): Escolha | undefined {
  return escolhas.find((e) => e.id === id);
}

function gravarEscolhaInterna(estado: EstadoParcial, idFilho: EscolhaId, valor: string): void {
  const pai = paiDoId(idFilho);
  if (!pai) return;
  for (const poder of estado.poderes) {
    const p = poder.provenancia;
    if ('escolhaId' in p && p.escolhaId === pai) poder.escolhaInterna = valor;
  }
}

function aplicar(estado: EstadoParcial, escolha: Escolha, nivel: number): void {
  const v = escolha.valor;
  switch (v.tipo) {
    case 'trilha':
      estado.trilha = v.trilha;
      break;
    case 'versatilidade': {
      const outra = TRILHAS.find((t) => t.nome === v.trilha);
      const primeira = outra?.habilidades.find((h) => h.nex === 10 || h.nex === 2);
      if (primeira && !estado.poderes.some((p) => p.nome === primeira.nome)) {
        estado.poderes.push({
          nome: primeira.nome,
          provenancia: { kind: 'versatilidade', nivel, escolhaId: escolha.id },
        });
      }
      break;
    }
    case 'habilidadeTrilha':
      estado.habilidadesTrilha.set(nivel, v.habilidade);
      for (const poder of estado.poderes) {
        if (poder.nome === v.habilidade) poder.escolhaInterna = v.escolhaInterna;
      }
      break;
    case 'afinidade':
      estado.afinidade = v.elemento;
      break;
    case 'poder':
      estado.poderes.push({
        nome: v.poder,
        provenancia: { kind: 'classe', nivel, escolhaId: escolha.id },
      });
      gravarEscolhaInterna(estado, escolha.id, v.poder);
      break;
    case 'ritual':
      estado.rituais.push(v.ritual);
      gravarEscolhaInterna(estado, escolha.id, v.ritual);
      break;
    case 'origem': {
      const outra = ORIGENS.find((o) => o.nome === v.origem);
      if (outra && !estado.poderes.some((p) => p.nome === outra.poder.nome)) {
        estado.poderes.push({
          nome: outra.poder.nome,
          provenancia: { kind: 'origem', origem: outra.nome },
        });
      }
      gravarEscolhaInterna(estado, escolha.id, v.origem);
      break;
    }
    case 'escolhaInterna':
      gravarEscolhaInterna(estado, escolha.id, v.valor);
      break;
    case 'atributo':
      estado.atributosGanhos.push(v.atributo);
      break;
    case 'pericias':
      break;
  }
}

function concederHabilidadeTrilha(
  estado: EstadoParcial,
  nomeTrilha: string,
  nivel: number,
): { nome: string; temEscolhaInterna: boolean } | undefined {
  const trilha = TRILHAS.find((t) => t.nome === nomeTrilha);
  const hab = trilha?.habilidades.find((h) => h.nex === nivel);
  if (!hab) return undefined;

  if (!estado.poderes.some((p) => p.nome === hab.nome)) {
    estado.poderes.push({
      nome: hab.nome,
      provenancia: { kind: 'trilha', trilha: nomeTrilha, nivel },
    });
  }
  estado.habilidadesTrilha.set(nivel, hab.nome);
  return { nome: hab.nome, temEscolhaInterna: Boolean(hab.escolha) };
}

export function derivarSlots(
  identidade: FichaIdentidade,
  progressao: Progressao,
  escolhas: readonly Escolha[],
): ResultadoSlots {
  const slots: Slot[] = [];
  const estado: EstadoParcial = {
    nivel: 0,
    habilidadesTrilha: new Map(),
    poderes: [],
    rituais: [],
    atributosGanhos: [],
  };

  const nivelDaFicha = identidade.classe === 'Sobrevivente'
    ? (progressao.estagio ?? 1)
    : progressao.nex;

  const origem = ORIGENS.find((o) => o.nome === identidade.origem);
  if (origem && identidade.beneficioOrigem !== 'pericias') {
    estado.poderes.push({
      nome: origem.poder.nome,
      provenancia: { kind: 'origem', origem: origem.nome },
    });
  }

  for (const hab of habilidadesAutomaticas(identidade.classe, nivelDaFicha)) {
    estado.poderes.push({
      nome: hab.nome,
      provenancia: { kind: 'classeAutomatica', nivel: hab.nivel },
    });
  }

  const usadas = new Set<EscolhaId>();

  const emitir = (
    kind: SlotKind,
    chave: ChaveNivel,
    nivel: number,
    rotulo: string,
    quantidade = 1,
    paiId?: EscolhaId,
    ordinal = 0,
    poderPai?: string,
  ): Slot => {
    const id = paiId ? montarIdFilho(paiId, kind, ordinal) : montarId(kind, chave, ordinal);
    const slot: Slot = { id, kind, chaveNivel: chave, nivel, quantidade, rotulo, paiId, poderPai };
    slots.push(slot);

    const resposta = respostaDe(escolhas, id);
    if (resposta) {
      usadas.add(id);
      aplicar(estado, resposta, nivel);
    }

    if (resposta && resposta.valor.tipo === 'poder') {
      emitirCascata(resposta.valor.poder, slot, nivel);
    }
    return slot;
  };

  function emitirCascata(nomePoder: string, pai: Slot, nivel: number): void {
    const poder = PODERES.find((p) => p.nome === nomePoder);
    const escolha = poder?.escolha;
    if (!escolha) return;

    const kindFilho: SlotKind | null =
      escolha.tipo === 'ritualAprendido' ? 'ritual'
      : escolha.tipo === 'poderParanormal' ? 'poderParanormal'
      : escolha.tipo === 'poderDiletante' ? 'poderDiletante'
      : escolha.tipo === 'origem' ? 'origem'
      : escolha.tipo === 'custom' ? null
      : 'escolhaInterna';
    if (!kindFilho) return;

    for (let ordinal = 0; ordinal < Math.max(1, escolha.quantidade); ordinal += 1) {
      const sufixo = escolha.quantidade > 1 ? ` (${ordinal + 1} de ${escolha.quantidade})` : '';
      emitir(kindFilho, pai.chaveNivel, nivel, `${nomePoder}: escolha${sufixo}`,
        1, pai.id, ordinal, nomePoder);
    }
  }

  if (origem && identidade.beneficioOrigem !== 'pericias' && origem.poder.escolha) {
    const escolhaOrigem = origem.poder.escolha;
    const kindOrigem: SlotKind | null =
      escolhaOrigem.tipo === 'poderParanormal' ? 'poderParanormal'
      : escolhaOrigem.tipo === 'ritualAprendido' ? 'ritual'
      : escolhaOrigem.tipo === 'custom' ? null
      : 'escolhaInterna';

    if (kindOrigem) {
      const nivelInicial = identidade.classe === 'Sobrevivente' ? 1 : 5;
      const chaveInicial = identidade.classe === 'Sobrevivente'
        ? chaveEstagio(nivelInicial)
        : chaveNex(nivelInicial);

      for (let ordinal = 0; ordinal < Math.max(1, escolhaOrigem.quantidade); ordinal += 1) {
        estado.nivel = nivelInicial;
        emitir(kindOrigem, chaveInicial, nivelInicial,
          `${origem.poder.nome}: escolha`, 1, undefined, ordinal, origem.poder.nome);
      }
    }
  }

  if (identidade.classe === 'Sobrevivente') {
    const estagioAtual = progressao.estagio ?? 1;

    for (const marco of MARCOS_SOBREVIVENTE) {
      if (marco.estagio > estagioAtual) continue;
      estado.nivel = marco.estagio;
      for (const kind of marco.kinds) {
        emitir(kind, chaveEstagio(marco.estagio), marco.estagio,
          kind === 'trilha' ? `Trilha de sobrevivente (estágio ${marco.estagio})` : `Aumento de atributo (estágio ${marco.estagio})`);
      }
    }

    if (estado.trilha) {
      for (const estagioHab of [2, 4]) {
        if (estagioHab > estagioAtual) continue;
        const hab = concederHabilidadeTrilha(estado, estado.trilha, estagioHab);
        if (!hab?.temEscolhaInterna) continue;
        estado.nivel = estagioHab;
        emitir('trilhaHabilidade', chaveEstagio(estagioHab), estagioHab,
          `${hab.nome}: decisão da habilidade (estágio ${estagioHab})`);
      }
    }
  } else {
    const marcos = [...NEX_EVENTOS].sort((a, b) => a.requisito - b.requisito);

    for (const marco of marcos) {
      if (marco.requisito > progressao.nex) continue;
      if (!marcoSeAplica(marco.tipo, identidade.classe)) continue;

      const kind = TIPO_PARA_KIND[marco.tipo];
      if (!kind) continue;

      estado.nivel = marco.requisito;
      const chave = chaveNex(marco.requisito);

      if (kind === 'trilha') {
        if (marco.requisito === 10) {
          emitir('trilha', chave, 10, 'Escolha de trilha');
        }
        if (estado.trilha) {
          const hab = concederHabilidadeTrilha(estado, estado.trilha, marco.requisito);
          if (hab?.temEscolhaInterna) {
            emitir('trilhaHabilidade', chave, marco.requisito,
              `${hab.nome}: decisão da habilidade (${marco.requisito}%)`);
          }
        }
        continue;
      }

      const quantidade = kind === 'pericia'
        ? quantidadePericiasPromovidas(identidade.classe, identidade.atributosBase.INT)
        : 1;

      emitir(kind, chave, marco.requisito, marco.descricao, quantidade);
    }

    if (identidade.classe === 'Ocultista') {
      for (const nivel of niveisDeRitual(progressao.nex)) {
        estado.nivel = nivel;
        const quantos = nivel === 5 ? 3 : 1;
        for (let ordinal = 0; ordinal < quantos; ordinal += 1) {
          emitir(
            'ritual',
            chaveNex(nivel),
            nivel,
            nivel === 5
              ? `Ritual inicial de 1º círculo (${ordinal + 1} de 3)`
              : `Ritual aprendido em NEX ${nivel}%`,
            1,
            undefined,
            ordinal,
          );
        }
      }
    }
  }

  const nivelAtual = identidade.classe === 'Sobrevivente'
    ? (progressao.estagio ?? 1)
    : progressao.nex;

  const inertes: Escolha[] = [];
  const orfas: Escolha[] = [];
  const idsEmitidos = new Set(slots.map((s) => s.id));

  for (const escolha of escolhas) {
    if (usadas.has(escolha.id)) continue;
    if (idsEmitidos.has(escolha.id)) continue;

    const nivel = nivelDaEscolha(escolha.id);
    if (nivel !== null && nivel > nivelAtual) inertes.push(escolha);
    else orfas.push(escolha);
  }

  return {
    slots: ordenarPorId(slots),
    estadoFinal: estado,
    inertes: ordenarPorId(inertes),
    orfas: ordenarPorId(orfas),
  };
}

function nivelDaEscolha(id: EscolhaId): number | null {
  const m = id.split('/')[0].match(/@(?:nex|est):(\d+)#/);
  return m ? Number(m[1]) : null;
}

export function pendenciasDe(
  resultado: ResultadoSlots,
  escolhas: readonly Escolha[],
): Slot[] {
  const respondidos = new Set(escolhas.map((e) => e.id));
  return resultado.slots.filter((s) => !respondidos.has(s.id));
}
