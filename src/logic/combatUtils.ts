import type { AtributoKey, Item, PericiaName, Personagem } from '@/core/types';
import { calcularStatsModificados } from '@/data/equipment/modifications';
import { prepararRolagemPericia } from './diceRoller';
import { condicoes, getCondicao } from '../data/combat/conditions';

export function calcularDefesaEfetiva(personagem: Personagem): number {
  let defesa = personagem.defesa;

  if (personagem.efeitosAtivos) {
    personagem.efeitosAtivos.forEach(nome => {
      const condicao = condicoes.find(c => c.nome === nome);
      if (condicao?.efeito?.defesa) {
        defesa += condicao.efeito.defesa;
      }
    });
  }

  return defesa;
}

export function getPenalidadesPericia(
  personagem: Personagem,
  atributo: AtributoKey,
  pericia?: PericiaName,
  ataque = false,
): { dados: number; valor: number } {
  let penalidadeDados = 0;
  let penalidadeValor = 0;

  for (const nome of personagem.efeitosAtivos ?? []) {
    const efeito = getCondicao(nome)?.efeito?.pericias;
    if (!efeito || (efeito.somenteAtaque && !ataque)) continue;
    if (efeito.atributos && !efeito.atributos.includes(atributo)) continue;
    if (efeito.somentePericias && !efeito.somentePericias.some(p => p === pericia)) continue;
    penalidadeDados += efeito.penalidadeDados ?? 0;
    penalidadeValor += efeito.penalidadeValor ?? 0;
  }

  return { dados: penalidadeDados, valor: penalidadeValor };
}

export function prepararTesteDaFicha(personagem: Personagem, pericia: PericiaName, opcoes?: {
  bonusFixo?: number;
  ataque?: boolean;
}) {
  const detalhe = personagem.periciasDetalhadas?.[pericia];
  if (!detalhe) return null;

  const condicao = getPenalidadesPericia(personagem, detalhe.atributoBase, pericia, opcoes?.ataque);
  return {
    ...detalhe,
    bonusO: (detalhe.bonusO ?? 0) + condicao.dados,
    bonusFixo: (detalhe.bonusFixo ?? 0) + condicao.valor + (opcoes?.bonusFixo ?? 0),
  };
}

export function formatarTesteDaFicha(...argumentos: Parameters<typeof prepararTesteDaFicha>): string {
  const detalhe = prepararTesteDaFicha(...argumentos);
  if (!detalhe) return 'Teste indisponível';
  const plano = prepararRolagemPericia(detalhe);
  const sinal = plano.bonusFixo >= 0 ? '+' : '';
  const criterio = plano.criterio === 'pior' ? ' · pior' : '';
  return plano.diceCount + 'd20 ' + sinal + plano.bonusFixo + criterio;
}

export interface AtaqueDaFicha {
  chave: string;
  item: Item;
  descricao: string;
  pericia: 'Luta' | 'Pontaria';
  teste: string;
  ataqueBonus: number;
}

export function prepararAtaquesDaFicha(personagem: Personagem): AtaqueDaFicha[] {
  return personagem.equipamentos.flatMap((item, indice) => {
    if (item.tipo !== 'Arma' && !item.stats?.dano && !item.stats?.danoBase) return [];

    const stats = item.modificacoes?.length ? calcularStatsModificados(item) : item.stats;
    const alcance = stats?.alcance?.toLowerCase() ?? '';
    const corpoACorpo = !alcance || alcance.includes('corpo') || alcance.includes('adjacente');
    const pericia = corpoACorpo ? 'Luta' : 'Pontaria';
    const ataqueBonus = stats?.ataqueBonus ?? 0;
    const dadosDaArma = [
      'Dano base: ' + (stats?.dano ?? stats?.danoBase ?? '—'),
      'Crítico: ' + (stats?.critico ?? '—'),
      'Alcance: ' + (stats?.alcance ?? '—'),
      stats?.tipoDano,
      stats?.automatica ? 'Automática' : null,
    ].filter(Boolean).join(' · ');

    const teste = formatarTesteDaFicha(personagem, pericia, { ataque: true, bonusFixo: ataqueBonus });
    return [{ chave: 'arma-' + indice, item, descricao: dadosDaArma + '\n' + item.descricao, pericia, teste, ataqueBonus }];
  });
}
