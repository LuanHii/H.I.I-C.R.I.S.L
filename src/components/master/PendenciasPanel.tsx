"use client";

import { useMemo, useState } from 'react';
import type { FichaPersistida, Problema, Slot, ValorEscolha } from '../../core/ficha/tipos';
import type { Opcao } from '../../core/ficha/opcoes';
import { pendenciasResolviveis } from '../../core/ficha/pendencias';

export interface PendenciasPanelProps {
  ficha: FichaPersistida;
  onResponder: (escolhaId: string, valor: ValorEscolha) => Promise<Problema[]> | void;
  onDesfazer?: (escolhaId: string) => void;
  mostrarRespondidas?: boolean;
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

function ListaDeOpcoes({
  opcoes,
  busca,
  aoEscolher,
  desabilitado,
}: {
  opcoes: Opcao[];
  busca: string;
  aoEscolher: (o: Opcao) => void;
  desabilitado: boolean;
}) {
  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return opcoes;
    return opcoes.filter((o) => o.rotulo.toLowerCase().includes(termo));
  }, [opcoes, busca]);

  const ordenadas = useMemo(
    () => [...filtradas].sort((a, b) => Number(b.elegivel) - Number(a.elegivel)),
    [filtradas],
  );

  if (ordenadas.length === 0) {
    return <p className="text-xs text-ordem-text-muted py-2">Nenhuma opção corresponde à busca.</p>;
  }

  return (
    <ul className="space-y-1 max-h-64 overflow-y-auto pr-1">
      {ordenadas.map((opcao) => (
        <li key={opcao.rotulo}>
          <button
            type="button"
            disabled={!opcao.elegivel || desabilitado}
            onClick={() => aoEscolher(opcao)}
            className={`touch-target w-full text-left px-2 py-1.5 rounded border text-sm transition-colors ${
              opcao.elegivel
                ? 'border-ordem-border text-ordem-text-primary hover:border-ordem-cyan hover:text-ordem-cyan'
                : 'border-ordem-border/40 text-ordem-text-muted cursor-not-allowed'
            }`}
          >
            <span className={opcao.elegivel ? '' : 'line-through'}>{opcao.rotulo}</span>
            {!opcao.elegivel && opcao.motivos.length > 0 && (
              <span className="block text-[11px] text-ordem-red mt-0.5">{opcao.motivos.join('; ')}</span>
            )}
            {opcao.indeterminados.length > 0 && (
              <span className="block text-[11px] text-ordem-gold mt-0.5">
                Não deu para verificar: {opcao.indeterminados.join('; ')}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function PendenciasPanel({ ficha, onResponder, onDesfazer }: PendenciasPanelProps) {
  const [buscaPorSlot, setBuscaPorSlot] = useState<Record<string, string>>({});
  const [selecaoMultipla, setSelecaoMultipla] = useState<Record<string, string[]>>({});
  const [problemas, setProblemas] = useState<Record<string, Problema[]>>({});
  const [ocupado, setOcupado] = useState<string | null>(null);

  const pendencias = useMemo(() => pendenciasResolviveis(ficha), [ficha]);

  if (pendencias.length === 0) {
    return (
      <div className="border border-ordem-green/50 rounded p-3 text-sm text-ordem-green">
        Nenhuma pendência: todas as obrigações deste nível estão respondidas.
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
    <div className="space-y-3">
      <header className="flex items-baseline justify-between gap-2">
        <h3 className="text-xs uppercase tracking-widest text-ordem-gold">
          {pendencias.length} pendência(s)
        </h3>
        <span className="text-[11px] text-ordem-text-muted">
          Em ordem de nível — responder um marco muda o que fica disponível nos seguintes.
        </span>
      </header>

      {pendencias.map(({ slot, opcoes, quantidade }) => {
        const busca = buscaPorSlot[slot.id] ?? '';
        const selecionadas = selecaoMultipla[slot.id] ?? [];
        const meusProblemas = problemas[slot.id] ?? [];
        const multi = quantidade > 1;

        return (
          <section key={slot.id} className="border border-ordem-border rounded p-3 space-y-2">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <h4 className="text-sm text-ordem-text-primary font-bold">
                {tituloDoSlot(slot)}
                {multi && <span className="font-normal text-ordem-text-secondary"> — escolha {quantidade}</span>}
              </h4>
              <span className="text-[11px] text-ordem-cyan">{rotuloDoNivel(slot)}</span>
            </div>
            <p className="text-[11px] text-ordem-text-muted">{slot.rotulo}</p>

            {opcoes.length > 8 && (
              <input
                type="text"
                value={busca}
                onChange={(e) => setBuscaPorSlot((b) => ({ ...b, [slot.id]: e.target.value }))}
                placeholder="Filtrar…"
                className="w-full bg-ordem-black-deep border border-ordem-border rounded px-2 py-1 text-sm text-ordem-text-primary"
              />
            )}

            {multi ? (
              <>
                <ul className="space-y-1 max-h-64 overflow-y-auto pr-1">
                  {opcoes
                    .filter((o) => !busca || o.rotulo.toLowerCase().includes(busca.toLowerCase()))
                    .sort((a, b) => Number(b.elegivel) - Number(a.elegivel))
                    .map((opcao) => {
                      const nome = (opcao.valor as { pericias?: string[] }).pericias?.[0] ?? opcao.rotulo;
                      const marcada = selecionadas.includes(nome);
                      const cheio = selecionadas.length >= quantidade && !marcada;
                      return (
                        <li key={opcao.rotulo}>
                          <button
                            type="button"
                            disabled={!opcao.elegivel || cheio}
                            onClick={() => setSelecaoMultipla((s) => ({
                              ...s,
                              [slot.id]: marcada
                                ? selecionadas.filter((x) => x !== nome)
                                : [...selecionadas, nome],
                            }))}
                            className={`touch-target w-full text-left px-2 py-1.5 rounded border text-sm ${
                              marcada
                                ? 'border-ordem-cyan text-ordem-cyan'
                                : opcao.elegivel && !cheio
                                  ? 'border-ordem-border text-ordem-text-primary hover:border-ordem-cyan'
                                  : 'border-ordem-border/40 text-ordem-text-muted cursor-not-allowed'
                            }`}
                          >
                            {marcada ? '☑ ' : '☐ '}{opcao.rotulo}
                            {!opcao.elegivel && opcao.motivos.length > 0 && (
                              <span className="block text-[11px] text-ordem-red mt-0.5">{opcao.motivos.join('; ')}</span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                </ul>
                <button
                  type="button"
                  disabled={selecionadas.length !== quantidade || ocupado === slot.id}
                  onClick={() => responder(slot.id, { tipo: 'pericias', pericias: selecionadas as never })}
                  className="touch-target px-3 py-1.5 rounded border border-ordem-green text-ordem-green text-sm disabled:opacity-40"
                >
                  Confirmar {selecionadas.length}/{quantidade}
                </button>
              </>
            ) : (
              <ListaDeOpcoes
                opcoes={opcoes}
                busca={busca}
                desabilitado={ocupado === slot.id}
                aoEscolher={(o) => responder(slot.id, o.valor)}
              />
            )}

            {meusProblemas.length > 0 && (
              <div className="text-xs space-y-1">
                {meusProblemas.map((p, i) => (
                  <p key={`${p.codigo}-${i}`} className={p.gravidade === 'erro' ? 'text-ordem-red' : 'text-ordem-gold'}>
                    {p.mensagem}
                  </p>
                ))}
              </div>
            )}

            {onDesfazer && (
              <button
                type="button"
                onClick={() => onDesfazer(slot.id)}
                className="touch-target text-[11px] underline text-ordem-text-muted hover:text-ordem-text-primary"
              >
                Limpar resposta deste marco
              </button>
            )}
          </section>
        );
      })}
    </div>
  );
}
