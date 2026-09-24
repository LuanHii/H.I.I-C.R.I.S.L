import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import { removeUndefinedFields } from './firestoreUtils';
import type { FichaDaMesa, MesaFoundry } from '../foundry/mesa';

/**
 * Colecoes de leitura publica (ver firestore.rules), lidas pelo Foundry via
 * `/api/foundry/*`. O id da mesa e um UUID: quem nao o conhece nao a encontra.
 */
const MESAS = 'mesas';
const PAREAMENTOS = 'pareamentos';

export interface Pareamento {
  mesaId: string;
  ownerId: string;
  nomeDoMundo: string;
  criadoEm: string;
}

export function assinarMesasDoDono(ownerId: string, aoMudar: (mesas: MesaFoundry[]) => void): Unsubscribe {
  return onSnapshot(
    query(collection(db, MESAS), where('ownerId', '==', ownerId)),
    (snapshot) => aoMudar(snapshot.docs.map((d) => d.data() as MesaFoundry)),
    (erro) => {
      console.error('Erro ao escutar mesas do Foundry:', erro);
      aoMudar([]);
    },
  );
}

export async function salvarMesa(mesa: MesaFoundry): Promise<void> {
  await setDoc(doc(db, MESAS, mesa.id), removeUndefinedFields(mesa));
}

export async function atualizarFichasDaMesa(mesaId: string, fichas: FichaDaMesa[]): Promise<void> {
  await updateDoc(doc(db, MESAS, mesaId), {
    fichas: fichas.map((f) => removeUndefinedFields(f)),
    atualizadoEm: new Date().toISOString(),
  });
}

export async function lerMesa(mesaId: string): Promise<MesaFoundry | null> {
  const referencia = await getDoc(doc(db, MESAS, mesaId));
  return referencia.exists() ? (referencia.data() as MesaFoundry) : null;
}

export async function gravarPareamento(codigo: string, pareamento: Pareamento): Promise<void> {
  await setDoc(doc(db, PAREAMENTOS, codigo), removeUndefinedFields(pareamento));
}

export async function lerPareamento(codigo: string): Promise<Pareamento | null> {
  const referencia = await getDoc(doc(db, PAREAMENTOS, codigo));
  return referencia.exists() ? (referencia.data() as Pareamento) : null;
}
