import { db } from './config';
import {
  doc,
  collection,
  setDoc,
  getDocs,
  deleteDoc,
  writeBatch,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { Personagem, Ameaca, Item, Weapow } from '../types';

export interface FichaRegistroCloud {
  id: string;
  personagem: Personagem;
  atualizadoEm: string;
  campanha?: string;
}

export interface CampanhaCloud {
  id: string;
  nome: string;
  cor?: string;
  ordem: number;
}

export interface MonsterRegistroCloud {
  id: string;
  ameaca: Ameaca;
  atualizadoEm: string;
}

export interface CustomItemsCloud {
  items: Item[];
  weapons: Weapow[];
}

export interface UserDataCloud {
  fichas: FichaRegistroCloud[];
  campanhas: CampanhaCloud[];
  monstros: MonsterRegistroCloud[];
  customItems: Item[];
  customWeapons: Weapow[];
}

function removeUndefinedFields<T extends object>(obj: T): T {
  const cleaned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (value === undefined) {
        continue;
      } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        cleaned[key] = removeUndefinedFields(value as object) as T[Extract<keyof T, string>];
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

function getUserDocRef(userId: string) {
  return doc(db, 'users', userId);
}

function getFichasCollectionRef(userId: string) {
  return collection(db, 'users', userId, 'fichas');
}

function getCampanhasCollectionRef(userId: string) {
  return collection(db, 'users', userId, 'campanhas');
}

function getMonstrosCollectionRef(userId: string) {
  return collection(db, 'users', userId, 'monstros');
}

function getCustomItemsDocRef(userId: string) {
  return doc(db, 'users', userId, 'customData', 'items');
}

export async function saveFichaToCloud(userId: string, ficha: FichaRegistroCloud): Promise<void> {
  try {
    const cleanedData = removeUndefinedFields(ficha);
    const fichaRef = doc(getFichasCollectionRef(userId), ficha.id);
    await setDoc(fichaRef, cleanedData);
  } catch (e) {
    console.error('Erro ao salvar ficha na nuvem:', e);
    throw e;
  }
}

export async function deleteFichaFromCloud(userId: string, fichaId: string): Promise<void> {
  try {
    const fichaRef = doc(getFichasCollectionRef(userId), fichaId);
    await deleteDoc(fichaRef);
  } catch (e) {
    console.error('Erro ao deletar ficha da nuvem:', e);
    throw e;
  }
}

export async function getAllFichasFromCloud(userId: string): Promise<FichaRegistroCloud[]> {
  try {
    const snapshot = await getDocs(getFichasCollectionRef(userId));
    return snapshot.docs.map(doc => doc.data() as FichaRegistroCloud);
  } catch (e) {
    console.error('Erro ao buscar fichas da nuvem:', e);
    return [];
  }
}

export function subscribeToFichas(
  userId: string,
  callback: (fichas: FichaRegistroCloud[]) => void
): Unsubscribe {
  return onSnapshot(
    getFichasCollectionRef(userId),
    (snapshot) => {
      const fichas = snapshot.docs.map(d => d.data() as FichaRegistroCloud);
      callback(fichas);
    },
    (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao escutar fichas:', error);
      }
      callback([]);
    }
  );
}

export async function saveCampanhaToCloud(userId: string, campanha: CampanhaCloud): Promise<void> {
  try {
    const cleanedData = removeUndefinedFields(campanha);
    const campanhaRef = doc(getCampanhasCollectionRef(userId), campanha.id);
    await setDoc(campanhaRef, cleanedData);
  } catch (e) {
    console.error('Erro ao salvar campanha na nuvem:', e);
    throw e;
  }
}

export async function deleteCampanhaFromCloud(userId: string, campanhaId: string): Promise<void> {
  try {
    const campanhaRef = doc(getCampanhasCollectionRef(userId), campanhaId);
    await deleteDoc(campanhaRef);
  } catch (e) {
    console.error('Erro ao deletar campanha da nuvem:', e);
    throw e;
  }
}

export async function getAllCampanhasFromCloud(userId: string): Promise<CampanhaCloud[]> {
  try {
    const snapshot = await getDocs(getCampanhasCollectionRef(userId));
    return snapshot.docs.map(doc => doc.data() as CampanhaCloud);
  } catch (e) {
    console.error('Erro ao buscar campanhas da nuvem:', e);
    return [];
  }
}

export function subscribeToCampanhas(
  userId: string,
  callback: (campanhas: CampanhaCloud[]) => void
): Unsubscribe {
  return onSnapshot(
    getCampanhasCollectionRef(userId),
    (snapshot) => {
      const campanhas = snapshot.docs.map(d => d.data() as CampanhaCloud);
      callback(campanhas);
    },
    (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao escutar campanhas:', error);
      }
      callback([]);
    }
  );
}

export async function saveMonstroToCloud(userId: string, monstro: MonsterRegistroCloud): Promise<void> {
  try {
    const cleanedData = removeUndefinedFields(monstro);
    const monstroRef = doc(getMonstrosCollectionRef(userId), monstro.id);
    await setDoc(monstroRef, cleanedData);
  } catch (e) {
    console.error('Erro ao salvar monstro na nuvem:', e);
    throw e;
  }
}

export async function deleteMonstroFromCloud(userId: string, monstroId: string): Promise<void> {
  try {
    const monstroRef = doc(getMonstrosCollectionRef(userId), monstroId);
    await deleteDoc(monstroRef);
  } catch (e) {
    console.error('Erro ao deletar monstro da nuvem:', e);
    throw e;
  }
}

export async function getAllMonstrosFromCloud(userId: string): Promise<MonsterRegistroCloud[]> {
  try {
    const snapshot = await getDocs(getMonstrosCollectionRef(userId));
    return snapshot.docs.map(doc => doc.data() as MonsterRegistroCloud);
  } catch (e) {
    console.error('Erro ao buscar monstros da nuvem:', e);
    return [];
  }
}

export function subscribeToMonstros(
  userId: string,
  callback: (monstros: MonsterRegistroCloud[]) => void
): Unsubscribe {
  return onSnapshot(
    getMonstrosCollectionRef(userId),
    (snapshot) => {
      const monstros = snapshot.docs.map(d => d.data() as MonsterRegistroCloud);
      callback(monstros);
    },
    (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao escutar monstros:', error);
      }
      callback([]);
    }
  );
}

export async function saveCustomItemsToCloud(
  userId: string,
  items: Item[],
  weapons: Weapow[]
): Promise<void> {
  try {
    const data: CustomItemsCloud = { items, weapons };
    await setDoc(getCustomItemsDocRef(userId), data);
  } catch (e) {
    console.error('Erro ao salvar itens customizados na nuvem:', e);
    throw e;
  }
}

export async function getCustomItemsFromCloud(userId: string): Promise<CustomItemsCloud> {
  try {
    const snapshot = await getDocs(collection(db, 'users', userId, 'customData'));
    const itemsDoc = snapshot.docs.find(d => d.id === 'items');
    if (itemsDoc) {
      return itemsDoc.data() as CustomItemsCloud;
    }
    return { items: [], weapons: [] };
  } catch (e) {
    console.error('Erro ao buscar itens customizados da nuvem:', e);
    return { items: [], weapons: [] };
  }
}

export function subscribeToCustomItems(
  userId: string,
  callback: (data: CustomItemsCloud) => void
): Unsubscribe {
  return onSnapshot(
    getCustomItemsDocRef(userId),
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as CustomItemsCloud);
      } else {
        callback({ items: [], weapons: [] });
      }
    },
    (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao escutar itens customizados:', error);
      }
      callback({ items: [], weapons: [] });
    }
  );
}

export async function migrateLocalDataToCloud(
  userId: string,
  data: {
    fichas: FichaRegistroCloud[];
    campanhas: CampanhaCloud[];
    monstros: MonsterRegistroCloud[];
    customItems: Item[];
    customWeapons: Weapow[];
  }
): Promise<{ success: boolean; migrated: { fichas: number; campanhas: number; monstros: number; items: number } }> {
  const result = { fichas: 0, campanhas: 0, monstros: 0, items: 0 };

  try {

    const [existingFichas, existingCampanhas, existingMonstros] = await Promise.all([
      getAllFichasFromCloud(userId),
      getAllCampanhasFromCloud(userId),
      getAllMonstrosFromCloud(userId),
    ]);

    const existingFichaIds = new Set(existingFichas.map(f => f.id));
    const existingCampanhaIds = new Set(existingCampanhas.map(c => c.id));
    const existingMonstroIds = new Set(existingMonstros.map(m => m.id));

    const newFichas = data.fichas.filter(f => !existingFichaIds.has(f.id));
    for (const ficha of newFichas) {
      await saveFichaToCloud(userId, {
        id: ficha.id,
        personagem: ficha.personagem,
        atualizadoEm: ficha.atualizadoEm,
        campanha: ficha.campanha,
      });
      result.fichas++;
    }

    const newCampanhas = data.campanhas.filter(c => !existingCampanhaIds.has(c.id));
    for (const campanha of newCampanhas) {
      await saveCampanhaToCloud(userId, campanha);
      result.campanhas++;
    }

    const newMonstros = data.monstros.filter(m => !existingMonstroIds.has(m.id));
    for (const monstro of newMonstros) {
      await saveMonstroToCloud(userId, monstro);
      result.monstros++;
    }

    if (data.customItems.length > 0 || data.customWeapons.length > 0) {
      const existingItems = await getCustomItemsFromCloud(userId);
      const mergedItems = [
        ...existingItems.items,
        ...data.customItems.filter(i => !existingItems.items.some(ei => ei.nome === i.nome)),
      ];
      const mergedWeapons = [
        ...existingItems.weapons,
        ...data.customWeapons.filter(w => !existingItems.weapons.some(ew => ew.nome === w.nome)),
      ];
      await saveCustomItemsToCloud(userId, mergedItems, mergedWeapons);
      result.items = data.customItems.length + data.customWeapons.length;
    }

    return { success: true, migrated: result };
  } catch (e) {
    console.error('Erro durante migração:', e);
    return { success: false, migrated: result };
  }
}

export async function getAllUserData(userId: string): Promise<UserDataCloud> {
  const [fichas, campanhas, monstros, customItems] = await Promise.all([
    getAllFichasFromCloud(userId),
    getAllCampanhasFromCloud(userId),
    getAllMonstrosFromCloud(userId),
    getCustomItemsFromCloud(userId),
  ]);

  return {
    fichas,
    campanhas,
    monstros,
    customItems: customItems.items,
    customWeapons: customItems.weapons,
  };
}

export async function deleteAllUserData(userId: string): Promise<{ success: boolean; deleted: number }> {
  let deleted = 0;

  try {

    const fichas = await getAllFichasFromCloud(userId);
    for (const ficha of fichas) {
      await deleteFichaFromCloud(userId, ficha.id);
      deleted++;
    }

    const campanhas = await getAllCampanhasFromCloud(userId);
    for (const campanha of campanhas) {
      await deleteCampanhaFromCloud(userId, campanha.id);
      deleted++;
    }

    const monstros = await getAllMonstrosFromCloud(userId);
    for (const monstro of monstros) {
      await deleteMonstroFromCloud(userId, monstro.id);
      deleted++;
    }

    try {
      await deleteDoc(getCustomItemsDocRef(userId));
      deleted++;
    } catch {

    }

    try {
      await deleteDoc(getUserDocRef(userId));
      deleted++;
    } catch {

    }

    return { success: true, deleted };
  } catch (e) {
    console.error('Erro ao deletar dados do usuário:', e);
    return { success: false, deleted };
  }
}
