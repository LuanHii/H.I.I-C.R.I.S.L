"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Item, Weapow } from '../types';
import { useAuthOptional } from '../firebase/auth';
import {
  saveCustomItemsToCloud,
  subscribeToCustomItems,
} from '../firebase/userDataService';

const STORAGE_KEY_ITEMS = 'custom-items';
const STORAGE_KEY_WEAPONS = 'custom-weapons';

function lerItemsLocal(): Item[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_ITEMS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function lerWeaponsLocal(): Weapow[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_WEAPONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function gravarItemsLocal(items: Item[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
}

function gravarWeaponsLocal(weapons: Weapow[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_WEAPONS, JSON.stringify(weapons));
}

export function useCloudItems() {
  const auth = useAuthOptional();
  const userId = auth?.user?.uid;
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const authLoading = auth?.loading ?? true;

  const [customItems, setCustomItems] = useState<Item[]>([]);
  const [customWeapons, setCustomWeapons] = useState<Weapow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !userId) {
      setCustomItems(lerItemsLocal());
      setCustomWeapons(lerWeaponsLocal());
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToCustomItems(userId, (data) => {
      setCustomItems(data.items || []);
      setCustomWeapons(data.weapons || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, userId, authLoading]);

  const addCustomItem = useCallback(
    async (item: Item) => {
      if (isAuthenticated && userId) {
        const updated = [...customItems, item];
        try {
          await saveCustomItemsToCloud(userId, updated, customWeapons);
        } catch (err) {
          console.error('Erro ao salvar item na nuvem:', err);
        }
      } else {
        setCustomItems((prev) => {
          const updated = [...prev, item];
          gravarItemsLocal(updated);
          return updated;
        });
      }
    },
    [isAuthenticated, userId, customItems, customWeapons]
  );

  const removeCustomItem = useCallback(
    async (itemName: string) => {
      if (isAuthenticated && userId) {
        const updated = customItems.filter((i) => i.nome !== itemName);
        try {
          await saveCustomItemsToCloud(userId, updated, customWeapons);
        } catch (err) {
          console.error('Erro ao remover item da nuvem:', err);
        }
      } else {
        setCustomItems((prev) => {
          const updated = prev.filter((i) => i.nome !== itemName);
          gravarItemsLocal(updated);
          return updated;
        });
      }
    },
    [isAuthenticated, userId, customItems, customWeapons]
  );

  const addCustomWeapon = useCallback(
    async (weapon: Weapow) => {
      if (isAuthenticated && userId) {
        const updated = [...customWeapons, weapon];
        try {
          await saveCustomItemsToCloud(userId, customItems, updated);
        } catch (err) {
          console.error('Erro ao salvar arma na nuvem:', err);
        }
      } else {
        setCustomWeapons((prev) => {
          const updated = [...prev, weapon];
          gravarWeaponsLocal(updated);
          return updated;
        });
      }
    },
    [isAuthenticated, userId, customItems, customWeapons]
  );

  const removeCustomWeapon = useCallback(
    async (weaponName: string) => {
      if (isAuthenticated && userId) {
        const updated = customWeapons.filter((w) => w.nome !== weaponName);
        try {
          await saveCustomItemsToCloud(userId, customItems, updated);
        } catch (err) {
          console.error('Erro ao remover arma da nuvem:', err);
        }
      } else {
        setCustomWeapons((prev) => {
          const updated = prev.filter((w) => w.nome !== weaponName);
          gravarWeaponsLocal(updated);
          return updated;
        });
      }
    },
    [isAuthenticated, userId, customItems, customWeapons]
  );

  return useMemo(
    () => ({
      customItems,
      customWeapons,
      loading,
      addCustomItem,
      removeCustomItem,
      addCustomWeapon,
      removeCustomWeapon,
      isCloudMode: isAuthenticated,
    }),
    [
      customItems,
      customWeapons,
      loading,
      addCustomItem,
      removeCustomItem,
      addCustomWeapon,
      removeCustomWeapon,
      isAuthenticated,
    ]
  );
}
