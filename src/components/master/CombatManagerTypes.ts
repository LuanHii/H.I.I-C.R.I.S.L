

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

export interface Combatant {
    id: string;
    name: string;
    type: 'agent' | 'npc' | 'creature';
    sourceId?: string;
    initiative: number;
    initiativeBonus: number;
    hp: CombatantHP;
    pe?: CombatantHP;
    san?: CombatantHP;
    defense: number;
    conditions: string[];
    notes: string;
    isActive: boolean;
    color?: string;
    abilities?: CombatantAbility[];
}

export interface CombatState {
    isActive: boolean;
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
    return `cbt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
export function rollInitiative(diceCount: number, bonus: number): number {
    const rolls: number[] = [];
    for (let i = 0; i < Math.max(1, diceCount); i++) {
        rolls.push(Math.floor(Math.random() * 20) + 1);
    }
    return Math.max(...rolls) + bonus;
}
