"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ArrowUp,
    Heart,
    Zap,
    Brain,
    Sparkles,
    Check,
    AlertTriangle,
    ChevronRight
} from 'lucide-react';
import { Personagem, Poder, PendenciaNex, AtributoKey, Elemento, Ritual, PericiaName } from '../core/types';
import { subirNex, MudancasNex, getPendenciasNaoResolvidas, resolverPendencia } from '../logic/levelUp';
import { recalcularRecursosPersonagem } from '../logic/progression';
import { cn } from '../lib/utils';
import { PowerChoiceModal } from './PowerChoiceModal';
import { ParanormalPowerModal } from './ParanormalPowerModal';
import { PODERES } from '../data/powers';
import { TRILHAS } from '../data/tracks';

interface LevelUpModalProps {
    agent: Personagem;
    onConfirm: (updatedAgent: Personagem) => void;
    onClose?: () => void;
}

type ModalState = 'summary' | 'powerChoice' | 'paranormalChoice' | 'attributeChoice' | 'affinityChoice' | 'versatilityChoice' | 'skillUpgrade' | 'trackAbilityChoice';

export function LevelUpModal({ agent, onConfirm, onClose }: LevelUpModalProps) {
    const [modalState, setModalState] = useState<ModalState>('summary');
    const [personagemAtualizado, setPersonagemAtualizado] = useState<Personagem | null>(null);
    const [mudancas, setMudancas] = useState<MudancasNex | null>(null);
    const [pendenciaSelecionada, setPendenciaSelecionada] = useState<PendenciaNex | null>(null);
    const [transcenderEscolhido, setTranscenderEscolhido] = useState(false);

    // Calcular novo NEX
    const novoNex = agent.nex + 5;

    // Executar level-up na primeira renderização
    React.useEffect(() => {
        if (!personagemAtualizado) {
            const resultado = subirNex(agent, novoNex, transcenderEscolhido);
            setPersonagemAtualizado(resultado.personagem);
            setMudancas(resultado.mudancas);
        }
    }, [agent, novoNex, transcenderEscolhido, personagemAtualizado]);

    if (!personagemAtualizado || !mudancas) {
        return null;
    }

    const pendenciasAbertas = getPendenciasNaoResolvidas(personagemAtualizado);
    const temPendencias = pendenciasAbertas.length > 0;

    const handleConfirmLevelUp = () => {
        onConfirm(personagemAtualizado);
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
            default:
                break;
        }
    };



    const handleTranscenderComplete = (poderParanormal: Poder, ritual?: Ritual) => {
        if (!pendenciaSelecionada) return;

        // Transcender é o mecanismo para ganhar poderes paranormais
        // O poder que fica salvo é o poder PARANORMAL escolhido, não "Transcender"
        // Adicionar o poder paranormal ao personagem
        let novosPoderes = [...personagemAtualizado.poderes, poderParanormal];
        let novosRituais = [...personagemAtualizado.rituais];

        if (ritual) {
            novosRituais.push(ritual);
        }

        const infoPendencia = ritual
            ? `Transcender: ${poderParanormal.nome} (${ritual.nome})`
            : `Transcender: ${poderParanormal.nome}`;

        // Incrementar contador de transcender
        const qtdTranscender = (personagemAtualizado.qtdTranscender || 0) + 1;

        // Aplicar alterações iniciais
        let atualizado: Personagem = {
            ...resolverPendencia(personagemAtualizado, pendenciaSelecionada.id, infoPendencia),
            poderes: novosPoderes,
            rituais: novosRituais,
            qtdTranscender: qtdTranscender
        };

        // Recalcular recursos para aplicar penalidade de Sanidade automaticamente
        // (Isso vai ajustar san.max e san.atual corretamente baseado no qtdTranscender)
        atualizado = recalcularRecursosPersonagem(atualizado);

        // Marcar que já aplicamos a penalidade de Transcender
        setTranscenderEscolhido(true);
        setPersonagemAtualizado(atualizado);
        setPendenciaSelecionada(null);
        setModalState('summary');

        // Atualizar as mudanças exibidas
        if (mudancas) {
            setMudancas({
                ...mudancas,
                sanGanha: 0,
            });
        }
    };

    const handlePowerSelect = (poderNome: string) => {
        if (!pendenciaSelecionada) return;

        // SEGURANÇA: Se o poder selecionado for "Transcender", ignorar
        // Isso deve ser tratado via onTranscenderComplete
        if (poderNome === 'Transcender') return;

        // Encontrar o poder selecionado
        const poder = PODERES.find(p => p.nome === poderNome);
        if (!poder) return;

        // ... resto da função segue normal, mas preciso garantir que não cortei nada
        const atualizado = {
            ...resolverPendencia(personagemAtualizado, pendenciaSelecionada.id, poderNome),
            poderes: [...personagemAtualizado.poderes, poder],
        };
        setPersonagemAtualizado(atualizado);
        setPendenciaSelecionada(null);
        setModalState('summary');
    };

    const handleAttributeSelect = (atributo: AtributoKey) => {
        if (!pendenciaSelecionada) return;

        const atualizado = resolverPendencia(personagemAtualizado, pendenciaSelecionada.id, atributo);
        setPersonagemAtualizado(atualizado);
        setPendenciaSelecionada(null);
        setModalState('summary');
    };

    const handleAffinitySelect = (elemento: Elemento) => {
        if (!pendenciaSelecionada) return;
        const atualizado = resolverPendencia(personagemAtualizado, pendenciaSelecionada.id, elemento);
        setPersonagemAtualizado(atualizado);
        setPendenciaSelecionada(null);
        setModalState('summary');
    };

    const handleVersatilitySelect = (valor: string) => {
        if (!pendenciaSelecionada) return;
        const atualizado = resolverPendencia(personagemAtualizado, pendenciaSelecionada.id, valor);
        setPersonagemAtualizado(atualizado);
        setPendenciaSelecionada(null);
        setModalState('summary');
    };

    const handleSkillUpgradeConfirm = (selectedSkills: string[]) => {
        if (!pendenciaSelecionada) return;
        const atualizado = resolverPendencia(personagemAtualizado, pendenciaSelecionada.id, selectedSkills);
        setPersonagemAtualizado(atualizado);
        setPendenciaSelecionada(null);
        setModalState('summary');
    };

    const handleTrackAbilityConfirm = (valor: string) => {
        if (!pendenciaSelecionada) return;
        const atualizado = resolverPendencia(personagemAtualizado, pendenciaSelecionada.id, valor);
        setPersonagemAtualizado(atualizado);
        setPendenciaSelecionada(null);
        setModalState('summary');
    };

    // Renderizar sub-modais
    if (modalState === 'powerChoice' && pendenciaSelecionada) {
        return (
            <PowerChoiceModal
                agent={personagemAtualizado}
                onSelect={handlePowerSelect}
                onClose={() => {
                    setPendenciaSelecionada(null);
                    setModalState('summary');
                }}
                onTranscenderComplete={handleTranscenderComplete}
            />
        );
    }

    if (modalState === 'paranormalChoice' && pendenciaSelecionada) {
        return (
            <ParanormalPowerModal
                agent={personagemAtualizado}
                onSelect={(poder, ritualSelecionado) => {
                    const novosPoderes = [...personagemAtualizado.poderes, poder];
                    let atualizado = {
                        ...resolverPendencia(personagemAtualizado, pendenciaSelecionada.id, poder.nome),
                        poderes: novosPoderes,
                    };

                    // Se escolheu Aprender Ritual e selecionou um ritual
                    if (ritualSelecionado) {
                        atualizado = {
                            ...atualizado,
                            rituais: [...personagemAtualizado.rituais, ritualSelecionado],
                        };
                    }

                    setPersonagemAtualizado(atualizado);
                    setPendenciaSelecionada(null);
                    setModalState('summary');
                }}
                onClose={() => {
                    setPendenciaSelecionada(null);
                    setModalState('summary');
                }}
            />
        );
    }


    if (modalState === 'attributeChoice' && pendenciaSelecionada) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative w-full max-w-md bg-ordem-ooze border border-ordem-border rounded-xl p-6"
                >
                    <h2 className="text-lg font-bold text-ordem-text mb-4">+1 em Atributo</h2>
                    <p className="text-sm text-ordem-text-muted mb-4">Escolha um atributo para aumentar em +1:</p>

                    <div className="grid grid-cols-5 gap-2">
                        {(['AGI', 'FOR', 'INT', 'PRE', 'VIG'] as AtributoKey[]).map(attr => (
                            <button
                                key={attr}
                                onClick={() => handleAttributeSelect(attr)}
                                disabled={personagemAtualizado.atributos[attr] >= 5}
                                className={cn(
                                    'p-4 rounded-lg border text-center transition-colors',
                                    personagemAtualizado.atributos[attr] >= 5
                                        ? 'opacity-50 cursor-not-allowed border-ordem-border'
                                        : 'border-ordem-border hover:border-ordem-red hover:bg-ordem-red/10 cursor-pointer'
                                )}
                            >
                                <div className="font-bold text-ordem-text">{attr}</div>
                                <div className="text-lg text-ordem-red">{personagemAtualizado.atributos[attr]}</div>
                                {personagemAtualizado.atributos[attr] >= 5 && (
                                    <div className="text-xs text-ordem-text-muted">MAX</div>
                                )}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            setPendenciaSelecionada(null);
                            setModalState('summary');
                        }}
                        className="mt-4 w-full px-4 py-2 rounded-lg border border-ordem-border text-ordem-text-muted hover:text-ordem-text"
                    >
                        Voltar
                    </button>
                </motion.div>
            </motion.div>
        );
    }

    if (modalState === 'affinityChoice' && pendenciaSelecionada) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            >
                <div className="relative w-full max-w-md bg-ordem-ooze border border-ordem-border rounded-xl p-6">
                    <h2 className="text-lg font-bold text-ordem-text mb-4">Afinidade Elemental</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {(['Sangue', 'Morte', 'Conhecimento', 'Energia'] as Elemento[]).map(elem => (
                            <button
                                key={elem}
                                onClick={() => handleAffinitySelect(elem)}
                                className="p-4 rounded-lg border border-ordem-border hover:border-purple-500 hover:bg-purple-500/10 transition-colors"
                            >
                                <div className="font-bold text-ordem-text">{elem}</div>
                            </button>
                        ))}
                    </div>
                    <button onClick={() => { setPendenciaSelecionada(null); setModalState('summary'); }} className="mt-4 w-full px-4 py-2 border border-ordem-border rounded text-ordem-text-muted">Voltar</button>
                </div>
            </motion.div>
        );
    }

    if (modalState === 'skillUpgrade' && pendenciaSelecionada) {
        return (
            <SkillUpgradeModal
                personagem={personagemAtualizado}
                pendencia={pendenciaSelecionada}
                onConfirm={handleSkillUpgradeConfirm}
                onCancel={() => { setPendenciaSelecionada(null); setModalState('summary'); }}
            />
        );
    }

    if (modalState === 'versatilityChoice' && pendenciaSelecionada) {
        return (
            <VersatilityChoiceModal
                personagem={personagemAtualizado}
                onSelect={handleVersatilitySelect}
                onCancel={() => { setPendenciaSelecionada(null); setModalState('summary'); }}
                openPowerModal={() => setModalState('powerChoice')}
            />
        );
    }

    if (modalState === 'trackAbilityChoice' && pendenciaSelecionada) {
        return (
            <TrackAbilityChoiceModal
                personagem={personagemAtualizado}
                pendencia={pendenciaSelecionada}
                onConfirm={handleTrackAbilityConfirm}
                onCancel={() => { setPendenciaSelecionada(null); setModalState('summary'); }}
            />
        );
    }

    // Modal principal de resumo
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-lg bg-ordem-ooze border border-ordem-border rounded-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-ordem-border bg-gradient-to-r from-green-900/30 to-ordem-ooze">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ArrowUp className="text-green-400" size={24} />
                            <div>
                                <h2 className="text-lg font-bold text-ordem-text">Subir de Nível</h2>
                                <p className="text-sm text-ordem-text-muted">
                                    NEX {mudancas.nexAnterior}% → {mudancas.nexNovo}%
                                </p>
                            </div>
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-ordem-border/50 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-ordem-text-muted" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Mudanças */}
                <div className="p-4 space-y-4">
                    <h3 className="text-sm font-bold text-ordem-text-muted uppercase tracking-wide">
                        Mudanças Automáticas
                    </h3>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-ordem-bg/50 p-3 rounded-lg border border-ordem-border">
                            <div className="flex items-center gap-2 mb-1">
                                <Heart size={14} className="text-red-400" />
                                <span className="text-xs text-ordem-text-muted">PV</span>
                            </div>
                            <div className="text-lg font-bold text-green-400">+{mudancas.pvGanho}</div>
                        </div>

                        <div className="bg-ordem-bg/50 p-3 rounded-lg border border-ordem-border">
                            <div className="flex items-center gap-2 mb-1">
                                <Zap size={14} className="text-yellow-400" />
                                <span className="text-xs text-ordem-text-muted">PE</span>
                            </div>
                            <div className="text-lg font-bold text-green-400">+{mudancas.peGanho}</div>
                        </div>

                        <div className="bg-ordem-bg/50 p-3 rounded-lg border border-ordem-border">
                            <div className="flex items-center gap-2 mb-1">
                                <Brain size={14} className="text-blue-400" />
                                <span className="text-xs text-ordem-text-muted">SAN</span>
                            </div>
                            <div className={cn(
                                'text-lg font-bold',
                                mudancas.sanGanha > 0 ? 'text-green-400' : 'text-ordem-text-muted'
                            )}>
                                {mudancas.sanGanha > 0 ? `+${mudancas.sanGanha}` : '0'}
                            </div>
                            {transcenderEscolhido && (
                                <div className="text-xs text-purple-400">Transcender</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-ordem-bg/50 p-3 rounded-lg border border-ordem-border">
                        <span className="text-xs text-ordem-text-muted">Limite PE/turno:</span>
                        <span className="ml-2 font-bold text-ordem-text">{mudancas.limitePeRodada}</span>
                    </div>
                </div>

                {/* Pendências */}
                {temPendencias && (
                    <div className="p-4 border-t border-ordem-border">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle size={16} className="text-yellow-400" />
                            <h3 className="text-sm font-bold text-ordem-text">Escolhas Pendentes</h3>
                        </div>

                        <div className="space-y-2">
                            {pendenciasAbertas.map(pendencia => (
                                <button
                                    key={pendencia.id}
                                    onClick={() => handleResolvePendencia(pendencia)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg border border-ordem-border hover:border-ordem-red hover:bg-ordem-red/5 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={14} className="text-ordem-text-muted" />
                                        <span className="text-sm text-ordem-text">{pendencia.descricao}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-ordem-text-muted" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="p-4 border-t border-ordem-border bg-ordem-ooze/80 flex justify-end gap-2">
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-ordem-border text-ordem-text-muted hover:text-ordem-text transition-colors"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        onClick={handleConfirmLevelUp}
                        disabled={temPendencias}
                        className={cn(
                            'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2',
                            !temPendencias
                                ? 'bg-green-600 text-white hover:bg-green-500'
                                : 'bg-ordem-border text-ordem-text-muted cursor-not-allowed'
                        )}
                    >
                        {temPendencias ? (
                            'Resolver Pendências'
                        ) : (
                            <>
                                <Check size={16} />
                                Confirmar Level Up
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default LevelUpModal;

function SkillUpgradeModal({ personagem, pendencia, onConfirm, onCancel }: { personagem: Personagem, pendencia: PendenciaNex, onConfirm: (s: string[]) => void, onCancel: () => void }) {
    const [selected, setSelected] = useState<string[]>([]);
    const maxSelect = pendencia.quantidade || 0;
    const alvo = pendencia.nex === 35 ? 'Veterano' : 'Expert';
    const requisitoAtual = pendencia.nex === 35 ? 'Treinado' : 'Veterano';

    const eligibleSkills = Object.keys(personagem.pericias).filter(p => {
        const grau = personagem.pericias[p as PericiaName];
        // Permitir upgrade apenas se tiver o grau anterior necessário?
        // Regra OPRPG: "Escolha X pericias... elas aumentam em um grau (T->V ou V->E)"
        // Portanto, se for 35%, precisa ser Treinado para virar Veterano.
        // Se for 70%, precisa ser Veterano para virar Expert.
        return grau === requisitoAtual;
    });

    const toggleSkill = (skill: string) => {
        if (selected.includes(skill)) {
            setSelected(selected.filter(s => s !== skill));
        } else {
            if (selected.length < maxSelect) {
                setSelected([...selected, skill]);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-ordem-ooze border border-ordem-border rounded-xl p-6 w-full max-w-lg">
                <h3 className="text-lg font-bold text-ordem-text mb-2">Aumentar Grau de Treinamento</h3>
                <p className="text-sm text-ordem-text-muted mb-4">Selecione até {maxSelect} perícias para se tornar {alvo}.</p>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto mb-4">
                    {eligibleSkills.map(skill => (
                        <button
                            key={skill}
                            onClick={() => toggleSkill(skill)}
                            className={cn(
                                "p-2 rounded border text-left text-sm",
                                selected.includes(skill)
                                    ? "border-green-500 bg-green-500/10 text-green-400"
                                    : "border-ordem-border text-ordem-text hover:bg-ordem-white/5"
                            )}
                        >
                            {skill}
                        </button>
                    ))}
                    {eligibleSkills.length === 0 && <p className="text-ordem-text-muted col-span-2">Nenhuma perícia elegível para upgrade.</p>}
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={onCancel} className="px-4 py-2 border border-ordem-border rounded text-ordem-text-muted">Cancelar</button>
                    <button
                        onClick={() => onConfirm(selected)}
                        disabled={selected.length === 0} // Pode confirmar com menos que o max? Sim. Opcional? Não, regra diz "Escolha X".
                        className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                    >
                        Confirmar ({selected.length}/{maxSelect})
                    </button>
                </div>
            </div>
        </div>
    );
}

function VersatilityChoiceModal({ personagem, onSelect, onCancel, openPowerModal }: { personagem: Personagem, onSelect: (v: string) => void, onCancel: () => void, openPowerModal: () => void }) {
    const [view, setView] = useState<'main' | 'tracks'>('main');

    // Filter tracks: same class, not own track
    const availableTracks = useMemo(() => {
        return TRILHAS.filter(t => t.classe === personagem.classe && t.nome !== personagem.trilha);
    }, [personagem]);

    if (view === 'tracks') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                <div className="bg-ordem-ooze border border-ordem-border rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                    <h3 className="text-lg font-bold text-ordem-text mb-4">Escolher Habilidade de Trilha (NEX 10%)</h3>
                    <div className="space-y-4">
                        {availableTracks.map(track => {
                            const firstAbility = track.habilidades.find(h => h.nex === 10);
                            if (!firstAbility) return null;
                            return (
                                <button
                                    key={track.nome}
                                    onClick={() => onSelect(firstAbility.nome)}
                                    className="w-full text-left p-4 border border-ordem-border rounded-lg hover:border-ordem-red/50 hover:bg-ordem-red/5 transition-colors"
                                >
                                    <h4 className="font-bold text-ordem-red mb-1">{track.nome}: {firstAbility.nome}</h4>
                                    <p className="text-sm text-ordem-text-muted">{firstAbility.descricao}</p>
                                </button>
                            );
                        })}
                    </div>
                    <button onClick={() => setView('main')} className="mt-4 w-full px-4 py-2 border border-ordem-border rounded text-ordem-text-muted">Voltar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-ordem-ooze border border-ordem-border rounded-xl p-6 w-full max-w-md text-center">
                <h3 className="text-lg font-bold text-ordem-text mb-2">Versatilidade (NEX 50%)</h3>
                <p className="text-sm text-ordem-text-muted mb-6">Escolha um benefício:</p>
                <div className="grid gap-3">
                    <button
                        onClick={openPowerModal}
                        className="p-4 border border-ordem-border rounded-lg hover:border-ordem-red hover:bg-ordem-red/10 transition-colors"
                    >
                        <strong className="block text-ordem-text mb-1">Poder de Classe</strong>
                        <span className="text-xs text-ordem-text-muted">Escolha um poder da sua própria classe.</span>
                    </button>
                    <button
                        onClick={() => setView('tracks')}
                        className="p-4 border border-ordem-border rounded-lg hover:border-blue-500 hover:bg-blue-500/10 transition-colors"
                    >
                        <strong className="block text-ordem-text mb-1">Habilidade de Outra Trilha</strong>
                        <span className="text-xs text-ordem-text-muted">Receba a primeira habilidade de outra trilha da sua classe.</span>
                    </button>
                </div>
                <button onClick={onCancel} className="mt-4 w-full px-4 py-2 text-sm text-ordem-text-muted hover:underline">Cancelar</button>
            </div>
        </div>
    );
}

function TrackAbilityChoiceModal({ personagem, pendencia, onConfirm, onCancel }: { personagem: Personagem, pendencia: PendenciaNex, onConfirm: (v: string) => void, onCancel: () => void }) {
    const trilhaData = TRILHAS.find(t => t.nome === personagem.trilha);
    const habilidade = trilhaData?.habilidades.find(h => h.nex === pendencia.nex);

    if (!habilidade || !habilidade.escolha) {
        return null; // Should not happen given logic
    }

    const escolha = habilidade.escolha;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-ordem-ooze border border-ordem-border rounded-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-ordem-text mb-2">{habilidade.nome}</h3>
                <p className="text-sm text-ordem-text-muted mb-4">{habilidade.descricao}</p>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {escolha.tipo === 'pericia' && (escolha.opcoes ? escolha.opcoes : Object.keys(personagem.pericias)).map(opt => (
                        <button key={opt} onClick={() => onConfirm(opt)} className="w-full text-left p-2 border border-ordem-border rounded hover:bg-ordem-white/5 text-ordem-text">
                            {opt}
                        </button>
                    ))}

                    {escolha.tipo === 'elemento' && (['Sangue', 'Morte', 'Conhecimento', 'Energia'] as Elemento[]).map(elem => (
                        <button key={elem} onClick={() => onConfirm(elem)} className="w-full text-left p-2 border border-ordem-border rounded hover:bg-ordem-white/5 text-ordem-text">
                            {elem}
                        </button>
                    ))}

                    {escolha.tipo === 'custom' && escolha.opcoes?.map(opt => (
                        <button key={opt} onClick={() => onConfirm(opt)} className="w-full text-left p-2 border border-ordem-border rounded hover:bg-ordem-white/5 text-ordem-text">
                            {opt}
                        </button>
                    ))}
                </div>

                <button onClick={onCancel} className="mt-4 w-full px-4 py-2 border border-ordem-border rounded text-ordem-text-muted">Cancelar</button>
            </div>
        </div>
    );
}
