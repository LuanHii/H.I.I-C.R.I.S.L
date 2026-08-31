'use client';

import React from 'react';
import type { IconType } from 'react-icons';
import {
  GiD10,
  GiD12,
  GiD4,
  GiDiceEightFacesEight,
  GiDiceSixFacesSix,
  GiDiceTwentyFacesTwenty,
} from 'react-icons/gi';
import { cn } from '@/lib/utils';
import type { DiceStep } from '../regras/tipos';

/**
 * Um icone por passo da escada, da colecao Game Icons.
 *
 * Nao vale reaproveitar o mesmo desenho para dois dados: o icone e o primeiro
 * sinal que o olho pega ao varrer a lista de pericias, e dois passos com a
 * mesma silhueta anulam essa leitura.
 */
export const ICONES_DE_DADO: Record<DiceStep, IconType> = {
  d4: GiD4,
  d6: GiDiceSixFacesSix,
  d8: GiDiceEightFacesEight,
  d10: GiD10,
  d12: GiD12,
  d20: GiDiceTwentyFacesTwenty,
};

/**
 * Cor por NIVEL, nao por face. Seis cores de dado gastariam todo o orcamento
 * cromatico com informacao que a notacao ja carrega, e competiriam com os
 * recursos, que sao o que muda durante o jogo.
 */
export const NIVEIS_DO_DADO: Record<DiceStep, string> = {
  d4: 'text-white/25',
  d6: 'text-white/80',
  d8: 'text-ordem-cyan',
  d10: 'text-ordem-gold',
  d12: 'text-ordem-gold',
  d20: 'text-ordem-red-light',
};

export interface IconeDeDadoProps {
  dado: DiceStep;
  className?: string;
  tamanho?: number;
}

export const IconeDeDado: React.FC<IconeDeDadoProps> = ({ dado, className, tamanho = 20 }) => {
  const Icone = ICONES_DE_DADO[dado];
  return <Icone size={tamanho} aria-hidden className={cn('shrink-0', className)} />;
};

export interface SeloDeDadoProps {
  dado: DiceStep;
  className?: string;
  tamanho?: number;
}

export const SeloDeDado: React.FC<SeloDeDadoProps> = ({ dado, className, tamanho = 24 }) => (
  <span
    className={cn('inline-flex shrink-0 items-center gap-1.5', NIVEIS_DO_DADO[dado], className)}
  >
    <IconeDeDado dado={dado} tamanho={tamanho} />
    <span className="font-dados text-sm font-bold tabular-nums">{dado.replace('d', '')}</span>
  </span>
);
