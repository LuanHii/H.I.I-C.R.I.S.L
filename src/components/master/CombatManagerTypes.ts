import type { PericiaDetalhada } from '@/core/types';
import type { ModoDaOrdem, ParticipanteDaIniciativa } from '@/core/rules/ordemCombate';
import { rollPericia } from '@/logic/diceRoller';

export interface CombatantHP {
    current: number;
    max: number;
}

export interface CombatantAbility {
    name: string;
    description: string;
    type?: string;
    cost?: string;
}

export interface Combatant extends ParticipanteDaIniciativa {
    name: string;
    sourceId?: string;
    initiativeDice?: number;
    initiativeSkill?: PericiaDetalhada;
    hp: CombatantHP;
    pe?: CombatantHP;
    pd?: CombatantHP;
    san?: CombatantHP;
    defense: number;
    conditions: string[];
    notes: string;
    color?: string;
    abilities?: CombatantAbility[];

    atributos?: { AGI: number; FOR: number; INT: number; PRE: number; VIG: number };
    fortitude?: string;
    reflexos?: string;
    vontade?: string;
    resistencias?: string[];
    imunidades?: string[];
    vulnerabilidades?: string[];
    deslocamento?: string;
}

export interface CombatState {
    isActive: boolean;
    isPaused?: boolean;
    iniciativaPreparada?: boolean;
    orderMode?: ModoDaOrdem;
    combatants: Combatant[];
    currentTurnIndex: number;
    round: number;
}

export interface QuickNPC {
    name: string;
    hp: number;
    defense: number;
    initiativeBonus: number;
}

export function generateCombatantId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `cbt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function rollInitiative(diceCount: number, bonus: number, skill?: PericiaDetalhada): number {
    if (skill) return rollPericia(skill).total;

    const rolls: number[] = [];
    for (let i = 0; i < Math.max(1, diceCount); i++) {
        rolls.push(Math.floor(Math.random() * 20) + 1);
    }
    return Math.max(...rolls) + bonus;
}
