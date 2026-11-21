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

export const CONDITION_COLORS: Record<string, string> = {
    'abalado': 'bg-yellow-600',
    'apavorado': 'bg-yellow-700',
    'confuso': 'bg-purple-500',
    'fascinado': 'bg-pink-500',
    'frustrado': 'bg-orange-500',
    'esmorecido': 'bg-orange-600',
    'pasmo': 'bg-purple-400',
    'caido': 'bg-amber-600',
    'lento': 'bg-blue-500',
    'imóvel': 'bg-blue-700',
    'paralisado': 'bg-blue-800',
    'agarrado': 'bg-teal-600',
    'enredado': 'bg-teal-500',
    'sangrando': 'bg-red-600',
    'envenenado': 'bg-green-600',
    'em-chamas': 'bg-orange-500',
    'morrendo': 'bg-red-800',
    'machucado': 'bg-red-400',
    'cego': 'bg-gray-600',
    'surdo': 'bg-gray-500',
    'ofuscado': 'bg-yellow-400',
    'desprevenido': 'bg-cyan-600',
    'indefeso': 'bg-red-700',
    'vulneravel': 'bg-red-500',
    'surpreendido': 'bg-cyan-700',
    'fraco': 'bg-amber-500',
    'debilitado': 'bg-amber-700',
    'fatigado': 'bg-amber-600',
    'exausto': 'bg-amber-800',
    'atordoado': 'bg-purple-700',
    'inconsciente': 'bg-gray-700',
    'petrificado': 'bg-stone-600',
    'doente': 'bg-green-700',
    'enjoado': 'bg-lime-600',
    'alquebrado': 'bg-indigo-500',
    'perturbado': 'bg-violet-500',
    'enlouquecendo': 'bg-violet-700',
};

export function getConditionColor(conditionId: string): string {
    return CONDITION_COLORS[conditionId] || 'bg-gray-500';
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
