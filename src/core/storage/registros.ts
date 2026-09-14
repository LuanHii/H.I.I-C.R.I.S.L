import type { Ameaca, Personagem } from '../types';
import type { FichaPersistida } from '../ficha/tipos';
import type { FonteDaFicha } from '../ficha/leitura';

export interface FichaRegistro {
  id: string;
  personagem: Personagem;
  atualizadoEm: string;
  campanha?: string;
  sincronizadaNaNuvem?: boolean;
  ficha?: FichaPersistida;
  fichaMigradaDe?: string;
  fichaConfirmada?: boolean;
  personagemOriginal?: Personagem;
  fonte?: FonteDaFicha;
  motivoDaFonte?: string;
}

export interface Campanha {
  id: string;
  nome: string;
  cor?: string;
  ordem: number;
}

export interface MonsterRegistro {
  id: string;
  ameaca: Ameaca;
  atualizadoEm: string;
}
