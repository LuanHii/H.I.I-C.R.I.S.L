import React, { useMemo, useState } from 'react';
import { Personagem, AtributoKey, PericiaName, Item, Poder } from '../../core/types';
import { StatusBar } from '../StatusBar';
import { calcularDefesaEfetiva } from '../../logic/combatUtils';
import { PERICIA_ATRIBUTO, calcularPericiasDetalhadas } from '../../logic/rulesEngine';
import { ActionsTab } from '../ActionsTab';
import { ItemSelectorModal } from './ItemSelectorModal';
import { AbilitySelectorModal } from './AbilitySelectorModal';
import { SkillSelectorModal } from './SkillSelectorModal';
import { levelUp, levelDown, applyAttributePoint, removeAttributePoint, chooseTrack } from '../../logic/progression';
import { ProgressionTab } from '../ProgressionTab';
import { PendingChoiceModal } from '../PendingChoiceModal';
import { TrackSelectorModal } from '../TrackSelectorModal';
import { calculateDerivedStats } from '../../core/rules/derivedStats';
import { auditPersonagem, summarizeIssues } from '../../core/validation/auditPersonagem';
import { Brain, Flame, Dices } from 'lucide-react';
import { rollPericia, type DiceRollResult } from '../../logic/diceRoller';

interface AgentDetailViewProps {
    agent: Personagem;
    onUpdate: (updated: Personagem) => void;
    readOnly?: boolean;
    disableInteractionModals?: boolean;
}

export const AgentDetailView: React.FC<AgentDetailViewProps> = ({ agent, onUpdate, readOnly, disableInteractionModals }) => {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        status: true,
        // Na visualização remota, a prioridade é status + ações.
        attributes: !!readOnly ? false : true,
        inventory: false,
        abilities: false,
        actions: !!readOnly ? true : false,
        progression: false,
    });

    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isAbilityModalOpen, setIsAbilityModalOpen] = useState(false);
    const [isPendingChoiceModalSuppressed, setIsPendingChoiceModalSuppressed] = useState(false);
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [editingSkill, setEditingSkill] = useState<PericiaName | null>(null);
    const [tempSkillBonus, setTempSkillBonus] = useState<string>('');
    const [lastRoll, setLastRoll] = useState<{ pericia: PericiaName; result: DiceRollResult } | null>(null);

    const auditIssues = useMemo(() => auditPersonagem(agent), [agent]);
    const auditSummary = useMemo(() => summarizeIssues(auditIssues), [auditIssues]);
    const auditTitle = useMemo(() => {
        if (auditSummary.total === 0) return '';
        const lines = auditIssues.map((i) => `- [${i.severity.toUpperCase()}] ${i.message}`);
        return `Problemas detectados (${auditSummary.errors} erro(s), ${auditSummary.warns} aviso(s)):\n${lines.join('\n')}`;
    }, [auditIssues, auditSummary]);

    const recalcularPericias = (ch: Personagem) => {
        const fixos = ch.overrides?.periciaFixos;
        return calcularPericiasDetalhadas(ch.atributos, ch.pericias, fixos ? { fixos } : undefined);
    };

    const toggleSkillGrade = (skillName: PericiaName) => {
        const currentSkills = { ...agent.pericias };
        const currentGrade = currentSkills[skillName] || 'Destreinado';

        let newGrade: 'Destreinado' | 'Treinado' | 'Veterano' | 'Expert' = 'Destreinado';

        if (currentGrade === 'Destreinado') newGrade = 'Treinado';
        else if (currentGrade === 'Treinado') newGrade = 'Veterano';
        else if (currentGrade === 'Veterano') newGrade = 'Expert';
        else newGrade = 'Destreinado';

        const updated = { ...agent };
        updated.pericias[skillName] = newGrade;

        updated.periciasDetalhadas = recalcularPericias(updated);
        onUpdate(updated);
    };

    const handleManualSkillBonusChange = (skillName: PericiaName, newValue: number) => {
        const updated = { ...agent };

        // Persistimos um DELTA (extras fixos) para atingir o valor final desejado.
        const baseBonus = calcularPericiasDetalhadas(updated.atributos, updated.pericias)[skillName]?.bonusFixo ?? 0;
        const delta = newValue - baseBonus;
        updated.overrides = {
            ...(updated.overrides ?? {}),
            periciaFixos: {
                ...((updated.overrides?.periciaFixos ?? {}) as Partial<Record<PericiaName, number>>),
                [skillName]: delta,
            },
        };
        updated.periciasDetalhadas = recalcularPericias(updated);
        onUpdate(updated);
        setEditingSkill(null);
    };

    const startEditingSkill = (skillName: PericiaName, currentBonus: number) => {
        setEditingSkill(skillName);
        setTempSkillBonus(currentBonus.toString());
    };

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleLevelUp = () => {
        const updated = levelUp(agent);
        onUpdate(updated);
    };

    const handleLevelDown = () => {
        const updated = levelDown(agent);
        onUpdate(updated);
    };

    const handleAttributeChange = (attr: AtributoKey, increase: boolean) => {
        if (isEditingMode) {
            // Manual Override Mode
            const updated = { ...agent };
            updated.atributos[attr] += increase ? 1 : -1;
            if (updated.atributos[attr] < 0) updated.atributos[attr] = 0;

            // Update Skills
            updated.periciasDetalhadas = recalcularPericias(updated);

            // Recalculate Derived Stats
            const derived = calculateDerivedStats(updated.classe, updated.atributos, updated.nex, updated.estagio);

            const targetPvMax = updated.overrides?.pvMax ?? derived.pvMax;
            const targetPeMax = updated.overrides?.peMax ?? derived.peMax;
            const targetSanMax = updated.overrides?.sanMax ?? derived.sanMax;

            const diffPV = targetPvMax - updated.pv.max;
            updated.pv.max = targetPvMax;
            updated.pv.atual = Math.min(updated.pv.max, Math.max(0, updated.pv.atual + diffPV));

            const diffPE = targetPeMax - updated.pe.max;
            updated.pe.max = targetPeMax;
            updated.pe.atual = Math.min(updated.pe.max, Math.max(0, updated.pe.atual + diffPE));
            updated.pe.rodada = derived.peRodada;

            const diffSAN = targetSanMax - updated.san.max;
            updated.san.max = targetSanMax;
            updated.san.atual = Math.min(updated.san.max, Math.max(0, updated.san.atual + diffSAN));

            if (updated.usarPd && updated.pd) {
                const targetPdMax = updated.overrides?.pdMax ?? derived.pdMax;
                const diffPD = targetPdMax - updated.pd.max;
                updated.pd.max = targetPdMax;
                updated.pd.atual = Math.min(updated.pd.max, Math.max(0, updated.pd.atual + diffPD));
            }

            onUpdate(updated);
        } else {
            // Standard Progression Mode
            if (increase) {
                const updated = applyAttributePoint(agent, attr);
                onUpdate(updated);
            } else {
                const updated = removeAttributePoint(agent, attr);
                onUpdate(updated);
            }
        }
    };

    const togglePdMode = () => {
        const newMode = !agent.usarPd;
        const derived = calculateDerivedStats(agent.classe, agent.atributos, agent.nex, agent.estagio);

        const updated = { ...agent, usarPd: newMode };

        if (newMode) {
            const targetPdMax = updated.overrides?.pdMax ?? derived.pdMax;
            updated.pd = {
                atual: targetPdMax,
                max: targetPdMax
            };
        } else {
            const targetSanMax = updated.overrides?.sanMax ?? derived.sanMax;
            const targetPeMax = updated.overrides?.peMax ?? derived.peMax;
            updated.san = {
                atual: targetSanMax,
                max: targetSanMax,
                perturbado: false
            };
            updated.pe = {
                atual: targetPeMax,
                max: targetPeMax,
                rodada: derived.peRodada
            };
        }
        onUpdate(updated);
    };

    const updateStat = (stat: 'pv' | 'pe' | 'san' | 'pd', newValue: number) => {
        const updated = { ...agent };
        if (stat === 'pv') updated.pv.atual = newValue;
        if (stat === 'pe') updated.pe.atual = newValue;
        if (stat === 'san') {
            updated.san.atual = newValue;
            updated.san.perturbado = newValue <= updated.san.max / 2;
        }
        if (stat === 'pd') {
            if (updated.pd) updated.pd.atual = newValue;
            else updated.pd = { atual: newValue, max: newValue };
        }
        onUpdate(updated);
    };

    const updateMaxStat = (stat: 'pv' | 'pe' | 'san' | 'pd', newMax: number) => {
        const updated = { ...agent };
        if (stat === 'pv') updated.pv.max = newMax;
        if (stat === 'pe') updated.pe.max = newMax;
        if (stat === 'san') updated.san.max = newMax;
        if (stat === 'pd') {
            if (!updated.pd) updated.pd = { atual: newMax, max: newMax };
            else updated.pd.max = newMax;
        }

        // Persistir override no modo Mestre/Operador
        updated.overrides = {
            ...(updated.overrides ?? {}),
            pvMax: stat === 'pv' ? newMax : updated.overrides?.pvMax,
            peMax: stat === 'pe' ? newMax : updated.overrides?.peMax,
            sanMax: stat === 'san' ? newMax : updated.overrides?.sanMax,
            pdMax: stat === 'pd' ? newMax : updated.overrides?.pdMax,
            periciaFixos: updated.overrides?.periciaFixos,
        };

        // Clamp dos atuais
        if (stat === 'pv') updated.pv.atual = Math.min(updated.pv.atual, updated.pv.max);
        if (stat === 'pe') updated.pe.atual = Math.min(updated.pe.atual, updated.pe.max);
        if (stat === 'san') updated.san.atual = Math.min(updated.san.atual, updated.san.max);
        if (stat === 'pd' && updated.pd) updated.pd.atual = Math.min(updated.pd.atual, updated.pd.max);
        onUpdate(updated);
    };

    const handleAddItem = (item: Item) => {
        const updated = { ...agent };
        updated.equipamentos = [...updated.equipamentos, item];
        const currentLoad = updated.equipamentos.reduce((acc, i) => acc + i.espaco, 0);
        updated.carga.atual = currentLoad;

        onUpdate(updated);
        setIsItemModalOpen(false);
    };

    const handleRemoveItem = (index: number) => {
        const updated = { ...agent };
        updated.equipamentos = updated.equipamentos.filter((_, i) => i !== index);
        const currentLoad = updated.equipamentos.reduce((acc, i) => acc + i.espaco, 0);
        updated.carga.atual = currentLoad;
        onUpdate(updated);
    };

    const handleAddAbility = (ability: Poder) => {
        const updated = { ...agent };
        updated.poderes = [...updated.poderes, ability];
        onUpdate(updated);
        setIsAbilityModalOpen(false);
    };

    const handleRemoveAbility = (index: number) => {
        const updated = { ...agent };
        updated.poderes = updated.poderes.filter((_, i) => i !== index);
        onUpdate(updated);
    };

    const handleTrackSelection = (trackName: string) => {
        const updated = chooseTrack(agent, trackName);
        onUpdate(updated);
    };

    const handleSkillSelection = (skill: PericiaName) => {
        const updated = { ...agent };
        updated.pericias = { ...updated.pericias, [skill]: 'Treinado' };
        updated.periciasTreinadasPendentes = (updated.periciasTreinadasPendentes || 0) - 1;
        updated.periciasDetalhadas = recalcularPericias(updated);
        onUpdate(updated);
    };

    const handleSkillPromotionSelection = (skill: PericiaName) => {
        const pending = agent.periciasPromocaoPendentes;
        if (!pending) return;

        const requiredFrom = pending.alvo === 'Veterano' ? 'Treinado' : 'Veterano';
        if (agent.pericias[skill] !== requiredFrom) return;

        const updated = { ...agent };
        updated.pericias = { ...updated.pericias, [skill]: pending.alvo };
        const restante = Math.max(0, (pending.restante || 0) - 1);
        updated.periciasPromocaoPendentes = restante > 0 ? { ...pending, restante } : undefined;
        updated.periciasDetalhadas = recalcularPericias(updated);
        onUpdate(updated);
    };

    const pendingChoice = agent.habilidadesTrilhaPendentes && agent.habilidadesTrilhaPendentes.length > 0
        ? agent.habilidadesTrilhaPendentes[0]
        : null;

    const hasPendingStuff =
        pendingChoice ||
        (agent.periciasTreinadasPendentes && agent.periciasTreinadasPendentes > 0) ||
        (agent.periciasPromocaoPendentes && agent.periciasPromocaoPendentes.restante > 0) ||
        agent.escolhaTrilhaPendente;

    const derivedPreview = calculateDerivedStats(agent.classe, agent.atributos, agent.nex, agent.estagio);
    const expectedPvMax = agent.overrides?.pvMax ?? derivedPreview.pvMax;
    const expectedPeMax = agent.overrides?.peMax ?? derivedPreview.peMax;
    const expectedSanMax = agent.overrides?.sanMax ?? derivedPreview.sanMax;
    const expectedPdMax = agent.overrides?.pdMax ?? derivedPreview.pdMax;

    const warnings: string[] = [];
    if (agent.pv.atual > agent.pv.max) warnings.push('PV atual está acima do PV máximo.');
    if (!agent.usarPd) {
        if (agent.pe.atual > agent.pe.max) warnings.push('PE atual está acima do PE máximo.');
        if (agent.san.atual > agent.san.max) warnings.push('SAN atual está acima do SAN máximo.');
    } else {
        if (!agent.pd) warnings.push('Regra de Determinação ativa, mas PD está ausente na ficha.');
        if (agent.pd && agent.pd.atual > agent.pd.max) warnings.push('PD atual está acima do PD máximo.');
    }
    if (agent.pv.max !== expectedPvMax) warnings.push('PV máximo diverge do valor esperado pela regra (ou override).');
    if (agent.pe.max !== expectedPeMax) warnings.push('PE máximo diverge do valor esperado pela regra (ou override).');
    if (agent.san.max !== expectedSanMax) warnings.push('SAN máximo diverge do valor esperado pela regra (ou override).');
    if (agent.usarPd && agent.pd && agent.pd.max !== expectedPdMax) warnings.push('PD máximo diverge do valor esperado pela regra (ou override).');
    if (agent.pe.rodada !== derivedPreview.peRodada) warnings.push('Limite de PE por turno diverge da Tabela 1.2 (NEX).');

    const fixInconsistencies = () => {
        const updated = { ...agent };
        updated.pv = { ...updated.pv, max: expectedPvMax, atual: Math.min(updated.pv.atual, expectedPvMax) };
        updated.pe = { ...updated.pe, max: expectedPeMax, atual: Math.min(updated.pe.atual, expectedPeMax), rodada: derivedPreview.peRodada };
        updated.san = { ...updated.san, max: expectedSanMax, atual: Math.min(updated.san.atual, expectedSanMax) };
        if (updated.usarPd) {
            if (!updated.pd) updated.pd = { atual: expectedPdMax, max: expectedPdMax };
            else updated.pd = { ...updated.pd, max: expectedPdMax, atual: Math.min(updated.pd.atual, expectedPdMax) };
        }
        onUpdate(updated);
    };

    return (
        <div className="flex flex-col gap-4 p-4 overflow-y-auto custom-scrollbar max-h-full">
            {hasPendingStuff && isPendingChoiceModalSuppressed && !disableInteractionModals && (
                <button
                    onClick={() => setIsPendingChoiceModalSuppressed(false)}
                    className="w-full bg-yellow-600/20 border border-yellow-600/50 text-yellow-500 p-3 rounded flex items-center justify-between hover:bg-yellow-600/30 transition-colors animate-pulse"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-xl">⚠️</span>
                        <span className="font-bold">ESCOLHAS PENDENTES</span>
                    </div>
                    <span className="text-xs uppercase tracking-wider border border-yellow-600/50 px-2 py-1 rounded">Resolver Agora</span>
                </button>
            )}

            {!disableInteractionModals && !isPendingChoiceModalSuppressed && !(agent.periciasPromocaoPendentes && agent.periciasPromocaoPendentes.restante > 0) && agent.periciasTreinadasPendentes && agent.periciasTreinadasPendentes > 0 && (
                <SkillSelectorModal
                    isOpen={true}
                    currentSkills={agent.pericias}
                    onSelect={handleSkillSelection}
                    onDefer={() => setIsPendingChoiceModalSuppressed(true)}
                />
            )}
            {!disableInteractionModals && !isPendingChoiceModalSuppressed && agent.periciasPromocaoPendentes && agent.periciasPromocaoPendentes.restante > 0 && (
                <SkillSelectorModal
                    isOpen={true}
                    currentSkills={agent.pericias}
                    onSelect={handleSkillPromotionSelection}
                    onDefer={() => setIsPendingChoiceModalSuppressed(true)}
                    eligibleFrom={agent.periciasPromocaoPendentes.alvo === 'Veterano' ? 'Treinado' : 'Veterano'}
                    title={`Grau de Treinamento (${agent.periciasPromocaoPendentes.alvo})`}
                    description={`Pela regra de Grau de Treinamento (NEX ${agent.periciasPromocaoPendentes.alvo === 'Veterano' ? '35%' : '70%'}), escolha perícias elegíveis para promover. Restante: ${agent.periciasPromocaoPendentes.restante}.`}
                    confirmLabel="Promover"
                />
            )}
            {!disableInteractionModals && !isPendingChoiceModalSuppressed && agent.escolhaTrilhaPendente && (
                <TrackSelectorModal
                    agent={agent}
                    onConfirm={handleTrackSelection}
                    onDefer={() => setIsPendingChoiceModalSuppressed(true)}
                />
            )}
            {!disableInteractionModals && !isPendingChoiceModalSuppressed && pendingChoice && (
                <PendingChoiceModal
                    agent={agent}
                    pendingChoice={pendingChoice}
                    onConfirm={onUpdate}
                    onDefer={() => setIsPendingChoiceModalSuppressed(true)}
                />
            )}
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 relative overflow-hidden shadow-lg">
                {!readOnly && (
                    <button
                        onClick={togglePdMode}
                        className="absolute top-4 left-4 p-2 bg-zinc-800/50 hover:bg-zinc-700 rounded-full text-zinc-400 hover:text-white transition-colors z-20"
                        title={agent.usarPd ? "Desativar Regra de Determinação" : "Ativar Regra de Determinação"}
                    >
                        {agent.usarPd ? <Flame size={20} className="text-violet-300" /> : <Brain size={20} className="text-blue-300" />}
                    </button>
                )}
                <div className="absolute bottom-0 right-0 p-4 opacity-10 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><path d="M8 20v2h8v-2" /><path d="m12.5 17-.5-1-.5 1h1z" /><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20" /></svg>
                </div>

                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h2 className="text-4xl font-bold text-white tracking-tight mb-1">{agent.nome}</h2>
                        <div className="flex items-center gap-3 text-zinc-300 font-mono text-sm">
                            <span className="bg-zinc-800 px-2 py-1 rounded border border-zinc-600">{agent.classe}</span>
                            <div className="flex items-center bg-zinc-800 rounded border border-zinc-600 overflow-hidden">
                                {!readOnly && (
                                    <button
                                        onClick={handleLevelDown}
                                        className="px-2 py-1 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors border-r border-zinc-600"
                                        title="Diminuir Nível"
                                    >
                                        -
                                    </button>
                                )}
                                <span className="px-2 py-1 text-zinc-100">
                                    {agent.classe === 'Sobrevivente' ? `Estágio ${agent.estagio || 1}` : `${agent.nex}% NEX`}
                                </span>
                                {!readOnly && (
                                    <button
                                        onClick={handleLevelUp}
                                        className="px-2 py-1 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors border-l border-zinc-600"
                                        title="Aumentar Nível"
                                    >
                                        +
                                    </button>
                                )}
                            </div>
                            <span className="bg-zinc-800 px-2 py-1 rounded border border-zinc-600">{agent.origem || 'Sem Origem'}</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Defesa</div>
                        <div className="text-3xl font-bold text-zinc-100 flex items-center justify-end gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
                            {calcularDefesaEfetiva(agent)}
                        </div>
                        {auditSummary.total > 0 && (
                            <div
                                className={`mt-2 inline-flex items-center justify-end px-2 py-1 rounded border text-[10px] font-mono tracking-widest ${auditSummary.errors > 0
                                        ? 'border-ordem-red text-ordem-red bg-ordem-red/10'
                                        : 'border-ordem-gold text-ordem-gold bg-ordem-gold/10'
                                    }`}
                                title={auditTitle}
                            >
                                {auditSummary.errors > 0 ? 'ERRO' : 'AVISO'} {auditSummary.total}
                            </div>
                        )}
                    </div>
                </div>

                {auditSummary.total > 0 && (
                    <div className="mt-6 bg-black/30 border border-zinc-800 rounded p-4">
                        <div className="text-xs font-mono tracking-[0.25em] text-zinc-500 uppercase mb-2">Avisos da ficha</div>
                        <ul className="text-xs text-zinc-200 space-y-1 list-disc pl-5">
                            {auditIssues.slice(0, 6).map((i, idx) => (
                                <li key={idx}>
                                    <span className={i.severity === 'erro' ? 'text-ordem-red' : 'text-ordem-gold'}>
                                        [{i.severity.toUpperCase()}]
                                    </span>{' '}
                                    {i.message}
                                </li>
                            ))}
                        </ul>
                        {auditIssues.length > 6 && (
                            <div className="mt-2 text-[11px] text-zinc-500 font-mono">
                                +{auditIssues.length - 6} aviso(s) oculto(s) (passe o mouse no badge).
                            </div>
                        )}
                    </div>
                )}

                {warnings.length > 0 && (
                    <div className="mt-6 bg-ordem-red/10 border border-ordem-red/30 rounded p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-xs font-bold text-ordem-red uppercase tracking-widest mb-2">
                                    Avisos de consistência
                                </div>
                                <ul className="text-xs text-zinc-200 space-y-1 list-disc pl-5">
                                    {warnings.map((w, idx) => (
                                        <li key={idx}>{w}</li>
                                    ))}
                                </ul>
                            </div>
                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={fixInconsistencies}
                                    className="shrink-0 px-3 py-2 text-[10px] font-mono tracking-widest uppercase border border-ordem-red/40 text-ordem-red hover:bg-ordem-red/15 rounded transition-colors"
                                    title="Ajusta máximos/limites para o valor calculado (respeitando overrides)"
                                >
                                    Corrigir
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <StatusBar
                        label="Pontos de Vida"
                        current={agent.pv.atual}
                        max={agent.pv.max}
                        color="red"
                        onChange={(v) => updateStat('pv', v)}
                        onMaxChange={isEditingMode ? (v) => updateMaxStat('pv', v) : undefined}
                        readOnly={readOnly}
                    />
                    {agent.usarPd ? (
                        <StatusBar
                            label="Determinação"
                            current={agent.pd?.atual || 0}
                            max={agent.pd?.max || 0}
                            color="purple"
                            onChange={(v) => updateStat('pd', v)}
                            onMaxChange={isEditingMode ? (v) => updateMaxStat('pd', v) : undefined}
                            readOnly={readOnly}
                        />
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <StatusBar
                                label="Sanidade"
                                current={agent.san.atual}
                                max={agent.san.max}
                                color="blue"
                                onChange={(v) => updateStat('san', v)}
                                onMaxChange={isEditingMode ? (v) => updateMaxStat('san', v) : undefined}
                                readOnly={readOnly}
                            />
                            <StatusBar
                                label="Pontos de Esforço"
                                current={agent.pe.atual}
                                max={agent.pe.max}
                                color="gold"
                                onChange={(v) => updateStat('pe', v)}
                                onMaxChange={isEditingMode ? (v) => updateMaxStat('pe', v) : undefined}
                                readOnly={readOnly}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-lg">
                <button
                    onClick={() => toggleSection('attributes')}
                    className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 transition-colors border-b border-zinc-700"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-700 rounded text-zinc-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                        </div>
                        <span className="font-bold text-zinc-100">Atributos & Perícias</span>
                    </div>
                    {openSections['attributes'] ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m6 9 6 6 6-6" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m9 18 6-6-6-6" /></svg>
                    )}
                </button>

                {openSections['attributes'] && (
                    <div className="p-6 animate-in slide-in-from-top-2">
                        {!readOnly && (
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={() => setIsEditingMode(!isEditingMode)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-colors ${isEditingMode
                                            ? 'bg-ordem-red text-white shadow-lg shadow-ordem-red/50 animate-pulse'
                                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200'
                                        }`}
                                >
                                    {isEditingMode ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                            MODO EDIÇÃO ATIVO (MESTRE)
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                                            EDITAR DADOS (OVERRIDE)
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                        {agent.pontosAtributoPendentes && agent.pontosAtributoPendentes !== 0 ? (
                            <div className={`mb-4 p-3 rounded border ${agent.pontosAtributoPendentes > 0 ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-red-900/20 border-red-800 text-red-400'} text-center font-mono text-sm`}>
                                {agent.pontosAtributoPendentes > 0
                                    ? `VOCÊ TEM ${agent.pontosAtributoPendentes} PONTO(S) DE ATRIBUTO PARA GASTAR!`
                                    : `VOCÊ PRECISA REMOVER ${Math.abs(agent.pontosAtributoPendentes)} PONTO(S) DE ATRIBUTO!`}
                            </div>
                        ) : null}

                        <div className="flex justify-between gap-4 mb-8">
                            {Object.entries(agent.atributos).map(([key, val]) => {
                                const canIncrease = isEditingMode || (!readOnly && agent.pontosAtributoPendentes && agent.pontosAtributoPendentes > 0 && (agent.classe !== 'Sobrevivente' || val < 3));
                                const canDecrease = isEditingMode || (!readOnly && agent.pontosAtributoPendentes && agent.pontosAtributoPendentes < 0 && val > 0);

                                return (
                                    <div key={key} className="flex flex-col items-center flex-1 bg-zinc-950/50 p-3 rounded border border-zinc-700 relative group">
                                        <span className="text-xs font-mono text-zinc-400 uppercase mb-1">{key}</span>
                                        <span className="text-2xl font-bold text-zinc-100">{val}</span>

                                        {canIncrease && (
                                            <button
                                                onClick={() => handleAttributeChange(key as AtributoKey, true)}
                                                className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-colors ${isEditingMode
                                                        ? 'bg-ordem-red hover:bg-red-700 text-white'
                                                        : 'bg-green-600 hover:bg-green-500 text-white'
                                                    }`}
                                                title={isEditingMode ? "Override (+)" : "Aumentar Atributo"}
                                            >
                                                +
                                            </button>
                                        )}
                                        {canDecrease && (
                                            <button
                                                onClick={() => handleAttributeChange(key as AtributoKey, false)}
                                                className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-colors ${isEditingMode
                                                        ? 'bg-zinc-700 hover:bg-zinc-600 text-white right-auto -left-2'
                                                        : 'bg-red-600 hover:bg-red-500 text-white'
                                                    }`}
                                                title={isEditingMode ? "Override (-)" : "Diminuir Atributo"}
                                            >
                                                -
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="space-y-6">
                            {lastRoll && (
                                <div className="bg-black/30 border border-zinc-800 rounded p-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-xs font-mono text-zinc-400">
                                            ÚLTIMA ROLAGEM: <span className="text-white font-bold">{lastRoll.pericia}</span>
                                        </div>
                                        <div className="text-xs font-mono text-zinc-500">
                                            {lastRoll.result.diceCount}d20 ({lastRoll.result.criterio}){' '}
                                            {lastRoll.result.bonusFixo >= 0 ? '+' : ''}{lastRoll.result.bonusFixo}
                                        </div>
                                    </div>
                                    <div className="mt-2 text-sm text-zinc-200 font-mono">
                                        Dados: [{lastRoll.result.dice.join(', ')}] • Escolhido: {lastRoll.result.chosen} • Total:{' '}
                                        <span className="text-ordem-green font-bold">{lastRoll.result.total}</span>
                                    </div>
                                </div>
                            )}
                            {(['AGI', 'FOR', 'INT', 'PRE', 'VIG'] as AtributoKey[]).map((attr) => {
                                const skills = Object.entries(agent.periciasDetalhadas).filter(([nome]) => PERICIA_ATRIBUTO[nome as PericiaName] === attr);
                                if (skills.length === 0) return null;

                                return (
                                    <div key={attr}>
                                        <h4 className="text-zinc-400 font-bold text-xs uppercase tracking-widest mb-2 border-b border-zinc-800 pb-1 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-zinc-500 rotate-45 inline-block"></span>
                                            {attr} <span className="text-zinc-400">({agent.atributos[attr]})</span>
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                            {skills.map(([nome, detalhe]) => (
                                                <div
                                                    key={nome}
                                                    className={`flex justify-between items-center p-2 bg-zinc-950/30 rounded border transition-colors ${isEditingMode
                                                            ? 'border-zinc-700 hover:border-zinc-500'
                                                            : 'border-zinc-700/50 hover:border-zinc-600'
                                                        }`}
                                                >
                                                    <div
                                                        className={`flex items-center gap-1.5 ${isEditingMode ? 'cursor-pointer hover:text-white' : ''}`}
                                                        onClick={() => isEditingMode && toggleSkillGrade(nome as PericiaName)}
                                                        title={isEditingMode ? "Clique para alterar o grau de treinamento" : ""}
                                                    >
                                                        <span className="text-sm text-zinc-300">{nome}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const pericia = nome as PericiaName;
                                                                const det = agent.periciasDetalhadas[pericia];
                                                                if (!det) return;
                                                                setLastRoll({ pericia, result: rollPericia(det) });
                                                            }}
                                                            className="p-1 rounded border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
                                                            title="Rolar teste desta perícia"
                                                        >
                                                            <Dices size={14} />
                                                        </button>
                                                        <span
                                                            onClick={() => isEditingMode && toggleSkillGrade(nome as PericiaName)}
                                                            className={`text-[10px] px-1 rounded border ${isEditingMode ? 'cursor-pointer hover:opacity-80' : ''} ${(detalhe.grau || 'Destreinado') === 'Destreinado' ? 'border-zinc-800 text-zinc-400' :
                                                                    detalhe.grau === 'Treinado' ? 'border-green-900 text-green-500' :
                                                                        detalhe.grau === 'Veterano' ? 'border-blue-900 text-blue-500' :
                                                                            'border-purple-900 text-purple-500'
                                                                }`}>
                                                            {(detalhe.grau || 'Destreinado').substring(0, 3).toUpperCase()}
                                                        </span>

                                                        {isEditingMode && editingSkill === nome ? (
                                                            <input
                                                                type="number"
                                                                value={tempSkillBonus}
                                                                onChange={(e) => setTempSkillBonus(e.target.value)}
                                                                onBlur={() => handleManualSkillBonusChange(nome as PericiaName, parseInt(tempSkillBonus) || 0)}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleManualSkillBonusChange(nome as PericiaName, parseInt(tempSkillBonus) || 0)}
                                                                autoFocus
                                                                className="w-10 bg-zinc-800 text-white text-center font-mono text-xs border border-ordem-red rounded focus:outline-none"
                                                            />
                                                        ) : (
                                                            <span
                                                                onClick={() => isEditingMode && startEditingSkill(nome as PericiaName, detalhe.bonusFixo)}
                                                                className={`font-mono text-zinc-100 font-bold ${isEditingMode ? 'cursor-pointer hover:text-ordem-red underline decoration-dashed underline-offset-4' : ''}`}
                                                                title={isEditingMode ? "Clique para editar o bônus numérico manualmente" : ""}
                                                            >
                                                                +{detalhe.bonusFixo || 0}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ... Inventory, Abilities, Actions, Progression sections ... */}

            {/* Re-adding Inventory, Abilities, Actions, Progression which were truncated in previous edit block logic */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-lg">
                <button
                    onClick={() => toggleSection('inventory')}
                    className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 transition-colors border-b border-zinc-700"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-700 rounded text-zinc-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5" /><path d="M8 10h8" /><path d="M8 18h8" /></svg>
                        </div>
                        <span className="font-bold text-zinc-100">Inventário</span>
                        <span className="text-xs font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 border border-zinc-600">
                            {agent.carga.atual}/{agent.carga.maxima}
                        </span>
                    </div>
                    {openSections['inventory'] ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m6 9 6 6 6-6" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m9 18 6-6-6-6" /></svg>
                    )}
                </button>

                {openSections['inventory'] && (
                    <div className="p-6 animate-in slide-in-from-top-2">
                        <div className="space-y-2">
                            {agent.equipamentos.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-zinc-950/50 rounded border border-zinc-700 hover:border-zinc-500 group">
                                    <div>
                                        <div className="font-bold text-zinc-200">{item.nome}</div>
                                        <div className="text-xs text-zinc-400">{item.categoria} • {item.espaco} espaço</div>
                                    </div>
                                    {!readOnly && (
                                        <button
                                            onClick={() => handleRemoveItem(idx)}
                                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-900/30 rounded text-zinc-400 hover:text-red-400 transition-all"
                                            title="Remover Item"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                            {!readOnly && (
                                <button
                                    onClick={() => setIsItemModalOpen(true)}
                                    className="w-full py-3 border border-dashed border-zinc-700 rounded text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/50 transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg> Adicionar Item
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-lg">
                <button
                    onClick={() => toggleSection('abilities')}
                    className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 transition-colors border-b border-zinc-700"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-700 rounded text-zinc-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                        </div>
                        <span className="font-bold text-zinc-100">Habilidades & Poderes</span>
                    </div>
                    {openSections['abilities'] ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m6 9 6 6 6-6" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m9 18 6-6-6-6" /></svg>
                    )}
                </button>

                {openSections['abilities'] && (
                    <div className="p-6 animate-in slide-in-from-top-2 space-y-4">
                        {agent.poderes.map((poder, idx) => (
                            <div key={idx} className="bg-zinc-950/50 p-4 rounded border border-zinc-700 group relative">
                                <h4 className="font-bold text-zinc-100 mb-1">{poder.nome}</h4>
                                <p className="text-sm text-zinc-300">{poder.descricao}</p>
                                {!readOnly && (
                                    <button
                                        onClick={() => handleRemoveAbility(idx)}
                                        className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 hover:bg-red-900/30 rounded text-zinc-400 hover:text-red-400 transition-all"
                                        title="Remover Habilidade"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                    </button>
                                )}
                            </div>
                        ))}
                        {!readOnly && (
                            <button
                                onClick={() => setIsAbilityModalOpen(true)}
                                className="w-full py-3 border border-dashed border-zinc-700 rounded text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/50 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg> Adicionar Habilidade
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-lg">
                <button
                    onClick={() => toggleSection('actions')}
                    className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 transition-colors border-b border-zinc-700"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-700 rounded text-zinc-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
                        </div>
                        <span className="font-bold text-zinc-100">Ações Disponíveis</span>
                    </div>
                    {openSections['actions'] ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m6 9 6 6 6-6" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m9 18 6-6-6-6" /></svg>
                    )}
                </button>

                {openSections['actions'] && (
                    <div className="p-6 animate-in slide-in-from-top-2">
                        <ActionsTab character={agent} useSanity={!agent.usarPd} />
                    </div>
                )}
            </div>

            <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-lg">
                <button
                    onClick={() => toggleSection('progression')}
                    className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 transition-colors border-b border-zinc-700"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-700 rounded text-zinc-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                        </div>
                        <span className="font-bold text-zinc-100">Progressão & Trilha</span>
                    </div>
                    {openSections['progression'] ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m6 9 6 6 6-6" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m9 18 6-6-6-6" /></svg>
                    )}
                </button>

                {openSections['progression'] && (
                    <div className="p-6 animate-in slide-in-from-top-2 h-[500px]">
                        <ProgressionTab character={agent} />
                    </div>
                )}
            </div>

            <ItemSelectorModal
                isOpen={isItemModalOpen}
                onClose={() => setIsItemModalOpen(false)}
                onSelect={handleAddItem}
            />

            <AbilitySelectorModal
                isOpen={isAbilityModalOpen}
                onClose={() => setIsAbilityModalOpen(false)}
                onSelect={handleAddAbility}
            />
        </div>
    );
};
