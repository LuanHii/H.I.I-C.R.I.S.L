'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useOp2FichasStore } from '../estado/useOp2FichasStore';
import { pdAtual, pvAtual } from '../regras/ficha';
import type { FichaOp2 } from '../regras/tipos';
import { FichaOp2View } from './FichaOp2View';
import { SeletorDePresets } from './SeletorDePresets';

const CORES_DO_PERFIL: Record<FichaOp2['perfil']['tipo'], string> = {
  EXECUTOR: 'text-ordem-red',
  ANALISTA: 'text-ordem-blue',
  VIGILANTE: 'text-ordem-green',
};

export const PainelOp2: React.FC = () => {
  const fichas = useOp2FichasStore((estado) => estado.fichas);
  const fichaAtiva = useOp2FichasStore((estado) => estado.fichaAtiva);
  const setFichaAtiva = useOp2FichasStore((estado) => estado.setFichaAtiva);
  const adicionarFicha = useOp2FichasStore((estado) => estado.adicionarFicha);
  const removerFicha = useOp2FichasStore((estado) => estado.removerFicha);
  const sofrerDano = useOp2FichasStore((estado) => estado.sofrerDano);
  const curar = useOp2FichasStore((estado) => estado.curar);
  const gastarPd = useOp2FichasStore((estado) => estado.gastarPd);
  const recuperarPd = useOp2FichasStore((estado) => estado.recuperarPd);
  const ativarHabilidade = useOp2FichasStore((estado) => estado.ativarHabilidade);
  const registrarResultadoDeTeste = useOp2FichasStore((estado) => estado.registrarResultadoDeTeste);
  const encerrarCena = useOp2FichasStore((estado) => estado.encerrarCena);

  const [mostrandoPresets, setMostrandoPresets] = useState(false);

  const selecionada = fichas.find((ficha) => ficha.id === fichaAtiva);

  const importar = (novas: FichaOp2[]) => {
    novas.forEach(adicionarFicha);
    setFichaAtiva(novas[0]?.id ?? null);
    setMostrandoPresets(false);
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ordem-white">Ordem Paranormal 2</h1>
          <p className="text-xs uppercase tracking-wide text-ordem-text-muted">
            Playtest Alpha · sistema isolado, não afeta as fichas do Ordem 1
          </p>
        </div>
        <Button className="ml-auto" onClick={() => setMostrandoPresets((atual) => !atual)}>
          {mostrandoPresets ? 'Fechar' : 'Importar sobreviventes'}
        </Button>
      </header>

      {mostrandoPresets ? <SeletorDePresets onImportar={importar} /> : null}

      {fichas.length === 0 && !mostrandoPresets ? (
        <p className="rounded-lg border border-dashed border-ordem-border bg-ordem-black p-8 text-center text-sm text-ordem-text-muted">
          Nenhuma ficha de Ordem 2 ainda. Importe os sobreviventes da missão para começar.
        </p>
      ) : null}

      {fichas.length > 0 ? (
        <nav className="flex flex-wrap gap-2" aria-label="Fichas de Ordem 2">
          {fichas.map((ficha) => (
            <button
              key={ficha.id}
              type="button"
              onClick={() => setFichaAtiva(ficha.id)}
              aria-pressed={ficha.id === fichaAtiva}
              className={cn(
                'rounded border px-3 py-2 text-left transition-colors',
                ficha.id === fichaAtiva
                  ? 'border-ordem-green bg-ordem-ooze'
                  : 'border-ordem-border bg-ordem-black hover:border-ordem-border-light',
              )}
            >
              <span className="block text-sm font-bold text-ordem-white">{ficha.nome}</span>
              <span
                className={cn(
                  'block text-[0.65rem] uppercase tracking-wide',
                  CORES_DO_PERFIL[ficha.perfil.tipo],
                )}
              >
                {ficha.perfil.tipo}
              </span>
              <span className="mt-0.5 block font-mono text-[0.65rem] text-ordem-text-muted">
                PV {pvAtual(ficha)}/{ficha.pvMax} · PD {pdAtual(ficha)}/{ficha.pdMax}
              </span>
            </button>
          ))}
        </nav>
      ) : null}

      {selecionada ? (
        <>
          <FichaOp2View
            ficha={selecionada}
            onAlterarPv={(delta) =>
              delta < 0 ? sofrerDano(selecionada.id, -delta) : curar(selecionada.id, delta)
            }
            onAlterarPd={(delta) =>
              delta < 0 ? gastarPd(selecionada.id, -delta) : recuperarPd(selecionada.id, delta)
            }
            onResultado={({ habilidadesUsadas, contaComoFalhaParaImpeto }) => {
              habilidadesUsadas.forEach((id) => ativarHabilidade(selecionada.id, id));
              registrarResultadoDeTeste(selecionada.id, { contaComoFalhaParaImpeto });
            }}
          />

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => encerrarCena(selecionada.id)}>
              Encerrar cena
            </Button>
            <Button variant="danger" onClick={() => removerFicha(selecionada.id)}>
              Remover ficha
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
};
