"use client";

import { useMemo, useState } from 'react';
import type { FichaPersistida } from '../../core/ficha/tipos';
import {
  nivelAtual,
  nivelAnterior,
  previsao,
  proximoNivel,
  type Previsao,
} from '../../core/ficha/progressao';

export interface NivelPanelProps {
  ficha: FichaPersistida;
  onDefinirNivel: (nivel: number) => Promise<void> | void;
}

const KIND_LEGIVEL: Record<string, string> = {
  trilha: 'escolha de trilha',
  trilhaHabilidade: 'decisão de habilidade de trilha',
  poderClasse: 'poder de classe',
  atributo: 'aumento de atributo',
  pericia: 'grau de treinamento',
  afinidade: 'afinidade paranormal',
  versatilidade: 'versatilidade',
  ritual: 'ritual',
};

function Delta({ rotulo, par }: { rotulo: string; par: [number, number] }) {
  const [antes, depois] = par;
  const diff = depois - antes;
  return (
    <div className="flex justify-between gap-2">
      <span className="text-ordem-text-secondary">{rotulo}</span>
      <span className="text-ordem-text-primary">
        {antes}
        {diff !== 0 && (
          <>
            {' → '}
            <strong className={diff > 0 ? 'text-ordem-green' : 'text-ordem-red'}>{depois}</strong>
            <span className="text-ordem-text-muted"> ({diff > 0 ? '+' : ''}{diff})</span>
          </>
        )}
      </span>
    </div>
  );
}

function Preview({ p, rotuloNivel }: { p: Previsao; rotuloNivel: (n: number) => string }) {
  return (
    <div className="border border-ordem-cyan/50 rounded p-3 space-y-2 text-sm">
      <h4 className="text-xs uppercase tracking-widest text-ordem-cyan">
        {rotuloNivel(p.de)} → {rotuloNivel(p.para)}
      </h4>

      <div className="space-y-1">
        <Delta rotulo="PV máx." par={p.pv} />
        <Delta rotulo="PE máx." par={p.pe} />
        <Delta rotulo="SAN máx." par={p.san} />
        <Delta rotulo="Defesa" par={p.defesa} />
      </div>

      {p.novosPoderes.length > 0 && (
        <div>
          <p className="text-xs text-ordem-text-secondary">Recebe automaticamente:</p>
          <ul className="list-disc pl-4 text-xs text-ordem-green">
            {p.novosPoderes.map((poder) => <li key={poder.nome}>{poder.nome}</li>)}
          </ul>
        </div>
      )}

      {p.novosSlots.length > 0 && (
        <div>
          <p className="text-xs text-ordem-text-secondary">Passa a escolher:</p>
          <ul className="list-disc pl-4 text-xs text-ordem-gold">
            {p.novosSlots.map((slot) => (
              <li key={slot.id}>{KIND_LEGIVEL[slot.kind] ?? slot.kind}</li>
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
        <p className="text-xs text-ordem-text-muted">Este marco não concede habilidade nem escolha nova.</p>
      )}

      {p.problemas.filter((x) => x.gravidade === 'erro').map((x, i) => (
        <p key={`${x.codigo}-${i}`} className="text-xs text-ordem-red">{x.mensagem}</p>
      ))}
    </div>
  );
}

export function NivelPanel({ ficha, onDefinirNivel }: NivelPanelProps) {
  const [ocupado, setOcupado] = useState(false);
  const [confirmandoQueda, setConfirmandoQueda] = useState(false);

  const sobrevivente = ficha.identidade.classe === 'Sobrevivente';
  const rotuloNivel = (n: number) => (sobrevivente ? `Estágio ${n}` : `NEX ${n}%`);

  const atual = nivelAtual(ficha);
  const proximo = useMemo(() => proximoNivel(ficha), [ficha]);
  const anterior = useMemo(() => nivelAnterior(ficha), [ficha]);

  const previsaoSubir = useMemo(
    () => (proximo === null ? null : previsao(ficha, proximo)),
    [ficha, proximo],
  );
  const previsaoDescer = useMemo(
    () => (anterior === null || !confirmandoQueda ? null : previsao(ficha, anterior)),
    [ficha, anterior, confirmandoQueda],
  );

  const aplicar = async (nivel: number) => {
    setOcupado(true);
    try {
      await onDefinirNivel(nivel);
      setConfirmandoQueda(false);
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className="space-y-3">
      <header className="flex items-baseline justify-between gap-2">
        <h3 className="text-xs uppercase tracking-widest text-ordem-cyan">
          Progressão — {rotuloNivel(atual)}
        </h3>
        {proximo === null && (
          <span className="text-[11px] text-ordem-text-muted">no nível máximo</span>
        )}
      </header>

      {previsaoSubir && <Preview p={previsaoSubir} rotuloNivel={rotuloNivel} />}

      <div className="flex flex-wrap gap-2">
        {proximo !== null && (
          <button
            type="button"
            disabled={ocupado}
            onClick={() => aplicar(proximo)}
            className="touch-target px-4 py-2 rounded border border-ordem-green text-ordem-green font-bold hover:bg-ordem-green/10 disabled:opacity-40"
          >
            {ocupado ? 'Aplicando…' : `Avançar para ${rotuloNivel(proximo)}`}
          </button>
        )}

        {anterior !== null && !confirmandoQueda && (
          <button
            type="button"
            onClick={() => setConfirmandoQueda(true)}
            className="touch-target px-3 py-2 rounded border border-ordem-border text-ordem-text-secondary hover:text-ordem-text-primary"
          >
            Rebaixar para {rotuloNivel(anterior)}
          </button>
        )}
      </div>

      {confirmandoQueda && anterior !== null && previsaoDescer && (
        <div className="border border-ordem-gold/60 rounded p-3 space-y-2">
          <p className="text-xs text-ordem-gold">
            Rebaixar não apaga nada. As escolhas acima de {rotuloNivel(anterior)} ficam
            guardadas e voltam se você subir de novo.
          </p>
          <Preview p={previsaoDescer} rotuloNivel={rotuloNivel} />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={ocupado}
              onClick={() => aplicar(anterior)}
              className="touch-target px-3 py-2 rounded border border-ordem-gold text-ordem-gold hover:bg-ordem-gold/10 disabled:opacity-40"
            >
              Confirmar rebaixamento
            </button>
            <button
              type="button"
              onClick={() => setConfirmandoQueda(false)}
              className="touch-target px-3 py-2 rounded border border-ordem-border text-ordem-text-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
