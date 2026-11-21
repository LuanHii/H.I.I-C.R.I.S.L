'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { type Combatant, type CombatState, generateCombatantId, rollInitiative } from '@/components/master/CombatManagerTypes';
import { REGRAS } from '@/data/reference/guiaRegras';
import { montarCatalogoAmeacas } from '@/core/rules/catalogoAmeacas';
import { useCloudCampanhas, useCloudFichas, useCloudMonsters, useCloudNPCs } from '@/core/storage';
import { apresentarEfeitoDeRitual, formatarCustoDoRitual } from '@/core/rules/rituais';
import { prepararTesteDaFicha } from '@/logic/combatUtils';
import { acrescentarNaOrdem, avancarNaOrdem, ordenarAtivos, prepararIniciativa, preservarTurno, voltarNaOrdem } from '@/core/rules/ordemCombate';
import type { Personagem } from '@/core/types';
import type { CombatantAbility } from '@/components/master/CombatManagerTypes';

const QUICK_ACTIONS = REGRAS.filter(r =>
    r.categoria === 'combate' || r.categoria === 'ataques' || r.categoria === 'manobras'
).slice(0, 15);

const QUICK_CONDITIONS = REGRAS.filter(r => r.categoria === 'condicoes').slice(0, 12);

export function useCombatManager() {
    const { fichas, salvar: salvarFicha } = useCloudFichas();
    const { campanhas } = useCloudCampanhas();
    const { monstros } = useCloudMonsters();
    const { npcs } = useCloudNPCs();
    const catalogoAmeacas = useMemo(() => montarCatalogoAmeacas(monstros), [monstros]);
    const nomesCampanha = useMemo(() => new Map(campanhas.map(c => [c.id, c.nome])), [campanhas]);

    const agents = useMemo(() => fichas.map(f => {
        const p = f.personagem;
        const abilities: CombatantAbility[] = [];

        p.poderes.forEach(poder => {
            abilities.push({
                name: poder.nome,
                description: poder.descricao,
                type: 'Poder'
            });
        });

        p.rituais.forEach(ritual => {
            abilities.push({
                name: ritual.nome,
                description: apresentarEfeitoDeRitual(ritual.descricao, p.usarPd),
                type: 'Ritual',
                cost: formatarCustoDoRitual(ritual.circulo, p.usarPd)
            });
        });

        return {
            id: f.id,
            nome: p.nome,
            nex: p.nex,
            sobrevivente: p.classe === 'Sobrevivente',
            campanha: f.campanha ? nomesCampanha.get(f.campanha) : undefined,
            hp: { current: p.pv?.atual ?? 0, max: p.pv?.max ?? 0 },
            pe: p.usarPd ? undefined : { current: p.pe?.atual ?? 0, max: p.pe?.max ?? 0 },
            san: p.usarPd ? undefined : { current: p.san?.atual ?? 0, max: p.san?.max ?? 0 },
            pd: p.usarPd && p.pd ? { current: p.pd.atual, max: p.pd.max } : undefined,
            defesa: p.defesa ?? 10,
            initiativeSkill: prepararTesteDaFicha(p, 'Iniciativa') ?? undefined,
            abilities
        };
    }), [fichas, nomesCampanha]);

    const [state, setState] = useState<CombatState>({
        isActive: false, combatants: [], currentTurnIndex: 0, round: 1,
    });
    const [sessaoCarregada, setSessaoCarregada] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showQuickRef, setShowQuickRef] = useState(false);
    const [quickRefTab, setQuickRefTab] = useState<'dice' | 'actions' | 'conditions'>('dice');
    const [quickRefQuery, setQuickRefQuery] = useState('');
    const orderMode = state.orderMode ?? 'initiative';

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        setQuickRefQuery('');
    }, [quickRefTab]);

    const filteredQuickActions = useMemo(() => {
        const q = quickRefQuery.trim().toLowerCase();
        if (!q) return QUICK_ACTIONS;
        return QUICK_ACTIONS.filter(rule =>
            rule.titulo.toLowerCase().includes(q) ||
            rule.resumo.toLowerCase().includes(q) ||
            (rule.tags || []).some(t => t.toLowerCase().includes(q))
        );
    }, [quickRefQuery]);

    const filteredQuickConditions = useMemo(() => {
        const q = quickRefQuery.trim().toLowerCase();
        if (!q) return QUICK_CONDITIONS;
        return QUICK_CONDITIONS.filter(rule =>
            rule.titulo.toLowerCase().includes(q) ||
            rule.resumo.toLowerCase().includes(q) ||
            (rule.tags || []).some(t => t.toLowerCase().includes(q))
        );
    }, [quickRefQuery]);

    useEffect(() => {
        try {
            const conteudo = localStorage.getItem('combat-state');
            const salva = conteudo ? JSON.parse(conteudo) as CombatState : null;
            if (salva && Array.isArray(salva.combatants) && Number.isInteger(salva.round) && Number.isInteger(salva.currentTurnIndex)) {
                setState(salva);
            }
        } catch {
            // Sem sessão legível, o painel inicia vazio.
        } finally {
            setSessaoCarregada(true);
        }
    }, []);

    useEffect(() => {
        if (!sessaoCarregada) return;
        try {
            localStorage.setItem('combat-state', JSON.stringify(state));
        } catch (erro) {
            console.warn('Não foi possível salvar a sessão de combate neste dispositivo.', erro);
        }
    }, [state, sessaoCarregada]);

    const sortedCombatants = useMemo(
        () => ordenarAtivos(state.combatants, orderMode, state.round),
        [state.combatants, orderMode, state.round],
    );

    const inactiveCombatants = useMemo(() => {
        return state.combatants.filter(c => !c.isActive);
    }, [state.combatants]);

    const currentCombatant = sortedCombatants[state.currentTurnIndex] ?? null;
    const rodadaSeguinte = avancarNaOrdem(state);
    const proximoCombatente = rodadaSeguinte === state ? null
        : ordenarAtivos(state.combatants, orderMode, rodadaSeguinte.round)[rodadaSeguinte.currentTurnIndex] ?? null;
    const aguardando = state.combatants.filter(c => c.isActive && (c.entradaNaRodada ?? 1) > state.round);

    const rollStoredInitiative = useCallback((combatant: Combatant) => {
        const skill = combatant.initiativeSkill ?? (combatant.type === 'agent'
            ? agents.find(agent => agent.id === combatant.sourceId)?.initiativeSkill
            : undefined);
        return rollInitiative(combatant.initiativeDice ?? 1, combatant.initiativeBonus, skill);
    }, [agents]);

    const addCombatants = useCallback((newCombatants: Combatant[]) => {
        if (!newCombatants.length) return;
        setState(prev => {
            const state = acrescentarNaOrdem(prev, newCombatants, rollStoredInitiative);
            return prev.isActive || prev.isPaused ? state : { ...state, iniciativaPreparada: false };
        });
        setShowAddModal(false);
    }, [rollStoredInitiative]);

    const syncAgentStats = useCallback((combatant: Combatant, updates: Partial<Combatant>) => {
        if (combatant.type !== 'agent' || !combatant.sourceId) return;
        if (!updates.hp && !updates.pe && !updates.san && !updates.pd) return;

        const ficha = fichas.find(f => f.id === combatant.sourceId);
        if (!ficha) return;

        const personagem = ficha.personagem;
        const recursos: Partial<Personagem> = {};
        if (updates.hp && personagem.pv.atual !== updates.hp.current) {
            recursos.pv = { ...personagem.pv, atual: updates.hp.current };
        }
        if (updates.pe && personagem.pe.atual !== updates.pe.current) {
            recursos.pe = { ...personagem.pe, atual: updates.pe.current };
        }
        if (updates.san && personagem.san.atual !== updates.san.current) {
            recursos.san = { ...personagem.san, atual: updates.san.current };
        }
        if (updates.pd && personagem.pd && personagem.pd.atual !== updates.pd.current) {
            recursos.pd = { ...personagem.pd, atual: updates.pd.current };
        }
        if (Object.keys(recursos).length > 0) {
            void salvarFicha({ ...personagem, ...recursos }, combatant.sourceId);
        }
    }, [fichas, salvarFicha]);

    const updateCombatant = useCallback((id: string, updates: Partial<Combatant>) => {
        const combatente = state.combatants.find(c => c.id === id);
        if (!combatente) return;
        setState(prev => {
            const marcouIniciativa = updates.initiative !== undefined;
            const combatants = prev.combatants.map(c => c.id === id ? {
                ...c, ...updates,
                ...(marcouIniciativa ? { iniciativaManual: true, iniciativaColetiva: false, desempates: [] } : {}),
            } : c);
            const mudouOrdem = updates.isActive !== undefined || updates.initiative !== undefined;
            const turno = mudouOrdem ? preservarTurno(prev, combatants) : {};
            const mudouGrupo = updates.inimigo !== undefined || updates.isActive !== undefined || marcouIniciativa;
            const iniciativaPreparada = mudouGrupo && !prev.isActive && !prev.isPaused ? false : prev.iniciativaPreparada;
            return { ...prev, ...turno, combatants, iniciativaPreparada };
        });
        syncAgentStats(combatente, updates);
    }, [state.combatants, syncAgentStats]);

    const removeCombatant = useCallback((id: string) => {
        setState(prev => {
            const combatants = prev.combatants.filter(c => c.id !== id);
            const iniciativaPreparada = prev.isActive || prev.isPaused ? prev.iniciativaPreparada : false;
            return { ...prev, ...preservarTurno(prev, combatants), combatants, iniciativaPreparada };
        });
    }, []);

    const duplicateCombatant = useCallback((id: string) => {
        const original = state.combatants.find(c => c.id === id);
        if (!original) return;
        const duplicate: Combatant = {
            ...original,
            id: generateCombatantId(),
            name: original.name + ' (cópia)',
            initiative: 0,
            isActive: original.isActive && !original.semTesteDeIniciativa,
            iniciativaManual: false,
            iniciativaColetiva: false,
            entradaNaRodada: undefined,
            desempates: [],
        };
        setState(prev => {
            const state = acrescentarNaOrdem(prev, [duplicate], rollStoredInitiative);
            return prev.isActive || prev.isPaused ? state : { ...state, iniciativaPreparada: false };
        });
    }, [state.combatants, rollStoredInitiative]);

    const nextTurn = useCallback(() => setState(avancarNaOrdem), []);
    const prevTurn = useCallback(() => setState(voltarNaOrdem), []);

    const startCombat = useCallback(() => {
        setState(prev => {
            if (prev.isActive) return prev;
            if (prev.isPaused) return { ...prev, isActive: true, isPaused: false };
            const combatants = prev.iniciativaPreparada
                ? prev.combatants
                : prepararIniciativa(prev.combatants, 1, rollStoredInitiative);
            return { ...prev, combatants, iniciativaPreparada: true, isActive: true, isPaused: false, currentTurnIndex: 0, round: 1 };
        });
    }, [rollStoredInitiative]);

    const endCombat = useCallback(() => {
        setState(prev => ({ ...prev, isActive: false, isPaused: true }));
    }, []);

    const resetCombat = useCallback(() => {
        if (confirm('Tem certeza que deseja resetar o combate? Isso removerá todos os combatentes.')) {
            setState({ isActive: false, combatants: [], currentTurnIndex: 0, round: 1 });
        }
    }, []);

    const rerollAllInitiatives = useCallback(() => {
        setState(prev => ({
            ...prev,
            combatants: prepararIniciativa(prev.combatants, prev.round, rollStoredInitiative, true),
            iniciativaPreparada: true,
            currentTurnIndex: 0,
            orderMode: 'initiative',
        }));
    }, [rollStoredInitiative]);

    const moverCombatente = useCallback((id: string | number, destino: string | number) => {
        if (id === destino) return;
        setState(prev => {
            const ativos = ordenarAtivos(prev.combatants, prev.orderMode ?? 'initiative', prev.round);
            const inativos = prev.combatants.filter(c => !c.isActive);
            const pendentes = prev.combatants.filter(c => c.isActive && (c.entradaNaRodada ?? 1) > prev.round);
            const grupo = ativos.some(c => c.id === id) ? ativos : inativos;
            const de = grupo.findIndex(c => c.id === id);
            const para = grupo.findIndex(c => c.id === destino);
            if (de < 0 || para < 0) return prev;
            const ordem = arrayMove(grupo, de, para);
            const combatants = grupo === ativos ? [...ordem, ...pendentes, ...inativos] : [...ativos, ...pendentes, ...ordem];
            const modo = grupo === ativos ? 'manual' : prev.orderMode;
            return { ...prev, ...preservarTurno(prev, combatants, modo), orderMode: modo, combatants };
        });
    }, []);

    const handleDragEnd = useCallback(({ active, over }: DragEndEvent) => {
        if (over) moverCombatente(active.id, over.id);
    }, [moverCombatente]);

    const sortByInitiative = useCallback(() => {
        setState(prev => ({
            ...prev,
            ...preservarTurno(prev, prev.combatants, 'initiative'),
            orderMode: 'initiative',
        }));
    }, []);

    return {
        
        state,
        sortedCombatants,
        inactiveCombatants,
        currentCombatant, proximoCombatente, aguardando,
        showAddModal, setShowAddModal,
        showQuickRef, setShowQuickRef,
        quickRefTab, setQuickRefTab,
        quickRefQuery, setQuickRefQuery,
        orderMode,
        
        sensors,
        agents,
        catalogoAmeacas,
        npcs,
        filteredQuickActions,
        filteredQuickConditions,
        
        addCombatants,
        updateCombatant,
        removeCombatant,
        duplicateCombatant,
        nextTurn,
        prevTurn,
        startCombat,
        endCombat,
        resetCombat,
        rerollAllInitiatives,
        handleDragEnd,
        moverCombatente,
        sortByInitiative,
    };
}
