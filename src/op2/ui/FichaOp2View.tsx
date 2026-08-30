'use client';

import React, { useState } from 'react';
import { Modal, ModalContent } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { habilidadePorId, temEfeitoEmRuntime } from '../regras/habilidades';
import { ROTULO_ATRIBUTO, type FichaOp2, type RefPericia } from '../regras/tipos';
import { GradePericias } from './GradePericias';
import { PainelRecursos } from './PainelRecursos';
import { TesteRapido } from './TesteRapido';

const CORES_DO_PERFIL: Record<FichaOp2['perfil']['tipo'], string> = {
  EXECUTOR: 'bg-ordem-red text-ordem-white',
  ANALISTA: 'bg-ordem-blue text-ordem-white',
  VIGILANTE: 'bg-ordem-green text-ordem-black',
};

export interface FichaOp2ViewProps {
  ficha: FichaOp2;
  onAlterarPv?: (delta: number) => void;
  onAlterarPd?: (delta: number) => void;
  onResultado?: (dados: { habilidadesUsadas: string[]; contaComoFalhaParaImpeto: boolean }) => void;
  className?: string;
}

export const FichaOp2View: React.FC<FichaOp2ViewProps> = ({
  ficha,
  onAlterarPv,
  onAlterarPd,
  onResultado,
  className,
}) => {
  const [emTeste, setEmTeste] = useState<RefPericia | null>(null);

  return (
    <div className={cn('space-y-4', className)}>
      <header className="rounded-lg border border-ordem-border bg-ordem-black p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-bold text-ordem-white">{ficha.nome}</h2>
          <span
            className={cn(
              'rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider',
              CORES_DO_PERFIL[ficha.perfil.tipo],
            )}
          >
            {ficha.perfil.tipo}
          </span>
          <span className="text-sm text-ordem-text-secondary">{ficha.ocupacao}</span>
          <span className="ml-auto text-sm text-ordem-text-muted">Nível {ficha.nivel}</span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {(['FISICO', 'MENTE', 'EMOCAO'] as const).map((atributo) => (
            <div
              key={atributo}
              className="rounded border border-ordem-border bg-ordem-bg px-3 py-2 text-center"
            >
              <div className="text-[0.65rem] uppercase tracking-wide text-ordem-text-muted">
                {ROTULO_ATRIBUTO[atributo]}
              </div>
              <div className="font-mono text-xl font-bold text-ordem-white">
                {ficha.atributos[atributo]}
              </div>
            </div>
          ))}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <PainelRecursos ficha={ficha} onAlterarPv={onAlterarPv} onAlterarPd={onAlterarPd} />

          <div className="rounded-lg border border-ordem-border bg-ordem-black p-4">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-ordem-white">
              Habilidades
            </h3>
            <ul className="space-y-2">
              {ficha.habilidades
                .map(habilidadePorId)
                .filter((habilidade): habilidade is NonNullable<typeof habilidade> => !!habilidade)
                .filter(
                  (habilidade, indice, lista) =>
                    lista.findIndex((outra) => outra.nome === habilidade.nome) === indice,
                )
                .map((habilidade) => (
                  <li key={habilidade.id} className="rounded border border-ordem-border bg-ordem-bg p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-ordem-white">{habilidade.nome}</span>
                      {!temEfeitoEmRuntime(habilidade) ? (
                        <span className="rounded bg-ordem-ooze px-1.5 py-0.5 text-[0.6rem] uppercase text-ordem-text-muted">
                          já na ficha
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-ordem-text-secondary">
                      {habilidade.descricao}
                    </p>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        <GradePericias ficha={ficha} onSelecionar={setEmTeste} />
      </div>

      <Modal open={emTeste !== null} onOpenChange={(aberto) => !aberto && setEmTeste(null)}>
        <ModalContent size="lg">
          {emTeste ? (
            <TesteRapido
              ficha={ficha}
              ref_={emTeste}
              onConfirmar={({ resultado, habilidadesUsadas }) =>
                onResultado?.({
                  habilidadesUsadas,
                  contaComoFalhaParaImpeto: resultado.contaComoFalhaParaImpeto,
                })
              }
              onCancelar={() => setEmTeste(null)}
            />
          ) : null}
        </ModalContent>
      </Modal>
    </div>
  );
};
