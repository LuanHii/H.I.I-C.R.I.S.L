import React, { useMemo, useState } from 'react';
import { Personagem, AtributoKey, PericiaName, Item, Poder, Ritual, Patente } from '../../core/types';
import { StatusBar } from '../StatusBar';
import { calcularPericiasDetalhadas, getPatenteConfig } from '../../logic/rulesEngine';
import { ActionsTab } from '../ActionsTab';
import { ItemSelectorModal } from './ItemSelectorModal';
import { AbilitySelectorModal } from './AbilitySelectorModal';
import { SkillSelectorModal } from './SkillSelectorModal';
import { applyAttributePoint, removeAttributePoint, chooseTrack, choosePower, recalcularRecursosPersonagem } from '../../logic/progression';
import { subirNex, rebaixarNex } from '../../logic/levelUp';
import { ProgressionTab } from '../ProgressionTab';
import { PendingChoiceModal } from '../PendingChoiceModal';
import { TrackSelectorModal } from '../TrackSelectorModal';
import { PowerChoiceModal } from '../PowerChoiceModal';
import { RitualChoiceModal } from '../RitualChoiceModal';
import { LevelUpModal } from '../LevelUpModal';
import { NivelModal } from './NivelModal';
import { AjustesPanel } from './AjustesPanel';
import { HistoricoEscolhas } from './HistoricoEscolhas';
import type { FichaPersistida, Problema, ValorEscolha } from '../../core/ficha/tipos';
import { buildFicha } from '../../core/ficha/buildFicha';
import {
    adicionarPericiaLivre,
    adicionarPoderManual,
    ajustarAtributoBase,
    definirBonusPericia,
    definirDelta,
    removerPericiaLivre,
    removerPoderManual,
} from '../../core/ficha/ajustes';
import { calculateDerivedStats } from '../../core/rules/derivedStats';
import { auditPersonagem, summarizeIssues } from '../../core/validation/auditPersonagem';
import { grauRequeridoParaAlvo } from '../../core/rules/progressao';
import { definirPerdaManual, somarPerdasDeRecurso } from '../../core/rules/marcas';
import { Edit2 } from 'lucide-react';
import type { DiceRollResult } from '../../logic/diceRoller';
import { ConditionsManager } from '../ConditionsManager';
import { PatenteSelectorModal } from './PatenteSelectorModal';
import { CharacterHeader } from './character/CharacterHeader';
import { StatusBarsSection } from './character/StatusBarsSection';
import { AttributesGrid } from './character/AttributesGrid';
import { SkillsTabContent } from './character/SkillsTabContent';
import { InventoryTabContent } from './character/InventoryTabContent';
import { PowersTabContent } from './character/PowersTabContent';
import { RitualsTabContent } from './character/RitualsTabContent';

interface AgentDetailViewProps {
    agent: Personagem;
    onUpdate: (updated: Personagem) => void;
    readOnly?: boolean;
    disableInteractionModals?: boolean;
    progressao?: ProgressaoNoMotorNovo;
}

export interface ProgressaoNoMotorNovo {
    ficha: FichaPersistida;
    onDefinirNivel: (nivel: number) => Promise<void> | void;
    onResponder: (escolhaId: string, valor: ValorEscolha) => Promise<Problema[]> | void;
    onDesfazer?: (escolhaId: string) => void;
    onEditar: (transformar: (ficha: FichaPersistida) => FichaPersistida) => Promise<void> | void;
}

export const AgentDetailView: React.FC<AgentDetailViewProps> = ({ agent, onUpdate, readOnly, disableInteractionModals, progressao }) => {
    const progressaoNoMotorNovo = Boolean(progressao);
    const [nivelModal, setNivelModal] = useState<{ aberto: boolean; direcao: 'subir' | 'descer'; etapa: 'preview' | 'escolhas' }>({ aberto: false, direcao: 'subir', etapa: 'preview' });
    const fichaV2 = progressao?.ficha;
    const buildV2 = useMemo(() => (fichaV2 ? buildFicha({ ficha: fichaV2 }) : null), [fichaV2]);
    const abrirPendencias = () => setNivelModal({ aberto: true, direcao: 'subir', etapa: 'escolhas' });
    type TabId = 'skills' | 'inventory' | 'powers' | 'rituals' | 'actions' | 'progression' | 'conditions';
    const [activeTab, setActiveTab] = useState<TabId>(readOnly ? 'actions' : 'skills');

    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isAbilityModalOpen, setIsAbilityModalOpen] = useState(false);
    const [isRitualModalOpen, setIsRitualModalOpen] = useState(false);
    const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState<{ open: boolean; resume: boolean }>({ open: false, resume: false });
    const [isPendingChoiceModalSuppressed, setIsPendingChoiceModalSuppressed] = useState(false);
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [editingSkill, setEditingSkill] = useState<PericiaName | null>(null);
    const [tempSkillBonus, setTempSkillBonus] = useState<string>('');
    const [lastRoll, setLastRoll] = useState<{ pericia: PericiaName; result: DiceRollResult } | null>(null);
    const [isPatenteModalOpen, setIsPatenteModalOpen] = useState(false);

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
        if (progressao) {
            const grau = agent.pericias[skillName] || 'Destreinado';
            if (grau === 'Destreinado') progressao.onEditar((f) => adicionarPericiaLivre(f, skillName));
            else if (grau === 'Treinado') progressao.onEditar((f) => removerPericiaLivre(f, skillName));
            return;
        }
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
        if (progressao) {
            const ajusteAtual = progressao.ficha.ajustes.periciaFixos?.[skillName] ?? 0;
            const semAjuste = (agent.periciasDetalhadas[skillName]?.bonusFixo ?? 0) - ajusteAtual;
            progressao.onEditar((f) => definirBonusPericia(f, skillName, newValue - semAjuste));
            setEditingSkill(null);
            return;
        }
        const updated = { ...agent };

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


    const escolhasPeloMotorAntigo = !disableInteractionModals && !progressaoNoMotorNovo;

    const dicaDeGrauV2 = (skillName: PericiaName) => {
        const grau = agent.pericias[skillName] || 'Destreinado';
        if (grau === 'Destreinado') return 'Clique para treinar (perícia de criação)';
        if (grau === 'Treinado') {
            return fichaV2?.identidade.periciasLivres.includes(skillName)
                ? 'Clique para destreinar (perícia de criação)'
                : 'Treinada pela classe — não pode ser removida';
        }
        return `${grau} vem de um marco de nível — mude pelo histórico de escolhas`;
    };

    const handleLevelUp = () => {
        if (progressaoNoMotorNovo) {
            setNivelModal({ aberto: true, direcao: 'subir', etapa: 'preview' });
            return;
        }
        setIsLevelUpModalOpen({ open: true, resume: false });
    };

    const handleLevelDown = () => {
        if (progressaoNoMotorNovo) {
            setNivelModal({ aberto: true, direcao: 'descer', etapa: 'preview' });
            return;
        }
        const decrement = agent.classe === 'Sobrevivente' ? 1 : (agent.nex === 99 ? 4 : 5);
        const alvo = agent.classe === 'Sobrevivente' ? Math.max(1, (agent.estagio || 1) - 1) : Math.max(5, agent.nex - decrement);
        const updated = rebaixarNex(agent, alvo);
        onUpdate(updated);
    };

    const handleAttributeChange = (attr: AtributoKey, increase: boolean) => {
        if (progressao) {
            if (isEditingMode) {
                progressao.onEditar((f) => ajustarAtributoBase(f, attr, increase ? 1 : -1));
                return;
            }
            const vaga = buildV2?.pendencias.find((p) => p.slot.kind === 'atributo');
            if (!increase || !vaga) return;
            Promise.resolve(progressao.onResponder(vaga.slot.id, { tipo: 'atributo', atributo: attr })).then((problemas) => {
                if ((problemas ?? []).some((p) => p.gravidade === 'erro')) abrirPendencias();
            });
            return;
        }
        if (isEditingMode) {

            const updated = { ...agent };
            updated.atributos[attr] += increase ? 1 : -1;
            if (updated.atributos[attr] < 0) updated.atributos[attr] = 0;

            updated.periciasDetalhadas = recalcularPericias(updated);

            const derived = calculateDerivedStats({
                classe: updated.classe,
                atributos: updated.atributos,
                nex: updated.nex,
                estagio: updated.estagio,
                origemNome: updated.origem,
                trilhaNome: updated.trilha,
                qtdTranscender: updated.qtdTranscender,
                marcas: updated.marcas,
            });

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
        const derived = calculateDerivedStats({
            classe: agent.classe,
            atributos: agent.atributos,
            nex: agent.nex,
            estagio: agent.estagio,
            origemNome: agent.origem,
            trilhaNome: agent.trilha,
            qtdTranscender: agent.qtdTranscender,
            marcas: agent.marcas,
        });

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
        if (stat === 'pv') updated.pv = { ...updated.pv, max: newMax };
        if (stat === 'pe') updated.pe = { ...updated.pe, max: newMax };
        if (stat === 'san') updated.san = { ...updated.san, max: newMax };
        if (stat === 'pd') {
            if (progressao) {
                const atual = agent.pd?.max ?? newMax;
                progressao.onEditar((f) => definirDelta(f, 'pdMaxDelta', (f.ajustes.pdMaxDelta ?? 0) + (newMax - atual)));
                return;
            }
            if (!updated.pd) updated.pd = { atual: newMax, max: newMax };
            else updated.pd = { ...updated.pd, max: newMax };
        }

        const tipoDeMarca = stat === 'pv' ? 'pvMaxPerdido' : stat === 'pe' ? 'peMaxPerdido' : stat === 'san' ? 'sanMaxPerdida' : undefined;

        if (tipoDeMarca) {
            const perdaAnterior = somarPerdasDeRecurso(updated.marcas);
            const perdaAtual = stat === 'pv' ? perdaAnterior.pvMaxPerdido : stat === 'pe' ? perdaAnterior.peMaxPerdido : perdaAnterior.sanMaxPerdida;
            const maximoSemPerda = (stat === 'pv' ? derivedPreview.pvMax : stat === 'pe' ? derivedPreview.peMax : derivedPreview.sanMax) + perdaAtual;
            const perdaNova = maximoSemPerda - newMax;

            updated.marcas = definirPerdaManual(updated.marcas, tipoDeMarca, perdaNova, new Date().toISOString());
            updated.overrides = {
                ...(updated.overrides ?? {}),
                pvMax: stat === 'pv' ? undefined : updated.overrides?.pvMax,
                peMax: stat === 'pe' ? undefined : updated.overrides?.peMax,
                sanMax: stat === 'san' ? undefined : updated.overrides?.sanMax,
                pdMax: updated.overrides?.pdMax,
                defesa: updated.overrides?.defesa,
                periciaFixos: updated.overrides?.periciaFixos,
            };
        } else {
            updated.overrides = {
                ...(updated.overrides ?? {}),
                pdMax: newMax,
                periciaFixos: updated.overrides?.periciaFixos,
            };
        }

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
        if (progressao) {
            progressao.onEditar((f) => adicionarPoderManual(f, ability.nome));
            setIsAbilityModalOpen(false);
            return;
        }
        const updated = { ...agent };
        updated.poderes = [...updated.poderes, ability];
        onUpdate(updated);
        setIsAbilityModalOpen(false);
    };

    const poderRemovivel = (index: number) => !buildV2 || buildV2.poderes[index]?.provenancia.kind === 'manual';

    const handleRemoveAbility = (index: number) => {
        if (progressao) {
            const derivado = buildV2?.poderes[index];
            if (derivado?.provenancia.kind === 'manual') progressao.onEditar((f) => removerPoderManual(f, derivado.nome));
            return;
        }
        const updated = { ...agent };
        updated.poderes = updated.poderes.filter((_, i) => i !== index);
        onUpdate(updated);
    };

    const handleAddRitual = (ritual: Ritual) => {
        const updated = { ...agent };
        updated.rituais = [...updated.rituais, ritual];
        onUpdate(updated);
        setIsRitualModalOpen(false);
    };

    const handleRemoveRitual = (index: number) => {
        const updated = { ...agent };
        updated.rituais = updated.rituais.filter((_, i) => i !== index);
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

        const requiredFrom = grauRequeridoParaAlvo(pending.alvo);
        if (agent.pericias[skill] !== requiredFrom) return;

        const updated = { ...agent };
        updated.pericias = { ...updated.pericias, [skill]: pending.alvo };
        const restante = Math.max(0, (pending.restante || 0) - 1);
        updated.periciasPromocaoPendentes = restante > 0 ? { ...pending, restante } : undefined;
        updated.periciasDetalhadas = recalcularPericias(updated);
        onUpdate(updated);
    };

    const handlePatenteChange = (newPatente: Patente) => {
        const config = getPatenteConfig(newPatente);
        const updated = {
            ...agent,
            patente: newPatente,
            limiteItens: config.limiteItens,
            ...(progressao ? { pp: config.ppMin } : {}),
        };
        onUpdate(updated);
    };

    const pendingChoice = agent.habilidadesTrilhaPendentes && agent.habilidadesTrilhaPendentes.length > 0
        ? agent.habilidadesTrilhaPendentes[0]
        : null;

    const activePendencies = agent.pendenciasNex && agent.pendenciasNex.length > 0;

    const hasPendingStuff =
        activePendencies ||
        pendingChoice ||
        (agent.periciasTreinadasPendentes && agent.periciasTreinadasPendentes > 0) ||
        (agent.periciasPromocaoPendentes && agent.periciasPromocaoPendentes.restante > 0) ||
        (agent.poderesClassePendentes && agent.poderesClassePendentes > 0) ||
        agent.escolhaTrilhaPendente;

    const derivedPreview = calculateDerivedStats({
        classe: agent.classe,
        atributos: agent.atributos,
        nex: agent.nex,
        estagio: agent.estagio,
        origemNome: agent.origem,
        trilhaNome: agent.trilha,
        qtdTranscender: agent.qtdTranscender,
        marcas: agent.marcas,
    });
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
    if (!progressao) {
        if (agent.pv.max !== expectedPvMax) warnings.push('PV máximo diverge do valor esperado pela regra (ou override).');
        if (agent.pe.max !== expectedPeMax) warnings.push('PE máximo diverge do valor esperado pela regra (ou override).');
        if (agent.san.max !== expectedSanMax) warnings.push('SAN máximo diverge do valor esperado pela regra (ou override).');
        if (agent.usarPd && agent.pd && agent.pd.max !== expectedPdMax) warnings.push('PD máximo diverge do valor esperado pela regra (ou override).');
        if (agent.pe.rodada !== derivedPreview.peRodada) warnings.push('Limite de PE por turno diverge da Tabela 1.2 (NEX).');
    }

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

    const TABS: { id: TabId; label: string; icon: React.ReactNode; badge?: React.ReactNode }[] = [
        { id: 'skills', label: 'Perícias', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg> },
        { id: 'inventory', label: 'Inventário', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></svg>, badge: <span className="text-[10px] font-mono">{agent.carga.atual}/{agent.carga.maxima}</span> },
        { id: 'powers', label: 'Poderes', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> },
        { id: 'rituals', label: 'Rituais', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m14.31 8-5.74 9.94" /><path d="M9.69 8h11.48" /></svg> },
        { id: 'actions', label: 'Ações', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg> },
        { id: 'progression', label: 'Progressão', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg> },
        { id: 'conditions', label: 'Condições', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>, badge: agent.efeitosAtivos?.length > 0 ? <span className="text-[10px] font-mono text-red-400">{agent.efeitosAtivos.length}</span> : undefined },
    ];

    return (
        <div
            data-classe={agent.classe}
            className={`relative flex h-full flex-col transition-all duration-300 ${isEditingMode ? 'ring-2 ring-dashed ring-red-500/50 bg-red-900/5' : ''}`}
        >
            <span aria-hidden className="mestre-aura pointer-events-none absolute inset-x-0 top-0 h-64" />

            
            {!readOnly && (
                <span className="hidden">
                    <button
                        onClick={() => setIsEditingMode(!isEditingMode)}
                        className={`flex items-center gap-2 border px-3 py-1.5 font-carimbo text-[10px] uppercase tracking-[0.16em] transition-colors ${isEditingMode
                            ? 'border-ordem-red bg-ordem-red/15 text-ordem-red'
                            : 'border-white/10 text-ordem-text-muted hover:border-ordem-text-muted hover:text-white'
                            }`}
                        title={isEditingMode ? "Desativar Modo de Edição Livre" : "Ativar Modo de Edição Livre (Override)"}
                    >
                        {isEditingMode ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                MODO EDIÇÃO ATIVO
                            </>
                        ) : (
                            <>
                                <Edit2 size={16} />
                                MODO EDIÇÃO
                            </>
                        )}
                    </button>
                </span>
            )}

            
            {hasPendingStuff && isPendingChoiceModalSuppressed && escolhasPeloMotorAntigo && (
                <button
                    onClick={() => {
                        setIsPendingChoiceModalSuppressed(false)
                        if (activePendencies) {
                            setIsLevelUpModalOpen({ open: true, resume: true });
                        }
                    }}
                    className="mx-3 mt-3 sm:mx-4 sm:mt-4 bg-yellow-600/20 border border-yellow-600/50 text-yellow-500 p-3 rounded-lg flex items-center justify-between hover:bg-yellow-600/30 transition-colors animate-pulse"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-xl">⚠️</span>
                        <span className="font-bold text-sm">ESCOLHAS PENDENTES</span>
                    </div>
                    <span className="text-xs uppercase tracking-wider border border-yellow-600/50 px-2 py-1 rounded">Resolver</span>
                </button>
            )}

            
            {escolhasPeloMotorAntigo && !isPendingChoiceModalSuppressed && !(agent.periciasPromocaoPendentes && agent.periciasPromocaoPendentes.restante > 0) && agent.periciasTreinadasPendentes && agent.periciasTreinadasPendentes > 0 && !activePendencies && (
                <SkillSelectorModal isOpen={true} currentSkills={agent.pericias} onSelect={handleSkillSelection} onDefer={() => setIsPendingChoiceModalSuppressed(true)} />
            )}
            {escolhasPeloMotorAntigo && !isPendingChoiceModalSuppressed && agent.periciasPromocaoPendentes && agent.periciasPromocaoPendentes.restante > 0 && (
                <SkillSelectorModal isOpen={true} currentSkills={agent.pericias} onSelect={handleSkillPromotionSelection} onDefer={() => setIsPendingChoiceModalSuppressed(true)} eligibleFrom={grauRequeridoParaAlvo(agent.periciasPromocaoPendentes.alvo)} title={`Grau de Treinamento (${agent.periciasPromocaoPendentes.alvo})`} description={`Pela regra de Grau de Treinamento (NEX ${agent.periciasPromocaoPendentes.alvo === 'Veterano' ? '35%' : '70%'}), escolha perícias elegíveis para promover. Restante: ${agent.periciasPromocaoPendentes.restante}.`} confirmLabel="Promover" />
            )}
            {escolhasPeloMotorAntigo && !isPendingChoiceModalSuppressed && agent.escolhaTrilhaPendente && (
                <TrackSelectorModal agent={agent} onConfirm={handleTrackSelection} onDefer={() => setIsPendingChoiceModalSuppressed(true)} />
            )}
            {escolhasPeloMotorAntigo && !isPendingChoiceModalSuppressed && pendingChoice && !activePendencies && (
                <PendingChoiceModal agent={agent} pendingChoice={pendingChoice} onConfirm={onUpdate} onDefer={() => setIsPendingChoiceModalSuppressed(true)} />
            )}
            {escolhasPeloMotorAntigo && !isPendingChoiceModalSuppressed && agent.poderesClassePendentes && agent.poderesClassePendentes > 0 && !activePendencies && (
                <PowerChoiceModal
                    agent={agent}
                    onSelect={(poderNome) => { try { const updated = choosePower(agent, poderNome); onUpdate(updated); } catch (error: any) { console.error('Erro ao escolher poder:', error.message); } }}
                    onTranscenderComplete={(poderParanormal: Poder, ritual?: Ritual) => {
                        const updated = { ...agent }; updated.poderes = [...updated.poderes, poderParanormal]; if (ritual) { updated.rituais = [...updated.rituais, ritual]; } if (updated.poderesClassePendentes && updated.poderesClassePendentes > 0) { updated.poderesClassePendentes -= 1; if (updated.poderesClassePendentes <= 0) updated.poderesClassePendentes = undefined; } updated.qtdTranscender = (updated.qtdTranscender || 0) + 1; const finalAgent = recalcularRecursosPersonagem(updated); onUpdate(finalAgent); setIsPendingChoiceModalSuppressed(true);
                    }}
                    onClose={() => setIsPendingChoiceModalSuppressed(true)}
                />
            )}

            <div className="bg-ordem-ooze border-b border-ordem-border-light p-4 sm:p-5 rounded-t-xl">
                <CharacterHeader
                    agent={agent}
                    readOnly={readOnly}
                    auditSummary={auditSummary}
                    auditTitle={auditTitle}
                    warnings={warnings}
                    onLevelUp={handleLevelUp}
                    onLevelDown={handleLevelDown}
                    acaoDeFicha={!readOnly ? (
                        <button
                            type="button"
                            onClick={() => setIsEditingMode(!isEditingMode)}
                            title={isEditingMode ? 'Desativar Modo de Edição Livre' : 'Ativar Modo de Edição Livre (Override)'}
                            className={`flex items-center gap-1.5 border px-2.5 py-1 font-carimbo text-[10px] uppercase tracking-[0.16em] transition-colors ${isEditingMode
                                ? 'border-ordem-red bg-ordem-red/15 text-ordem-red'
                                : 'border-white/10 text-ordem-text-muted hover:border-ordem-text-muted hover:text-white'
                                }`}
                        >
                            <Edit2 size={12} />
                            {isEditingMode ? 'Editando' : 'Editar'}
                        </button>
                    ) : undefined}
                    onPatenteClick={() => setIsPatenteModalOpen(true)}
                    onTogglePd={togglePdMode}
                    onFixInconsistencies={fixInconsistencies}
                />
                <StatusBarsSection
                    agent={agent}
                    readOnly={readOnly}
                    isEditingMode={isEditingMode}
                    onStatChange={updateStat}
                    onMaxStatChange={updateMaxStat}
                />
                <AttributesGrid
                    agent={agent}
                    readOnly={readOnly}
                    isEditingMode={isEditingMode}
                    onAttributeChange={handleAttributeChange}
                />
                {progressao && isEditingMode && (
                    <AjustesPanel ficha={progressao.ficha} onEditar={progressao.onEditar} />
                )}
            </div>

            
            
            
            <div className="touch-scroll overflow-x-auto border-y border-white/10 bg-black/30 px-2 sm:px-4">
                <div className="flex min-w-max gap-1">
                    {TABS.map(tab => {
                        const ativa = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                aria-current={ativa ? 'page' : undefined}
                                className={`relative flex items-center gap-1.5 whitespace-nowrap px-3 py-3 font-carimbo text-[11px] uppercase tracking-[0.14em] transition-colors ${ativa
                                    ? 'text-[var(--mestre-primary,#DC2626)]'
                                    : 'text-ordem-text-muted hover:text-ordem-white-muted'
                                }`}
                            >
                                <span className={ativa ? 'opacity-100' : 'opacity-60'}>{tab.icon}</span>
                                <span className="hidden sm:inline">{tab.label}</span>
                                {tab.badge}
                                {ativa && (
                                    <span
                                        aria-hidden
                                        className="absolute inset-x-2 bottom-0 h-[2px] bg-[var(--mestre-primary,#DC2626)] shadow-[0_0_10px_-1px_var(--mestre-glow)]"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-ordem-ooze/50 rounded-b-xl">
                <div className="p-4 sm:p-5">

                    {activeTab === 'skills' && (
                        <SkillsTabContent
                            agent={agent}
                            isEditingMode={isEditingMode}
                            lastRoll={lastRoll}
                            onLastRollChange={setLastRoll}
                            editingSkill={editingSkill}
                            tempSkillBonus={tempSkillBonus}
                            onTempSkillBonusChange={setTempSkillBonus}
                            onToggleSkillGrade={toggleSkillGrade}
                            onManualSkillBonusChange={handleManualSkillBonusChange}
                            onStartEditingSkill={startEditingSkill}
                            dicaDeGrau={progressao ? dicaDeGrauV2 : undefined}
                        />
                    )}

                    {activeTab === 'inventory' && (
                        <InventoryTabContent
                            agent={agent}
                            readOnly={readOnly}
                            onAddItem={() => setIsItemModalOpen(true)}
                            onRemoveItem={handleRemoveItem}
                        />
                    )}

                    {activeTab === 'powers' && (
                        <PowersTabContent
                            agent={agent}
                            isEditingMode={isEditingMode}
                            onAddAbility={() => setIsAbilityModalOpen(true)}
                            onRemoveAbility={handleRemoveAbility}
                            podeRemover={poderRemovivel}
                        />
                    )}

                    {activeTab === 'rituals' && (
                        <RitualsTabContent
                            agent={agent}
                            isEditingMode={isEditingMode}
                            onAddRitual={() => setIsRitualModalOpen(true)}
                            onRemoveRitual={handleRemoveRitual}
                        />
                    )}

                    {activeTab === 'actions' && (
                        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
                            <ActionsTab character={agent} useSanity={!agent.usarPd} />
                        </div>
                    )}

                    {activeTab === 'progression' && (
                        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 space-y-4">
                            {progressao && (
                                <HistoricoEscolhas
                                    ficha={progressao.ficha}
                                    onDesfazer={readOnly ? undefined : progressao.onDesfazer}
                                    onResponderPendencias={readOnly ? undefined : abrirPendencias}
                                />
                            )}
                            <div className="h-[500px]">
                                <ProgressionTab character={agent} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'conditions' && (
                        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
                            <ConditionsManager personagem={agent} onUpdate={onUpdate} readOnly={readOnly} />
                        </div>
                    )}
                </div>
            </div>

            <ItemSelectorModal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} onSelect={handleAddItem} />
            <AbilitySelectorModal isOpen={isAbilityModalOpen} onClose={() => setIsAbilityModalOpen(false)} onSelect={handleAddAbility} />
            <PatenteSelectorModal isOpen={isPatenteModalOpen} currentPatente={agent.patente || 'Recruta'} onSelect={handlePatenteChange} onClose={() => setIsPatenteModalOpen(false)} />
            {isRitualModalOpen && <RitualChoiceModal agent={agent} onSelect={handleAddRitual} onClose={() => setIsRitualModalOpen(false)} circuloMaximo={4} />}
            {progressao && (
                <NivelModal
                    ficha={progressao.ficha}
                    aberto={nivelModal.aberto}
                    direcao={nivelModal.direcao}
                    etapaInicial={nivelModal.etapa}
                    onFechar={() => setNivelModal((m) => ({ ...m, aberto: false }))}
                    onDefinirNivel={progressao.onDefinirNivel}
                    onResponder={progressao.onResponder}
                    onDesfazer={progressao.onDesfazer}
                />
            )}
            {isLevelUpModalOpen.open && !progressaoNoMotorNovo && (
                <LevelUpModal agent={agent} isResume={isLevelUpModalOpen.resume} onConfirm={(updatedAgent) => { onUpdate(updatedAgent); setIsLevelUpModalOpen({ open: false, resume: false }); }} onClose={() => setIsLevelUpModalOpen({ open: false, resume: false })} />
            )}
        </div>

    );
};
