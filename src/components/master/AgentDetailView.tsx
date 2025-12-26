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
        <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 overflow-y-auto custom-scrollbar touch-scroll max-h-full">
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
            <div className="bg-ordem-ooze border border-ordem-border-light rounded-xl p-4 sm:p-6 relative overflow-hidden shadow-lg">
                {/* Botão de modo PD - reposicionado para não sobrepor em mobile */}
                {!readOnly && (
                    <button
                        onClick={togglePdMode}
                        className="absolute top-2 right-2 sm:top-4 sm:left-4 sm:right-auto p-2 bg-ordem-ooze/50 hover:bg-ordem-border-light rounded-full text-ordem-text-secondary hover:text-white transition-colors z-20"
                        title={agent.usarPd ? "Desativar Regra de Determinação" : "Ativar Regra de Determinação"}
                    >
                        {agent.usarPd ? <Flame size={18} className="text-violet-300" /> : <Brain size={18} className="text-blue-300" />}
                    </button>
                )}
                {/* Ilustração de fundo - menor em mobile */}
                <div className="absolute bottom-0 right-0 p-2 sm:p-4 opacity-10 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[120px] sm:h-[120px]"><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><path d="M8 20v2h8v-2" /><path d="m12.5 17-.5-1-.5 1h1z" /><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20" /></svg>
                </div>

                {/* Header: Nome, classe, defesa */}
                <div className="relative z-10">
                    {/* Nome e info básica */}
                    <div className="mb-3 sm:mb-0">
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-2 pr-10 sm:pr-0">{agent.nome}</h2>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-ordem-white-muted font-mono text-[10px] sm:text-xs">
                            <span className="bg-ordem-ooze px-2 py-1 rounded border border-ordem-text-muted">{agent.classe}</span>
                            <div className="flex items-center bg-ordem-ooze rounded border border-ordem-text-muted overflow-hidden">
                                {!readOnly && (
                                    <button
                                        onClick={handleLevelDown}
                                        className="px-2 py-1 hover:bg-ordem-border-light text-ordem-text-secondary hover:text-white active:bg-ordem-border-light transition-colors border-r border-ordem-text-muted touch-target-sm"
                                        title="Diminuir Nível"
                                    >
                                        -
                                    </button>
                                )}
                                <span className="px-2 py-1 text-zinc-100">
                                    {agent.classe === 'Sobrevivente' ? `Est. ${agent.estagio || 1}` : `${agent.nex}%`}
                                </span>
                                {!readOnly && (
                                    <button
                                        onClick={handleLevelUp}
                                        className="px-2 py-1 hover:bg-ordem-border-light text-ordem-text-secondary hover:text-white active:bg-ordem-border-light transition-colors border-l border-ordem-text-muted touch-target-sm"
                                        title="Aumentar Nível"
                                    >
                                        +
                                    </button>
                                )}
                            </div>
                            <span className="bg-ordem-ooze px-2 py-1 rounded border border-ordem-text-muted truncate max-w-[120px] sm:max-w-none">{agent.origem || 'Sem Origem'}</span>
                        </div>
                    </div>

                    {/* Defesa - inline em mobile */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-ordem-border/50 sm:absolute sm:top-0 sm:right-0 sm:mt-0 sm:pt-0 sm:border-0">
                        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                            <div className="text-[10px] sm:text-xs text-ordem-text-secondary uppercase tracking-widest">Defesa</div>
                            <div className="text-2xl sm:text-3xl font-bold text-zinc-100 flex items-center gap-1.5 sm:gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ordem-text-secondary sm:w-6 sm:h-6"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
                                {calcularDefesaEfetiva(agent)}
                            </div>
                        </div>
                        {auditSummary.total > 0 && (
                            <div
                                className={`px-2 py-1 rounded border text-[10px] font-mono tracking-widest ${auditSummary.errors > 0
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
                    <div className="mt-6 bg-ordem-black/30 border border-ordem-border rounded p-4">
                        <div className="text-xs font-mono tracking-[0.25em] text-ordem-text-muted uppercase mb-2">Avisos da ficha</div>
                        <ul className="text-xs text-ordem-white space-y-1 list-disc pl-5">
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
                            <div className="mt-2 text-[11px] text-ordem-text-muted font-mono">
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
                                <ul className="text-xs text-ordem-white space-y-1 list-disc pl-5">
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

                {/* Barras de status - empilhadas em mobile */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 mt-6 sm:mt-8">
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
                        <>
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
                        </>
                    )}
                </div>
            </div>

            <div className="bg-ordem-ooze border border-ordem-border-light rounded-xl overflow-hidden shadow-lg">
                <button
                    onClick={() => toggleSection('attributes')}
                    className="w-full flex items-center justify-between p-4 bg-ordem-ooze/50 hover:bg-ordem-ooze transition-colors border-b border-ordem-border-light"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-ordem-border-light rounded text-ordem-white-muted">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                        </div>
                        <span className="font-bold text-zinc-100">Atributos & Perícias</span>
                    </div>
                    {openSections['attributes'] ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ordem-text-secondary"><path d="m6 9 6 6 6-6" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ordem-text-secondary"><path d="m9 18 6-6-6-6" /></svg>
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
                                        : 'bg-ordem-ooze text-ordem-text-secondary border border-ordem-border-light hover:bg-ordem-border-light hover:text-ordem-white'
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

                        {/* Grid de atributos - scroll horizontal em mobile */}
                        <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8 overflow-x-auto touch-scroll pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
                            {Object.entries(agent.atributos).map(([key, val]) => {
                                const canIncrease = isEditingMode || (!readOnly && agent.pontosAtributoPendentes && agent.pontosAtributoPendentes > 0 && (agent.classe !== 'Sobrevivente' || val < 3));
                                const canDecrease = isEditingMode || (!readOnly && agent.pontosAtributoPendentes && agent.pontosAtributoPendentes < 0 && val > 0);

                                return (
                                    <div key={key} className="flex flex-col items-center flex-shrink-0 w-20 sm:w-auto sm:flex-1 bg-ordem-black-deep/50 p-2 sm:p-3 rounded-lg border border-ordem-border-light relative group">
                                        <span className="text-[10px] sm:text-xs font-mono text-ordem-text-secondary uppercase mb-1">{key}</span>
                                        <span className="text-xl sm:text-2xl font-bold text-zinc-100">{val}</span>

                                        {canIncrease && (
                                            <button
                                                onClick={() => handleAttributeChange(key as AtributoKey, true)}
                                                className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors z-10 touch-target ${isEditingMode
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
                                                className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors z-10 touch-target ${isEditingMode
                                                    ? 'bg-ordem-border-light hover:bg-ordem-text-muted text-white right-auto -left-3'
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
                                <div className="bg-ordem-black/30 border border-ordem-border rounded p-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-xs font-mono text-ordem-text-secondary">
                                            ÚLTIMA ROLAGEM: <span className="text-white font-bold">{lastRoll.pericia}</span>
                                        </div>
                                        <div className="text-xs font-mono text-ordem-text-muted">
                                            {lastRoll.result.diceCount}d20 ({lastRoll.result.criterio}){' '}
                                            {lastRoll.result.bonusFixo >= 0 ? '+' : ''}{lastRoll.result.bonusFixo}
                                        </div>
                                    </div>
                                    <div className="mt-2 text-sm text-ordem-white font-mono">
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
                                        <h4 className="text-ordem-text-secondary font-bold text-xs uppercase tracking-widest mb-2 border-b border-ordem-border pb-1 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-ordem-text-muted rotate-45 inline-block"></span>
                                            {attr} <span className="text-ordem-text-secondary">({agent.atributos[attr]})</span>
                                        </h4>
                                        {/* Grid responsivo - 1 coluna em mobile, mais em desktop */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
                                            {skills.map(([nome, detalhe]) => (
                                                <div
                                                    key={nome}
                                                    className={`flex justify-between items-center p-3 sm:p-2 bg-ordem-black-deep/30 rounded-lg border transition-colors gap-3 ${isEditingMode
                                                        ? 'border-ordem-border-light hover:border-ordem-text-muted'
                                                        : 'border-ordem-border-light/50 hover:border-ordem-text-muted'
                                                        }`}
                                                >
                                                    {/* Nome da perícia */}
                                                    <div
                                                        className={`flex-1 min-w-0 ${isEditingMode ? 'cursor-pointer hover:text-white' : ''}`}
                                                        onClick={() => isEditingMode && toggleSkillGrade(nome as PericiaName)}
                                                        title={isEditingMode ? "Clique para alterar o grau de treinamento" : ""}
                                                    >
                                                        <span className="text-sm text-ordem-white-muted truncate block">{nome}</span>
                                                    </div>
                                                    {/* Ações e info - não encolhem */}
                                                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                                        {/* Botão de rolar - maior em mobile */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const pericia = nome as PericiaName;
                                                                const det = agent.periciasDetalhadas[pericia];
                                                                if (!det) return;
                                                                setLastRoll({ pericia, result: rollPericia(det) });
                                                            }}
                                                            className="p-2 sm:p-1.5 rounded-lg sm:rounded border border-ordem-border-light text-ordem-white-muted hover:border-ordem-text-muted hover:text-white active:bg-ordem-ooze/50 transition-colors touch-target-sm"
                                                            title="Rolar teste desta perícia"
                                                        >
                                                            <Dices size={16} className="sm:w-[14px] sm:h-[14px]" />
                                                        </button>
                                                        {/* Badge de grau */}
                                                        <span
                                                            onClick={() => isEditingMode && toggleSkillGrade(nome as PericiaName)}
                                                            className={`text-[10px] px-1.5 py-0.5 rounded border ${isEditingMode ? 'cursor-pointer hover:opacity-80' : ''} ${(detalhe.grau || 'Destreinado') === 'Destreinado' ? 'border-ordem-border text-ordem-text-secondary' :
                                                                detalhe.grau === 'Treinado' ? 'border-green-900 text-green-500' :
                                                                    detalhe.grau === 'Veterano' ? 'border-blue-900 text-blue-500' :
                                                                        'border-purple-900 text-purple-500'
                                                                }`}>
                                                            {(detalhe.grau || 'Destreinado').substring(0, 3).toUpperCase()}
                                                        </span>

                                                        {/* Bônus numérico */}
                                                        {isEditingMode && editingSkill === nome ? (
                                                            <input
                                                                type="number"
                                                                value={tempSkillBonus}
                                                                onChange={(e) => setTempSkillBonus(e.target.value)}
                                                                onBlur={() => handleManualSkillBonusChange(nome as PericiaName, parseInt(tempSkillBonus) || 0)}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleManualSkillBonusChange(nome as PericiaName, parseInt(tempSkillBonus) || 0)}
                                                                autoFocus
                                                                className="w-12 bg-ordem-ooze text-white text-center font-mono text-xs border border-ordem-red rounded focus:outline-none"
                                                            />
                                                        ) : (
                                                            <span
                                                                onClick={() => isEditingMode && startEditingSkill(nome as PericiaName, detalhe.bonusFixo)}
                                                                className={`font-mono text-zinc-100 font-bold text-sm ${isEditingMode ? 'cursor-pointer hover:text-ordem-red underline decoration-dashed underline-offset-4' : ''}`}
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
            <div className="bg-ordem-ooze border border-ordem-border-light rounded-xl overflow-hidden shadow-lg">
                <button
                    onClick={() => toggleSection('inventory')}
                    className="w-full flex items-center justify-between p-4 bg-ordem-ooze/50 hover:bg-ordem-ooze transition-colors border-b border-ordem-border-light"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-ordem-border-light rounded text-ordem-white-muted">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5" /><path d="M8 10h8" /><path d="M8 18h8" /></svg>
                        </div>
                        <span className="font-bold text-zinc-100">Inventário</span>
                        <span className="text-xs font-mono bg-ordem-ooze px-2 py-0.5 rounded text-ordem-text-secondary border border-ordem-text-muted">
                            {agent.carga.atual}/{agent.carga.maxima}
                        </span>
                    </div>
                    {openSections['inventory'] ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ordem-text-secondary"><path d="m6 9 6 6 6-6" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ordem-text-secondary"><path d="m9 18 6-6-6-6" /></svg>
                    )}
                </button>

                {openSections['inventory'] && (
                    <div className="p-6 animate-in slide-in-from-top-2">
                        <div className="space-y-2">
                            {agent.equipamentos.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-ordem-black-deep/50 rounded border border-ordem-border-light hover:border-ordem-text-muted group">
                                    <div>
                                        <div className="font-bold text-ordem-white">{item.nome}</div>
                                        <div className="text-xs text-ordem-text-secondary">{item.categoria} • {item.espaco} espaço</div>
                                    </div>
                                    {!readOnly && (
                                        <button
                                            onClick={() => handleRemoveItem(idx)}
                                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-900/30 rounded text-ordem-text-secondary hover:text-red-400 transition-all"
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
                                    className="w-full py-3 border border-dashed border-ordem-border-light rounded text-ordem-text-secondary hover:text-ordem-white hover:border-ordem-text-muted hover:bg-ordem-ooze/50 transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg> Adicionar Item
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-ordem-ooze border border-ordem-border-light rounded-xl overflow-hidden shadow-lg">
                <button
                    onClick={() => toggleSection('abilities')}
                    className="w-full flex items-center justify-between p-4 bg-ordem-ooze/50 hover:bg-ordem-ooze transition-colors border-b border-ordem-border-light"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-ordem-border-light rounded text-ordem-white-muted">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                        </div>
                        <span className="font-bold text-zinc-100">Habilidades & Poderes</span>
                    </div>
                    {openSections['abilities'] ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ordem-text-secondary"><path d="m6 9 6 6 6-6" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ordem-text-secondary"><path d="m9 18 6-6-6-6" /></svg>
                    )}
                </button>

                {openSections['abilities'] && (
                    <div className="p-6 animate-in slide-in-from-top-2 space-y-4">
                        {agent.poderes.map((poder, idx) => (
                            <div key={idx} className="bg-ordem-black-deep/50 p-4 rounded border border-ordem-border-light group relative">
                                <h4 className="font-bold text-zinc-100 mb-1">{poder.nome}</h4>
                                <p className="text-sm text-ordem-white-muted">{poder.descricao}</p>
                                {!readOnly && (
                                    <button
                                        onClick={() => handleRemoveAbility(idx)}
                                        className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 hover:bg-red-900/30 rounded text-ordem-text-secondary hover:text-red-400 transition-all"
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
                                className="w-full py-3 border border-dashed border-ordem-border-light rounded text-ordem-text-secondary hover:text-ordem-white hover:border-ordem-text-muted hover:bg-ordem-ooze/50 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg> Adicionar Habilidade
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-ordem-ooze border border-ordem-border-light rounded-xl overflow-hidden shadow-lg">
                <button
                    onClick={() => toggleSection('actions')}
                    className="w-full flex items-center justify-between p-4 bg-ordem-ooze/50 hover:bg-ordem-ooze transition-colors border-b border-ordem-border-light"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-ordem-border-light rounded text-ordem-white-muted">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
                        </div>
                        <span className="font-bold text-zinc-100">Ações Disponíveis</span>
                    </div>
                    {openSections['actions'] ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ordem-text-secondary"><path d="m6 9 6 6 6-6" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ordem-text-secondary"><path d="m9 18 6-6-6-6" /></svg>
                    )}
                </button>

                {openSections['actions'] && (
                    <div className="p-6 animate-in slide-in-from-top-2">
                        <ActionsTab character={agent} useSanity={!agent.usarPd} />
                    </div>
                )}
            </div>

            <div className="bg-ordem-ooze border border-ordem-border-light rounded-xl overflow-hidden shadow-lg">
                <button
                    onClick={() => toggleSection('progression')}
                    className="w-full flex items-center justify-between p-4 bg-ordem-ooze/50 hover:bg-ordem-ooze transition-colors border-b border-ordem-border-light"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-ordem-border-light rounded text-ordem-white-muted">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                        </div>
                        <span className="font-bold text-zinc-100">Progressão & Trilha</span>
                    </div>
                    {openSections['progression'] ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ordem-text-secondary"><path d="m6 9 6 6 6-6" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ordem-text-secondary"><path d="m9 18 6-6-6-6" /></svg>
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
