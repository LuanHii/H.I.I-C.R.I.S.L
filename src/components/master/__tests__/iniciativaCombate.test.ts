import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PericiaDetalhada } from '@/core/types';
import { rollInitiative } from '../CombatManagerTypes';

const iniciativa: PericiaDetalhada = {
    atributoBase: 'AGI',
    dados: 3,
    criterio: 'melhor',
    bonusFixo: 5,
    bonusO: 0,
    grau: 'Treinado',
};

function dadosControlados(...resultados: number[]) {
    const getRandomValues = vi.fn((dados: Uint32Array) => {
        const resultado = resultados.shift();
        if (resultado === undefined) throw new Error('Dado além dos previstos');
        dados[0] = resultado - 1;
        return dados;
    });
    vi.stubGlobal('crypto', { getRandomValues });
    return getRandomValues;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('teste de iniciativa de agentes', () => {
    it('rola um d20 por ponto de Agilidade e soma o bônus ao melhor', () => {
        const dados = dadosControlados(4, 17, 11);
        expect(rollInitiative(1, 5, iniciativa)).toBe(22);
        expect(dados).toHaveBeenCalledTimes(3);
    });

    it('usa o pior de dois dados quando a Agilidade é zero', () => {
        const dados = dadosControlados(18, 4);
        expect(rollInitiative(1, 5, { ...iniciativa, dados: 2, criterio: 'pior' })).toBe(9);
        expect(dados).toHaveBeenCalledTimes(2);
    });

    it('preserva os dados extras que o motor calculou para a perícia', () => {
        const dados = dadosControlados(3, 18);
        expect(rollInitiative(1, 5, { ...iniciativa, dados: 1, bonusO: 1 })).toBe(23);
        expect(dados).toHaveBeenCalledTimes(2);
    });

    it('preserva a rolagem com bônus para combatentes antigos e manuais', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        expect(rollInitiative(1, 5)).toBe(16);
    });
});
