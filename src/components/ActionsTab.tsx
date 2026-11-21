import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown, Swords, Zap, Crosshair, Sparkles, BookOpen, Flame, Shield, Wind, Clock, ArrowRight } from 'lucide-react';
import type { AtributoKey, Personagem, Poder, Ritual } from '@/core/types';
import { UNIVERSAL_ACTIONS, INVESTIGATION_ACTIONS, CHASE_ACTIONS, STEALTH_ACTIONS, MANEUVER_ACTIONS, ACAO_BADGE, ActionDefinition, TipoAcao } from '../data/combat/actions';
import { ORIGENS } from '../data/character/origins';
import { CLASS_ABILITIES } from '../data/character/classAbilities';
import { TRILHAS } from '../data/character/tracks';
import { prepararAtaquesDaFicha, type AtaqueDaFicha } from '@/logic/combatUtils';
import { calcularDTRitual } from '@/logic/rulesEngine';
import { apresentarEfeitoDeRitual, formatarCustoDoRitual } from '@/core/rules/rituais';
import { MODIFICACOES_ARMAS } from '@/data/equipment/modifications';

type AcaoDaFicha = ActionDefinition | Ritual | (Pick<Poder, 'nome' | 'descricao' | 'custo' | 'acao'> & {
  tipo: string;
  teste?: string;
});

interface ActionsTabProps {
  character: Personagem;
  useSanity: boolean;
}

type FilterKey = 'todos' | 'universais' | 'manobras' | 'habilidades' | 'rituais' | 'cenarios' | 'ataques';

const TIPO_ICON: Record<TipoAcao, React.ReactNode> = {
  'Padrão': <Swords size={11} />,
  'Movimento': <Wind size={11} />,
  'Completa': <Flame size={11} />,
  'Livre': <Zap size={11} />,
  'Reação': <Shield size={11} />,
};

const TIPO_GRADIENT: Record<TipoAcao, string> = {
  'Padrão': 'from-red-500/10 via-transparent to-transparent',
  'Movimento': 'from-blue-500/10 via-transparent to-transparent',
  'Completa': 'from-purple-500/10 via-transparent to-transparent',
  'Livre': 'from-gray-400/10 via-transparent to-transparent',
  'Reação': 'from-yellow-500/10 via-transparent to-transparent',
};

const TIPO_GLOW: Record<TipoAcao, string> = {
  'Padrão': 'hover:shadow-[0_0_20px_rgba(239,68,68,0.08)]',
  'Movimento': 'hover:shadow-[0_0_20px_rgba(59,130,246,0.08)]',
  'Completa': 'hover:shadow-[0_0_20px_rgba(168,85,247,0.08)]',
  'Livre': 'hover:shadow-[0_0_20px_rgba(156,163,175,0.06)]',
  'Reação': 'hover:shadow-[0_0_20px_rgba(234,179,8,0.08)]',
};

const ELEMENT_STYLES: Record<string, { gradient: string; text: string; glow: string }> = {
  'Sangue': { gradient: 'from-red-600/15 to-red-900/5', text: 'text-red-400', glow: 'shadow-red-500/5' },
  'Morte': { gradient: 'from-gray-400/10 to-gray-800/5', text: 'text-gray-300', glow: 'shadow-gray-400/5' },
  'Conhecimento': { gradient: 'from-yellow-500/15 to-yellow-900/5', text: 'text-yellow-400', glow: 'shadow-yellow-500/5' },
  'Energia': { gradient: 'from-purple-500/15 to-purple-900/5', text: 'text-purple-400', glow: 'shadow-purple-500/5' },
  'Medo': { gradient: 'from-white/10 to-white/2', text: 'text-white', glow: 'shadow-white/5' },
};

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

export const ActionsTab: React.FC<ActionsTabProps> = ({ character, useSanity }) => {
  const [filter, setFilter] = useState<FilterKey>('todos');
  const [query, setQuery] = useState('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = useCallback((key: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const ritualDtBonus = useMemo(() =>
    character.poderes?.some(p => p.nome === 'Rituais Eficientes') ? 5 : 0
    , [character.poderes]);

  const q = query.trim().toLowerCase();
  const matchesQuery = useCallback((a: { nome: string; descricao: string; teste?: string; acao?: string; custo?: string }) => {
    if (!q) return true;
    return [a.nome, a.descricao, a.teste, a.acao, a.custo].join(' ').toLowerCase().includes(q);
  }, [q]);

  const formatCost = (cost?: string) => {
    if (!cost) return null;
    if (useSanity) return cost;
    return cost.replace(/PE/g, 'PD').replace(/SAN/g, 'PD');
  };

  const parseDtAttr = (raw?: string): AtributoKey | undefined =>
    raw?.match(/\bDT\s*(Agi|For|Int|Pre|Vig)\b/i)?.[1].toUpperCase() as AtributoKey | undefined;

  const renderActionCard = (action: AcaoDaFicha, source?: string, idx = 0) => {
    const isRitual = 'circulo' in action;
    const isActionDef = 'tipoAcao' in action;
    const cardKey = action.nome + (source || '');
    const isOpen = expandedCards.has(cardKey);

    let cost: string | undefined;
    if ('custo' in action) cost = action.custo;
    const displayCost = isRitual ? formatarCustoDoRitual(action.circulo, !useSanity) : formatCost(cost);

    const limite = character.pe?.rodada ?? 1;
    const dtAttr = isRitual ? undefined : parseDtAttr('teste' in action ? action.teste : undefined) ?? parseDtAttr(action.descricao);
    const dt = isRitual && action.resistencia?.trim() && !/^(?:nenhuma?|[-—]+)$/i.test(action.resistencia.trim())
      ? calcularDTRitual({ atributos: character.atributos, limitePe: limite, bonusDT: ritualDtBonus })
      : dtAttr ? 10 + limite + character.atributos[dtAttr] : null;
    const dtText = dt === null ? '' : 'DT ' + dt;

    const numericCost = displayCost ? Number(displayCost.match(/(\d+)/)?.[1] || 0) : 0;
    const overLimit = numericCost > 0 && numericCost > (character.pe?.rodada ?? 1);

    const tipoAcao = isActionDef ? (action as ActionDefinition).tipoAcao : null;
    const gradientBg = isActionDef && tipoAcao ? TIPO_GRADIENT[tipoAcao] : isRitual ? (ELEMENT_STYLES[(action as Ritual).elemento]?.gradient || '') : '';
    const hoverGlow = isActionDef && tipoAcao ? TIPO_GLOW[tipoAcao] : '';
    const badge = isActionDef && tipoAcao ? ACAO_BADGE[tipoAcao] : null;

    return (
      <motion.div
        key={cardKey}
        layout="position"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springTransition, delay: idx * 0.02 }}
        whileHover={{ scale: 1.005 }}
        className={`
          relative overflow-hidden transition-colors duration-200
          border border-white/[0.06] 
          bg-gradient-to-r ${gradientBg || 'from-white/[0.02] to-transparent'}
          ${hoverGlow}
          ${isOpen ? 'ring-1 ring-white/10 shadow-lg' : 'hover:border-white/[0.12]'}
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => toggleCard(cardKey)}
          className="relative flex w-full flex-wrap items-start gap-3 p-3.5 text-left focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-ordem-red-light sm:flex-nowrap sm:p-4"
        >
          {isActionDef && tipoAcao && (
            <span className={`shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center ${badge?.bg} border ${badge?.border}`}>
              <span className={badge?.color}>{TIPO_ICON[tipoAcao]}</span>
            </span>
          )}

          {isRitual && (
            <span className={`shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center bg-purple-500/10 border border-purple-500/20`}>
              <Sparkles size={13} className="text-purple-400" />
            </span>
          )}

          {!isActionDef && !isRitual && (
            <span className="shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center bg-white/5 border border-white/10">
              <Zap size={13} className="text-ordem-text-muted" />
            </span>
          )}

          <span className="min-w-[8rem] flex-1">
            <span className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white text-sm leading-tight">{action.nome}</span>

              {isActionDef && badge && (
                <span className={`inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-[2px] ${badge.bg} ${badge.color} border ${badge.border}`}>
                  {badge.label}
                </span>
              )}

              {source && (
                <span className="text-[9px] px-1.5 py-[2px] bg-white/5 text-white/40 border border-white/5 uppercase tracking-wider">
                  {source}
                </span>
              )}

              {isRitual && (() => {
                const el = (action as Ritual).elemento;
                const s = ELEMENT_STYLES[el];
                return s ? (
                  <span className={`text-[9px] px-1.5 py-[2px] bg-gradient-to-r ${s.gradient} ${s.text} border border-white/5 font-medium`}>
                    {el} {(action as Ritual).circulo}
                  </span>
                ) : null;
              })()}
            </span>
            <span className="text-xs text-ordem-text-secondary mt-1 line-clamp-1 leading-relaxed">{action.descricao}</span>
          </span>

          <span className="flex items-center gap-1.5 shrink-0 ml-auto">
            {dtText && (
              <span className="text-xs font-mono px-2 py-1 bg-white/[0.04] text-emerald-400/80 border border-emerald-500/10">
                {dtText}
              </span>
            )}
            {displayCost && (
              <span className={`text-xs font-mono px-2 py-1 border ${overLimit ? 'bg-red-500/10 text-red-400/80 border-red-500/10' : 'bg-white/[0.04] text-amber-400/80 border-amber-500/10'}`}>
                {displayCost}
              </span>
            )}
            <motion.span
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              className="ml-0.5"
            >
              <ChevronDown size={14} className="text-ordem-text-muted" />
            </motion.span>
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 border-t border-white/[0.04]" onClick={e => e.stopPropagation()}>
                <div className="mt-3 p-3.5 bg-black/30  border border-white/[0.04]">
                  <p className="text-[13px] text-white/60 leading-[1.7] whitespace-pre-line">{action.descricao}</p>
                </div>

                {isActionDef && (action as ActionDefinition).requisito && (
                  <div className="p-3 bg-amber-500/[0.06] border border-amber-500/10 flex items-start gap-2.5">
                    <div className="w-5 h-5 bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Shield size={11} className="text-amber-400" />
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-400/60 uppercase tracking-wider font-medium block mb-0.5">Requisito</span>
                      <p className="text-xs text-amber-300/80">{(action as ActionDefinition).requisito}</p>
                    </div>
                  </div>
                )}

                {isActionDef && (action as ActionDefinition).pericia && (
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] text-white/25 uppercase tracking-wider font-medium">Perícia</span>
                    <span className="text-xs font-mono text-emerald-400/70 bg-emerald-500/[0.06] px-2.5 py-1 border border-emerald-500/10">
                      {(action as ActionDefinition).pericia}
                    </span>
                  </div>
                )}

                {'teste' in action && ('teste' in action ? action.teste : undefined) && (
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] text-white/25 uppercase tracking-wider font-medium">Teste</span>
                    <span className="text-xs font-mono text-emerald-400/70 bg-emerald-500/[0.06] px-2.5 py-1 border border-emerald-500/10">
                      {('teste' in action ? action.teste : undefined)}
                    </span>
                  </div>
                )}

                {overLimit && (
                  <div className="p-3 bg-red-500/[0.06] border border-red-500/10 flex items-start gap-2.5">
                    <div className="w-5 h-5 bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Flame size={11} className="text-red-400" />
                    </div>
                    <p className="text-xs text-red-300/70">Custo acima do limite de PE por turno. Ainda permite 1 uso no custo mínimo.</p>
                  </div>
                )}

                {isRitual && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Execução', value: (action as Ritual).execucao, icon: <Clock size={10} /> },
                        { label: 'Alcance', value: (action as Ritual).alcance, icon: <ArrowRight size={10} /> },
                        { label: 'Alvo', value: (action as Ritual).alvo, icon: <Crosshair size={10} /> },
                        { label: 'Duração', value: (action as Ritual).duracao, icon: <Wind size={10} /> },
                      ].map(({ label, value, icon }) => (
                        <div key={label} className="p-2.5 bg-white/[0.02] border border-white/[0.04]">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-white/20">{icon}</span>
                            <span className="text-[9px] text-white/25 uppercase tracking-wider font-medium">{label}</span>
                          </div>
                          <span className="text-xs text-white/50">{value}</span>
                        </div>
                      ))}
                    </div>

                    {(action as Ritual).resistencia && (
                      <div className="p-2.5 bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-[9px] text-white/25 uppercase tracking-wider font-medium block mb-1">Resistência</span>
                        <span className="text-xs text-white/50">{(action as Ritual).resistencia}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      {[
                        { key: 'padrao', label: 'Padrão', text: apresentarEfeitoDeRitual(action.efeito.padrao ?? '', !useSanity), color: 'border-white/20', labelColor: 'text-white/50' },
                        { key: 'discente', label: 'Discente', text: apresentarEfeitoDeRitual(action.efeito.discente ?? '', !useSanity), color: 'border-amber-400/30', labelColor: 'text-amber-400/70' },
                        { key: 'verdadeiro', label: 'Verdadeiro', text: apresentarEfeitoDeRitual(action.efeito.verdadeiro ?? '', !useSanity), color: 'border-red-400/30', labelColor: 'text-red-400/70' },
                      ].filter(t => t.text).map(tier => (
                        <div key={tier.key} className={`p-3 bg-black/20 border-l-2 ${tier.color}`}>
                          <span className={`text-[10px] ${tier.labelColor} font-semibold uppercase tracking-widest block mb-1.5`}>{tier.label}</span>
                          <p className="text-xs text-white/45 leading-relaxed">{tier.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {isActionDef && <span className="text-[8px] px-2 py-0.5 bg-white/[0.03] text-white/20 border border-white/[0.04]">#{(action as ActionDefinition).tipoAcao.toLowerCase()}</span>}
                  {isActionDef && (action as ActionDefinition).pericia && <span className="text-[8px] px-2 py-0.5 bg-white/[0.03] text-white/20 border border-white/[0.04]">#{(action as ActionDefinition).pericia?.toLowerCase()}</span>}
                  {isRitual && <span className="text-[8px] px-2 py-0.5 bg-white/[0.03] text-white/20 border border-white/[0.04]">#{(action as Ritual).elemento.toLowerCase()}</span>}
                  {source && <span className="text-[8px] px-2 py-0.5 bg-white/[0.03] text-white/20 border border-white/[0.04]">#{source.toLowerCase().replace(/[\s()%]+/g, '-')}</span>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderWeaponCard = (a: AtaqueDaFicha, idx: number) => {
    const cardKey = a.chave;
    const modificacoes = a.item.modificacoes ?? [];
    const isOpen = expandedCards.has(cardKey);

    return (
      <motion.div
        key={cardKey}
        layout="position"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springTransition, delay: idx * 0.02 }}
        whileHover={{ scale: 1.005 }}
        className={`
          relative overflow-hidden transition-colors duration-200
          border border-white/[0.06] 
          bg-gradient-to-r from-red-500/[0.06] via-transparent to-transparent
          hover:shadow-[0_0_20px_rgba(239,68,68,0.06)]
          ${isOpen ? 'ring-1 ring-white/10 shadow-lg' : 'hover:border-white/[0.12]'}
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => toggleCard(cardKey)}
          className="relative flex w-full flex-wrap items-start gap-3 p-3.5 text-left focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-ordem-red-light sm:flex-nowrap sm:p-4"
        >
          <span className="shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center bg-red-500/10 border border-red-500/20">
            <Crosshair size={13} className="text-red-400" />
          </span>

          <span className="min-w-[8rem] flex-1">
            <span className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white text-sm">{a.item.nome}</span>
              {modificacoes.length > 0 && (
                <span className="text-[9px] px-1.5 py-[2px] bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/15 font-medium">
                  +{modificacoes.length} mod
                </span>
              )}
              <span className="text-[9px] px-1.5 py-[2px] bg-red-500/10 text-red-400/80 border border-red-500/15 font-medium">
                Ataque
              </span>
            </span>
            <span className="text-xs text-ordem-text-secondary mt-1 line-clamp-1">{a.descricao.split('\n')[0]}</span>
          </span>

          <span className="flex items-center gap-1.5 shrink-0 ml-auto">
            <span className="text-xs font-mono px-2 py-1 bg-white/[0.04] text-emerald-400/80 border border-emerald-500/10">
              {a.teste}
            </span>
            <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronDown size={14} className="text-ordem-text-muted" />
            </motion.span>
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 border-t border-white/[0.04]" onClick={e => e.stopPropagation()}>
                <div className="mt-3 p-3.5 bg-black/30 border border-white/[0.04]">
                  <p className="text-[13px] text-white/60 leading-[1.7] whitespace-pre-line">{a.descricao}</p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-[10px] text-white/25 uppercase tracking-wider font-medium">Teste</span>
                  <span className="text-xs font-mono text-emerald-400/70 bg-emerald-500/[0.06] px-2.5 py-1 border border-emerald-500/10">
                    {a.pericia} · {a.teste}
                  </span>
                  {a.ataqueBonus !== 0 && (
                    <span className="text-xs font-mono text-amber-400/70 bg-amber-500/[0.06] px-2.5 py-1 border border-amber-500/10">
                      Arma {a.ataqueBonus > 0 ? '+' : ''}{a.ataqueBonus}
                    </span>
                  )}
                </div>

                {modificacoes.length > 0 && (
                  <div>
                    <span className="text-[9px] text-white/25 uppercase tracking-widest font-medium block mb-2">Modificações</span>
                    <div className="flex flex-wrap gap-1.5">
                      {modificacoes.map((modNome: string) => {
                        const mod = MODIFICACOES_ARMAS.find(m => m.nome === modNome);
                        return (
                          <div key={modNome} className="group/mod relative">
                            <span className="text-[9px] px-2 py-1 bg-amber-500/[0.06] text-amber-400/70 border border-amber-500/10 font-mono cursor-help transition-colors hover:bg-amber-500/10">
                              {modNome}
                            </span>
                            {mod && (
                              <div className="absolute bottom-full left-0 mb-2 hidden group-hover/mod:block z-50 pointer-events-none">
                                <div className="bg-black/90  border border-white/10 p-3 shadow-2xl max-w-xs">
                                  <div className="text-[11px] font-semibold text-white mb-1">{mod.nome}</div>
                                  <div className="text-[10px] text-white/50 leading-relaxed">{mod.efeito}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const activePowers = character.poderes.filter(p => (p.custo || p.acao || p.tipo === 'Paranormal') && matchesQuery(p));
  const originData = ORIGENS.find(o => o.nome === character.origem);
  const originPower = originData?.poder && matchesQuery(originData.poder) ? originData.poder : undefined;
  const nivelDoPersonagem = character.classe === 'Sobrevivente' ? (character.estagio ?? 1) : character.nex;
  const classAbilities = CLASS_ABILITIES[character.classe]?.filter(a => a.nex <= nivelDoPersonagem && matchesQuery(a)) || [];
  const trackData = TRILHAS.find(t => t.nome === character.trilha);
  const trackAbilities = trackData?.habilidades.filter(h => h.nex <= character.nex && matchesQuery(h)) || [];

  const weaponActions = useMemo(() => prepararAtaquesDaFicha(character), [character]);
  const filteredWeaponActions = weaponActions.filter(a => matchesQuery({ ...a, nome: a.item.nome }));
  const filteredUniversal = UNIVERSAL_ACTIONS.filter(matchesQuery);
  const filteredInv = INVESTIGATION_ACTIONS.filter(matchesQuery);
  const filteredChase = CHASE_ACTIONS.filter(matchesQuery);
  const filteredStealth = STEALTH_ACTIONS.filter(matchesQuery);
  const filteredManeuvers = MANEUVER_ACTIONS.filter(matchesQuery);
  const filteredRituais = character.rituais.filter(matchesQuery);

  const actionsByType: Record<TipoAcao, ActionDefinition[]> = { 'Padrão': [], 'Movimento': [], 'Completa': [], 'Livre': [], 'Reação': [] };
  filteredUniversal.forEach(a => actionsByType[a.tipoAcao].push(a));
  const totalHabilidades = activePowers.length + classAbilities.length + trackAbilities.length + Number(Boolean(originPower));

  const SectionHeader = ({ icon, title, count }: { icon: React.ReactNode; title: string; count: number; color: string }) => (
    <div className="sticky top-0 z-10 mb-3 flex items-baseline gap-2 bg-ordem-ooze/95 py-2 backdrop-blur-sm">
      <span className="text-[var(--mestre-primary,#DC2626)]">{icon}</span>
      <h3 className="font-carimbo text-[10px] uppercase tracking-[0.22em] text-[var(--mestre-primary,#DC2626)]">{title}</h3>
      <span className="font-mono text-[10px] text-ordem-text-muted">{count}</span>
      <div className="ml-2 h-px flex-1 bg-white/[0.06]" />
    </div>
  );

  const SubHeader = ({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) => (
    <div className="mb-2 mt-3 flex items-center gap-2">
      <span className={color}>{icon}</span>
      <span className={`font-carimbo text-[10px] uppercase tracking-[0.18em] ${color}`}>{title}</span>
      <div className="ml-2 h-px flex-1 bg-white/[0.04]" />
    </div>
  );

  const filterButtons: { key: FilterKey; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'todos', label: 'Todos', icon: <BookOpen size={12} />, count: 0 },
    { key: 'universais', label: 'Ações', icon: <Swords size={12} />, count: filteredUniversal.length },
    { key: 'manobras', label: 'Manobras', icon: <Shield size={12} />, count: filteredManeuvers.length },
    { key: 'ataques', label: 'Ataques', icon: <Crosshair size={12} />, count: filteredWeaponActions.length },
    { key: 'habilidades', label: 'Habilidades', icon: <Zap size={12} />, count: totalHabilidades },
    { key: 'rituais', label: 'Rituais', icon: <Sparkles size={12} />, count: filteredRituais.length },
    { key: 'cenarios', label: 'Cenários', icon: <BookOpen size={12} />, count: filteredInv.length + filteredChase.length + filteredStealth.length },
  ];

  const haResultados = filterButtons.some(({ key, count }) =>
    count > 0 && (filter === 'todos' || filter === key),
  );

  return (
    <div className="h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springTransition}
        className="mb-5 shrink-0 space-y-4"
      >
        <label className="flex items-center gap-2 border border-white/10 bg-black/30 px-2.5 focus-within:border-[var(--mestre-primary,#DC2626)]/60">
          <Search size={13} className="shrink-0 text-ordem-text-muted" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Buscar ações, rituais e poderes"
            placeholder="Buscar ações, rituais, poderes…"
            className="w-full bg-transparent py-2 text-sm text-white placeholder:text-ordem-text-muted focus:outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Limpar busca" className="text-ordem-text-muted transition-colors hover:text-white">
              <X size={13} />
            </button>
          )}
        </label>

        <div className="flex flex-wrap gap-1.5">
          {filterButtons.map(fb => (
            <motion.button
              key={fb.key}
              type="button"
              aria-pressed={filter === fb.key}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilter(fb.key)}
              className={`inline-flex items-center gap-1.5 min-h-9 border px-2.5 py-1 font-carimbo text-xs uppercase tracking-[0.14em] transition ${filter === fb.key
                  ? 'border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)]/15 text-white'
                  : 'border-white/10 text-ordem-text-muted hover:border-white/30 hover:text-white'
                }`}
            >
              {fb.icon}
              {fb.label}
              {fb.count > 0 && <span className="text-[9px] opacity-60 font-mono">{fb.count}</span>}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="overflow-y-auto pr-1 custom-scrollbar flex-1 space-y-8 pb-4">
        {!haResultados && (
          <p role="status" className="border border-dashed border-ordem-border p-6 text-center text-sm text-ordem-text-secondary">
            {q ? 'Nenhum resultado para esta busca.' : 'Nenhum registro nesta categoria.'}
          </p>
        )}
        {(filter === 'todos' || filter === 'ataques') && filteredWeaponActions.length > 0 && (
          <section>
            <SectionHeader icon={<Crosshair size={15} className="text-red-400" />} title="Armas & Ataques" count={filteredWeaponActions.length} color="from-red-500/20 to-red-500/5 border border-red-500/15" />
            <div className="space-y-2">
              {filteredWeaponActions.map((a, i) => renderWeaponCard(a, i))}
            </div>
          </section>
        )}

        {(filter === 'todos' || filter === 'universais') && filteredUniversal.length > 0 && (
          <section>
            <SectionHeader icon={<Swords size={15} className="text-red-400" />} title="Ações Universais" count={filteredUniversal.length} color="from-red-500/20 to-red-500/5 border border-red-500/15" />
            <div className="space-y-5">
              {(['Padrão', 'Movimento', 'Completa', 'Livre', 'Reação'] as TipoAcao[]).map(tipo => {
                const actions = actionsByType[tipo];
                if (actions.length === 0) return null;
                const badge = ACAO_BADGE[tipo];
                return (
                  <div key={tipo}>
                    <SubHeader icon={TIPO_ICON[tipo]} title={`${badge.label} (${actions.length})`} color={badge.color} />
                    <div className="space-y-2">
                      {actions.map((a, i) => renderActionCard(a, undefined, i))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {(filter === 'todos' || filter === 'manobras') && filteredManeuvers.length > 0 && (
          <section>
            <SectionHeader icon={<Shield size={15} className="text-orange-400" />} title="Manobras de Combate" count={filteredManeuvers.length} color="from-orange-500/20 to-orange-500/5 border border-orange-500/15" />
            <div className="space-y-2">
              {filteredManeuvers.map((a, i) => renderActionCard(a, undefined, i))}
            </div>
          </section>
        )}

        {(filter === 'todos' || filter === 'habilidades') && totalHabilidades > 0 && (
          <section>
            <SectionHeader icon={<Zap size={15} className="text-yellow-400" />} title="Habilidades & Poderes" count={totalHabilidades} color="from-yellow-500/20 to-yellow-500/5 border border-yellow-500/15" />
            <div className="space-y-2">
              {originPower && renderActionCard({ nome: originPower.nome, descricao: originPower.descricao, tipo: 'Origem' }, 'Origem', 0)}
              {classAbilities.map((a, i) => renderActionCard({ nome: a.nome, descricao: a.descricao, custo: a.custo, acao: a.acao, tipo: 'Classe' }, `Classe ${a.nex}%`, i + 1))}
              {trackAbilities.map((a, i) => renderActionCard({ nome: a.nome, descricao: a.descricao, tipo: 'Trilha' }, `Trilha ${a.nex}%`, i + classAbilities.length + 2))}
              {activePowers.map((p, i) => renderActionCard(p, undefined, i + classAbilities.length + trackAbilities.length + 3))}
            </div>
          </section>
        )}

        {(filter === 'todos' || filter === 'rituais') && filteredRituais.length > 0 && (
          <section>
            <SectionHeader icon={<Sparkles size={15} className="text-purple-400" />} title="Rituais" count={filteredRituais.length} color="from-purple-500/20 to-purple-500/5 border border-purple-500/15" />
            <div className="space-y-2">
              {filteredRituais.map((r, i) => renderActionCard(r, undefined, i))}
            </div>
          </section>
        )}

        {(filter === 'todos' || filter === 'cenarios') && (filteredInv.length > 0 || filteredChase.length > 0 || filteredStealth.length > 0) && (
          <section>
            <SectionHeader icon={<BookOpen size={15} className="text-cyan-400" />} title="Cenários Específicos" count={filteredInv.length + filteredChase.length + filteredStealth.length} color="from-cyan-500/20 to-cyan-500/5 border border-cyan-500/15" />
            <div className="space-y-5">
              {filteredInv.length > 0 && (
                <div>
                  <SubHeader icon={<Search size={11} />} title="Investigação" color="text-cyan-400/70" />
                  <div className="space-y-2">{filteredInv.map((a, i) => renderActionCard(a, undefined, i))}</div>
                </div>
              )}
              {filteredChase.length > 0 && (
                <div>
                  <SubHeader icon={<Wind size={11} />} title="Perseguição" color="text-cyan-400/70" />
                  <div className="space-y-2">{filteredChase.map((a, i) => renderActionCard(a, undefined, i))}</div>
                </div>
              )}
              {filteredStealth.length > 0 && (
                <div>
                  <SubHeader icon={<Shield size={11} />} title="Furtividade" color="text-cyan-400/70" />
                  <div className="space-y-2">{filteredStealth.map((a, i) => renderActionCard(a, undefined, i))}</div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
