import type { AtributoKey, Item, ItemStats, PericiaName, Personagem, TipoAtaqueCondicao } from '@/core/types';
import { WEAPONS } from '@/data/combat/weapons';
import { ehArmaDeEquipamento } from '@/core/rules/catalogo';
import { calcularStatsModificados, formatarCriticoCompleto } from '@/data/equipment/modifications';
import { prepararRolagemPericia, rollPericia, type DiceRollResult } from './diceRoller';
import { calcularPenalidadeDefesa, combinarModificadoresDeCondicao, getCondicao } from '../data/combat/conditions';

export function calcularDefesaEfetiva(personagem: Personagem, tipoAtaque?: TipoAtaqueCondicao): number {
  return personagem.defesa + calcularPenalidadeDefesa(personagem.efeitosAtivos ?? [], tipoAtaque);
}

export function getPenalidadesPericia(
  personagem: Personagem,
  atributo: AtributoKey,
  pericia?: PericiaName,
  ataque = false,
): { dados: number; valor: number } {
  const dados: number[] = [];
  const valores: number[] = [];

  for (const nome of personagem.efeitosAtivos ?? []) {
    const condicao = getCondicao(nome)?.efeito;
    // Livro de Regras v1.3, Apêndice > Desprevenido (Ordem PyMuPDF.md:12407–12408).
    if (condicao?.desprevenido && pericia === 'Reflexos') dados.push(-1);
    const efeito = condicao?.pericias;
    if (!efeito || (efeito.somenteAtaque && !ataque)) continue;
    if (efeito.atributos && !efeito.atributos.includes(atributo)) continue;
    if (efeito.somentePericias && !efeito.somentePericias.some(p => p === pericia)
        && !(efeito.tambemEmAtaques && ataque)) continue;
    dados.push(efeito.penalidadeDados ?? 0);
    valores.push(efeito.penalidadeValor ?? 0);
  }

  return { dados: combinarModificadoresDeCondicao(dados), valor: combinarModificadoresDeCondicao(valores) };
}

export function prepararTesteDaFicha(personagem: Personagem, pericia: PericiaName, opcoes?: {
  bonusFixo?: number;
  ataque?: boolean;
}) {
  const detalhe = personagem.periciasDetalhadas?.[pericia];
  if (!detalhe) return null;

  const condicao = getPenalidadesPericia(personagem, detalhe.atributoBase, pericia, opcoes?.ataque);
  // Indefeso e as condições que o incluem (Ordem PyMuPDF.md:12447–12451, 12465–12473).
  const falhaAutomatica = pericia === 'Reflexos'
    && personagem.efeitosAtivos?.some(nome => getCondicao(nome)?.efeito?.falhaEmReflexos);
  return {
    ...detalhe,
    bonusO: (detalhe.bonusO ?? 0) + condicao.dados,
    bonusFixo: (detalhe.bonusFixo ?? 0) + condicao.valor + (opcoes?.bonusFixo ?? 0),
    ...(falhaAutomatica ? { falhaAutomatica: true as const } : {}),
  };
}

export type ResultadoTesteDaFicha = DiceRollResult | { falhaAutomatica: true };

export function rolarTesteDaFicha(teste: NonNullable<ReturnType<typeof prepararTesteDaFicha>>): ResultadoTesteDaFicha {
  return teste.falhaAutomatica ? { falhaAutomatica: true } : rollPericia(teste);
}

export function formatarTesteDaFicha(...argumentos: Parameters<typeof prepararTesteDaFicha>): string {
  const detalhe = prepararTesteDaFicha(...argumentos);
  if (!detalhe) return 'Teste indisponível';
  if (detalhe.falhaAutomatica) return 'Falha automática';
  const plano = prepararRolagemPericia(detalhe);
  const sinal = plano.bonusFixo >= 0 ? '+' : '';
  const criterio = plano.criterio === 'pior' ? ' · pior' : '';
  return plano.diceCount + 'd20 ' + sinal + plano.bonusFixo + criterio;
}

export interface AtaqueDaFicha {
  chave: string;
  item: Item;
  descricao: string;
  testes: TesteDaArma[];
  ataqueBonus: number;
}

interface TesteDaArma {
  pericia: 'Luta' | 'Pontaria';
  rolagem: string;
}

export function prepararTestesDaArma(personagem: Personagem, item: Item, stats: ItemStats): TesteDaArma[] {
  const alcance = stats.alcance?.toLowerCase();
  const corpoACorpo = !alcance || alcance.includes('corpo') || alcance.includes('adjacente');
  const pericias: TesteDaArma['pericia'][] = [];
  if (corpoACorpo) {
    pericias.push('Luta');
  } else {
    // Tabelas 3.3 (Livro de Regras) e 1.4 (Sobrevivendo ao Horror).
    const armaDoCatalogo = WEAPONS.find(arma => arma.nome === item.nome);
    const podeUsarLuta = armaDoCatalogo
      ? armaDoCatalogo.corpoACorpoComAlcance
      : /arremess/i.test(item.descricao ?? '');
    if (podeUsarLuta) pericias.push('Luta');
    pericias.push('Pontaria');
  }
  return pericias.map(pericia => ({
    pericia,
    rolagem: formatarTesteDaFicha(personagem, pericia, { ataque: true, bonusFixo: stats.ataqueBonus }),
  }));
}

export function prepararAtaquesDaFicha(personagem: Personagem): AtaqueDaFicha[] {
  return personagem.equipamentos.flatMap((item, indice) => {
    if (!ehArmaDeEquipamento(item)) return [];

    const stats = item.modificacoes?.length ? calcularStatsModificados(item) : (item.stats ?? {});
    const ataqueBonus = stats.ataqueBonus ?? 0;
    const dadosDaArma = [
      'Dano base: ' + (stats.dano ?? stats.danoBase ?? '—'),
      'Crítico: ' + (stats.critico ? formatarCriticoCompleto(stats.critico) : '—'),
      'Alcance: ' + (stats.alcance ?? '—'),
      stats.tipoDano,
      stats.automatica ? 'Automática' : null,
    ].filter(Boolean).join(' · ');

    const testes = prepararTestesDaArma(personagem, item, stats);
    return [{ chave: 'arma-' + indice, item, descricao: dadosDaArma + '\n' + item.descricao, testes, ataqueBonus }];
  });
}
