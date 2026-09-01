'use client';

import React, { useState } from 'react';
import { Modal, ModalContent } from '@/components/ui/Modal';
import type { FichaOp2, RefPericia } from '../regras/tipos';
import { FichaOp2Publica } from './FichaOp2Publica';
import { TesteRapido } from './TesteRapido';

export interface FichaOp2ViewProps {
  ficha: FichaOp2;
  onAlterarPv?: (delta: number) => void;
  onAlterarPd?: (delta: number) => void;
  onDefinirImpeto?: (valor: number) => void;
  onDefinirAvaliacao?: (valor: number) => void;
  onResultado?: (dados: { habilidadesUsadas: string[]; contaComoFalhaParaImpeto: boolean }) => void;
  className?: string;
}

export const FichaOp2View: React.FC<FichaOp2ViewProps> = ({
  ficha,
  onAlterarPv,
  onAlterarPd,
  onDefinirImpeto,
  onDefinirAvaliacao,
  onResultado,
  className,
}) => {
  const [emTeste, setEmTeste] = useState<RefPericia | null>(null);

  return (
    <>
      <FichaOp2Publica
        ficha={ficha}
        moldura="embutida"
        onAlterarPv={onAlterarPv}
        onAlterarPd={onAlterarPd}
        onDefinirImpeto={onDefinirImpeto}
        onDefinirAvaliacao={onDefinirAvaliacao}
        onSelecionarPericia={setEmTeste}
        className={className}
      />

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
    </>
  );
};
