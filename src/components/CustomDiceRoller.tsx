'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Dices, Minus, Plus, RotateCcw } from 'lucide-react';
import {
  rollCustomDice,
  type CustomDiceRollResult,
  type CustomRollMode,
} from '@/logic/diceRoller';

const STORAGE_KEY = 'hiicris-custom-roll-config-v1';
const COUNT_PRESETS = [1, 2, 3, 4];
const SIDE_PRESETS = [4, 6, 8, 10, 12, 20, 100];

interface StoredConfig {
  diceCount: number;
  sides: number;
  mode: CustomRollMode;
  bonus: number;
}

const DEFAULT_CONFIG: StoredConfig = {
  diceCount: 1,
  sides: 20,
  mode: 'sum',
  bonus: 0,
};

function clampInteger(value: number, minimum: number, maximum: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.trunc(value)));
}

function readStoredConfig(): StoredConfig {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
    return {
      diceCount: clampInteger(Number(stored.diceCount), 1, 100, DEFAULT_CONFIG.diceCount),
      sides: clampInteger(Number(stored.sides), 1, 1000, DEFAULT_CONFIG.sides),
      mode: stored.mode === 'highest' ? 'highest' : 'sum',
      bonus: clampInteger(Number(stored.bonus), -9999, 9999, DEFAULT_CONFIG.bonus),
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function CustomDiceRoller() {
  const [expanded, setExpanded] = useState(false);
  const [diceCount, setDiceCount] = useState(DEFAULT_CONFIG.diceCount);
  const [sides, setSides] = useState(DEFAULT_CONFIG.sides);
  const [mode, setMode] = useState<CustomRollMode>(DEFAULT_CONFIG.mode);
  const [bonus, setBonus] = useState(DEFAULT_CONFIG.bonus);
  const [lastRoll, setLastRoll] = useState<CustomDiceRollResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = readStoredConfig();
    setDiceCount(stored.diceCount);
    setSides(stored.sides);
    setMode(stored.mode);
    setBonus(stored.bonus);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ diceCount, sides, mode, bonus }));
  }, [bonus, diceCount, loaded, mode, sides]);

  const updateDiceCount = (value: number) => {
    setDiceCount(clampInteger(value, 1, 100, 1));
    setLastRoll(null);
  };

  const updateSides = (value: number) => {
    setSides(clampInteger(value, 1, 1000, 20));
    setLastRoll(null);
  };

  const updateBonus = (value: number) => {
    setBonus(clampInteger(value, -9999, 9999, 0));
    setLastRoll(null);
  };

  const reset = () => {
    setDiceCount(DEFAULT_CONFIG.diceCount);
    setSides(DEFAULT_CONFIG.sides);
    setMode(DEFAULT_CONFIG.mode);
    setBonus(DEFAULT_CONFIG.bonus);
    setLastRoll(null);
  };

  const roll = () => {
    setLastRoll(rollCustomDice({ diceCount, sides, mode, bonus }));
  };

  const formula = `${diceCount}d${sides}${bonus === 0 ? '' : bonus > 0 ? ` + ${bonus}` : ` - ${Math.abs(bonus)}`}`;

  return (
    <section className="rounded-2xl border border-ordem-gold/25 bg-black/40 shadow-xl backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={expanded}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ordem-gold/30 bg-ordem-gold/10 text-ordem-gold">
            <Dices size={18} />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-bold uppercase tracking-[0.18em] text-zinc-100">
              Rolagem personalizada
            </span>
            <span className="block truncate text-[10px] font-mono text-ordem-text-muted">
              {formula} · {mode === 'sum' ? 'somar dados' : 'pegar o maior'}
            </span>
          </span>
        </span>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {expanded && (
        <div className="space-y-5 border-t border-white/10 p-4">
          <fieldset>
            <legend className="mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-ordem-text-muted">
              Resultado
            </legend>
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-black/45 p-1">
              {([
                ['sum', 'Somar dados'],
                ['highest', 'Maior dado'],
              ] as Array<[CustomRollMode, string]>).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setMode(value);
                    setLastRoll(null);
                  }}
                  className={`min-h-10 rounded-md px-3 text-xs font-bold transition-colors ${
                    mode === value
                      ? 'bg-ordem-gold text-black'
                      : 'text-ordem-text-secondary hover:bg-white/5 hover:text-white'
                  }`}
                  aria-pressed={mode === value}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-ordem-text-muted">
              Número de dados
            </legend>
            <div className="grid grid-cols-[repeat(4,minmax(0,1fr))_96px] gap-2">
              {COUNT_PRESETS.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => updateDiceCount(count)}
                  className={`min-h-10 rounded-lg border text-sm font-bold transition-colors ${
                    diceCount === count
                      ? 'border-ordem-gold bg-ordem-gold/15 text-ordem-gold'
                      : 'border-white/10 bg-black/35 text-zinc-300 hover:border-white/25'
                  }`}
                >
                  {count}
                </button>
              ))}
              <input
                type="number"
                min={1}
                max={100}
                value={diceCount}
                onChange={(event) => updateDiceCount(Number(event.target.value))}
                className="min-w-0 rounded-lg border border-white/10 bg-black/60 px-2 text-center font-mono text-sm text-white outline-none focus:border-ordem-gold"
                aria-label="Quantidade personalizada de dados"
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-ordem-text-muted">
              Tipo de dado
            </legend>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {SIDE_PRESETS.map((sideCount) => (
                <button
                  key={sideCount}
                  type="button"
                  onClick={() => updateSides(sideCount)}
                  className={`min-h-10 rounded-lg border font-mono text-xs font-bold transition-colors ${
                    sides === sideCount
                      ? 'border-ordem-gold bg-ordem-gold/15 text-ordem-gold'
                      : 'border-white/10 bg-black/35 text-zinc-300 hover:border-white/25'
                  }`}
                >
                  d{sideCount}
                </button>
              ))}
              <label className="relative min-w-0">
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 font-mono text-xs text-ordem-text-muted">
                  d
                </span>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={sides}
                  onChange={(event) => updateSides(Number(event.target.value))}
                  className="h-10 w-full min-w-0 rounded-lg border border-white/10 bg-black/60 pl-5 pr-1 text-center font-mono text-xs text-white outline-none focus:border-ordem-gold"
                  aria-label="Número personalizado de faces"
                />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-ordem-text-muted">
              Bônus
            </legend>
            <div className="grid grid-cols-[44px_1fr_44px] gap-2">
              <button
                type="button"
                onClick={() => updateBonus(bonus - 5)}
                className="flex min-h-10 items-center justify-center rounded-lg border border-white/10 bg-black/35 text-zinc-300 hover:border-red-400/40 hover:text-red-300"
                title="Remover 5 do bônus"
              >
                <Minus size={16} />
                <span className="sr-only">Remover 5</span>
              </button>
              <input
                type="number"
                min={-9999}
                max={9999}
                value={bonus}
                onChange={(event) => updateBonus(Number(event.target.value))}
                className="min-w-0 rounded-lg border border-white/10 bg-black/60 px-3 text-center font-mono text-sm text-white outline-none focus:border-ordem-gold"
                aria-label="Bônus da rolagem"
              />
              <button
                type="button"
                onClick={() => updateBonus(bonus + 5)}
                className="flex min-h-10 items-center justify-center rounded-lg border border-white/10 bg-black/35 text-zinc-300 hover:border-green-400/40 hover:text-green-300"
                title="Adicionar 5 ao bônus"
              >
                <Plus size={16} />
                <span className="sr-only">Adicionar 5</span>
              </button>
            </div>
          </fieldset>

          <div className="grid grid-cols-[44px_1fr] gap-2">
            <button
              type="button"
              onClick={reset}
              className="flex min-h-11 items-center justify-center rounded-lg border border-white/10 bg-black/35 text-ordem-text-muted hover:border-white/25 hover:text-white"
              title="Restaurar configuração"
            >
              <RotateCcw size={17} />
            </button>
            <button
              type="button"
              onClick={roll}
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-ordem-gold px-4 text-sm font-black uppercase tracking-[0.15em] text-black transition-colors hover:bg-yellow-300 active:scale-[0.99]"
            >
              <Dices size={18} />
              Rolar {formula}
            </button>
          </div>

          {lastRoll && (
            <div className="border-t border-white/10 pt-4" aria-live="polite">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-ordem-gold/35 bg-ordem-gold/10 text-3xl font-black text-ordem-gold">
                  {lastRoll.total}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-100">
                    {lastRoll.mode === 'sum' ? 'Soma dos dados' : 'Maior dado'}
                    {lastRoll.bonus !== 0 && ` ${lastRoll.bonus > 0 ? '+' : '-'} ${Math.abs(lastRoll.bonus)}`}
                  </div>
                  <div className="mt-1 break-words font-mono text-xs text-ordem-text-secondary">
                    [{lastRoll.dice.join(', ')}] = {lastRoll.baseTotal}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
