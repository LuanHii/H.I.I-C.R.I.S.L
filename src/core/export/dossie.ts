import type { AtributoKey, Item, Marca, PericiaName, Personagem, Poder, Ritual } from '../types';
import { calcularStatsModificados, parseCritico } from '../../data/equipment/modifications';
import { calcularDefesaEfetiva, getPenalidadesPericia } from '../../logic/combatUtils';
import { calcularDTRitual } from '../../logic/rulesEngine';
import { apenasCondicoes } from '../rules/condicoes';
import { semAcento } from '../rules/pericias';
import { custoDoRitual } from '../rules/rituais';

const ATRIBUTOS: AtributoKey[] = ['AGI', 'FOR', 'INT', 'PRE', 'VIG'];

const ROTULO_DE_MARCA: Record<Marca['tipo'], string> = {
  sanMaxPerdida: 'SAN máxima perdida',
  pvMaxPerdido: 'PV máximo perdido',
  peMaxPerdido: 'PE máximo perdido',
  atributoPerdido: 'atributo perdido',
  nexForaDaEscada: 'NEX fora da escada',
};

const sinal = (n: number): string => (n >= 0 ? `+${n}` : `${n}`);

function cabecalho(p: Personagem): string[] {
  const nivel = p.classe === 'Sobrevivente' ? `Estágio ${p.estagio ?? 1}` : `NEX ${p.nex}%`;
  const partes = [p.classe, p.trilha, nivel, `Origem: ${p.origem}`];
  if (p.patente) partes.push(`Patente ${p.patente}${p.pp !== undefined ? ` (${p.pp} PP)` : ''}`);
  if (p.afinidade) partes.push(`Afinidade: ${p.afinidade}`);
  const linhas = [`# ${p.nome}`, partes.filter(Boolean).join(' · ')];
  if (p.conceito?.trim()) linhas.push(p.conceito.trim());
  return linhas;
}

function recursos(p: Personagem): string[] {
  const usaPd = Boolean(p.usarPd && p.pd);
  const linhas: string[] = ['## Recursos'];

  const pv = [`- PV ${p.pv.atual}/${p.pv.max}`];
  if (p.pv.temp > 0) pv.push(`+${p.pv.temp} temporários`);
  if (p.pv.atual <= p.pv.machucado) pv.push('MACHUCADO');
  linhas.push(pv.join(' · '));

  if (usaPd && p.pd) {
    linhas.push(`- PD ${p.pd.atual}/${p.pd.max} · limite ${p.pe.rodada} por turno`);
  } else {
    linhas.push(`- PE ${p.pe.atual}/${p.pe.max} · limite ${p.pe.rodada} por turno`);
    linhas.push(`- SAN ${p.san.atual}/${p.san.max}${p.san.perturbado ? ' · PERTURBADO' : ''}`);
  }

  const defesaEfetiva = calcularDefesaEfetiva(p);
  const defesa = defesaEfetiva !== p.defesa ? `Defesa ${p.defesa} (efetiva ${defesaEfetiva} com as condições)` : `Defesa ${p.defesa}`;
  linhas.push(`- ${defesa} · Deslocamento ${p.deslocamento}m · Carga ${p.carga.atual}/${p.carga.maxima} espaços`);

  const condicoes = apenasCondicoes(p.efeitosAtivos ?? []);
  if (condicoes.length > 0) linhas.push(`- Condições ativas: ${condicoes.join(', ')}`);

  const marcas = (p.marcas ?? []).map((m) =>
    `${ROTULO_DE_MARCA[m.tipo]}${m.atributo ? ` (${m.atributo})` : ''} ${m.pontos}${m.motivo ? ` (${m.motivo})` : ''}`,
  );
  if (marcas.length > 0) linhas.push(`- Marcas: ${marcas.join('; ')}`);

  return linhas;
}

function atributos(p: Personagem): string[] {
  return ['## Atributos', ATRIBUTOS.map((a) => `${a} ${p.atributos[a]}`).join(' · ')];
}

function testeDePericia(p: Personagem, pericia: PericiaName, extraFixo = 0): string {
  const d = p.periciasDetalhadas[pericia];
  const penalidade = getPenalidadesPericia(p, d.atributoBase);
  const dados = Math.max(0, d.dados + penalidade.dados);
  const bonus = d.bonusFixo + d.bonusO + penalidade.valor + extraFixo;
  return `${dados}d20 ${sinal(bonus)}`;
}

function pericias(p: Personagem): string[] {
  const treinadas = (Object.keys(p.periciasDetalhadas) as PericiaName[])
    .filter((nome) => p.periciasDetalhadas[nome].grau !== 'Destreinado')
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const linhas = ['## Perícias treinadas'];
  for (const nome of treinadas) {
    const d = p.periciasDetalhadas[nome];
    linhas.push(`- ${nome} (${d.atributoBase}) — ${testeDePericia(p, nome)} · ${d.grau}`);
  }

  const dadosPorAtributo = ATRIBUTOS.map((a) => {
    const penalidade = getPenalidadesPericia(p, a);
    return `${a} ${Math.max(0, p.atributos[a] + penalidade.dados)}d20`;
  });
  linhas.push(`Demais perícias: destreinadas, rolam só o atributo (${dadosPorAtributo.join(', ')}), bônus +0; atributo 0 rola 2d20 e fica com o pior.`);

  const condicoes = apenasCondicoes(p.efeitosAtivos ?? []);
  if (condicoes.length > 0) {
    linhas.push(`As penalidades de ${condicoes.join(', ')} já estão aplicadas nos testes acima.`);
  }
  return linhas;
}

const ehArma = (i: Item): boolean => i.tipo === 'Arma' || Boolean(i.stats?.dano || i.stats?.danoBase);
const ehProtecao = (i: Item): boolean => i.tipo === 'Proteção' || (i.stats?.defesa ?? 0) > 0 || (i.stats?.resistencia ?? 0) > 0;

function testeDeAtaque(p: Personagem, arma: Item, alcance: string, ataqueBonus: number): string {
  const baixo = alcance.toLowerCase();
  const corpoACorpo = baixo.includes('corpo') || baixo.includes('adjacente');
  if (corpoACorpo) return `Luta ${testeDePericia(p, 'Luta', ataqueBonus)}`;
  if (/arremess/i.test(arma.descricao ?? '')) {
    return `Luta ${testeDePericia(p, 'Luta', ataqueBonus)} corpo a corpo ou Pontaria ${testeDePericia(p, 'Pontaria', ataqueBonus)} arremessada`;
  }
  return `Pontaria ${testeDePericia(p, 'Pontaria', ataqueBonus)}`;
}

function linhaDeAtaque(p: Personagem, arma: Item): string {
  const stats = arma.modificacoes?.length ? calcularStatsModificados(arma) : (arma.stats ?? {});
  const alcance = stats.alcance ?? 'Corpo a corpo';
  const { margem, multiplicador } = parseCritico(stats.critico ?? 'x2');

  const partes = [
    testeDeAtaque(p, arma, alcance, stats.ataqueBonus ?? 0),
    `dano ${stats.dano ?? stats.danoBase ?? '—'}${stats.tipoDano ? ` ${stats.tipoDano}` : ''}`,
    `crítico ${margem}/x${multiplicador}`,
    `alcance ${alcance}`,
  ];
  if (stats.automatica) partes.push('automática');
  if (arma.modificacoes?.length) partes.push(`mods: ${arma.modificacoes.join(', ')}`);
  return `- ${arma.nome} (Cat. ${arma.categoria}) — ${partes.join(' · ')}`;
}

function linhaDeProtecao(item: Item): string {
  const partes: string[] = [];
  if (item.stats?.defesa) partes.push(`Defesa +${item.stats.defesa}`);
  if (item.stats?.resistencia) partes.push(`RD ${item.stats.resistencia}`);
  return `- ${item.nome} (Cat. ${item.categoria}) — ${partes.join(' · ') || item.descricao}`;
}

function equipamento(p: Personagem): string[][] {
  const itens = p.equipamentos ?? [];
  if (itens.length === 0) return [];

  const blocos: string[][] = [];
  const armas = itens.filter(ehArma);
  const protecoes = itens.filter((i) => !ehArma(i) && ehProtecao(i));
  const outros = itens.filter((i) => !ehArma(i) && !ehProtecao(i));

  if (armas.length > 0) blocos.push(['## Ataques', ...armas.map((a) => linhaDeAtaque(p, a))]);
  if (protecoes.length > 0) blocos.push(['## Proteções', ...protecoes.map(linhaDeProtecao)]);
  if (outros.length > 0) {
    const limite = p.limiteItens ? ` · limite de itens I:${p.limiteItens.I} II:${p.limiteItens.II} III:${p.limiteItens.III} IV:${p.limiteItens.IV}` : '';
    blocos.push([
      `## Inventário (${p.carga.atual}/${p.carga.maxima} espaços${limite})`,
      ...outros.map((item) => `- ${item.nome} (Cat. ${item.categoria}, ${item.espaco} esp.)${item.descricao?.trim() ? ` — ${item.descricao.trim()}` : ''}`),
    ]);
  }
  return blocos;
}

function linhaDePoder(poder: Poder): string {
  const meta = [poder.custo, poder.acao].filter(Boolean).join(', ');
  const descricao = (poder.descricao ?? '').trim().replace(/\s*\n\s*/g, ' ');
  return `- ${poder.nome}${meta ? ` (${meta})` : ''}${descricao ? `: ${descricao}` : ''}`;
}

function poderes(p: Personagem): string[] {
  const lista = p.poderes ?? [];
  if (lista.length === 0) return [];

  const grupos: [string, Poder[]][] = [
    ['Classe', lista.filter((x) => x.tipo === 'Classe' || x.tipo === 'Sobrevivente')],
    [p.trilha ? `Trilha — ${p.trilha}` : 'Trilha', lista.filter((x) => x.tipo === 'Trilha')],
    ['Origem', lista.filter((x) => x.tipo === 'Origem')],
    ['Paranormal', lista.filter((x) => x.tipo === 'Paranormal')],
    ['Geral', lista.filter((x) => x.tipo === 'Geral')],
  ];

  const linhas = ['## Habilidades e poderes'];
  for (const [titulo, itens] of grupos) {
    if (itens.length === 0) continue;
    linhas.push(`### ${titulo}`, ...itens.map(linhaDePoder));
  }
  return linhas;
}

function linhaDeRitual(r: Ritual): string[] {
  const meta = [`${r.elemento}, ${r.circulo}º círculo`, `${custoDoRitual(r.circulo)} PE`, r.execucao, r.alcance, r.alvo, r.duracao, r.resistencia]
    .filter(Boolean)
    .join(' · ');
  const linhas = [`- ${r.nome} — ${meta}`, `  Padrão: ${r.efeito.padrao}`];
  if (r.efeito.discente) linhas.push(`  Discente: ${r.efeito.discente}`);
  if (r.efeito.verdadeiro) linhas.push(`  Verdadeiro: ${r.efeito.verdadeiro}`);
  return linhas;
}

function rituais(p: Personagem): string[] {
  const lista = p.rituais ?? [];
  if (lista.length === 0) return [];
  const dt = calcularDTRitual({ atributos: p.atributos, limitePe: p.pe.rodada });
  return [`## Rituais (DT ${dt})`, ...lista.flatMap(linhaDeRitual)];
}

function proficiencias(p: Personagem): string[] {
  const lista = (p.proficiencias ?? []).filter(Boolean);
  return lista.length > 0 ? ['## Proficiências', lista.join(', ')] : [];
}

function pendencias(p: Personagem): string[] {
  const itens: string[] = [];
  const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;
  if (p.pontosAtributoPendentes) itens.push(plural(p.pontosAtributoPendentes, 'ponto de atributo', 'pontos de atributo'));
  if (p.poderesClassePendentes) itens.push(plural(p.poderesClassePendentes, 'poder de classe', 'poderes de classe'));
  if (p.periciasTreinadasPendentes) itens.push(plural(p.periciasTreinadasPendentes, 'perícia a treinar', 'perícias a treinar'));
  if (p.escolhaTrilhaPendente) itens.push('escolha de trilha');
  return itens.length > 0 ? ['## Pendências', `A ficha ainda não escolheu: ${itens.join(', ')}.`] : [];
}

export function dossieParaIA(p: Personagem): string {
  const blocos = [
    cabecalho(p),
    recursos(p),
    atributos(p),
    pericias(p),
    ...equipamento(p),
    poderes(p),
    rituais(p),
    proficiencias(p),
    pendencias(p),
  ].filter((b) => b.length > 0);

  return blocos.map((b) => b.join('\n')).join('\n\n') + '\n';
}

export function nomeDoArquivoDoDossie(p: Personagem): string {
  const base = semAcento(p.nome).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'ficha';
  return `${base}-dossie.md`;
}
