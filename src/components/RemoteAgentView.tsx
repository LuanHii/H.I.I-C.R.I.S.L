"use client";

import React, { useMemo, useState } from 'react';
import { Personagem, AtributoKey, PericiaName } from '../core/types';
import { StatusBar } from './StatusBar';
import { ActionsTab } from './ActionsTab';
import { PERICIA_ATRIBUTO } from '../logic/rulesEngine';
import { auditPersonagem, summarizeIssues } from '../core/validation/auditPersonagem';
import { rollPericia, type DiceRollResult } from '../logic/diceRoller';
import { Dices, Package } from 'lucide-react';
import { ActiveConditionsDisplay, ConditionsSummary } from './ConditionBadge';
import { WeaponStatsDisplay } from './WeaponStatsDisplay';

type RemoteTab = 'status' | 'acoes' | 'pericias' | 'inventario';

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

  const usarDeterminacao = agent.usarPd === true;

  const issues = useMemo(() => auditPersonagem(agent), [agent]);
  const summary = useMemo(() => summarizeIssues(issues), [issues]);
  const issueTitle = useMemo(() => {
    if (summary.total === 0) return '';
    const lines = issues.map((i) => `- [${i.severity.toUpperCase()}] ${i.message}`);
    return `Problemas detectados (${summary.errors} erro(s), ${summary.warns} aviso(s)):\\n${lines.join('\\n')}`;
  }, [issues, summary]);

  const periciasPorAtributo = useMemo(() => {
    const grupos: Record<AtributoKey, Array<[PericiaName, Personagem['periciasDetalhadas'][PericiaName]]>> = {
      AGI: [],
      FOR: [],
      INT: [],
      PRE: [],
      VIG: [],
    };
    for (const [nome, det] of Object.entries(agent.periciasDetalhadas) as any) {
      const pericia = nome as PericiaName;
      const attr = PERICIA_ATRIBUTO[pericia];
      grupos[attr].push([pericia, det]);
    }
    (Object.keys(grupos) as AtributoKey[]).forEach((k) => {
      grupos[k].sort((a, b) => a[0].localeCompare(b[0]));
    });
    return grupos;
  }, [agent.periciasDetalhadas]);

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
    <div className="min-h-screen bg-ordem-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6 safe-x safe-top">
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

            <div className="flex items-center gap-2 ml-auto">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-ordem-text-muted'}`} />
              <span className={`text-[10px] sm:text-xs font-mono ${connected ? 'text-green-500' : 'text-ordem-text-secondary'}`}>
                {connected ? 'CONECTADO' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        {summary.total > 0 && (
          <div className="mb-6 bg-ordem-black/40 border border-ordem-border rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
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
              <div className="text-[11px] text-ordem-text-muted font-mono whitespace-nowrap">Este modo é somente leitura.</div>
            </div>
          </div>
        )}

        { }

        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 overflow-x-auto touch-scroll -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 no-select sticky top-0 z-20 bg-ordem-black/80 backdrop-blur pt-2">
          <TabButton id="status" label="STATUS" />
          <TabButton id="acoes" label="AÇÕES" />
          <TabButton id="pericias" label="PERÍCIAS" />
          <TabButton id="inventario" label="INVENTÁRIO" />
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
          <div className="bg-ordem-ooze/30 border border-ordem-border rounded-xl p-4">
            <ActionsTab character={agent} useSanity={!usarDeterminacao} />
          </div>
        )}

        {tab === 'inventario' && (
          <div className="bg-ordem-ooze/30 border border-ordem-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
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
              <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-black/95 text-white rounded-full border border-ordem-gold/50 shadow-[0_10px_40px_rgba(0,0,0,0.8)] px-6 py-3 flex items-center gap-4 animate-in slide-in-from-top-10 fade-in duration-300">
                <div className="text-3xl font-bold bg-gradient-to-br from-yellow-300 to-yellow-600 bg-clip-text text-transparent drop-shadow-md">
                  {lastRoll.result.total}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold uppercase tracking-widest leading-none mb-1 text-zinc-200">{lastRoll.pericia}</span>
                  <span className="text-[10px] text-ordem-text-secondary font-mono leading-none">
                    {lastRoll.result.diceCount}d20 • [{lastRoll.result.dice.join(', ')}] {lastRoll.result.bonusFixo >= 0 ? '+' : ''}{lastRoll.result.bonusFixo}
                  </span>
                </div>
                <button onClick={() => setLastRoll(null)} className="ml-2 w-6 h-6 flex items-center justify-center rounded-full bg-white/10 text-ordem-text-secondary hover:text-white hover:bg-red-500/50 transition-colors pb-0.5">×</button>
              </div>
            )}
            {(Object.keys(periciasPorAtributo) as AtributoKey[]).map((attr) => {
              const skills = periciasPorAtributo[attr];
              if (skills.length === 0) return null;
              return (
                <div key={attr} className="bg-gradient-to-b from-ordem-black/80 to-black/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
                  <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-ordem-text-muted rounded-full mix-blend-screen"></span>
                      <span className="text-sm font-serif tracking-[0.2em] text-white uppercase">{attr}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-ordem-text-secondary">DADOS</span>
                      <span className="text-white font-bold text-base px-2.5 py-0.5 bg-black/60 rounded border border-white/10 shadow-inner">{agent.atributos[attr]}</span>
                    </div>
                  </div>
                  <div className="divide-y divide-white/5">
                    {skills.map(([nome, det]) => (
                      <div key={nome} className="flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 transition-colors group">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm sm:text-base font-bold text-zinc-200 truncate group-hover:text-white transition-colors">{nome}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-mono border ${det.grau === 'Treinado' ? 'border-green-900/50 text-green-400 bg-green-900/10' : det.grau === 'Veterano' ? 'border-blue-900/50 text-blue-400 bg-blue-900/10' : det.grau === 'Expert' ? 'border-purple-900/50 text-purple-400 bg-purple-900/10' : 'border-white/10 text-ordem-text-secondary bg-white/5'}`}>
                              {det.grau || 'Destreinado'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="flex items-center gap-1 text-right">
                            <span className={`text-lg sm:text-xl font-mono font-bold ${det.bonusFixo >= 10 ? 'text-ordem-gold drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 'text-zinc-300'}`}>
                              {det.bonusFixo >= 0 ? '+' : ''}{det.bonusFixo}
                            </span>
                            {det.bonusO !== 0 && (
                              <span className="text-[10px] font-mono text-ordem-text-secondary hidden sm:inline-block ml-1">({det.bonusO > 0 ? '+' : ''}{det.bonusO}O)</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setLastRoll({ pericia: nome, result: rollPericia(det) })}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-black/60 border border-white/10 group-hover:border-ordem-gold/50 group-hover:text-ordem-gold group-hover:shadow-[0_0_15px_rgba(234,179,8,0.15)] group-hover:bg-ordem-gold/5 text-ordem-text-muted transition-all active:scale-95 shrink-0"
                            title="Rolar teste"
                          >
                            <Dices size={20} className="sm:w-6 sm:h-6" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
