import type { Elemento, PericiaName } from '../types';

export const TODAS_PERICIAS: PericiaName[] = [
  'Acrobacia', 'Adestramento', 'Artes', 'Atletismo', 'Atualidades',
  'Ciências', 'Crime', 'Diplomacia', 'Enganação', 'Fortitude',
  'Furtividade', 'Iniciativa', 'Intimidação', 'Intuição', 'Investigação',
  'Luta', 'Medicina', 'Ocultismo', 'Percepção', 'Pilotagem',
  'Pontaria', 'Profissão', 'Reflexos', 'Religião', 'Sobrevivência',
  'Tática', 'Tecnologia', 'Vontade',
];

export const ELEMENTOS: Elemento[] = ['Conhecimento', 'Energia', 'Medo', 'Morte', 'Sangue'];

export const ELEMENTOS_DE_AFINIDADE: Elemento[] = ['Conhecimento', 'Energia', 'Morte', 'Sangue'];

export function semAcento(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function chaveDeComparacao(texto: string): string {
  return semAcento(texto).trim().toLowerCase();
}

const INDICE_PERICIAS = new Map<string, PericiaName>(
  TODAS_PERICIAS.map((pericia) => [chaveDeComparacao(pericia), pericia]),
);

export function normalizarPericia(texto: string): PericiaName | undefined {
  return INDICE_PERICIAS.get(chaveDeComparacao(texto));
}

export function ehPericiaValida(texto: string): boolean {
  return normalizarPericia(texto) !== undefined;
}

const INDICE_ELEMENTOS = new Map<string, Elemento>(
  ELEMENTOS.map((elemento) => [chaveDeComparacao(elemento), elemento]),
);

export function normalizarElemento(texto: string): Elemento | undefined {
  return INDICE_ELEMENTOS.get(chaveDeComparacao(texto));
}
