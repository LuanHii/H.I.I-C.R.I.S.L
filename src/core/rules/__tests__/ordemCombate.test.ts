import { describe, expect, it } from 'vitest';
import { ordenarAtivos, preservarTurno } from '@/core/rules/ordemCombate';

const a = { id: 'a', isActive: true, initiative: 20 };
const b = { id: 'b', isActive: true, initiative: 15 };
const c = { id: 'c', isActive: true, initiative: 10 };
const estado = { combatants: [a, b, c], isActive: true, currentTurnIndex: 1, round: 3 };

describe('edições durante a rodada de OP1', () => {
  it('mantém o combatente atual ao remover quem já agiu', () => {
    expect(preservarTurno(estado, [b, c])).toEqual({ currentTurnIndex: 0, round: 3 });
  });

  it('mantém o combatente atual ao reordenar a lista manualmente', () => {
    expect(preservarTurno(estado, [b, a, c], 'manual')).toEqual({ currentTurnIndex: 0, round: 3 });
  });

  it('escolhe o próximo ativo ao retirar quem está agindo', () => {
    expect(preservarTurno(estado, [a, c])).toEqual({ currentTurnIndex: 1, round: 3 });
  });

  it('volta ao primeiro e avança a rodada ao retirar o último ativo da ordem anterior', () => {
    expect(preservarTurno({ ...estado, currentTurnIndex: 2 }, [a, b])).toEqual({ currentTurnIndex: 0, round: 4 });
  });

  it('carrega a ordem manual de uma sessão pausada', () => {
    const pausado = { ...estado, isActive: false, isPaused: true, orderMode: 'manual' as const, combatants: [c, a, b] };
    expect(ordenarAtivos(pausado.combatants, pausado.orderMode)).toEqual([c, a, b]);
    expect(preservarTurno(pausado, [a, b])).toEqual({ currentTurnIndex: 0, round: 3 });
  });
});
