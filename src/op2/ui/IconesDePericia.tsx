'use client';

import React from 'react';
import type { IconType } from 'react-icons';
import {
  GiAngryEyes,
  GiBiceps,
  GiBrain,
  GiCampfire,
  GiCartwheel,
  GiCrosshair,
  GiDominoMask,
  GiEyeTarget,
  GiFist,
  GiFootsteps,
  GiGears,
  GiHealthNormal,
  GiLockpicks,
  GiMagnifyingGlass,
  GiMeditation,
  GiOpenBook,
  GiProcessor,
  GiPublicSpeaker,
  GiScalpel,
  GiSpellBook,
  GiThirdEye,
} from 'react-icons/gi';
import { cn } from '@/lib/utils';
import type { CampoAptidao, PericiaOp2, RefPericia } from '../regras/tipos';

export const ICONES_DE_PERICIA: Record<PericiaOp2, IconType> = {
  Acrobacia: GiCartwheel,
  Atletismo: GiBiceps,
  Crime: GiLockpicks,
  Disciplina: GiMeditation,
  Enganação: GiDominoMask,
  Furtividade: GiFootsteps,
  Intimidar: GiAngryEyes,
  Intuição: GiThirdEye,
  Luta: GiFist,
  Máquinas: GiGears,
  Medicina: GiScalpel,
  Ocultismo: GiSpellBook,
  Percepção: GiEyeTarget,
  Persuasão: GiPublicSpeaker,
  Pesquisar: GiMagnifyingGlass,
  Pontaria: GiCrosshair,
  Sobrevivência: GiCampfire,
  Tecnologia: GiProcessor,
  Vigor: GiHealthNormal,
};

export const ICONE_DE_APTIDAO: IconType = GiOpenBook;

export const ICONES_DE_RECURSO = {
  vida: GiHealthNormal,
  determinacao: GiBrain,
} as const;

export function iconeDe(ref: RefPericia): IconType {
  return ref.tipo === 'aptidao' ? ICONE_DE_APTIDAO : ICONES_DE_PERICIA[ref.nome];
}

export interface IconeDePericiaProps {
  ref_: RefPericia;
  tamanho?: number;
  className?: string;
}

export const IconeDePericia: React.FC<IconeDePericiaProps> = ({
  ref_,
  tamanho = 16,
  className,
}) => {
  const Icone = iconeDe(ref_);
  return <Icone size={tamanho} aria-hidden className={cn('shrink-0', className)} />;
};

export type { CampoAptidao, PericiaOp2 };
