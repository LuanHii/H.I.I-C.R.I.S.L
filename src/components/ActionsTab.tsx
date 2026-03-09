import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Swords, Zap, Crosshair, Sparkles, BookOpen, Flame, Shield, Wind, Clock, ArrowRight } from 'lucide-react';
import { Personagem, Poder, Ritual } from '../core/types';
import { UNIVERSAL_ACTIONS, INVESTIGATION_ACTIONS, CHASE_ACTIONS, STEALTH_ACTIONS, MANEUVER_ACTIONS, ACAO_BADGE, ActionDefinition, TipoAcao } from '../data/actions';
import { ORIGENS } from '../data/origins';
import { CLASS_ABILITIES } from '../data/classAbilities';
import { TRILHAS } from '../data/tracks';
import { getPenalidadesPericia } from '../logic/combatUtils';
import { calcularStatsModificados, MODIFICACOES_ARMAS } from '../data/modifications';

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
  const matchesQuery = useCallback((a: any) => {
    if (!q) return true;
    return `${a.nome ?? ''} ${a.descricao ?? ''} ${a.teste ?? ''} ${a.acao ?? ''} ${a.custo ?? ''}`.toLowerCase().includes(q);
  }, [q]);

  const formatCost = (cost?: string) => {
    if (!cost) return null;
    if (useSanity) return cost;
    return cost.replace(/PE/g, 'PD').replace(/SAN/g, 'PD');
  };

  const getRitualCost = (circle: number) => ({ 1: '1 PE', 2: '3 PE', 3: '6 PE', 4: '10 PE' }[circle] || '? PE');

  const parseDtAttr = (raw?: string): 'AGI' | 'FOR' | 'INT' | 'PRE' | 'VIG' | null => {
    if (!raw) return null;
    const m = raw.match(/\bDT\s*(Agi|For|Int|Pre|Vig)\b/i);
    if (!m) return null;
    const key = m[1].toUpperCase() as 'AGI' | 'FOR' | 'INT' | 'PRE' | 'VIG';
    return ['AGI', 'FOR', 'INT', 'PRE', 'VIG'].includes(key) ? key : null;
  };

  const renderActionCard = (action: ActionDefinition | Poder | Ritual, source?: string, idx = 0) => {
    const isRitual = 'circulo' in action;
    const isActionDef = 'tipoAcao' in action;
    const cardKey = action.nome + (source || '');
    const isOpen = expandedCards.has(cardKey);

    let cost: string | undefined;
    if ('custo' in action) cost = action.custo;
    if (isRitual) cost = getRitualCost((action as Ritual).circulo);
    const displayCost = formatCost(cost);

    const dtRitual = isRitual ? 10 + (character.pe?.rodada ?? 1) + (character.atributos?.PRE ?? 0) + ritualDtBonus : null;
    const dtAttr = !isRitual ? (parseDtAttr((action as any).teste) ?? parseDtAttr((action as any).descricao)) : null;
    const dtVal = !isRitual && dtAttr ? 10 + (character.pe?.rodada ?? 1) + (character.atributos?.[dtAttr] ?? 0) : null;

    const dtText = isRitual ? `DT ${dtRitual ?? '?'}`
      : (action as any).tipo === 'Ataque' ? `DEF ${character.defesa ?? 10}`
        : dtVal !== null ? `DT ${dtVal}` : '';

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
          relative rounded-xl overflow-hidden transition-all duration-300 cursor-pointer
          border border-white/[0.06] backdrop-blur-sm
          bg-gradient-to-r ${gradientBg || 'from-white/[0.02] to-transparent'}
          ${hoverGlow}
          ${isOpen ? 'ring-1 ring-white/10 shadow-lg' : 'hover:border-white/[0.12]'}
        `}
        onClick={() => toggleCard(cardKey)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

        <div className="relative p-3.5 sm:p-4 flex items-start gap-3">
          {isActionDef && tipoAcao && (
            <div className={`shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center ${badge?.bg} border ${badge?.border}`}>
              <span className={badge?.color}>{TIPO_ICON[tipoAcao]}</span>
            </div>
          )}

          {isRitual && (
            <div className={`shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center bg-purple-500/10 border border-purple-500/20`}>
              <Sparkles size={13} className="text-purple-400" />
            </div>
          )}

          {!isActionDef && !isRitual && (
            <div className="shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
              <Zap size={13} className="text-ordem-text-muted" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white text-[13px] leading-tight">{action.nome}</span>

              {isActionDef && badge && (
                <span className={`inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-[2px] rounded-full ${badge.bg} ${badge.color} border ${badge.border}`}>
                  {badge.label}
                </span>
              )}

              {source && (
                <span className="text-[9px] px-1.5 py-[2px] rounded-full bg-white/5 text-white/40 border border-white/5 uppercase tracking-wider">
                  {source}
                </span>
              )}

              {isRitual && (() => {
                const el = (action as Ritual).elemento;
                const s = ELEMENT_STYLES[el];
                return s ? (
                  <span className={`text-[9px] px-1.5 py-[2px] rounded-full bg-gradient-to-r ${s.gradient} ${s.text} border border-white/5 font-medium`}>
                    {el} {(action as Ritual).circulo}
                  </span>
                ) : null;
              })()}
            </div>
            <p className="text-xs text-white/40 mt-1 line-clamp-1 leading-relaxed">{action.descricao}</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-1">
            {dtText && (
              <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-white/[0.04] text-emerald-400/80 border border-emerald-500/10">
                {dtText}
              </span>
            )}
            {displayCost && (
              <span className={`text-[10px] font-mono px-2 py-1 rounded-lg border ${overLimit ? 'bg-red-500/10 text-red-400/80 border-red-500/10' : 'bg-white/[0.04] text-amber-400/80 border-amber-500/10'}`}>
                {displayCost}
              </span>
            )}
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              className="ml-0.5"
            >
              <ChevronDown size={14} className="text-white/20" />
            </motion.div>
          </div>
        </div>

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
                <div className="mt-3 p-3.5 rounded-lg bg-black/30 backdrop-blur-sm border border-white/[0.04]">
                  <p className="text-[13px] text-white/60 leading-[1.7] whitespace-pre-line">{action.descricao}</p>
                </div>

                {isActionDef && (action as ActionDefinition).requisito && (
                  <div className="p-3 rounded-lg bg-amber-500/[0.06] border border-amber-500/10 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
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
                    <span className="text-xs font-mono text-emerald-400/70 bg-emerald-500/[0.06] px-2.5 py-1 rounded-lg border border-emerald-500/10">
                      {(action as ActionDefinition).pericia}
                    </span>
                  </div>
                )}

                {'teste' in action && (action as any).teste && (
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] text-white/25 uppercase tracking-wider font-medium">Teste</span>
                    <span className="text-xs font-mono text-emerald-400/70 bg-emerald-500/[0.06] px-2.5 py-1 rounded-lg border border-emerald-500/10">
                      {(action as any).teste}
                    </span>
                  </div>
                )}

                {overLimit && (
                  <div className="p-3 rounded-lg bg-red-500/[0.06] border border-red-500/10 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
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
                        <div key={label} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-white/20">{icon}</span>
                            <span className="text-[9px] text-white/25 uppercase tracking-wider font-medium">{label}</span>
                          </div>
                          <span className="text-xs text-white/50">{value}</span>
                        </div>
                      ))}
                    </div>

                    {(action as Ritual).resistencia && (
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-[9px] text-white/25 uppercase tracking-wider font-medium block mb-1">Resistência</span>
                        <span className="text-xs text-white/50">{(action as Ritual).resistencia}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      {[
                        { key: 'padrao', label: 'Padrão', text: (action as Ritual).efeito.padrao, color: 'white/20', labelColor: 'text-white/50' },
                        { key: 'discente', label: 'Discente', text: (action as Ritual).efeito.discente, color: 'amber-400/30', labelColor: 'text-amber-400/70' },
                        { key: 'verdadeiro', label: 'Verdadeiro', text: (action as Ritual).efeito.verdadeiro, color: 'red-400/30', labelColor: 'text-red-400/70' },
                      ].filter(t => t.text).map(tier => (
                        <div key={tier.key} className={`p-3 rounded-lg bg-black/20 border-l-2 border-${tier.color}`}>
                          <span className={`text-[10px] ${tier.labelColor} font-semibold uppercase tracking-widest block mb-1.5`}>{tier.label}</span>
                          <p className="text-xs text-white/45 leading-relaxed">{tier.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {isActionDef && <span className="text-[8px] px-2 py-0.5 rounded-full bg-white/[0.03] text-white/20 border border-white/[0.04]">#{(action as ActionDefinition).tipoAcao.toLowerCase()}</span>}
                  {isActionDef && (action as ActionDefinition).pericia && <span className="text-[8px] px-2 py-0.5 rounded-full bg-white/[0.03] text-white/20 border border-white/[0.04]">#{(action as ActionDefinition).pericia?.toLowerCase()}</span>}
                  {isRitual && <span className="text-[8px] px-2 py-0.5 rounded-full bg-white/[0.03] text-white/20 border border-white/[0.04]">#{(action as Ritual).elemento.toLowerCase()}</span>}
                  {source && <span className="text-[8px] px-2 py-0.5 rounded-full bg-white/[0.03] text-white/20 border border-white/[0.04]">#{source.toLowerCase().replace(/[\s()%]+/g, '-')}</span>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderWeaponCard = (a: any, idx: number) => {
    const cardKey = 'wpn-' + a.nome;
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
          relative rounded-xl overflow-hidden transition-all duration-300 cursor-pointer
          border border-white/[0.06] backdrop-blur-sm
          bg-gradient-to-r from-red-500/[0.06] via-transparent to-transparent
          hover:shadow-[0_0_20px_rgba(239,68,68,0.06)]
          ${isOpen ? 'ring-1 ring-white/10 shadow-lg' : 'hover:border-white/[0.12]'}
        `}
        onClick={() => toggleCard(cardKey)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

        <div className="relative p-3.5 sm:p-4 flex items-start gap-3">
          <div className="shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center bg-red-500/10 border border-red-500/20">
            <Crosshair size={13} className="text-red-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white text-[13px]">{a.nome}</span>
              {a.statsModificados && (
                <span className="text-[9px] px-1.5 py-[2px] rounded-full bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/15 font-medium">
                  +{a.itemOriginal.modificacoes.length} mod
                </span>
              )}
              <span className="text-[9px] px-1.5 py-[2px] rounded-full bg-red-500/10 text-red-400/80 border border-red-500/15 font-medium">
                Ataque
              </span>
            </div>
            <p className="text-xs text-white/40 mt-1 line-clamp-1">{a.descricao.split('\n')[0]}</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-1">
            <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-white/[0.04] text-emerald-400/80 border border-emerald-500/10">
              {a.teste}
            </span>
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronDown size={14} className="text-white/20" />
            </motion.div>
          </div>
        </div>

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
                <div className="mt-3 p-3.5 rounded-lg bg-black/30 border border-white/[0.04]">
                  <p className="text-[13px] text-white/60 leading-[1.7] whitespace-pre-line">{a.descricao}</p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-[10px] text-white/25 uppercase tracking-wider font-medium">Teste</span>
                  <span className="text-xs font-mono text-emerald-400/70 bg-emerald-500/[0.06] px-2.5 py-1 rounded-lg border border-emerald-500/10">
                    {a.teste}
                  </span>
                  {a.ataqueBonus > 0 && (
                    <span className="text-xs font-mono text-amber-400/70 bg-amber-500/[0.06] px-2.5 py-1 rounded-lg border border-amber-500/10">
                      MOD +{a.ataqueBonus}
                    </span>
                  )}
                </div>

                {a.modificacoes && (
                  <div>
                    <span className="text-[9px] text-white/25 uppercase tracking-widest font-medium block mb-2">Modificações</span>
                    <div className="flex flex-wrap gap-1.5">
                      {a.itemOriginal.modificacoes.map((modNome: string) => {
                        const mod = MODIFICACOES_ARMAS.find(m => m.nome === modNome);
                        return (
                          <div key={modNome} className="group/mod relative">
                            <span className="text-[9px] px-2 py-1 bg-amber-500/[0.06] text-amber-400/70 border border-amber-500/10 rounded-lg font-mono cursor-help transition-colors hover:bg-amber-500/10">
                              {modNome}
                            </span>
                            {mod && (
                              <div className="absolute bottom-full left-0 mb-2 hidden group-hover/mod:block z-50 pointer-events-none">
                                <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl max-w-xs">
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

  const activePowers = character.poderes.filter(p => p.custo || p.acao || p.tipo === 'Paranormal');
  const originData = ORIGENS.find(o => o.nome === character.origem);
  const originPower = originData?.poder;
  const classAbilities = CLASS_ABILITIES[character.classe]?.filter(a => a.nex <= character.nex) || [];
  const trackData = TRILHAS.find(t => t.nome === character.trilha);
  const trackAbilities = trackData?.habilidades.filter(h => h.nex <= character.nex) || [];

  const weaponActions = useMemo(() => character.equipamentos
    .filter(item => item.tipo === 'Arma' || (item.stats && (item.stats.dano || item.stats.danoBase)))
    .map(item => {
      const hasMods = item.modificacoes && item.modificacoes.length > 0;
      const stats = hasMods ? calcularStatsModificados(item) : item.stats;
      const alcance = stats?.alcance?.toLowerCase() || '';
      const isMelee = alcance.includes('corpo') || alcance.includes('adjacente') || alcance === '';
      const periciaName = isMelee ? 'Luta' : 'Pontaria';
      const pericia = character.periciasDetalhadas[periciaName];
      const penalidade = getPenalidadesPericia(character, pericia.atributoBase);
      let dados = Math.max(0, pericia.dados + penalidade.dados);
      let bonus = pericia.bonusFixo + pericia.bonusO + penalidade.valor;
      if (stats?.ataqueBonus) bonus += stats.ataqueBonus;
      const sinal = bonus >= 0 ? '+' : '';
      return {
        nome: item.nome, tipo: 'Ataque',
        descricao: `Dano: ${stats?.dano || '-'} | Crítico: ${stats?.critico || '-'} | Alcance: ${stats?.alcance || '-'} ${stats?.tipoDano ? `| ${stats.tipoDano}` : ''}${stats?.automatica ? ' | AUTOMÁTICA' : ''}\n${item.descricao}`,
        pericia: periciaName,
        teste: `${dados}d20 ${sinal}${bonus}${penalidade.dados !== 0 ? ` (${penalidade.dados}d)` : ''}${penalidade.valor !== 0 ? ` (${penalidade.valor})` : ''}`,
        modificacoes: hasMods ? item.modificacoes!.join(', ') : null,
        itemOriginal: item, statsModificados: hasMods, ataqueBonus: stats?.ataqueBonus,
      } as any;
    }), [character.equipamentos, character.periciasDetalhadas]);

  const filteredWeaponActions = weaponActions.filter(matchesQuery);
  const filteredUniversal = UNIVERSAL_ACTIONS.filter(matchesQuery);
  const filteredInv = INVESTIGATION_ACTIONS.filter(matchesQuery);
  const filteredChase = CHASE_ACTIONS.filter(matchesQuery);
  const filteredStealth = STEALTH_ACTIONS.filter(matchesQuery);
  const filteredManeuvers = MANEUVER_ACTIONS.filter(matchesQuery);
  const filteredRituais = character.rituais.filter(matchesQuery);

  const actionsByType = useMemo(() => {
    const groups: Record<TipoAcao, ActionDefinition[]> = { 'Padrão': [], 'Movimento': [], 'Completa': [], 'Livre': [], 'Reação': [] };
    filteredUniversal.forEach(a => groups[a.tipoAcao].push(a));
    return groups;
  }, [filteredUniversal]);

  const SectionHeader = ({ icon, title, count, color }: { icon: React.ReactNode; title: string; count: number; color: string }) => (
    <div className="flex items-center gap-3 mb-4 sticky top-0 z-10 py-2.5 -mx-1 px-1 bg-gradient-to-b from-[#0d0d0d] via-[#0d0d0d]/95 to-transparent backdrop-blur-sm">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${color}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white tracking-wide">{title}</h3>
        <span className="text-[10px] text-white/25 font-mono">{count} {count === 1 ? 'item' : 'itens'}</span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent ml-2" />
    </div>
  );

  const SubHeader = ({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) => (
    <div className="flex items-center gap-2 mb-2 mt-3">
      <span className={color}>{icon}</span>
      <span className={`text-[11px] font-semibold uppercase tracking-widest ${color}`}>{title}</span>
      <div className="flex-1 h-px bg-white/[0.04] ml-2" />
    </div>
  );

  const filterButtons: { key: FilterKey; label: string; icon: React.ReactNode; count: number; color: string; activeGradient: string }[] = [
    { key: 'todos', label: 'Todos', icon: <BookOpen size={12} />, count: 0, color: 'text-white/40', activeGradient: 'from-white/10 to-white/5 border-white/20 text-white' },
    { key: 'universais', label: 'Ações', icon: <Swords size={12} />, count: filteredUniversal.length, color: 'text-red-400/60', activeGradient: 'from-red-500/15 to-red-500/5 border-red-500/30 text-red-300' },
    { key: 'manobras', label: 'Manobras', icon: <Shield size={12} />, count: filteredManeuvers.length, color: 'text-orange-400/60', activeGradient: 'from-orange-500/15 to-orange-500/5 border-orange-500/30 text-orange-300' },
    { key: 'ataques', label: 'Ataques', icon: <Crosshair size={12} />, count: filteredWeaponActions.length, color: 'text-red-400/60', activeGradient: 'from-red-500/15 to-red-500/5 border-red-500/30 text-red-300' },
    { key: 'habilidades', label: 'Habilidades', icon: <Zap size={12} />, count: 0, color: 'text-yellow-400/60', activeGradient: 'from-yellow-500/15 to-yellow-500/5 border-yellow-500/30 text-yellow-300' },
    { key: 'rituais', label: 'Rituais', icon: <Sparkles size={12} />, count: filteredRituais.length, color: 'text-purple-400/60', activeGradient: 'from-purple-500/15 to-purple-500/5 border-purple-500/30 text-purple-300' },
    { key: 'cenarios', label: 'Cenários', icon: <BookOpen size={12} />, count: filteredInv.length + filteredChase.length + filteredStealth.length, color: 'text-cyan-400/60', activeGradient: 'from-cyan-500/15 to-cyan-500/5 border-cyan-500/30 text-cyan-300' },
  ];

  return (
    <div className="h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springTransition}
        className="mb-5 shrink-0 space-y-4"
      >
        <div className="relative group">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/10 via-purple-500/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity -m-px" />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white/40 transition-colors" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar ações, rituais, poderes..."
            className="relative w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-all backdrop-blur-sm"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors text-sm">
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {filterButtons.map(fb => (
            <motion.button
              key={fb.key}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilter(fb.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-200 ${filter === fb.key
                  ? `bg-gradient-to-r ${fb.activeGradient}`
                  : 'bg-white/[0.02] border-white/[0.05] text-white/30 hover:bg-white/[0.04] hover:text-white/50 hover:border-white/[0.08]'
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

        {(filter === 'todos' || filter === 'habilidades') && (
          <section>
            <SectionHeader icon={<Zap size={15} className="text-yellow-400" />} title="Habilidades & Poderes" count={activePowers.length + classAbilities.length + trackAbilities.length + (originPower ? 1 : 0)} color="from-yellow-500/20 to-yellow-500/5 border border-yellow-500/15" />
            <div className="space-y-2">
              {originPower && renderActionCard({ nome: originPower.nome, descricao: originPower.descricao, tipo: 'Origem' } as any, 'Origem', 0)}
              {classAbilities.map((a, i) => renderActionCard({ nome: a.nome, descricao: a.descricao, custo: a.custo, acao: a.acao, tipo: 'Classe' } as any, `Classe ${a.nex}%`, i + 1))}
              {trackAbilities.map((a, i) => renderActionCard({ nome: a.nome, descricao: a.descricao, tipo: 'Trilha' } as any, `Trilha ${a.nex}%`, i + classAbilities.length + 2))}
              {activePowers.map((p, i) => renderActionCard(p, undefined, i + classAbilities.length + trackAbilities.length + 3))}
              {!originPower && classAbilities.length === 0 && trackAbilities.length === 0 && activePowers.length === 0 && (
                <div className="text-center py-12"> <p className="text-sm text-white/20">Nenhuma habilidade ativa registrada.</p> </div>
              )}
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
