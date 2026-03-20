'use client';

import { useState, useEffect } from 'react';
import { Personagem, Poder, PendenciaNex, AtributoKey, Elemento, Ritual } from '@/core/types';
import { subirNex, MudancasNex, getPendenciasNaoResolvidas, resolverPendencia } from '@/logic/levelUp';
import { calculateDerivedStats } from '@/core/rules/derivedStats';
import { PODERES } from '@/data/character/powers';
import { CLASSES } from '@/data/character/classes';

export type ModalState = 'summary' | 'powerChoice' | 'paranormalChoice' | 'attributeChoice' | 'affinityChoice' | 'versatilityChoice' | 'skillUpgrade' | 'trackAbilityChoice' | 'ritualChoice' | 'trackChoice';

export function useLevelUpFlow(agent: Personagem, isResume?: boolean) {
    const [modalState, setModalState] = useState<ModalState>('summary');
    const [personagemAtualizado, setPersonagemAtualizado] = useState<Personagem | null>(null);
    const [mudancas, setMudancas] = useState<MudancasNex | null>(null);
    const [pendenciaSelecionada, setPendenciaSelecionada] = useState<PendenciaNex | null>(null);
    const [transcenderEscolhido, setTranscenderEscolhido] = useState(false);

    useEffect(() => {
        if (!personagemAtualizado) {
            if (isResume) {
                setPersonagemAtualizado(agent);
                setMudancas({
                    pvGanho: 0,
                    peGanho: 0,
                    sanGanha: 0,
                    limitePeRodada: calculateDerivedStats({
                        classe: agent.classe,
                        atributos: agent.atributos,
                        nex: agent.nex,
                        estagio: agent.estagio
                    }).peRodada,
                    nexAnterior: agent.nex,
                    nexNovo: agent.nex,
                    eventosDesbloqueados: []
                });
            } else {
                const novoNex = agent.classe === 'Sobrevivente' ? (agent.estagio || 1) + 1 : Math.min(99, agent.nex + (agent.nex === 95 ? 4 : 5));
                const resultado = subirNex(agent, novoNex, transcenderEscolhido);
                setPersonagemAtualizado(resultado.personagem);
                setMudancas(resultado.mudancas);
            }
        }
    }, [agent, transcenderEscolhido, personagemAtualizado, isResume]);

    const pendenciasAbertas = personagemAtualizado ? getPendenciasNaoResolvidas(personagemAtualizado) : [];
    const temPendencias = pendenciasAbertas.length > 0;

    const handleConfirmLevelUp = () => {
        return personagemAtualizado;
    };

    const handleResolvePendencia = (pendencia: PendenciaNex) => {
        setPendenciaSelecionada(pendencia);

        switch (pendencia.tipo) {
            case 'poder':
                setModalState('powerChoice');
                break;
            case 'transcenderPoder':
                setModalState('paranormalChoice');
                break;
            case 'trilha':
                setModalState('trackChoice');
                break;
            case 'atributo':
                setModalState('attributeChoice');
                break;
            case 'afinidade':
                setModalState('affinityChoice');
                break;
            case 'versatilidade':
                setModalState('versatilityChoice');
                break;
            case 'pericia':
                setModalState('skillUpgrade');
                break;
            case 'trilhaHabilidade':
                setModalState('trackAbilityChoice');
                break;
            case 'ritual':
                setModalState('ritualChoice');
                break;
            default:
                break;
        }
    };

    const handleTranscenderComplete = (poderParanormal: Poder, ritual?: Ritual) => {
        if (!pendenciaSelecionada || !mudancas || !personagemAtualizado) return;
        const infoPendencia = ritual
            ? `Transcender: ${poderParanormal.nome} (${ritual.nome})`
            : `Transcender: ${poderParanormal.nome}`;

        const sanPorNivel = CLASSES[personagemAtualizado.classe].sanPorNivel;
        const novoQtdTranscender = (personagemAtualizado.qtdTranscender || 0) + 1;

        let atualizado: Personagem = {
            ...resolverPendencia(personagemAtualizado, pendenciaSelecionada.id, infoPendencia),
            poderes: [...personagemAtualizado.poderes, poderParanormal],
            rituais: ritual ? [...personagemAtualizado.rituais, ritual] : personagemAtualizado.rituais,
            qtdTranscender: novoQtdTranscender,
            san: {
                ...personagemAtualizado.san,
                atual: personagemAtualizado.san.atual - sanPorNivel,
                max: personagemAtualizado.san.max - sanPorNivel,
            },
        };
        setTranscenderEscolhido(true);
        setPersonagemAtualizado(atualizado);
        setPendenciaSelecionada(null);
        setModalState('summary');
        setMudancas({
            ...mudancas,
            sanGanha: 0,
        });
    };

    const handlePowerSelect = (poderNome: string) => {
        if (!pendenciaSelecionada || !personagemAtualizado) return;
        if (poderNome === 'Transcender') return;
        const poder = PODERES.find(p => p.nome === poderNome);
        if (!poder) return;
        const atualizado = {
            ...resolverPendencia(personagemAtualizado, pendenciaSelecionada.id, poderNome),
            poderes: [...personagemAtualizado.poderes, poder],
        };
        setPersonagemAtualizado(atualizado);
        setPendenciaSelecionada(null);
        setModalState('summary');
    };

    const handleAttributeSelect = (atributo: AtributoKey) => {
        if (!pendenciaSelecionada || !personagemAtualizado) return;
        const atualizado = resolverPendencia(personagemAtualizado, pendenciaSelecionada.id, atributo);
        setPersonagemAtualizado(atualizado);
        setPendenciaSelecionada(null);
        setModalState('summary');
    };

    const handleAffinitySelect = (elemento: Elemento) => {
        if (!pendenciaSelecionada || !personagemAtualizado) return;
        const atualizado = resolverPendencia(personagemAtualizado, pendenciaSelecionada.id, elemento);
        setPersonagemAtualizado(atualizado);
        setPendenciaSelecionada(null);
        setModalState('summary');
    };

    const handleVersatilitySelect = (valor: string) => {
        if (!pendenciaSelecionada || !personagemAtualizado) return;
        const atualizado = resolverPendencia(personagemAtualizado, pendenciaSelecionada.id, valor);
        setPersonagemAtualizado(atualizado);
        setPendenciaSelecionada(null);
        setModalState('summary');
    };

    const handleSkillUpgradeConfirm = (selectedSkills: string[]) => {
        if (!pendenciaSelecionada || !personagemAtualizado) return;
        const atualizado = resolverPendencia(personagemAtualizado, pendenciaSelecionada.id, selectedSkills);
        setPersonagemAtualizado(atualizado);
        setPendenciaSelecionada(null);
        setModalState('summary');
    };

    const handleTrackAbilityConfirm = (valor: string) => {
        if (!pendenciaSelecionada || !personagemAtualizado) return;
        const atualizado = resolverPendencia(personagemAtualizado, pendenciaSelecionada.id, valor);
        setPersonagemAtualizado(atualizado);
        setPendenciaSelecionada(null);
        setModalState('summary');
    };

    const handleRitualSelect = (ritualNome: string) => {
        if (!pendenciaSelecionada || !personagemAtualizado) return;
        const atualizado = resolverPendencia(personagemAtualizado, pendenciaSelecionada.id, ritualNome);
        setPersonagemAtualizado(atualizado);
        setPendenciaSelecionada(null);
        setModalState('summary');
    };

    const handleTrackChoiceSelect = (trilhaNome: string) => {
        if (!pendenciaSelecionada || !personagemAtualizado) return;
        const atualizado = resolverPendencia(personagemAtualizado, pendenciaSelecionada.id, trilhaNome);
        setPersonagemAtualizado(atualizado);
        setPendenciaSelecionada(null);
        setModalState('summary');
    };

    return {
        modalState, setModalState,
        personagemAtualizado,
        mudancas,
        pendenciaSelecionada,
        pendenciasAbertas,
        temPendencias,
        isReady: !!personagemAtualizado && !!mudancas,
        transcenderEscolhido,
        setPendenciaSelecionada,
        handleConfirmLevelUp,
        handleResolvePendencia,
        handleTranscenderComplete,
        handlePowerSelect,
        handleAttributeSelect,
        handleAffinitySelect,
        handleVersatilitySelect,
        handleSkillUpgradeConfirm,
        handleTrackAbilityConfirm,
        handleRitualSelect,
        handleTrackChoiceSelect,
    };
}
