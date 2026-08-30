'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { dadoDaPericia, dadoDoAtributo } from '../regras/ficha';
import {
  CAMPOS_APTIDAO,
  DESCRICAO_DA_PERICIA,
  DESCRICAO_DO_CAMPO_APTIDAO,
  GRAUS_DE_TREINAMENTO,
  PERICIAS_SIMPLES,
  aptidao,
  atributoBaseDe,
  pericia,
} from '../regras/pericias';
import { ROTULO_ATRIBUTO, type DiceStep, type FichaOp2, type RefPericia } from '../regras/tipos';

const CORES_DO_DADO: Record<DiceStep, string> = {
  d4: 'border-ordem-border text-ordem-text-muted',
  d6: 'border-ordem-green-muted text-ordem-green-muted',
  d8: 'border-ordem-cyan text-ordem-cyan',
  d10: 'border-ordem-gold text-ordem-gold',
  d12: 'border-ordem-purple text-ordem-purple',
  d20: 'border-ordem-red text-ordem-red-light',
};

interface LinhaProps {
  ficha: FichaOp2;
  ref_: RefPericia;
  rotulo: string;
  descricao: string;
  recuada?: boolean;
  onSelecionar?: (ref_: RefPericia) => void;
}

const Linha: React.FC<LinhaProps> = ({ ficha, ref_, rotulo, descricao, recuada, onSelecionar }) => {
  const dado = dadoDaPericia(ficha, ref_);
  const atributo = atributoBaseDe(ref_);
  const grau = dado === 'd20' ? 'Sobre-humano' : GRAUS_DE_TREINAMENTO[dado];

  return (
    <button
      type="button"
      onClick={() => onSelecionar?.(ref_)}
      disabled={!onSelecionar}
      title={`${descricao} · ${grau}`}
      className={cn(
        'flex w-full items-center gap-3 rounded px-2 py-1.5 text-left transition-colors',
        onSelecionar ? 'hover:bg-ordem-ooze' : 'cursor-default',
        recuada && 'pl-6',
      )}
    >
      <span
        className={cn(
          'w-12 shrink-0 rounded border bg-ordem-bg py-0.5 text-center font-mono text-xs font-bold',
          CORES_DO_DADO[dado],
        )}
      >
        {dado}
      </span>
      <span className="flex-1 truncate text-sm text-ordem-text-secondary">{rotulo}</span>
      <span className="shrink-0 text-[0.65rem] uppercase tracking-wide text-ordem-text-muted">
        {ROTULO_ATRIBUTO[atributo]} {dadoDoAtributo(ficha, atributo)}
      </span>
    </button>
  );
};

export interface GradePericiasProps {
  ficha: FichaOp2;
  onSelecionar?: (ref_: RefPericia) => void;
  className?: string;
}

export const GradePericias: React.FC<GradePericiasProps> = ({ ficha, onSelecionar, className }) => (
  <div className={cn('rounded-lg border border-ordem-border bg-ordem-black p-3', className)}>
    <div className="mb-2 flex items-baseline justify-between px-2">
      <h3 className="text-sm font-bold uppercase tracking-wide text-ordem-white">Perícias</h3>
      <span className="text-[0.65rem] text-ordem-text-muted">
        d4 destreinado · d6 treinado · d8 especialista · d10 mestre · d12 grão-mestre
      </span>
    </div>

    <div className="space-y-0.5">
      <div
        className="flex items-center gap-3 px-2 py-1.5"
        title="Conhecimento em um campo específico. Cada campo tem o seu próprio dado."
      >
        <span className="w-12 shrink-0 text-center text-[0.65rem] uppercase tracking-wide text-ordem-text-muted">
          por campo
        </span>
        <span className="flex-1 text-sm font-bold text-ordem-text-secondary">Aptidão</span>
        <span className="shrink-0 text-[0.65rem] uppercase tracking-wide text-ordem-text-muted">
          {ROTULO_ATRIBUTO.MENTE} {dadoDoAtributo(ficha, 'MENTE')}
        </span>
      </div>
      {CAMPOS_APTIDAO.map((campo) => (
        <Linha
          key={campo}
          ficha={ficha}
          ref_={aptidao(campo)}
          rotulo={campo}
          descricao={DESCRICAO_DO_CAMPO_APTIDAO[campo]}
          recuada
          onSelecionar={onSelecionar}
        />
      ))}

      {PERICIAS_SIMPLES.map((nome) => (
        <Linha
          key={nome}
          ficha={ficha}
          ref_={pericia(nome)}
          rotulo={nome}
          descricao={DESCRICAO_DA_PERICIA[nome]}
          onSelecionar={onSelecionar}
        />
      ))}
    </div>
  </div>
);
