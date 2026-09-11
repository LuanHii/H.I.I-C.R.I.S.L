import type { Personagem, Patente, Poder, Ritual } from '../types';
import { PODERES } from '../../data/character/powers';
import { TRILHAS } from '../../data/character/tracks';
import { ORIGENS } from '../../data/character/origins';
import { RITUAIS } from '../../data/magic/rituals';
import { getPatenteConfig, calcularCarga, listarEventosNex } from '../../logic/rulesEngine';
import { apenasCondicoes } from '../rules/condicoes';
import { buildFicha, type BuildResultado } from './buildFicha';
import type { FichaPersistida, PoderDerivado } from './tipos';

function materializar(derivado: PoderDerivado): Poder {
  const doCatalogo = PODERES.find(
    (p) => p.nome === derivado.nome || (p.apelidos ?? []).includes(derivado.nome),
  );
  if (doCatalogo) {
    return { ...doCatalogo, ...notaDeEscolha(derivado) } as Poder;
  }

  const proc = derivado.provenancia;

  if (proc.kind === 'trilha') {
    const trilha = TRILHAS.find((t) => t.nome === proc.trilha);
    const hab = trilha?.habilidades.find((h) => h.nome === derivado.nome);
    if (hab && trilha) {
      return {
        nome: hab.nome,
        descricao: hab.descricao,
        tipo: 'Trilha',
        livro: trilha.livro,
        ...notaDeEscolha(derivado),
      } as Poder;
    }
  }

  if (proc.kind === 'origem') {
    const origem = ORIGENS.find((o) => o.nome === proc.origem);
    if (origem) {
      return {
        nome: origem.poder.nome,
        descricao: origem.poder.descricao,
        tipo: 'Origem',
        livro: origem.livro,
      } as Poder;
    }
  }

  return { nome: derivado.nome, descricao: '', tipo: 'Classe', livro: 'Regras Básicas' } as Poder;
}

function notaDeEscolha(derivado: PoderDerivado): { descricao?: string; escolhaInterna?: string } {
  if (!derivado.escolhaInterna) return {};
  const base = PODERES.find((p) => p.nome === derivado.nome)?.descricao ?? '';
  return {
    escolhaInterna: derivado.escolhaInterna,
    descricao: `${base}\n\nEscolha: ${derivado.escolhaInterna}`.trim(),
  };
}

export interface RenderInput {
  ficha: FichaPersistida;
  carregarDe: Personagem;
  build?: BuildResultado;
}

function unirRituais(doV0: readonly Ritual[], derivados: readonly string[]): Ritual[] {
  const saida = [...doV0];
  const conhecidos = new Set(saida.map((r) => r.nome));

  for (const nome of derivados) {
    if (conhecidos.has(nome)) continue;
    const doCatalogo = RITUAIS.find((r) => r.nome === nome);
    if (!doCatalogo) continue;
    saida.push(doCatalogo);
    conhecidos.add(nome);
  }

  return saida;
}

export function paraPersonagem({ ficha, carregarDe, build }: RenderInput): Personagem {
  const b = build ?? buildFicha({ ficha });
  const { identidade, progressao, sessao, ajustes } = ficha;
  const d = b.derivados;

  const poderes = b.poderes.map(materializar);
  const rituais = unirRituais(carregarDe.rituais ?? [], b.rituais);

  const carga = calcularCarga({
    atributos: b.atributos,
    itens: carregarDe.equipamentos ?? [],
    poderes,
  });

  const porTipo = (kind: string) => b.pendencias.filter((p) => p.slot.kind === kind).length;

  return {
    ...carregarDe,

    nome: identidade.nome,
    conceito: identidade.conceito,
    classe: identidade.classe,
    origem: identidade.origem,
    nex: identidade.classe === 'Sobrevivente' ? 0 : progressao.nex,
    estagio: identidade.classe === 'Sobrevivente' ? (progressao.estagio ?? 1) : carregarDe.estagio,

    atributos: b.atributos,
    pericias: d.graus,
    periciasDetalhadas: d.periciasDetalhadas,
    trilha: b.trilha,
    afinidade: b.afinidade as Personagem['afinidade'],
    patente: b.patente as Patente,
    pp: sessao.pontosPrestigio,
    limiteItens: getPatenteConfig(b.patente as Patente).limiteItens,
    defesa: d.defesa,
    deslocamento: d.deslocamento,
    carga,
    poderes,
    rituais,

    pv: { ...carregarDe.pv, max: d.pv.max, atual: d.pv.atual, machucado: d.pv.machucado },
    pe: { ...carregarDe.pe, max: d.pe.max, atual: d.pe.atual, rodada: d.peRodada },
    san: { ...carregarDe.san, max: d.san.max, atual: d.san.atual, perturbado: d.san.perturbado },
    pd: d.pd,

    overrides: {
      ...(ajustes.pvMaxDelta !== undefined ? { pvMax: d.pv.max } : {}),
      ...(ajustes.peMaxDelta !== undefined ? { peMax: d.pe.max } : {}),
      ...(ajustes.sanMaxDelta !== undefined ? { sanMax: d.san.max } : {}),
      ...(ajustes.defesaDelta !== undefined ? { defesa: d.defesa } : {}),
      ...(ajustes.periciaFixos ? { periciaFixos: ajustes.periciaFixos } : {}),
    },

    pontosAtributoPendentes: porTipo('atributo'),
    periciasTreinadasPendentes: 0,
    poderesClassePendentes: porTipo('poderClasse'),
    escolhaTrilhaPendente: porTipo('trilha') > 0,
    habilidadesTrilhaPendentes: [],
    pendenciasNex: [],

    eventosNex: listarEventosNex(identidade.classe === 'Sobrevivente' ? 0 : progressao.nex),
    efeitosAtivos: sessao.condicoes ?? apenasCondicoes(carregarDe.efeitosAtivos),
    marcas: sessao.marcas ?? carregarDe.marcas,
  };
}
