"use client";

import React, { useMemo, useState } from 'react';
import { Personagem, PericiaName } from '../core/types';
import { StatusBar } from './StatusBar';
import { ActionsTab } from './ActionsTab';
import { PERICIA_ATRIBUTO } from '../logic/rulesEngine';
import { auditPersonagem, summarizeIssues } from '../core/validation/auditPersonagem';
import { rollPericia, type DiceRollResult } from '../logic/diceRoller';
import { Backpack, Dices, Footprints, Package, Search, Shield, Swords, X } from 'lucide-react';
import { ActiveConditionsDisplay, ConditionsSummary } from './ConditionBadge';
import { WeaponStatsDisplay } from './WeaponStatsDisplay';

type RemoteTab = 'status' | 'acoes' | 'pericias' | 'inventario';

const TRAINED_GRADES = new Set(['Treinado', 'Veterano', 'Expert']);

const isTrainedSkill = (grau?: string) => (grau ? TRAINED_GRADES.has(grau) : false);

const skillGradeLabel = (grau?: string) => {
  if (grau === 'Treinado') return 'T';
  if (grau === 'Veterano') return 'V';
  if (grau === 'Expert') return 'E';
  return '-';
};

interface RemoteAgentViewProps {
  agent: Personagem;
  connected?: boolean;
  onOpenOverlayMini?: () => void;
  onOpenOverlayFull?: () => void;
}

export function RemoteAgentView({
  agent,
  connected = true,
  onOpenOverlayMini,
  onOpenOverlayFull,
}: RemoteAgentViewProps) {
  const [tab, setTab] = useState<RemoteTab>('status');
  const [lastRoll, setLastRoll] = useState<{ pericia: PericiaName; result: DiceRollResult } | null>(null);
  const [skillSearch, setSkillSearch] = useState('');
  const [situationalBonus, setSituationalBonus] = useState(0);
  const [trainedOnly, setTrainedOnly] = useState(false);
  const [expandedSkill, setExpandedSkill] = useState<PericiaName | null>(null);

  const usarDeterminacao = agent.usarPd === true;
  const quickSkills: PericiaName[] = ['Iniciativa', 'Percepção', 'Reflexos', 'Fortitude', 'Vontade', 'Luta', 'Pontaria', 'Ocultismo'];

  const issues = useMemo(() => auditPersonagem(agent), [agent]);
  const summary = useMemo(() => summarizeIssues(issues), [issues]);
  const issueTitle = useMemo(() => {
    if (summary.total === 0) return '';
    const lines = issues.map((i) => `- [${i.severity.toUpperCase()}] ${i.message}`);
    return `Problemas detectados (${summary.errors} erro(s), ${summary.warns} aviso(s)):\\n${lines.join('\\n')}`;
  }, [issues, summary]);

  const normalizedSkillSearch = useMemo(
    () => skillSearch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(),
    [skillSearch],
  );

  const compactSkills = useMemo(() => {
    return (Object.entries(agent.periciasDetalhadas) as Array<[PericiaName, Personagem['periciasDetalhadas'][PericiaName]]>)
      .map(([nome, det]) => ({
        nome,
        det,
        attr: PERICIA_ATRIBUTO[nome],
        trained: isTrainedSkill(det.grau),
      }))
      .filter(({ nome, trained }) => {
        if (trainedOnly && !trained) return false;
        if (!normalizedSkillSearch) return true;
        return nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(normalizedSkillSearch);
      })
      .sort((a, b) => {
        if (a.trained !== b.trained) return a.trained ? -1 : 1;
        if (b.det.bonusFixo !== a.det.bonusFixo) return b.det.bonusFixo - a.det.bonusFixo;
        return a.nome.localeCompare(b.nome);
      });
  }, [agent.periciasDetalhadas, normalizedSkillSearch, trainedOnly]);

  const rollSkill = (pericia: PericiaName) => {
    const det = agent.periciasDetalhadas[pericia];
    if (!det) return;
    setLastRoll({
      pericia,
      result: rollPericia({
        ...det,
        bonusFixo: det.bonusFixo + situationalBonus,
      }),
    });
  };

  const ResourcePill = ({ label, current, max, tone }: { label: string; current: number; max: number; tone: string }) => {
    const percent = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
    return (
      <div className="relative min-w-0 overflow-hidden rounded-lg border border-white/10 bg-black/45 px-3 py-2">
        <div className={`absolute inset-y-0 left-0 ${tone} opacity-20 transition-all`} style={{ width: `${percent}%` }} />
        <div className="relative z-10 text-[10px] font-mono tracking-widest text-ordem-text-muted uppercase">{label}</div>
        <div className="relative z-10 text-lg font-bold text-white leading-tight">
          {current}<span className="text-xs text-ordem-text-muted">/{max}</span>
        </div>
      </div>
    );
  };

  const TabButton = ({ id, label }: { id: RemoteTab; label: string }) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`px-4 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-xs font-mono tracking-widest border rounded-full transition-all touch-target-sm whitespace-nowrap shadow-sm ${tab === id
        ? 'border-ordem-gold bg-ordem-gold/15 text-ordem-gold shadow-[0_0_10px_rgba(234,179,8,0.2)]'
        : 'border-white/10 bg-black/40 text-ordem-white/50 hover:border-white/20 hover:text-white hover:bg-black/60'
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen overflow-x-clip bg-ordem-black text-white bg-[radial-gradient(circle_at_top,rgba(139,0,0,0.18),transparent_34%),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:auto,32px_32px,32px_32px]">
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 safe-x safe-top safe-bottom">
        { }
        <div className="flex flex-col gap-3 sm:gap-4 border-b border-ordem-border pb-4 sm:pb-5 mb-4 sm:mb-6">
          { }
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs font-mono tracking-[0.25em] sm:tracking-[0.35em] text-ordem-text-muted uppercase">Visualização Remota</div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white truncate mt-1 sm:mt-2">{agent.nome}</h1>
            <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
              <span className="text-[10px] sm:text-xs font-mono text-ordem-red border border-ordem-red/30 bg-ordem-red/10 px-2 py-1 rounded">
                {agent.classe}
              </span>
              <span className="text-[10px] sm:text-xs font-mono text-ordem-text-secondary">{agent.nex}% NEX</span>
              {agent.patente && <span className="text-[10px] sm:text-xs font-mono text-ordem-text-muted uppercase">{agent.patente}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <ResourcePill label="PV" current={agent.pv.atual} max={agent.pv.max} tone="bg-red-500" />
            {usarDeterminacao ? (
              <ResourcePill label="PD" current={agent.pd?.atual ?? 0} max={agent.pd?.max ?? 0} tone="bg-violet-500" />
            ) : (
              <>
                <ResourcePill label="PE" current={agent.pe.atual} max={agent.pe.max} tone="bg-yellow-500" />
                <ResourcePill label="SAN" current={agent.san.atual} max={agent.san.max} tone="bg-blue-500" />
              </>
            )}
            <div className="min-w-0 rounded-lg border border-white/10 bg-black/45 px-3 py-2">
              <div className="text-[10px] font-mono tracking-widest text-ordem-text-muted uppercase flex items-center gap-1">
                <Shield size={11} /> DEF
              </div>
              <div className="text-lg font-bold text-white leading-tight">{agent.defesa}</div>
            </div>
          </div>

          { }
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {onOpenOverlayMini && (
              <button
                type="button"
                onClick={onOpenOverlayMini}
                className="px-3 py-2.5 text-[10px] font-mono tracking-[0.15em] sm:tracking-[0.25em] border border-ordem-border-light text-ordem-white-muted hover:border-ordem-text-muted active:bg-ordem-ooze/50 hover:text-white rounded-lg transition touch-target-sm"
              >
                OVERLAY MINI
              </button>
            )}
            {onOpenOverlayFull && (
              <button
                type="button"
                onClick={onOpenOverlayFull}
                className="px-3 py-2.5 text-[10px] font-mono tracking-[0.15em] sm:tracking-[0.25em] border border-ordem-border-light text-ordem-white-muted hover:border-ordem-text-muted active:bg-ordem-ooze/50 hover:text-white rounded-lg transition touch-target-sm"
              >
                OVERLAY FULL
              </button>
            )}

            {summary.total > 0 && (
              <div
                className={`px-2 py-1.5 rounded border text-[10px] font-mono tracking-widest ${summary.errors > 0
                  ? 'border-ordem-red text-ordem-red bg-ordem-red/10'
                  : 'border-ordem-gold text-ordem-gold bg-ordem-gold/10'
                  }`}
                title={issueTitle}
              >
                {summary.errors > 0 ? 'ERRO' : 'AVISO'} {summary.total}
              </div>
            )}

            <div className="flex w-full items-center justify-end gap-2 rounded-full border border-white/5 bg-black/30 px-2 py-1 sm:ml-auto sm:w-auto sm:border-0 sm:bg-transparent sm:p-0">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-ordem-text-muted'}`} />
              <span className={`text-[10px] sm:text-xs font-mono ${connected ? 'text-green-500' : 'text-ordem-text-secondary'}`}>
                {connected ? 'CONECTADO' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        {summary.total > 0 && (
          <div className="mb-6 bg-ordem-black/40 border border-ordem-border rounded-xl p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-xs font-mono tracking-[0.25em] text-ordem-text-muted uppercase mb-2">Avisos da ficha</div>
                <ul className="text-xs text-ordem-white-muted space-y-1 list-disc pl-5">
                  {issues.slice(0, 6).map((i, idx) => (
                    <li key={idx}>
                      <span className={i.severity === 'erro' ? 'text-ordem-red' : 'text-ordem-gold'}>
                        [{i.severity.toUpperCase()}]
                      </span>{' '}
                      {i.message}
                    </li>
                  ))}
                </ul>
                {issues.length > 6 && (
                  <div className="mt-2 text-[11px] text-ordem-text-muted font-mono">
                    +{issues.length - 6} aviso(s) oculto(s) (passe o mouse no badge).
                  </div>
                )}
              </div>
              <div className="text-[11px] text-ordem-text-muted font-mono sm:whitespace-nowrap">Este modo é somente leitura.</div>
            </div>
          </div>
        )}

        { }

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="min-w-0 border border-white/10 bg-black/35 rounded-xl p-3">
            <div className="text-[10px] font-mono tracking-[0.14em] sm:tracking-widest text-ordem-text-muted uppercase flex items-center gap-2">
              <Footprints size={13} /> Deslocamento
            </div>
            <div className="text-xl font-bold mt-1">{agent.deslocamento}m</div>
          </div>
          <div className="min-w-0 border border-white/10 bg-black/35 rounded-xl p-3">
            <div className="text-[10px] font-mono tracking-[0.14em] sm:tracking-widest text-ordem-text-muted uppercase flex items-center gap-2">
              <Backpack size={13} /> Carga
            </div>
            <div className="text-xl font-bold mt-1">{agent.carga.atual}<span className="text-sm text-ordem-text-muted">/{agent.carga.maxima}</span></div>
          </div>
          <div className="min-w-0 border border-white/10 bg-black/35 rounded-xl p-3">
            <div className="text-[10px] font-mono tracking-[0.14em] sm:tracking-widest text-ordem-text-muted uppercase flex items-center gap-2">
              <Swords size={13} /> Armas
            </div>
            <div className="text-xl font-bold mt-1">{agent.equipamentos.filter((it) => it.tipo === 'Arma' || it.stats?.dano || it.stats?.danoBase).length}</div>
          </div>
          <div className="min-w-0 border border-white/10 bg-black/35 rounded-xl p-3">
            <div className="text-[10px] font-mono tracking-[0.14em] sm:tracking-widest text-ordem-text-muted uppercase">Condições</div>
            <div className="text-xl font-bold mt-1">{agent.efeitosAtivos?.length ?? 0}</div>
          </div>
        </div>

        <div className="flex max-w-full gap-2 sm:gap-3 mb-4 sm:mb-6 overflow-x-auto touch-scroll pb-2 no-select sticky top-0 z-20 bg-ordem-black/85 backdrop-blur pt-2">
          <TabButton id="status" label="STATUS" />
          <TabButton id="acoes" label="ACOES" />
          <TabButton id="pericias" label="PERICIAS" />
          <TabButton id="inventario" label="INVENTARIO" />
        </div>

        { }
        {tab === 'status' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-ordem-black/90 to-black/60 border border-white/10 shadow-2xl rounded-3xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

              <div className="flex items-center justify-between mb-8">
                <div className="text-xs font-mono tracking-[0.3em] text-ordem-text-muted uppercase">Recursos Vitais</div>
                <div className="text-xs font-mono text-ordem-text-secondary px-3 py-1 bg-black/50 rounded-full border border-white/5">
                  DEF <span className="text-white font-bold ml-1">{agent.defesa}</span>
                </div>
              </div>

              <div className="space-y-6">
                <StatusBar label="Vida" current={agent.pv.atual} max={agent.pv.max} color="red" onChange={() => { }} readOnly />
                {usarDeterminacao ? (
                  <StatusBar
                    label="Determinação"
                    current={agent.pd?.atual || 0}
                    max={agent.pd?.max || 0}
                    color="purple"
                    onChange={() => { }}
                    readOnly
                  />
                ) : (
                  <>
                    <StatusBar label="Sanidade" current={agent.san.atual} max={agent.san.max} color="blue" onChange={() => { }} readOnly />
                    <StatusBar label="Esforço" current={agent.pe.atual} max={agent.pe.max} color="gold" onChange={() => { }} readOnly />
                  </>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-bl from-ordem-ooze/40 to-black/40 border border-white/5 shadow-xl rounded-3xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-md flex flex-col">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

              <div className="text-xs font-mono tracking-[0.3em] text-ordem-text-muted uppercase mb-6">Resumo Tático</div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:border-white/10 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="text-[10px] font-mono text-ordem-text-muted uppercase tracking-widest mb-1 z-10">Carga</div>
                  <div className="text-2xl font-bold text-white z-10 tracking-tight">
                    {agent.carga.atual}<span className="text-ordem-text-secondary text-lg">/{agent.carga.maxima}</span>
                  </div>
                </div>
                <div className="bg-black/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:border-white/10 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="text-[10px] font-mono text-ordem-text-muted uppercase tracking-widest mb-1 z-10">Deslocamento</div>
                  <div className="text-2xl font-bold text-white z-10 tracking-tight">{agent.deslocamento}m</div>
                </div>
              </div>

              {agent.efeitosAtivos?.length > 0 && (
                <div className="mt-auto bg-red-950/20 border border-red-900/30 rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse drop-shadow-[0_0_5px_rgba(239,68,68,1)]"></div>
                    <div className="text-[10px] font-mono text-red-400 uppercase tracking-[0.2em]">Condições Ativas</div>
                  </div>
                  <ActiveConditionsDisplay efeitosAtivos={agent.efeitosAtivos} compact />
                  <div className="mt-4 pt-4 border-t border-red-900/20">
                    <ConditionsSummary efeitosAtivos={agent.efeitosAtivos} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'acoes' && (
          <div className="bg-ordem-ooze/30 border border-ordem-border rounded-xl p-3 sm:p-4">
            <ActionsTab character={agent} useSanity={!usarDeterminacao} />
          </div>
        )}

        {tab === 'inventario' && (
          <div className="bg-ordem-ooze/30 border border-ordem-border rounded-xl p-3 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="text-xs font-mono tracking-[0.25em] text-ordem-text-muted uppercase flex items-center gap-2">
                <Package size={14} />
                Equipamento
              </div>
              <div className="text-xs font-mono text-ordem-text-muted">
                {agent.equipamentos.length} item(ns) • {agent.carga.atual}/{agent.carga.maxima} espaços
              </div>
            </div>

            {(() => {
              const armas = agent.equipamentos.filter(it => it.tipo === 'Arma' || (it.stats && (it.stats.dano || it.stats.danoBase)));
              const protecoes = agent.equipamentos.filter(it => it.tipo === 'Proteção' || (it.stats && it.stats.defesa));
              const outros = agent.equipamentos.filter(it =>
                !armas.includes(it) && !protecoes.includes(it)
              );

              return (
                <div className="space-y-4">
                  {armas.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono text-ordem-gold uppercase tracking-widest mb-2">
                        Armas ({armas.length})
                      </div>
                      <div className="space-y-2">
                        {armas.map((it, idx) => (
                          <WeaponStatsDisplay
                            key={`arma-${it.nome}-${idx}`}
                            item={it}
                            compact={false}
                            showDescription={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {protecoes.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-2">
                        Proteções ({protecoes.length})
                      </div>
                      <div className="space-y-2">
                        {protecoes.map((it, idx) => (
                          <div key={`prot-${it.nome}-${idx}`} className="bg-ordem-black/30 border border-ordem-border rounded-lg p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-bold text-zinc-100 truncate">{it.nome}</div>
                                <div className="text-[11px] text-ordem-text-muted">
                                  {it.tipo} • Cat {['0', 'I', 'II', 'III', 'IV'][it.categoria]} • {it.espaco} espaço{it.espaco !== 1 ? 's' : ''}
                                </div>
                              </div>
                              {it.stats?.defesa && (
                                <div className="text-sm font-mono font-bold text-blue-400">
                                  DEF +{it.stats.defesa}
                                </div>
                              )}
                            </div>
                            {it.descricao && <div className="text-xs text-ordem-text-secondary mt-2 whitespace-pre-line">{it.descricao}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {outros.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono text-ordem-text-muted uppercase tracking-widest mb-2">
                        Outros Itens ({outros.length})
                      </div>
                      <div className="space-y-2">
                        {outros.map((it, idx) => (
                          <div key={`outro-${it.nome}-${idx}`} className="bg-ordem-black/30 border border-ordem-border rounded-lg p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-bold text-zinc-100 truncate">{it.nome}</div>
                                <div className="text-[11px] text-ordem-text-muted">
                                  {it.tipo} • Cat {['0', 'I', 'II', 'III', 'IV'][it.categoria]} • {it.espaco} espaço{it.espaco !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                            {it.descricao && <div className="text-xs text-ordem-text-secondary mt-2 whitespace-pre-line">{it.descricao}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {agent.equipamentos.length === 0 && (
                    <div className="text-sm text-ordem-text-muted italic text-center py-4">Inventário vazio.</div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {tab === 'pericias' && (
          <div className="space-y-6">
            {lastRoll && (
              <div className="fixed top-16 left-3 right-3 z-50 bg-black/95 text-white rounded-2xl border border-ordem-gold/50 shadow-[0_10px_40px_rgba(0,0,0,0.8)] px-4 py-3 flex items-center gap-3 animate-in slide-in-from-top-10 fade-in duration-300 sm:left-1/2 sm:right-auto sm:top-20 sm:-translate-x-1/2 sm:rounded-full sm:px-6 sm:gap-4">
                <div className="text-3xl font-bold bg-gradient-to-br from-yellow-300 to-yellow-600 bg-clip-text text-transparent drop-shadow-md">
                  {lastRoll.result.total}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-bold uppercase tracking-widest leading-none mb-1 text-zinc-200">{lastRoll.pericia}</span>
                  <span className="truncate text-[10px] text-ordem-text-secondary font-mono leading-none">
                    {lastRoll.result.diceCount}d20 • [{lastRoll.result.dice.join(', ')}] {lastRoll.result.bonusFixo >= 0 ? '+' : ''}{lastRoll.result.bonusFixo}
                  </span>
                </div>
                <button onClick={() => setLastRoll(null)} className="ml-2 w-6 h-6 flex items-center justify-center rounded-full bg-white/10 text-ordem-text-secondary hover:text-white hover:bg-red-500/50 transition-colors pb-0.5">×</button>
              </div>
            )}
            <div className="bg-black/45 border border-white/10 rounded-2xl p-4 space-y-4 sticky top-14 z-20 backdrop-blur">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
                <label className="flex items-center gap-2 border border-white/10 bg-black/50 rounded-xl px-3">
                  <Search size={16} className="text-ordem-text-muted" />
                  <input
                    value={skillSearch}
                    onChange={(event) => setSkillSearch(event.target.value)}
                    placeholder="Buscar pericia..."
                    className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-ordem-text-muted"
                  />
                  {skillSearch && (
                    <button type="button" onClick={() => setSkillSearch('')} className="text-ordem-text-muted hover:text-white">
                      <X size={16} />
                    </button>
                  )}
                </label>
                <label className="flex items-center gap-2 border border-white/10 bg-black/50 rounded-xl px-3">
                  <span className="text-[10px] font-mono tracking-widest text-ordem-text-muted uppercase">Bonus</span>
                  <input
                    type="number"
                    value={situationalBonus}
                    onChange={(event) => setSituationalBonus(Number(event.target.value) || 0)}
                    className="w-full bg-transparent py-3 text-sm font-mono text-right outline-none"
                  />
                </label>
              </div>
              <div className="flex gap-2 overflow-x-auto touch-scroll pb-1">
                <button
                  type="button"
                  onClick={() => setTrainedOnly((value) => !value)}
                  className={`shrink-0 px-3 py-2 rounded-lg border text-[10px] font-mono tracking-widest ${
                    trainedOnly
                      ? 'border-green-400/60 bg-green-500/15 text-green-300 shadow-[0_0_18px_rgba(74,222,128,0.18)]'
                      : 'border-white/10 bg-white/5 text-ordem-text-secondary hover:border-green-400/40 hover:text-green-300'
                  }`}
                >
                  SÓ TREINADAS
                </button>
                {quickSkills.filter((skill) => agent.periciasDetalhadas[skill]).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => rollSkill(skill)}
                    className="shrink-0 px-3 py-2 rounded-lg border border-ordem-gold/30 bg-ordem-gold/10 text-ordem-gold text-[10px] font-mono tracking-widest hover:bg-ordem-gold/20"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/35 p-2 sm:p-3 shadow-xl backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-ordem-text-muted">Matriz compacta</div>
                  <div className="text-[11px] text-ordem-text-secondary">Toque no card para detalhes. Use o dado para rolar.</div>
                </div>
                <div className="shrink-0 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] font-mono text-ordem-text-muted">
                  {compactSkills.length} / {Object.keys(agent.periciasDetalhadas).length}
                </div>
              </div>

              {compactSkills.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-black/35 px-4 py-6 text-center text-xs font-mono uppercase tracking-widest text-ordem-text-muted">
                  Nenhuma perícia encontrada.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2 lg:grid-cols-4">
                  {compactSkills.map(({ nome, det, attr, trained }) => {
                    const expanded = expandedSkill === nome;
                    return (
                      <div
                        key={nome}
                        className={`min-w-0 rounded-xl border transition-all ${
                          trained
                            ? 'border-green-400/30 bg-green-500/[0.07] shadow-[inset_0_0_0_1px_rgba(74,222,128,0.12),0_0_18px_rgba(74,222,128,0.08)]'
                            : 'border-white/8 bg-white/[0.025] opacity-75'
                        } ${expanded ? 'col-span-2 sm:col-span-1 lg:col-span-2 border-ordem-gold/45 bg-ordem-gold/[0.06] opacity-100' : ''}`}
                      >
                        <div className="grid grid-cols-[1fr_auto] gap-1.5 p-2">
                          <button
                            type="button"
                            onClick={() => setExpandedSkill(expanded ? null : nome)}
                            className="min-w-0 text-left"
                            aria-expanded={expanded}
                          >
                            <div className="flex min-w-0 items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${trained ? 'bg-green-300 shadow-[0_0_8px_rgba(134,239,172,0.9)]' : 'bg-white/20'}`} />
                              <span className={`truncate text-[12px] font-bold leading-tight sm:text-[13px] ${trained ? 'text-green-100' : 'text-zinc-300'}`}>
                                {nome}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider">
                              <span className="rounded border border-white/10 bg-black/45 px-1 text-ordem-text-muted">{attr}</span>
                              <span className={`rounded border px-1 ${
                                trained
                                  ? 'border-green-400/35 bg-green-400/10 text-green-300'
                                  : 'border-white/10 bg-white/5 text-ordem-text-muted'
                              }`}>
                                {skillGradeLabel(det.grau)}
                              </span>
                              {det.bonusO !== 0 && (
                                <span className="hidden rounded border border-ordem-gold/20 bg-ordem-gold/10 px-1 text-ordem-gold sm:inline">
                                  {det.bonusO > 0 ? '+' : ''}{det.bonusO}O
                                </span>
                              )}
                            </div>
                          </button>

                          <div className="flex flex-col items-end justify-between gap-1">
                            <span className={`font-mono text-lg font-black leading-none ${det.bonusFixo >= 10 ? 'text-ordem-gold' : trained ? 'text-white' : 'text-zinc-400'}`}>
                              {det.bonusFixo >= 0 ? '+' : ''}{det.bonusFixo}
                            </span>
                            <button
                              type="button"
                              onClick={() => rollSkill(nome)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/55 text-ordem-text-muted transition-all hover:border-ordem-gold/50 hover:text-ordem-gold active:scale-95"
                              title={`Rolar ${nome}`}
                            >
                              <Dices size={16} />
                            </button>
                          </div>
                        </div>

                        {expanded && (
                          <div className="border-t border-white/10 px-2 pb-2 pt-1.5">
                            <div className="grid grid-cols-3 gap-1 text-center font-mono text-[10px]">
                              <div className="rounded-lg bg-black/40 px-1.5 py-1">
                                <div className="text-ordem-text-muted">DADOS</div>
                                <div className="font-bold text-white">{agent.atributos[attr]}d20</div>
                              </div>
                              <div className="rounded-lg bg-black/40 px-1.5 py-1">
                                <div className="text-ordem-text-muted">GRAU</div>
                                <div className="truncate font-bold text-white">{det.grau || 'Destreinado'}</div>
                              </div>
                              <div className="rounded-lg bg-black/40 px-1.5 py-1">
                                <div className="text-ordem-text-muted">TOTAL</div>
                                <div className="font-bold text-white">{det.bonusFixo + situationalBonus >= 0 ? '+' : ''}{det.bonusFixo + situationalBonus}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
