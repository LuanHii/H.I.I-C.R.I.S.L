import { describe, expect, it, vi } from 'vitest';
import { acrescentarNaOrdem, avancarNaOrdem, lerPerfilDeIniciativa, ordenarAtivos, prepararIniciativa, voltarNaOrdem } from '../ordemCombate';

const combatente = (id: string, type: 'agent' | 'npc' | 'creature', initiativeBonus: number, initiative = 0) =>
  ({ id, type, initiativeBonus, initiative, isActive: true });

describe('iniciativa OP1', () => {
  it('rola uma vez pelos inimigos usando o menor bônus e rola separadamente pelo aliado', () => {
    const agente = combatente('agente', 'agent', 5);
    const aliado = combatente('aliado', 'npc', 0);
    const criatura = combatente('criatura', 'creature', 15);
    const npcInimigo = { ...combatente('capanga', 'npc', 5), inimigo: true };
    const rolar = vi.fn(c => ({ agente: 18, aliado: 8, capanga: 11 })[c.id as string] ?? 99);
    const ordem = prepararIniciativa([agente, aliado, criatura, npcInimigo], 1, rolar);
    expect(rolar.mock.calls.map(([participante]) => participante.id)).toEqual(['agente', 'aliado', 'capanga']);
    expect(ordenarAtivos(ordem, 'initiative', 1).map(c => [c.id, c.initiative]))
      .toEqual([['agente', 18], ['criatura', 11], ['capanga', 11], ['aliado', 8]]);
  });

  it('rerrola só os empatados, mantendo os valores iniciais e o grupo unido', () => {
    const a = combatente('a', 'agent', 5);
    const b = combatente('b', 'agent', 5);
    const c = combatente('c', 'creature', 10);
    const d = combatente('d', 'creature', 15);
    const e = combatente('e', 'npc', 0);
    const resultados: Record<string, number[]> = { a: [12, 20], b: [15], c: [12, 20, 17], e: [5] };
    resultados.a.push(14);
    const rolar = vi.fn(({ id }: { id: string }) => resultados[id].shift()!);
    const ordem = prepararIniciativa([a, b, c, d, e], 1, rolar);
    expect(ordenarAtivos(ordem, 'initiative', 1).map(item => [item.id, item.initiative]))
      .toEqual([['b', 15], ['c', 12], ['d', 12], ['a', 12], ['e', 5]]);
    expect(rolar.mock.calls.filter(([item]) => item.id === 'b' || item.id === 'e')).toHaveLength(2);
  });

  it('lê o perfil de NPC e omite a Anomalia do teste coletivo', () => {
    const perfil = lerPerfilDeIniciativa('4d20 + 10');
    const anomalia = { ...combatente('anomalia', 'creature', 0), ...lerPerfilDeIniciativa('—'), isActive: false };
    const inimigo = { ...combatente('inimigo', 'npc', 0), ...perfil, inimigo: true };
    const rolar = vi.fn(() => 18);
    const ordem = prepararIniciativa([anomalia, inimigo], 1, rolar);
    expect(rolar).toHaveBeenCalledExactlyOnceWith(inimigo);
    expect(perfil).toMatchObject({ initiativeDice: 4, initiativeBonus: 10 });
    expect(ordenarAtivos(ordem, 'initiative', 1).map(c => c.id)).toEqual(['inimigo']);
  });

  it('mantém a iniciativa preenchida manualmente', () => {
    const ficha = { ...combatente('ficha', 'agent', 5, 23), iniciativaManual: true };
    const rolar = vi.fn(() => 2);
    expect(prepararIniciativa([ficha], 1, rolar)[0].initiative).toBe(23);
    expect(rolar).not.toHaveBeenCalled();
  });

  it('coloca o reforço apenas na rodada seguinte e restaura a fila ao voltar', () => {
    const a = combatente('a', 'agent', 0, 18);
    const b = combatente('b', 'creature', 5, 12);
    const atual = { combatants: [a, b], currentTurnIndex: 0, round: 1, isActive: true };
    const nova = combatente('reforço', 'creature', 5);
    const rolar = vi.fn(() => 20);
    const preparada = acrescentarNaOrdem(atual, [nova], rolar);
    expect(preparada.combatants[2]).toMatchObject({ initiative: 20, entradaNaRodada: 2 });
    expect(ordenarAtivos(preparada.combatants, 'initiative', 1).map(c => c.id)).toEqual(['a', 'b']);
    const ultimo = avancarNaOrdem(preparada);
    expect(ultimo).toMatchObject({ currentTurnIndex: 1, round: 1 });
    const proxima = avancarNaOrdem(ultimo);
    expect(proxima).toMatchObject({ currentTurnIndex: 0, round: 2 });
    expect(ordenarAtivos(proxima.combatants, 'initiative', 2)[0].id).toBe('reforço');
    expect(voltarNaOrdem(proxima)).toMatchObject({ currentTurnIndex: 1, round: 1 });
    expect(rolar).toHaveBeenCalledTimes(1);
  });

  it('mantém desempates da rodada atual ao encaixar um reforço empatado na próxima', () => {
    const a = { ...combatente('a', 'agent', 0, 14), desempates: [{ rodada: 1, ordem: 0 }] };
    const b = { ...combatente('b', 'agent', 0, 14), desempates: [{ rodada: 1, ordem: 1 }] };
    const atual = { combatants: [a, b], currentTurnIndex: 0, round: 1, isActive: true };
    const resultados: Record<string, number[]> = { a: [2], b: [9], c: [14, 20] };
    const nova = acrescentarNaOrdem(atual, [combatente('c', 'npc', 0)], c => resultados[c.id].shift()!);
    expect(ordenarAtivos(nova.combatants, 'initiative', 1).map(c => c.id)).toEqual(['a', 'b']);
    expect(ordenarAtivos(nova.combatants, 'initiative', 2).map(c => c.id)).toEqual(['c', 'b', 'a']);
  });
});
