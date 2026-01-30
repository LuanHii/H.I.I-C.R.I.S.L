"use client";

import React, { useMemo, useState } from 'react';
import { Personagem, AtributoKey, PericiaName } from '../core/types';
import { StatusBar } from './StatusBar';
import { ActionsTab } from './ActionsTab';
import { PERICIA_ATRIBUTO } from '../logic/rulesEngine';
import { auditPersonagem, summarizeIssues } from '../core/validation/auditPersonagem';
import { rollPericia, type DiceRollResult } from '../logic/diceRoller';
import { Dices } from 'lucide-react';
import { ActiveConditionsDisplay, ConditionsSummary } from './ConditionBadge';

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
      className={`px-3 sm:px-4 py-2.5 sm:py-2 text-[10px] sm:text-xs font-mono tracking-[0.15em] sm:tracking-[0.25em] border rounded-lg transition touch-target-sm whitespace-nowrap ${tab === id
        ? 'border-ordem-green text-ordem-green bg-ordem-green/10'
        : 'border-ordem-white/15 text-ordem-white/60 hover:border-ordem-white/40 active:border-ordem-white/60 hover:text-ordem-white'
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-ordem-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6 safe-x safe-top">
        {}
        <div className="flex flex-col gap-3 sm:gap-4 border-b border-ordem-border pb-4 sm:pb-5 mb-4 sm:mb-6">
          {}
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

          {}
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

        {}
        <div className="flex gap-2 mb-4 sm:mb-5 overflow-x-auto touch-scroll -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 no-select">
          <TabButton id="status" label="STATUS" />
          <TabButton id="acoes" label="AÇÕES" />
          <TabButton id="pericias" label="PERÍCIAS" />
          <TabButton id="inventario" label="INVENTÁRIO" />
        </div>

        {}
        {tab === 'status' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-ordem-ooze/40 border border-ordem-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-mono tracking-[0.25em] text-ordem-text-muted uppercase">Recursos</div>
                <div className="text-xs font-mono text-ordem-text-secondary">
                  DEF <span className="text-white font-bold">{agent.defesa}</span>
                </div>
              </div>
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

            <div className="bg-ordem-ooze/40 border border-ordem-border rounded-xl p-5">
              <div className="text-xs font-mono tracking-[0.25em] text-ordem-text-muted uppercase mb-4">Resumo</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-ordem-black/30 border border-ordem-border rounded-lg p-3">
                  <div className="text-[10px] font-mono text-ordem-text-muted uppercase tracking-widest">Carga</div>
                  <div className="text-lg font-bold text-white">
                    {agent.carga.atual}/{agent.carga.maxima}
                  </div>
                </div>
                <div className="bg-ordem-black/30 border border-ordem-border rounded-lg p-3">
                  <div className="text-[10px] font-mono text-ordem-text-muted uppercase tracking-widest">Desloc.</div>
                  <div className="text-lg font-bold text-white">{agent.deslocamento}</div>
                </div>
              </div>

              {agent.efeitosAtivos?.length > 0 && (
                <div className="mt-4">
                  <div className="text-[10px] font-mono text-ordem-text-muted uppercase tracking-widest mb-2">Condições Ativas</div>
                  <ActiveConditionsDisplay efeitosAtivos={agent.efeitosAtivos} compact />
                  <div className="mt-3">
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
              <div className="text-xs font-mono tracking-[0.25em] text-ordem-text-muted uppercase">Itens</div>
              <div className="text-xs font-mono text-ordem-text-muted">{agent.equipamentos.length} item(ns)</div>
            </div>
            <div className="space-y-2">
              {agent.equipamentos.map((it, idx) => (
                <div key={`${it.nome}-${idx}`} className="bg-ordem-black/30 border border-ordem-border rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-zinc-100 truncate">{it.nome}</div>
                      <div className="text-[11px] text-ordem-text-muted">
                        {it.tipo} • Cat {it.categoria} • {it.espaco} espaço
                      </div>
                    </div>
                  </div>
                  {it.descricao && <div className="text-xs text-ordem-text-secondary mt-2 whitespace-pre-line">{it.descricao}</div>}
                </div>
              ))}
              {agent.equipamentos.length === 0 && <div className="text-sm text-ordem-text-muted italic">Inventário vazio.</div>}
            </div>
          </div>
        )}

        {tab === 'pericias' && (
          <div className="space-y-6">
            {lastRoll && (
              <div className="bg-ordem-ooze/30 border border-ordem-border rounded-xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-mono tracking-[0.25em] text-ordem-text-muted uppercase">
                    Última rolagem: <span className="text-white tracking-normal font-bold">{lastRoll.pericia}</span>
                  </div>
                  <div className="text-xs font-mono text-ordem-text-secondary">
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
            {(Object.keys(periciasPorAtributo) as AtributoKey[]).map((attr) => (
              <div key={attr} className="bg-ordem-ooze/30 border border-ordem-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-mono tracking-[0.25em] text-ordem-text-muted uppercase">{attr}</div>
                  <div className="text-xs font-mono text-ordem-text-secondary">
                    Valor: <span className="text-white font-bold">{agent.atributos[attr]}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {periciasPorAtributo[attr].map(([nome, det]) => (
                    <div key={nome} className="bg-ordem-black/30 border border-ordem-border rounded-lg p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm text-ordem-white truncate">{nome}</div>
                        <div className="text-[10px] font-mono text-ordem-text-muted uppercase tracking-widest">
                          {det.dados}d20 • {det.grau}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setLastRoll({ pericia: nome, result: rollPericia(det) })}
                          className="p-2 rounded border border-ordem-border bg-ordem-black/20 text-ordem-white-muted hover:border-ordem-text-muted hover:text-white transition-colors"
                          title="Rolar teste"
                        >
                          <Dices size={16} />
                        </button>
                        <div className="text-lg font-mono font-bold text-white">
                          {det.bonusFixo >= 0 ? '+' : ''}
                          {det.bonusFixo}
                          {det.bonusO !== 0 && (
                            <span className="text-xs text-ordem-text-muted ml-1">{det.bonusO > 0 ? `(+${det.bonusO}O)` : `(${det.bonusO}O)`}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

