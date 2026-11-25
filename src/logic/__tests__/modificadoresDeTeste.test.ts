import { describe, expect, it } from 'vitest';
import type { PericiaName } from '@/core/types';
import { aplicarCondicao } from '@/core/rules/condicoes';
import { deslocamentoComCondicoes, getCondicao, naoPodeAgir } from '@/data/combat/conditions';
import { calcularDefesaEfetiva, formatarTesteDaFicha, prepararTesteDaFicha, rolarTesteDaFicha } from '@/logic/combatUtils';
import { criarFicha } from '@/testUtils/fixtures';

function modificador(condicao: string | string[], pericia: PericiaName, ataque = false) {
  const ficha = criarFicha({ classe: 'Combatente' });
  ficha.efeitosAtivos = typeof condicao === 'string' ? [condicao] : condicao;
  const base = ficha.periciasDetalhadas[pericia].bonusO;
  const preparado = prepararTesteDaFicha(ficha, pericia, { ataque });
  if (!preparado) throw new Error('Perícia ausente na ficha de teste');
  return preparado.bonusO - base;
}

describe('escopo das condições de OP1', () => {
  it('Desprevenido só reduz dados de Reflexos', () => {
    expect(modificador('Desprevenido', 'Reflexos')).toBe(-1);
    expect(modificador('Desprevenido', 'Pontaria', true)).toBe(0);
  });

  it('Caído só reduz dados de ataques corpo a corpo', () => {
    expect(modificador('Caído', 'Luta', true)).toBe(-2);
    expect(modificador('Caído', 'Luta')).toBe(0);
    expect(modificador('Caído', 'Pontaria', true)).toBe(0);
  });

  it('calcula a Defesa de Caído conforme o ataque recebido', () => {
    const ficha = criarFicha({ classe: 'Combatente' });
    ficha.efeitosAtivos = ['Caído'];
    expect(calcularDefesaEfetiva(ficha, 'corpo-a-corpo')).toBe(ficha.defesa - 5);
    expect(calcularDefesaEfetiva(ficha, 'distancia')).toBe(ficha.defesa + 5);
  });

  it('aplica a penalidade mais severa quando as condições penalizam o mesmo valor', () => {
    const ficha = criarFicha({ classe: 'Combatente' });
    ficha.efeitosAtivos = ['Desprevenido', 'Vulnerável'];
    expect(calcularDefesaEfetiva(ficha)).toBe(ficha.defesa - 5);
    expect(modificador(['Fatigado', 'Exausto'], 'Luta', true)).toBe(-2);
  });

  it('só aplica a penalidade de Inconsciente quando o personagem está inconsciente', () => {
    const ficha = criarFicha({ classe: 'Combatente' });
    ficha.efeitosAtivos = ['Morrendo', 'Inconsciente'];
    expect(calcularDefesaEfetiva(ficha)).toBe(ficha.defesa - 10);
    ficha.efeitosAtivos = ['Morrendo'];
    expect(calcularDefesaEfetiva(ficha)).toBe(ficha.defesa);
    expect(naoPodeAgir(['Morrendo'])).toBe(false);
    expect(naoPodeAgir(['Morrendo', 'Inconsciente'])).toBe(true);
    expect(getCondicao('Morrendo')?.remocao).toContain('+5 por estabilização anterior');
  });

  it('restringe o deslocamento da condição mais severa e arredonda Lento para baixo', () => {
    expect(deslocamentoComCondicoes(7.5, ['Exausto'])).toBe(3);
    expect(deslocamentoComCondicoes(9, ['Caído', 'Exausto'])).toBe(1.5);
    expect(deslocamentoComCondicoes(9, ['Caído', 'Imóvel'])).toBe(0);
  });

  it('agrava fadiga quando a reaplicação é confirmada e preserva outros efeitos', () => {
    const inicial = ['Fatigado', 'Efeito de origem'];
    const exausto = aplicarCondicao(inicial, 'Fatigado', 'acumulo-permitido');
    expect(exausto).toEqual(['Efeito de origem', 'Exausto']);
    expect(aplicarCondicao(exausto, 'Exausto', 'acumulo-permitido')).toEqual(['Efeito de origem', 'Inconsciente']);
    expect(inicial).toEqual(['Fatigado', 'Efeito de origem']);
  });

  it('mantém a condição de uma fonte que não permite acúmulo, como Definhar', () => {
    expect(aplicarCondicao(['Fatigado'], 'Fatigado')).toEqual(['Fatigado']);
    expect(aplicarCondicao(['Exausto'], 'Exausto')).toEqual(['Exausto']);
  });

  it.each(['Fatigado', 'Exausto', 'Abalado'])('reaplicação entre rituais preserva %s', condicao => {
    const efeitos = [condicao, 'Outro efeito'];
    expect(aplicarCondicao(efeitos, condicao, 'entre-rituais')).toEqual(efeitos);
  });

  it('distingue o dano de fogo, a perda de PV e os casos de acúmulo por fonte', () => {
    expect(getCondicao('Em Chamas')?.especial).toContain('efeitos instantâneos');
    expect(getCondicao('Sangrando')?.descricao).toContain('perde 1d6 PV');
    expect(getCondicao('Sangrando')?.especial).toMatch(/Sanguinária.*2d6/);
    expect(getCondicao('Envenenado')?.remocao).toContain('fim da cena');
  });

  it('Agarrado penaliza Pontaria apenas em ataques', () => {
    expect(modificador('Agarrado', 'Pontaria', true)).toBe(-1);
    expect(modificador('Agarrado', 'Pontaria')).toBe(0);
  });

  it('Enredado reduz dados de ataques sem penalizar outros testes', () => {
    expect(modificador('Enredado', 'Furtividade')).toBe(0);
    expect(modificador('Enredado', 'Luta', true)).toBe(-1);
    expect(modificador('Enredado', 'Pontaria', true)).toBe(-1);
  });

  it('Ofuscado reduz dados somente de ataques ou de Percepção', () => {
    expect(modificador('Ofuscado', 'Iniciativa')).toBe(0);
    expect(modificador('Ofuscado', 'Luta')).toBe(0);
    expect(modificador('Ofuscado', 'Pontaria', true)).toBe(-1);
    expect(modificador('Ofuscado', 'Percepção')).toBe(-1);
  });

  it('Surdo reduz dois dados de Iniciativa sem penalizar a Percepção em geral', () => {
    expect(modificador('Surdo', 'Iniciativa')).toBe(-2);
    expect(modificador('Surdo', 'Percepção')).toBe(0);
    expect(modificador('Surdo', 'Pontaria', true)).toBe(0);
  });

  it.each(['Agarrado', 'Atordoado', 'Surpreendido'])('%s inclui a penalidade de Desprevenido em Reflexos', (condicao) => {
    expect(modificador(condicao, 'Reflexos')).toBe(-1);
    expect(modificador([condicao, 'Desprevenido'], 'Reflexos')).toBe(-1);
  });

  it.each(['Indefeso', 'Inconsciente', 'Paralisado', 'Petrificado'])('%s falha em Reflexos sem rolar', (condicao) => {
    const ficha = criarFicha({ classe: 'Combatente' });
    ficha.efeitosAtivos = [condicao];
    expect(formatarTesteDaFicha(ficha, 'Reflexos')).toBe('Falha automática');
    const teste = prepararTesteDaFicha(ficha, 'Reflexos');
    expect(teste).not.toBeNull();
    expect(rolarTesteDaFicha(teste!)).toEqual({ falhaAutomatica: true });
    expect(prepararTesteDaFicha(ficha, 'Fortitude')).not.toHaveProperty('falhaAutomatica');
  });

  it('Fascinado aplica a penalidade de dados somente em Percepção', () => {
    expect(modificador('Fascinado', 'Percepção')).toBe(-2);
    expect(modificador('Fascinado', 'Investigação')).toBe(0);
  });
});
