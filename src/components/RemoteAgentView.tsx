"use client";

import React, { useMemo, useState } from 'react';
import { AtributoKey, Personagem, PericiaName } from '../core/types';
import { StatusBar } from './StatusBar';
import { ActionsTab } from './ActionsTab';
import { PERICIA_ATRIBUTO } from '../logic/rulesEngine';
import { rollPericia, type DiceRollResult } from '../logic/diceRoller';
import { Backpack, Dices, Footprints, Search, Shield, ShieldAlert, Swords, X, Zap } from 'lucide-react';
import { ActiveConditionsDisplay, ConditionsSummary } from './ConditionBadge';
import { WeaponStatsDisplay } from './WeaponStatsDisplay';
import { CustomDiceRoller } from './CustomDiceRoller';
import { Cantos, Fita, RotuloSecao } from './master/ui/Pecas';

type AbaRemota = 'pericias' | 'acoes' | 'inventario' | 'condicoes';

const ATRIBUTOS: { chave: AtributoKey; nome: string }[] = [
  { chave: 'AGI', nome: 'Agilidade' },
  { chave: 'FOR', nome: 'Força' },
  { chave: 'INT', nome: 'Intelecto' },
  { chave: 'PRE', nome: 'Presença' },
  { chave: 'VIG', nome: 'Vigor' },
];

const GRAU_CURTO: Record<string, string> = { Treinado: 'TRE', Veterano: 'VET', Expert: 'EXP' };
const GRAU_COR: Record<string, string> = {
  Treinado: 'border-ordem-green/40 text-ordem-green',
  Veterano: 'border-ordem-blue/40 text-ordem-blue',
  Expert: 'border-ordem-purple/40 text-ordem-purple',
};

const treinada = (grau?: string) => Boolean(grau && grau !== 'Destreinado');

const semAcento = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

interface RemoteAgentViewProps {
  agent: Personagem;
  connected?: boolean;
  onOpenOverlayMini?: () => void;
  onOpenOverlayFull?: () => void;
}

const BOTAO_FANTASMA = 'flex items-center gap-1.5 border border-white/10 px-3 py-2 font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-secondary transition hover:border-white/30 hover:text-white touch-target-sm';

function Fato({ icone, rotulo, valor }: { icone: React.ReactNode; rotulo: string; valor: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 border border-white/10 bg-white/[0.02] px-3 py-2">
      <span className="shrink-0 text-ordem-text-muted">{icone}</span>
      <div className="min-w-0">
        <RotuloSecao className="block truncate tracking-[0.08em] sm:tracking-[0.22em]">{rotulo}</RotuloSecao>
        <div className="font-display text-xl font-bold leading-none text-white">{valor}</div>
      </div>
    </div>
  );
}

export function RemoteAgentView({
  agent,
  connected = true,
  onOpenOverlayMini,
  onOpenOverlayFull,
}: RemoteAgentViewProps) {
  const [aba, setAba] = useState<AbaRemota>('pericias');
  const [ultimaRolagem, setUltimaRolagem] = useState<{ pericia: PericiaName; result: DiceRollResult } | null>(null);
  const [busca, setBusca] = useState('');
  const [bonusSituacional, setBonusSituacional] = useState(0);
  const [soTreinadas, setSoTreinadas] = useState(false);
  const [expandida, setExpandida] = useState<PericiaName | null>(null);

  const usaPd = agent.usarPd === true;
  const sobrevivente = agent.classe === 'Sobrevivente';
  const rotuloNivel = sobrevivente ? `Estágio ${agent.estagio ?? 1}` : `NEX ${agent.nex}%`;
  const rapidas: PericiaName[] = ['Iniciativa', 'Percepção', 'Reflexos', 'Fortitude', 'Vontade', 'Luta', 'Pontaria', 'Ocultismo'];
  const condicoes = agent.efeitosAtivos ?? [];

  const termo = useMemo(() => semAcento(busca).trim(), [busca]);

  const grupos = useMemo(() => {
    const todas = (Object.entries(agent.periciasDetalhadas) as Array<[PericiaName, Personagem['periciasDetalhadas'][PericiaName]]>)
      .map(([nome, det]) => ({ nome, det, atributo: PERICIA_ATRIBUTO[nome], treinada: treinada(det.grau) }))
      .filter(({ nome, treinada: t }) => (!soTreinadas || t) && (!termo || semAcento(nome).includes(termo)));

    return ATRIBUTOS.map((a) => ({
      ...a,
      valor: agent.atributos[a.chave],
      pericias: todas
        .filter((p) => p.atributo === a.chave)
        .sort((x, y) => (x.treinada !== y.treinada ? (x.treinada ? -1 : 1) : x.nome.localeCompare(y.nome))),
    })).filter((g) => g.pericias.length > 0);
  }, [agent.periciasDetalhadas, agent.atributos, soTreinadas, termo]);

  const totalVisivel = grupos.reduce((n, g) => n + g.pericias.length, 0);

  const rolar = (pericia: PericiaName) => {
    const det = agent.periciasDetalhadas[pericia];
    if (!det) return;
    setUltimaRolagem({ pericia, result: rollPericia({ ...det, bonusFixo: det.bonusFixo + bonusSituacional }) });
  };

  const abas: { id: AbaRemota; rotulo: string; icone: React.ReactNode; badge?: React.ReactNode }[] = [
    { id: 'pericias', rotulo: 'Perícias', icone: <Zap size={15} /> },
    { id: 'acoes', rotulo: 'Ações', icone: <Swords size={15} /> },
    { id: 'inventario', rotulo: 'Inventário', icone: <Backpack size={15} />, badge: <span className="font-mono text-[10px]">{agent.carga.atual}/{agent.carga.maxima}</span> },
    { id: 'condicoes', rotulo: 'Condições', icone: <ShieldAlert size={15} />, badge: condicoes.length > 0 ? <span className="font-mono text-[10px] text-red-400">{condicoes.length}</span> : undefined },
  ];

  const armas = agent.equipamentos.filter((it) => it.tipo === 'Arma' || (it.stats && (it.stats.dano || it.stats.danoBase)));
  const protecoes = agent.equipamentos.filter((it) => !armas.includes(it) && (it.tipo === 'Proteção' || it.stats?.defesa));
  const outros = agent.equipamentos.filter((it) => !armas.includes(it) && !protecoes.includes(it));
  const categoriaRomana = ['0', 'I', 'II', 'III', 'IV'];

  return (
    <div
      data-classe={agent.classe}
      className="min-h-screen overflow-x-clip bg-ordem-black text-white bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:32px_32px]"
    >
      <div className="relative mx-auto w-full max-w-5xl px-3 py-4 sm:px-4 sm:py-6 safe-x safe-top safe-bottom">
        <span aria-hidden className="mestre-aura pointer-events-none absolute inset-x-0 top-0 h-72" />

        <header className="relative border border-white/10 bg-[var(--mestre-superficie,#16161a)]/80 px-3 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-5">
          <Cantos />
          <div className="flex items-start justify-between gap-x-4 gap-y-3 sm:flex-wrap sm:gap-x-6">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <RotuloSecao>Ficha compartilhada</RotuloSecao>
                <span className="flex items-center gap-1.5 font-carimbo text-[10px] uppercase tracking-[0.16em]">
                  <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-ordem-green animate-pulse' : 'bg-ordem-text-muted'}`} />
                  <span className={connected ? 'text-ordem-green' : 'text-ordem-text-muted'}>{connected ? 'ao vivo' : 'offline'}</span>
                </span>
              </div>
              <h1 className="mt-1 break-words font-display text-2xl uppercase leading-none tracking-[0.06em] text-white sm:text-4xl">{agent.nome}</h1>
              <div className="mt-1.5 h-px w-24 bg-[var(--mestre-primary,#DC2626)]" />
              {agent.conceito && <p className="mt-2 max-w-xl text-xs italic text-ordem-text-secondary sm:text-sm">{agent.conceito}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Fita variante="classe">{agent.classe}</Fita>
                <Fita variante="neutra">{rotuloNivel}</Fita>
                {agent.patente && <span className="border border-white/10 px-2.5 py-1 font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-gold">{agent.patente}</span>}
                {agent.origem && <Fita variante="neutra">{agent.origem}</Fita>}
                {agent.trilha && <Fita variante="contorno">{agent.trilha}</Fita>}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-3">
              <div className="text-right">
                <RotuloSecao>Defesa</RotuloSecao>
                <div className="flex items-center justify-end gap-1.5">
                  <Shield size={18} className="text-ordem-text-muted" />
                  <span className="font-display text-2xl font-bold leading-none text-white sm:text-3xl">{agent.defesa}</span>
                </div>
              </div>
              {(onOpenOverlayMini || onOpenOverlayFull) && (
                <div className="hidden flex-wrap justify-end gap-2 sm:flex">
                  {onOpenOverlayMini && <button type="button" onClick={onOpenOverlayMini} className={BOTAO_FANTASMA}>Overlay mini</button>}
                  {onOpenOverlayFull && <button type="button" onClick={onOpenOverlayFull} className={BOTAO_FANTASMA}>Overlay completo</button>}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-x-6 gap-y-3 sm:mt-5 sm:grid-cols-3 sm:gap-y-2">
            <StatusBar label="PV" current={agent.pv.atual} max={agent.pv.max} color="red" onChange={() => undefined} readOnly />
            {usaPd ? (
              <StatusBar label="PD" current={agent.pd?.atual ?? 0} max={agent.pd?.max ?? 0} color="purple" onChange={() => undefined} readOnly />
            ) : (
              <>
                <StatusBar label="SAN" current={agent.san.atual} max={agent.san.max} color="blue" onChange={() => undefined} readOnly />
                <StatusBar label="PE" current={agent.pe.atual} max={agent.pe.max} color="gold" onChange={() => undefined} readOnly />
              </>
            )}
          </div>

          <div className="mt-2 flex gap-2 sm:gap-3">
            {ATRIBUTOS.map(({ chave, nome }) => (
              <div key={chave} title={nome} className="flex flex-1 flex-col items-center border border-white/10 bg-white/[0.02] px-2 py-2.5">
                <span className="font-carimbo text-[9px] uppercase tracking-[0.2em] text-ordem-text-muted">{chave}</span>
                <span className="mt-0.5 font-display text-2xl font-bold leading-none text-white">{agent.atributos[chave]}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Fato icone={<Footprints size={14} />} rotulo="Deslocamento" valor={`${agent.deslocamento}m`} />
            <Fato icone={<Backpack size={14} />} rotulo="Carga" valor={<>{agent.carga.atual}<span className="text-sm text-ordem-text-muted">/{agent.carga.maxima}</span></>} />
            <Fato icone={<Zap size={14} />} rotulo="Limite de PE" valor={agent.pe.rodada ?? '—'} />
            <Fato icone={<ShieldAlert size={14} />} rotulo="Condições" valor={condicoes.length} />
          </div>
        </header>

        <div className="sticky top-[var(--topo-ficha,0px)] z-20 mt-4 border-y border-white/10 bg-ordem-black/95 backdrop-blur">
          <div className="grid grid-cols-4 sm:flex sm:gap-1 sm:px-4" role="tablist">
            {abas.map((a) => {
              const ativa = aba === a.id;
              return (
                <button
                  key={a.id}
                  role="tab"
                  aria-selected={ativa}
                  onClick={() => setAba(a.id)}
                  className={`relative flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2.5 font-carimbo text-[9px] uppercase tracking-[0.06em] transition-colors sm:flex-row sm:gap-1.5 sm:whitespace-nowrap sm:px-3 sm:py-3 sm:text-[11px] sm:tracking-[0.14em] ${ativa ? 'text-[var(--mestre-primary,#DC2626)]' : 'text-ordem-text-muted hover:text-ordem-white-muted'}`}
                >
                  <span className={`relative ${ativa ? 'opacity-100' : 'opacity-60'}`}>
                    {a.icone}
                    {a.badge && <span className="absolute left-full top-0 ml-1 leading-none sm:hidden">{a.badge}</span>}
                  </span>
                  <span className="max-w-full truncate">{a.rotulo}</span>
                  {a.badge && <span className="hidden sm:inline">{a.badge}</span>}
                  {ativa && <span aria-hidden className="absolute inset-x-2 bottom-0 h-[2px] bg-[var(--mestre-primary,#DC2626)] shadow-[0_0_10px_-1px_var(--mestre-glow)]" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border border-t-0 border-white/10 bg-ordem-ooze/50 p-3 sm:p-5">
          {aba === 'pericias' && (
            <div className="space-y-4">
              {ultimaRolagem && (
                <div className="fixed inset-x-3 top-3 z-50 flex items-center gap-4 border border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-superficie,#16161a)] px-4 py-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,1)] sm:left-1/2 sm:right-auto sm:top-6 sm:w-auto sm:min-w-[320px] sm:-translate-x-1/2">
                  <span className="font-display text-4xl font-bold leading-none text-white">{ultimaRolagem.result.total}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{ultimaRolagem.pericia}</p>
                    <p className="truncate font-mono text-[11px] text-ordem-text-secondary">
                      {ultimaRolagem.result.diceCount}d20 [{ultimaRolagem.result.dice.join(', ')}] → {ultimaRolagem.result.chosen} {ultimaRolagem.result.bonusFixo >= 0 ? '+' : ''}{ultimaRolagem.result.bonusFixo}
                    </p>
                  </div>
                  <button type="button" onClick={() => setUltimaRolagem(null)} aria-label="Fechar" className="grid h-8 w-8 shrink-0 place-items-center border border-white/10 text-ordem-text-muted transition hover:text-white">
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="space-y-2 border border-white/10 bg-black/30 p-3">
                <div className="grid gap-2 sm:grid-cols-[1fr_140px]">
                  <label className="flex items-center gap-2 border border-white/10 bg-black/30 px-2.5">
                    <Search size={13} className="shrink-0 text-ordem-text-muted" />
                    <input
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar perícia…"
                      className="w-full bg-transparent py-2 text-sm text-white placeholder:text-ordem-text-muted focus:outline-none"
                    />
                    {busca && (
                      <button type="button" onClick={() => setBusca('')} aria-label="Limpar busca" className="text-ordem-text-muted hover:text-white"><X size={13} /></button>
                    )}
                  </label>
                  <label className="flex items-center gap-2 border border-white/10 bg-black/30 px-2.5">
                    <span className="font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-muted">Bônus</span>
                    <input
                      type="number"
                      value={bonusSituacional}
                      onChange={(e) => setBonusSituacional(Number(e.target.value) || 0)}
                      className="w-full bg-transparent py-2 text-right font-mono text-sm text-white focus:outline-none"
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSoTreinadas((v) => !v)}
                    aria-pressed={soTreinadas}
                    className={`shrink-0 border px-2.5 py-1 font-carimbo text-[10px] uppercase tracking-[0.14em] transition ${soTreinadas ? 'border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)]/15 text-white' : 'border-white/10 text-ordem-text-muted hover:border-white/30 hover:text-white'}`}
                  >
                    Só treinadas
                  </button>
                  <span className="mx-1 h-6 w-px shrink-0 bg-white/10" aria-hidden />
                  {rapidas.filter((s) => agent.periciasDetalhadas[s]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => rolar(s)}
                      className="flex shrink-0 items-center gap-1 border border-white/10 px-2.5 py-1 font-carimbo text-[10px] uppercase tracking-[0.14em] text-ordem-text-secondary transition hover:border-[var(--mestre-primary,#DC2626)]/70 hover:text-white"
                    >
                      <Dices size={11} /> {s}
                    </button>
                  ))}
                </div>
              </div>

              <CustomDiceRoller />

              {totalVisivel === 0 ? (
                <p className="py-8 text-center text-sm italic text-ordem-text-muted">Nenhuma perícia encontrada.</p>
              ) : (
                grupos.map((grupo) => (
                  <section key={grupo.chave}>
                    <div className="mb-2 flex items-baseline gap-2">
                      <span className="font-carimbo text-[10px] uppercase tracking-[0.22em] text-[var(--mestre-primary,#DC2626)]">{grupo.nome}</span>
                      <span className="font-mono text-xs text-white">{grupo.valor}</span>
                      <span className="font-mono text-[10px] text-ordem-text-muted">· {grupo.valor}d20</span>
                      <div className="ml-2 h-px flex-1 bg-white/[0.06]" />
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
                      {grupo.pericias.map(({ nome, det, treinada: t }) => {
                        const aberta = expandida === nome;
                        return (
                          <div
                            key={nome}
                            className={`min-w-0 border transition ${t ? 'border-white/15 bg-white/[0.04]' : 'border-white/[0.06] bg-transparent'} ${aberta ? 'border-[var(--mestre-primary,#DC2626)]/60 lg:col-span-2' : ''}`}
                          >
                            <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                              <button
                                type="button"
                                onClick={() => setExpandida(aberta ? null : nome)}
                                aria-expanded={aberta}
                                className="min-w-0 flex-1 text-left"
                              >
                                <span className={`block truncate text-[13px] leading-tight ${t ? 'font-semibold text-white' : 'text-ordem-text-muted'}`}>{nome}</span>
                                {t && (
                                  <span className={`mt-1 inline-block border px-1 py-px font-carimbo text-[8px] uppercase tracking-[0.12em] ${GRAU_COR[det.grau ?? ''] ?? ''}`}>
                                    {GRAU_CURTO[det.grau ?? ''] ?? det.grau}
                                  </span>
                                )}
                              </button>
                              <span className={`font-mono text-lg font-bold leading-none ${t ? 'text-white' : 'text-ordem-text-muted'}`}>
                                {det.bonusFixo >= 0 ? '+' : ''}{det.bonusFixo}
                              </span>
                              <button
                                type="button"
                                onClick={() => rolar(nome)}
                                title={`Rolar ${nome}`}
                                className="grid h-8 w-8 shrink-0 place-items-center border border-white/10 text-ordem-text-muted transition hover:border-[var(--mestre-primary,#DC2626)] hover:text-white active:scale-95"
                              >
                                <Dices size={14} />
                              </button>
                            </div>
                            {aberta && (
                              <div className="grid grid-cols-3 gap-1 border-t border-white/10 px-2 py-2 text-center font-mono text-[10px]">
                                <div><div className="text-ordem-text-muted">DADOS</div><div className="font-bold text-white">{grupo.valor}d20</div></div>
                                <div><div className="text-ordem-text-muted">GRAU</div><div className="truncate font-bold text-white">{det.grau || 'Destreinado'}</div></div>
                                <div><div className="text-ordem-text-muted">TOTAL</div><div className="font-bold text-white">{det.bonusFixo + bonusSituacional >= 0 ? '+' : ''}{det.bonusFixo + bonusSituacional}</div></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))
              )}
            </div>
          )}

          {aba === 'acoes' && <ActionsTab character={agent} useSanity={!usaPd} />}

          {aba === 'inventario' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <RotuloSecao className="text-[var(--mestre-primary,#DC2626)]">Equipamento</RotuloSecao>
                <span className={`font-mono text-xs ${agent.carga.atual > agent.carga.maxima ? 'text-ordem-red' : 'text-ordem-text-secondary'}`}>
                  {agent.equipamentos.length} item(ns) · carga {agent.carga.atual}/{agent.carga.maxima}
                </span>
              </div>

              {armas.length > 0 && (
                <section>
                  <RotuloSecao>Armas · {armas.length}</RotuloSecao>
                  <div className="mt-2 space-y-2">
                    {armas.map((it, idx) => <WeaponStatsDisplay key={`arma-${it.nome}-${idx}`} item={it} compact={false} showDescription />)}
                  </div>
                </section>
              )}

              {[['Proteções', protecoes], ['Outros itens', outros]].map(([titulo, lista]) => (
                (lista as typeof outros).length > 0 && (
                  <section key={titulo as string}>
                    <RotuloSecao>{titulo as string} · {(lista as typeof outros).length}</RotuloSecao>
                    <ul className="mt-2 divide-y divide-white/[0.06] border border-white/10 bg-white/[0.02]">
                      {(lista as typeof outros).map((it, idx) => (
                        <li key={`${it.nome}-${idx}`} className="px-3 py-2.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">{it.nome}</p>
                              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-ordem-text-muted">
                                <span className="border border-white/10 px-1.5 py-0.5 font-carimbo text-[9px] uppercase tracking-[0.14em] text-ordem-text-secondary">Cat. {categoriaRomana[it.categoria]}</span>
                                <span>{it.tipo} · {it.espaco} espaço{it.espaco === 1 ? '' : 's'}</span>
                              </p>
                            </div>
                            {it.stats?.defesa && <span className="shrink-0 font-mono text-sm font-bold text-ordem-blue">DEF +{it.stats.defesa}</span>}
                          </div>
                          {it.descricao && <p className="mt-1.5 whitespace-pre-line text-xs text-ordem-text-secondary">{it.descricao}</p>}
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              ))}

              {agent.equipamentos.length === 0 && (
                <p className="py-6 text-center text-sm italic text-ordem-text-muted">Inventário vazio.</p>
              )}
            </div>
          )}

          {aba === 'condicoes' && (
            <div className="space-y-4">
              {condicoes.length === 0 ? (
                <p className="py-8 text-center text-sm italic text-ordem-text-muted">Nenhuma condição ativa.</p>
              ) : (
                <>
                  <ActiveConditionsDisplay efeitosAtivos={condicoes} compact />
                  <div className="border border-white/10 bg-white/[0.02] p-3">
                    <RotuloSecao>Penalidades somadas</RotuloSecao>
                    <div className="mt-2"><ConditionsSummary efeitosAtivos={condicoes} /></div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
