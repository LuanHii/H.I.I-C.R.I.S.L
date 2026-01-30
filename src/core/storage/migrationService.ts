"use client";

import { FichaRegistro, Campanha } from './useStoredFichas';
import { MonsterRegistro } from './useStoredMonsters';
import { Item, Weapow } from '../types';
import { migrateLocalDataToCloud, FichaRegistroCloud, CampanhaCloud, MonsterRegistroCloud } from '../firebase/userDataService';

const FICHAS_KEY = 'fichas-origem';
const CAMPANHAS_KEY = 'campanhas';
const MONSTROS_KEY = 'monstros-customizados';
const ITEMS_KEY = 'custom-items';
const WEAPONS_KEY = 'custom-weapons';
const MIGRATION_FLAG_KEY = 'data-migrated-to-cloud';

export interface LocalData {
  fichas: FichaRegistro[];
  campanhas: Campanha[];
  monstros: MonsterRegistro[];
  customItems: Item[];
  customWeapons: Weapow[];
}

export function getLocalData(): LocalData {
  if (typeof window === 'undefined') {
    return { fichas: [], campanhas: [], monstros: [], customItems: [], customWeapons: [] };
  }

  let fichas: FichaRegistro[] = [];
  let campanhas: Campanha[] = [];
  let monstros: MonsterRegistro[] = [];
  let customItems: Item[] = [];
  let customWeapons: Weapow[] = [];

  try {
    const fichasRaw = localStorage.getItem(FICHAS_KEY);
    if (fichasRaw) {
      const parsed = JSON.parse(fichasRaw);
      if (Array.isArray(parsed)) {
        fichas = parsed;
      }
    }
  } catch (e) {
    console.error('Erro ao ler fichas locais:', e);
  }

  try {
    const campanhasRaw = localStorage.getItem(CAMPANHAS_KEY);
    if (campanhasRaw) {
      const parsed = JSON.parse(campanhasRaw);
      if (Array.isArray(parsed)) {
        campanhas = parsed;
      }
    }
  } catch (e) {
    console.error('Erro ao ler campanhas locais:', e);
  }

  try {
    const monstrosRaw = localStorage.getItem(MONSTROS_KEY);
    if (monstrosRaw) {
      const parsed = JSON.parse(monstrosRaw);
      if (Array.isArray(parsed)) {
        monstros = parsed;
      }
    }
  } catch (e) {
    console.error('Erro ao ler monstros locais:', e);
  }

  try {
    const itemsRaw = localStorage.getItem(ITEMS_KEY);
    if (itemsRaw) {
      const parsed = JSON.parse(itemsRaw);
      if (Array.isArray(parsed)) {
        customItems = parsed;
      }
    }
  } catch (e) {
    console.error('Erro ao ler itens locais:', e);
  }

  try {
    const weaponsRaw = localStorage.getItem(WEAPONS_KEY);
    if (weaponsRaw) {
      const parsed = JSON.parse(weaponsRaw);
      if (Array.isArray(parsed)) {
        customWeapons = parsed;
      }
    }
  } catch (e) {
    console.error('Erro ao ler armas locais:', e);
  }

  return { fichas, campanhas, monstros, customItems, customWeapons };
}

export function hasLocalData(): boolean {
  const data = getLocalData();
  return (
    data.fichas.length > 0 ||
    data.campanhas.length > 0 ||
    data.monstros.length > 0 ||
    data.customItems.length > 0 ||
    data.customWeapons.length > 0
  );
}

export function hasMigratedBefore(userId: string): boolean {
  if (typeof window === 'undefined') return false;
  const migratedUsers = localStorage.getItem(MIGRATION_FLAG_KEY);
  if (!migratedUsers) return false;
  try {
    const users = JSON.parse(migratedUsers);
    return Array.isArray(users) && users.includes(userId);
  } catch {
    return false;
  }
}

export function markAsMigrated(userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const migratedUsers = localStorage.getItem(MIGRATION_FLAG_KEY);
    let users: string[] = [];
    if (migratedUsers) {
      const parsed = JSON.parse(migratedUsers);
      if (Array.isArray(parsed)) {
        users = parsed;
      }
    }
    if (!users.includes(userId)) {
      users.push(userId);
      localStorage.setItem(MIGRATION_FLAG_KEY, JSON.stringify(users));
    }
  } catch (e) {
    console.error('Erro ao marcar migração:', e);
  }
}

export function clearLocalDataAfterMigration(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(FICHAS_KEY);
    localStorage.removeItem(CAMPANHAS_KEY);
    localStorage.removeItem(MONSTROS_KEY);
    localStorage.removeItem(ITEMS_KEY);
    localStorage.removeItem(WEAPONS_KEY);
  } catch (e) {
    console.error('Erro ao limpar dados locais:', e);
  }
}

export async function migrateDataOnLogin(
  userId: string
): Promise<{ success: boolean; migrated: { fichas: number; campanhas: number; monstros: number; items: number } } | null> {

  if (!hasLocalData()) {
    return null;
  }

  const localData = getLocalData();

  const fichasCloud: FichaRegistroCloud[] = localData.fichas.map(f => ({
    id: f.id,
    personagem: f.personagem,
    atualizadoEm: f.atualizadoEm,
    campanha: f.campanha,
  }));

  const campanhasCloud: CampanhaCloud[] = localData.campanhas.map(c => ({
    id: c.id,
    nome: c.nome,
    cor: c.cor,
    ordem: c.ordem,
  }));

  const monstrosCloud: MonsterRegistroCloud[] = localData.monstros.map(m => ({
    id: m.id,
    ameaca: m.ameaca,
    atualizadoEm: m.atualizadoEm,
  }));

  const result = await migrateLocalDataToCloud(userId, {
    fichas: fichasCloud,
    campanhas: campanhasCloud,
    monstros: monstrosCloud,
    customItems: localData.customItems,
    customWeapons: localData.customWeapons,
  });

  if (result.success) {
    clearLocalDataAfterMigration();
    markAsMigrated(userId);
  }

  return result;
}
