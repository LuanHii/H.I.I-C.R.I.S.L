import { ClasseName, ClasseStats, PericiaName } from '../core/types';

export const CLASSES: Record<ClasseName, ClasseStats> = {
  'Combatente': {
    pvInicial: 20,
    pvPorNivel: 4,
    peInicial: 2,
    pePorNivel: 2,
    sanInicial: 12,
    sanPorNivel: 3,
    pdInicial: 6,
    pdPorNivel: 3,
    periciasIniciais: 1,
    periciasObrigatorias: ['Luta', 'Pontaria', 'Fortitude', 'Reflexos'],
    proficiencias: ['Armas Simples', 'Armas Táticas', 'Proteções Leves']
  },
  'Especialista': {
    pvInicial: 16,
    pvPorNivel: 3,
    peInicial: 3,
    pePorNivel: 3,
    sanInicial: 16,
    sanPorNivel: 4,
    pdInicial: 8,
    pdPorNivel: 4,
    periciasIniciais: 7,
    periciasObrigatorias: [],
    proficiencias: ['Armas Simples', 'Proteções Leves']
  },
  'Ocultista': {
    pvInicial: 12,
    pvPorNivel: 2,
    peInicial: 4,
    pePorNivel: 4,
    sanInicial: 20,
    sanPorNivel: 5,
    pdInicial: 10,
    pdPorNivel: 5,
    periciasIniciais: 3,
    periciasObrigatorias: ['Ocultismo', 'Vontade'],
    proficiencias: ['Armas Simples']
  },
  'Sobrevivente': {
    pvInicial: 8,
    pvPorNivel: 2,
    peInicial: 2,
    pePorNivel: 2,
    sanInicial: 8,
    sanPorNivel: 2,
    pdInicial: 4,
    pdPorNivel: 2,
    periciasIniciais: 1,
    periciasObrigatorias: [],
    proficiencias: []
  }
};
