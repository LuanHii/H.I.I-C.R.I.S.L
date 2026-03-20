import type { Elemento } from '@/core/types';
import type { LucideIcon } from 'lucide-react';
import { Flame, Skull, Brain, Zap, Ghost } from 'lucide-react';

export interface ElementoConfig {
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  text: string;
}

export const ELEMENTO_CONFIG: Record<Elemento, ElementoConfig> = {
  Sangue: {
    icon: Flame,
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-600',
    text: 'text-red-300',
  },
  Morte: {
    icon: Skull,
    color: 'text-gray-400',
    bg: 'bg-gray-500/20',
    border: 'border-gray-500',
    text: 'text-gray-300',
  },
  Conhecimento: {
    icon: Brain,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-600',
    text: 'text-yellow-300',
  },
  Energia: {
    icon: Zap,
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    border: 'border-purple-600',
    text: 'text-purple-300',
  },
  Medo: {
    icon: Ghost,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-600',
    text: 'text-blue-300',
  },
};

export const ELEMENTO_COR: Record<Elemento, string> = {
  Sangue: 'border-red-700 bg-red-900/20 text-red-300',
  Morte: 'border-gray-500 bg-gray-800/30 text-gray-300',
  Conhecimento: 'border-yellow-600 bg-yellow-900/15 text-yellow-300',
  Energia: 'border-purple-600 bg-purple-900/15 text-purple-300',
  Medo: 'border-blue-600 bg-blue-900/15 text-blue-300',
};

export const ELEMENTO_FILTER_STYLES: Record<Elemento, string> = {
  Sangue: 'text-red-600 border-red-900/50 bg-red-900/10',
  Morte: 'text-ordem-text-secondary border-ordem-border-light bg-ordem-ooze/30',
  Conhecimento: 'text-amber-500 border-amber-900/50 bg-amber-900/10',
  Energia: 'text-purple-500 border-purple-900/50 bg-purple-900/10',
  Medo: 'text-blue-500 border-blue-900/50 bg-blue-900/10',
};
