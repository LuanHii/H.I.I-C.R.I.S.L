"use client";

import { useMemo, useState } from 'react';
import { Check, Search } from 'lucide-react';
import type { FichaPersistida, Problema, Slot, ValorEscolha } from '../../core/ficha/tipos';
import type { Opcao } from '../../core/ficha/opcoes';
import { pendenciasResolviveis } from '../../core/ficha/pendencias';
import { PODERES } from '../../data/character/powers';
import { TRILHAS } from '../../data/character/tracks';
import { RITUAIS } from '../../data/magic/rituals';
import { ORIGENS } from '../../data/character/origins';
import { Fita, RotuloSecao } from './ui/Pecas';

export interface PendenciasPanelProps {
  ficha: FichaPersistida;
  onResponder: (escolhaId: string, valor: ValorEscolha) => Promise<Problema[]> | void;
  onDesfazer?: (escolhaId: string) => void;
}

const TITULO: Record<string, string> = {
  trilha: 'Escolha de trilha',
  trilhaHabilidade: 'Decisão da habilidade de trilha',
  poderClasse: 'Poder de classe',
  atributo: 'Aumento de atributo',
  pericia: 'Grau de treinamento',
  afinidade: 'Afinidade paranormal',
  versatilidade: 'Versatilidade',
  ritual: 'Ritual',
  poderParanormal: 'Poder paranormal (Transcender)',
  poderDiletante: 'Poder de outra classe (Especialista Diletante)',
  origem: 'Origem (Flashback)',
  escolhaInterna: 'Decisão do poder',
};

function tituloDoSlot(slot: Slot): string {
  const base = TITULO[slot.kind] ?? slot.kind;
  return slot.poderPai ? `${slot.poderPai}: escolha` : base;
}

function rotuloDoNivel(slot: Slot): string {
  return slot.chaveNivel.startsWith('est:') ? `Estágio ${slot.nivel}` : `NEX ${slot.nivel}%`;
}

function descricaoDaOpcao(opcao: Opcao): string | undefined {
  const v = opcao.valor;
  switch (v.tipo) {
    case 'poder':
      return PODERES.find((p) => p.nome === v.poder)?.descricao;
    case 'trilha':
    case 'versatilidade':
      return TRILHAS.find((t) => t.nome === v.trilha)?.descricao;
    case 'ritual': {
      const r = RITUAIS.find((x) => x.nome === v.ritual);
      return r ? `${r.circulo}º círculo · ${r.elemento} — ${r.descricao}` : undefined;
    }
    case 'origem': {
      const o = ORIGENS.find((x) => x.nome === v.origem);
      return o ? `${o.pericias.join(', ')} · ${o.poder.nome}` : undefined;
    }
    default:
      return undefined;
  }
}

function CartaoDeOpcao({
  opcao,
  marcada,
  desabilitada,
  aoClicar,
  multi,
}: {
  opcao: Opcao;
  marcada?: boolean;
  desabilitada: boolean;
  aoClicar: () => void;
  multi?: boolean;
}) {
  const descricao = descricaoDaOpcao(opcao);
  const bloqueada = !opcao.elegivel;

  return (
    <button
      type="button"
      disabled={bloqueada || desabilitada}
      onClick={aoClicar}
      aria-pressed={multi ? Boolean(marcada) : undefined}
      className={`group relative w-full border px-3 py-2.5 text-left transition ${marcada
        ? 'border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)]/10'
        : bloqueada
          ? 'cursor-not-allowed border-white/[0.06] bg-transparent opacity-60'
          : 'border-white/10 bg-white/[0.02] hover:border-[var(--mestre-primary,#DC2626)]/70 hover:bg-white/[0.04]'
        }`}
    >
      <span className="flex items-start justify-between gap-2">
        <span className={`text-sm font-semibold ${bloqueada ? 'text-ordem-text-muted line-through' : 'text-white'}`}>
          {opcao.rotulo}
        </span>
        {multi && (
          <span
            aria-hidden
            className={`grid h-4 w-4 shrink-0 place-items-center border ${marcada
              ? 'border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)] text-black'
              : 'border-white/20'
              }`}
          >
            {marcada && <Check size={11} />}
          </span>
        )}
      </span>
      {descricao && !bloqueada && (
        <span className="mt-1 line-clamp-2 text-[12px] leading-snug text-ordem-text-secondary group-hover:line-clamp-none">
          {descricao}
        </span>
      )}
      {bloqueada && opcao.motivos.length > 0 && (
        <span className="mt-1 block text-[11px] text-ordem-red">{opcao.motivos.join('; ')}</span>
      )}
      {opcao.indeterminados.length > 0 && (
        <span className="mt-1 block text-[11px] text-ordem-gold">
          Não deu para verificar: {opcao.indeterminados.join('; ')}
        </span>
      )}
    </button>
  );
}

function filtrarEOrdenar(opcoes: Opcao[], busca: string): Opcao[] {
  const termo = busca.trim().toLowerCase();
  const filtradas = termo ? opcoes.filter((o) => o.rotulo.toLowerCase().includes(termo)) : opcoes;
  return [...filtradas].sort((a, b) => Number(b.elegivel) - Number(a.elegivel));
}

export function PendenciasPanel({ ficha, onResponder }: PendenciasPanelProps) {
  const [buscaPorSlot, setBuscaPorSlot] = useState<Record<string, string>>({});
  const [selecaoMultipla, setSelecaoMultipla] = useState<Record<string, string[]>>({});
  const [problemas, setProblemas] = useState<Record<string, Problema[]>>({});
  const [ocupado, setOcupado] = useState<string | null>(null);

  const pendencias = useMemo(() => pendenciasResolviveis(ficha), [ficha]);

  if (pendencias.length === 0) {
    return (
      <div className="flex items-center gap-2 border border-ordem-green/40 bg-ordem-green/10 px-3 py-2.5 text-sm text-ordem-green">
        <Check size={14} aria-hidden />
        Nenhuma pendência — todas as obrigações deste nível estão respondidas.
      </div>
    );
  }

  const responder = async (slotId: string, valor: ValorEscolha) => {
    setOcupado(slotId);
    try {
      const resultado = await onResponder(slotId, valor);
      setProblemas((p) => ({ ...p, [slotId]: resultado ?? [] }));
    } finally {
      setOcupado(null);
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <RotuloSecao className="text-[var(--mestre-primary,#DC2626)]">
          {pendencias.length} {pendencias.length === 1 ? 'escolha pendente' : 'escolhas pendentes'}
        </RotuloSecao>
        <span className="text-[11px] text-ordem-text-muted">
          em ordem de nível — responder um marco muda o que os seguintes oferecem
        </span>
      </header>

      {pendencias.map(({ slot, opcoes, quantidade }) => {
        const busca = buscaPorSlot[slot.id] ?? '';
        const selecionadas = selecaoMultipla[slot.id] ?? [];
        const meusProblemas = problemas[slot.id] ?? [];
        const multi = quantidade > 1;
        const visiveis = filtrarEOrdenar(opcoes, busca);
        const ocupadoAqui = ocupado === slot.id;

        return (
          <section key={slot.id} className="border border-white/10 bg-white/[0.02] p-3 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] sm:p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="text-sm font-bold text-white">
                {tituloDoSlot(slot)}
                {multi && <span className="font-normal text-ordem-text-secondary"> — escolha {quantidade}</span>}
              </h4>
              <Fita variante="neutra">{rotuloDoNivel(slot)}</Fita>
            </div>
            <p className="mt-0.5 text-[11px] text-ordem-text-muted">{slot.rotulo}</p>

            {opcoes.length > 8 && (
              <label className="mt-3 flex items-center gap-2 border border-white/10 bg-black/30 px-2.5">
                <Search size={13} className="shrink-0 text-ordem-text-muted" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBuscaPorSlot((b) => ({ ...b, [slot.id]: e.target.value }))}
                  placeholder="Filtrar…"
                  className="w-full bg-transparent py-1.5 text-sm text-white placeholder:text-ordem-text-muted focus:outline-none"
                />
              </label>
            )}

            {visiveis.length === 0 ? (
              <p className="mt-3 text-xs text-ordem-text-muted">Nenhuma opção corresponde à busca.</p>
            ) : (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {visiveis.map((opcao) => {
                  const nome = (opcao.valor as { pericias?: string[] }).pericias?.[0] ?? opcao.rotulo;
                  const marcada = multi && selecionadas.includes(nome);
                  const cheio = multi && selecionadas.length >= quantidade && !marcada;
                  return (
                    <li key={opcao.rotulo}>
                      <CartaoDeOpcao
                        opcao={opcao}
                        multi={multi}
                        marcada={marcada}
                        desabilitada={ocupadoAqui || cheio}
                        aoClicar={() => {
                          if (!multi) {
                            responder(slot.id, opcao.valor);
                            return;
                          }
                          setSelecaoMultipla((s) => ({
                            ...s,
                            [slot.id]: marcada ? selecionadas.filter((x) => x !== nome) : [...selecionadas, nome],
                          }));
                        }}
                      />
                    </li>
                  );
                })}
              </ul>
            )}

            {multi && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-[11px] text-ordem-text-muted">{selecionadas.length} de {quantidade} marcada{selecionadas.length === 1 ? '' : 's'}</span>
                <button
                  type="button"
                  disabled={selecionadas.length !== quantidade || ocupadoAqui}
                  onClick={() => responder(slot.id, { tipo: 'pericias', pericias: selecionadas as never })}
                  className="border border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)]/15 px-4 py-1.5 font-carimbo text-[10px] uppercase tracking-[0.16em] text-white transition hover:bg-[var(--mestre-primary,#DC2626)]/30 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {ocupadoAqui ? 'Gravando…' : `Confirmar ${selecionadas.length}/${quantidade}`}
                </button>
              </div>
            )}

            {meusProblemas.length > 0 && (
              <div className="mt-3 space-y-1 text-xs">
                {meusProblemas.map((p, i) => (
                  <p key={`${p.codigo}-${i}`} className={p.gravidade === 'erro' ? 'text-ordem-red' : 'text-ordem-gold'}>
                    {p.mensagem}
                  </p>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
