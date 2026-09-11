'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Check, X } from 'lucide-react';
import { Modal, ModalContent, ModalDescription, ModalTitle } from '../ui/Modal';
import type { FichaPersistida, Problema, ValorEscolha } from '../../core/ficha/tipos';
import { nivelAnterior, nivelAtual, previsao, proximoNivel, type Previsao } from '../../core/ficha/progressao';
import { pendenciasResolviveis } from '../../core/ficha/pendencias';
import { PendenciasPanel } from './PendenciasPanel';
import { Cantos, Fita, RotuloSecao } from './ui/Pecas';

export interface NivelModalProps {
  ficha: FichaPersistida;
  aberto: boolean;
  direcao: 'subir' | 'descer';
  etapaInicial?: 'preview' | 'escolhas';
  onFechar: () => void;
  onDefinirNivel: (nivel: number) => Promise<void> | void;
  onResponder: (escolhaId: string, valor: ValorEscolha) => Promise<Problema[]> | void;
  onDesfazer?: (escolhaId: string) => void;
}

const KIND_LEGIVEL: Record<string, string> = {
  trilha: 'trilha',
  trilhaHabilidade: 'decisão de habilidade de trilha',
  poderClasse: 'poder de classe',
  atributo: 'aumento de atributo',
  pericia: 'grau de treinamento',
  afinidade: 'afinidade paranormal',
  versatilidade: 'versatilidade',
  ritual: 'ritual',
  poderParanormal: 'poder paranormal',
  poderDiletante: 'poder de outra classe',
  origem: 'origem de flashback',
  escolhaInterna: 'decisão de poder',
};

function Delta({ rotulo, par, invertido = false }: { rotulo: string; par: [number, number]; invertido?: boolean }) {
  const [antes, depois] = par;
  const diff = depois - antes;
  const melhora = invertido ? diff < 0 : diff > 0;

  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/[0.06] py-2 last:border-0">
      <RotuloSecao>{rotulo}</RotuloSecao>
      <span className="font-mono tabular-nums">
        <span className="text-ordem-text-secondary">{antes}</span>
        {diff !== 0 && (
          <>
            <span className="mx-1.5 text-ordem-text-muted">→</span>
            <span className="text-lg font-bold text-white">{depois}</span>
            <span className={`ml-1.5 text-xs ${melhora ? 'text-ordem-green' : 'text-ordem-red'}`}>
              {diff > 0 ? '+' : ''}{diff}
            </span>
          </>
        )}
      </span>
    </div>
  );
}

function Preview({ p, rotuloNivel }: { p: Previsao; rotuloNivel: (n: number) => string }) {
  const erros = p.problemas.filter((x) => x.gravidade === 'erro');

  return (
    <div className="space-y-5">
      <div>
        <Delta rotulo="Pontos de Vida" par={p.pv} />
        <Delta rotulo="Pontos de Esforço" par={p.pe} />
        <Delta rotulo="Sanidade" par={p.san} />
        <Delta rotulo="Defesa" par={p.defesa} />
      </div>

      {p.novosPoderes.length > 0 && (
        <div>
          <RotuloSecao className="text-ordem-green">Recebe automaticamente</RotuloSecao>
          <ul className="mt-2 space-y-1">
            {p.novosPoderes.map((poder) => (
              <li key={poder.nome} className="flex items-center gap-2 text-sm text-white">
                <Check size={14} className="shrink-0 text-ordem-green" />
                {poder.nome}
              </li>
            ))}
          </ul>
        </div>
      )}

      {p.novosSlots.length > 0 && (
        <div>
          <RotuloSecao className="text-[var(--mestre-primary,#DC2626)]">Passa a escolher</RotuloSecao>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {p.novosSlots.map((slot) => (
              <li key={slot.id}>
                <Fita variante="contorno">{KIND_LEGIVEL[slot.kind] ?? slot.kind}</Fita>
              </li>
            ))}
          </ul>
        </div>
      )}

      {p.reativadas.length > 0 && (
        <p className="text-xs text-ordem-cyan">
          {p.reativadas.length} escolha(s) que estavam guardadas voltam a valer.
        </p>
      )}

      {p.novosPoderes.length === 0 && p.novosSlots.length === 0 && (
        <p className="text-sm text-ordem-text-muted">
          {p.para > p.de ? 'Este marco não concede habilidade nem escolha nova — só os recursos acima.' : 'Nada é apagado. As escolhas acima deste nível ficam guardadas e voltam se você subir de novo.'}
        </p>
      )}

      {erros.map((x, i) => (
        <p key={`${x.codigo}-${i}`} className="border border-ordem-red/40 bg-ordem-red/10 px-3 py-2 text-xs text-ordem-red">
          {x.mensagem}
        </p>
      ))}
    </div>
  );
}

export function NivelModal({ ficha, aberto, direcao, etapaInicial = 'preview', onFechar, onDefinirNivel, onResponder, onDesfazer }: NivelModalProps) {
  const [etapa, setEtapa] = useState<'preview' | 'escolhas'>('preview');
  const [ocupado, setOcupado] = useState(false);

  const sobrevivente = ficha.identidade.classe === 'Sobrevivente';
  const rotuloNivel = (n: number) => (sobrevivente ? `Estágio ${n}` : `NEX ${n}%`);

  const atual = nivelAtual(ficha);
  const alvo = useMemo(
    () => (direcao === 'subir' ? proximoNivel(ficha) : nivelAnterior(ficha)),
    [ficha, direcao],
  );
  const previa = useMemo(() => (alvo === null ? null : previsao(ficha, alvo)), [ficha, alvo]);
  const pendencias = useMemo(() => pendenciasResolviveis(ficha), [ficha]);

  useEffect(() => {
    if (aberto) setEtapa(etapaInicial);
  }, [aberto, direcao, etapaInicial]);

  const confirmar = async () => {
    if (alvo === null) return;
    setOcupado(true);
    try {
      await onDefinirNivel(alvo);
      setEtapa('escolhas');
    } finally {
      setOcupado(false);
    }
  };

  const subindo = direcao === 'subir';
  const Seta = subindo ? ArrowUp : ArrowDown;

  return (
    <Modal open={aberto} onOpenChange={(v) => { if (!v) onFechar(); }}>
      <ModalContent size="lg" showCloseButton={false} className="w-full max-w-2xl border-0 bg-transparent p-0 shadow-none">
        <div
          data-classe={ficha.identidade.classe}
          className="relative max-h-[85vh] overflow-hidden border border-white/10 bg-[var(--mestre-superficie,#16161a)] shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_40px_80px_-30px_rgba(0,0,0,1)]"
        >
          <span aria-hidden className="mestre-aura pointer-events-none absolute inset-x-0 top-0 h-40" />
          <Cantos />

          <header className="relative flex items-start justify-between gap-4 px-6 pt-6">
            <div className="min-w-0">
              <ModalDescription asChild>
                <RotuloSecao>{etapa === 'preview' ? (subindo ? 'Subir de nível' : 'Rebaixar nível') : 'Escolhas do nível'}</RotuloSecao>
              </ModalDescription>
              <ModalTitle className="mt-1 font-display text-2xl uppercase leading-none tracking-[0.06em] text-white sm:text-3xl">
                {ficha.identidade.nome}
              </ModalTitle>
              <div className="mt-3 flex items-center gap-2">
                {etapa === 'preview' ? (
                  <>
                    <Fita variante="neutra">{rotuloNivel(atual)}</Fita>
                    {alvo !== null && (
                      <>
                        <Seta size={14} className="text-[var(--mestre-primary,#DC2626)]" />
                        <Fita variante="classe">{rotuloNivel(alvo)}</Fita>
                      </>
                    )}
                  </>
                ) : (
                  <Fita variante="classe">{rotuloNivel(atual)}</Fita>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onFechar}
              aria-label="Fechar"
              className="grid h-9 w-9 shrink-0 place-items-center border border-white/10 text-ordem-text-muted transition hover:border-white/30 hover:text-white"
            >
              <X size={16} />
            </button>
          </header>

          <div className="relative max-h-[55vh] overflow-y-auto px-6 py-5">
            {etapa === 'preview' && previa && <Preview p={previa} rotuloNivel={rotuloNivel} />}
            {etapa === 'preview' && alvo === null && (
              <p className="text-sm text-ordem-text-muted">
                {subindo ? 'Já está no nível máximo.' : 'Já está no nível mínimo.'}
              </p>
            )}
            {etapa === 'escolhas' && (
              <PendenciasPanel ficha={ficha} onResponder={onResponder} onDesfazer={onDesfazer} />
            )}
          </div>

          <footer className="relative flex items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
            {etapa === 'preview' ? (
              <>
                <span className="text-xs text-ordem-text-muted">
                  {subindo ? 'Nada muda até você confirmar.' : 'As escolhas acima do nível ficam guardadas.'}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onFechar}
                    className="border border-white/10 px-4 py-2 font-carimbo text-[11px] uppercase tracking-[0.16em] text-ordem-text-secondary transition hover:border-white/30 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={alvo === null || ocupado}
                    onClick={confirmar}
                    className="border border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)]/15 px-5 py-2 font-carimbo text-[11px] uppercase tracking-[0.16em] text-white transition hover:bg-[var(--mestre-primary,#DC2626)]/30 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {ocupado ? 'Aplicando…' : alvo === null ? '—' : `Confirmar ${rotuloNivel(alvo)}`}
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="text-xs text-ordem-text-muted">
                  {pendencias.length === 0
                    ? 'Tudo respondido.'
                    : 'Cada resposta é gravada na hora — pode fechar e voltar depois.'}
                </span>
                <button
                  type="button"
                  onClick={onFechar}
                  className={`border px-5 py-2 font-carimbo text-[11px] uppercase tracking-[0.16em] transition ${pendencias.length === 0
                    ? 'border-ordem-green bg-ordem-green/15 text-white hover:bg-ordem-green/25'
                    : 'border-white/10 text-ordem-text-secondary hover:border-white/30 hover:text-white'
                    }`}
                >
                  {pendencias.length === 0 ? 'Concluir' : 'Fechar por agora'}
                </button>
              </>
            )}
          </footer>
        </div>
      </ModalContent>
    </Modal>
  );
}
