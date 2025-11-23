import { useState, useEffect, useCallback } from 'react';
import { Item, Weapow } from '../types';

const STORAGE_KEY_ITEMS = 'custom-items';
const STORAGE_KEY_WEAPONS = 'custom-weapons';

export function useStoredItems() {
  const [customItems, setCustomItems] = useState<Item[]>([]);
  const [customWeapons, setCustomWeapons] = useState<Weapow[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedItems = localStorage.getItem(STORAGE_KEY_ITEMS);
      const storedWeapons = localStorage.getItem(STORAGE_KEY_WEAPONS);

      if (storedItems) {
        try {
          setCustomItems(JSON.parse(storedItems));
        } catch (e) {
          console.error('Failed to parse custom items', e);
        }
      }

      if (storedWeapons) {
        try {
          setCustomWeapons(JSON.parse(storedWeapons));
        } catch (e) {
          console.error('Failed to parse custom weapons', e);
        }
      }
    }
  }, []);

  const addCustomItem = useCallback((item: Item) => {
    setCustomItems(prev => {
      const updated = [...prev, item];
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeCustomItem = useCallback((itemName: string) => {
    setCustomItems(prev => {
      const updated = prev.filter(i => i.nome !== itemName);
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addCustomWeapon = useCallback((weapon: Weapow) => {
    setCustomWeapons(prev => {
      const updated = [...prev, weapon];
      localStorage.setItem(STORAGE_KEY_WEAPONS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeCustomWeapon = useCallback((weaponName: string) => {
    setCustomWeapons(prev => {
      const updated = prev.filter(w => w.nome !== weaponName);
      localStorage.setItem(STORAGE_KEY_WEAPONS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    customItems,
    customWeapons,
    addCustomItem,
    removeCustomItem,
    addCustomWeapon,
    removeCustomWeapon
  };
}
