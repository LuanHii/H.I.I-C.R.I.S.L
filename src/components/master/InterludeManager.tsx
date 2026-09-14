'use client';

import React, { useMemo, useState } from 'react';
import { Moon, Coffee, Wrench } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Personagem } from '../../core/types';
import type { FichaRegistro } from '../../core/storage/registros';
import {
  CONDICOES_DE_DESCANSO,
  aplicarInterludio,
  recuperacaoDeDescanso,
  type AcaoDeInterludio,
  type CondicaoDeDescanso,
} from '../../core/rules/interludio';
import { Painel, Recurso, RotuloSecao, iniciaisDoNome } from './ui/Pecas';
import { cn } from '@/lib/utils';

export interface InterludeManagerProps {
  fichas: FichaRegistro[];
  onUpdate: (id: string, personagem: Personagem) => void;
}

interface Selecao {
  id: string;
  selecionado: boolean;
  acao?: AcaoDeInterludio;
}

const ACOES: { id: AcaoDeInterludio; rotulo: string; resumo: string; Icone: typeof Moon; tom: string }[] = [
  { id: 'dormir', rotulo: 'Dormir', resumo: 'PV e PE iguais ao limite de PE, conforme a condição.', Icone: Moon, tom: 'text-ordem-blue' },
  { id: 'relaxar', rotulo: 'Relaxar', resumo: 'Sanidade (ou PD) como dormir, +1 por agente relaxando junto.', Icone: Coffee, tom: 'text-ordem-purple' },
  { id: 'manutencao', rotulo: 'Manutenção', resumo: 'Conserta um item quebrado. Não mexe em recursos.', Icone: Wrench, tom: 'text-ordem-gold' },
];

function previa(p: Personagem, acao: AcaoDeInterludio | undefined, condicao: CondicaoDeDescanso, relaxando: number): string | null {
  if (!acao) return null;
  const base = recuperacaoDeDescanso(p.pe.rodada, condicao);
  const usaPd = Boolean(p.usarPd && p.pd);
  if (acao === 'dormir') return usaPd ? `+${base} PV` : `+${base} PV · +${base} PE`;
  if (acao === 'relaxar') return `+${base + relaxando} ${usaPd ? 'PD' : 'SAN'}`;
  return 'itens';
}

export const InterludeManager: React.FC<InterludeManagerProps> = ({ fichas, onUpdate }) => {
  const [selecoes, setSelecoes] = useState<Selecao[]>(() => fichas.map((f) => ({ id: f.id, selecionado: true })));
  const [condicao, setCondicao] = useState<CondicaoDeDescanso>('normal');
  const [relato, setRelato] = useState<string[]>([]);

  const relaxando = useMemo(() => selecoes.filter((s) => s.selecionado && s.acao === 'relaxar').length, [selecoes]);
  const prontos = selecoes.some((s) => s.selecionado && s.acao);

  const alternar = (id: string) =>
    setSelecoes((prev) => prev.map((s) => (s.id === id ? { ...s, selecionado: !s.selecionado } : s)));

  const definirAcao = (acao: AcaoDeInterludio) =>
    setSelecoes((prev) => prev.map((s) => (s.selecionado ? { ...s, acao } : s)));

  const aplicar = () => {
    const linhas: string[] = [];
    for (const sel of selecoes) {
      if (!sel.selecionado || !sel.acao) continue;
      const ficha = fichas.find((f) => f.id === sel.id);
      if (!ficha) continue;
      const r = aplicarInterludio(ficha.personagem, { acao: sel.acao, condicao, quantosRelaxaram: relaxando });
      if (r.personagem !== ficha.personagem) onUpdate(ficha.id, r.personagem);
      linhas.push(r.relato);
    }
    setRelato(linhas);
    setSelecoes((prev) => prev.map((s) => ({ ...s, acao: undefined })));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 font-serif text-xl tracking-wide text-white">
          <Moon className="h-5 w-5 text-ordem-blue" />
          Interlúdio
        </h2>
        <p className="text-sm text-ordem-text-secondary">
          Recuperação entre missões. As contas seguem o livro: dormir recupera o limite de PE em PV e PE, relaxar recupera o mesmo em Sanidade.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-4">
          <Painel cantos className="p-4">
            <RotuloSecao>Condição de descanso</RotuloSecao>
            <div className="mt-3 space-y-1.5">
              {CONDICOES_DE_DESCANSO.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCondicao(c.id)}
                  className={cn(
                    'w-full border px-3 py-2 text-left transition',
                    condicao === c.id
                      ? 'border-[var(--mestre-primary,#DC2626)]/70 bg-white/[0.04]'
                      : 'border-white/10 hover:border-white/25',
                  )}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-carimbo text-[11px] uppercase tracking-[0.16em] text-white">{c.rotulo}</span>
                    <span className="font-mono text-[11px] text-ordem-text-muted">×{c.multiplicador}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-ordem-text-secondary">{c.exemplo}</p>
                </button>
              ))}
            </div>
          </Painel>

          <Painel cantos className="p-4">
            <RotuloSecao>Ação para os selecionados</RotuloSecao>
            <div className="mt-3 space-y-1.5">
              {ACOES.map(({ id, rotulo, resumo, Icone, tom }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => definirAcao(id)}
                  className="group flex w-full items-start gap-3 border border-white/10 px-3 py-2.5 text-left transition hover:border-white/30"
                >
                  <Icone size={16} className={cn('mt-0.5 shrink-0', tom)} />
                  <span>
                    <span className="block font-carimbo text-[11px] uppercase tracking-[0.16em] text-white">{rotulo}</span>
                    <span className="block text-[11px] leading-snug text-ordem-text-secondary">{resumo}</span>
                  </span>
                </button>
              ))}
            </div>
          </Painel>
        </div>

        <Painel cantos className="p-4 md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <RotuloSecao>Agentes no grupo</RotuloSecao>
            <Button size="sm" variant="ghost" onClick={() => setSelecoes((prev) => prev.map((s) => ({ ...s, selecionado: !s.selecionado })))}>
              Inverter seleção
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {selecoes.map((sel) => {
              const ficha = fichas.find((f) => f.id === sel.id);
              if (!ficha) return null;
              const p = ficha.personagem;
              const estimativa = previa(p, sel.acao, condicao, relaxando);

              return (
                <button
                  key={sel.id}
                  type="button"
                  onClick={() => alternar(sel.id)}
                  className={cn(
                    'relative border p-3 text-left transition',
                    sel.selecionado ? 'border-white/25 bg-white/[0.03]' : 'border-white/10 opacity-50',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/15 font-carimbo text-[11px] text-white">
                        {iniciaisDoNome(p.nome)}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">{p.nome}</div>
                        <div className="font-mono text-[10px] text-ordem-text-muted">limite de PE {p.pe.rodada}</div>
                      </div>
                    </div>
                    {sel.acao && (
                      <span className="shrink-0 font-carimbo text-[10px] uppercase tracking-[0.14em] text-[var(--mestre-primary,#DC2626)]">
                        {ACOES.find((a) => a.id === sel.acao)?.rotulo}
                        {estimativa && <span className="ml-1 normal-case tracking-normal text-ordem-text-secondary">{estimativa}</span>}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <Recurso tom="pv" compacto atual={p.pv.atual} max={p.pv.max} segmentos={6} />
                    {p.usarPd && p.pd ? (
                      <Recurso tom="pd" compacto atual={p.pd.atual} max={p.pd.max} segmentos={6} />
                    ) : (
                      <Recurso tom="pe" compacto atual={p.pe.atual} max={p.pe.max} segmentos={6} />
                    )}
                    {!(p.usarPd && p.pd) && <Recurso tom="san" compacto atual={p.san.atual} max={p.san.max} segmentos={6} />}
                  </div>
                </button>
              );
            })}
          </div>

          {fichas.length === 0 && (
            <div className="py-8 text-center text-sm italic text-ordem-text-muted">Nenhuma ficha salva para aplicar interlúdio.</div>
          )}

          {relato.length > 0 && (
            <ul className="mt-4 space-y-1 border-t border-white/[0.06] pt-3 font-mono text-[11px] text-ordem-text-secondary">
              {relato.map((linha, i) => (
                <li key={i}>{linha}</li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex justify-end">
            <Button onClick={aplicar} disabled={!prontos} className="w-full sm:w-auto">
              Aplicar interlúdio
            </Button>
          </div>
        </Painel>
      </div>
    </div>
  );
};
