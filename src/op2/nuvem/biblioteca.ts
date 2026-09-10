import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  type QuerySnapshot,
} from 'firebase/firestore';
import { db } from '@/core/firebase/config';
import { removeUndefinedFields } from '@/core/firebase/firestoreUtils';
import type { FichaOp2 } from '../regras/tipos';
import type { RegistroOp2 } from './mesclagem';

export const SUBCOLECAO_OP2 = 'fichasOp2';

export function caminhoDaBiblioteca(uid: string): string[] {
  return ['users', uid, SUBCOLECAO_OP2];
}

export function ehRegistroOp2(dados: unknown): dados is RegistroOp2 {
  if (typeof dados !== 'object' || dados === null) return false;
  const registro = dados as { ficha?: { sistema?: unknown } };
  return typeof registro.ficha === 'object' && registro.ficha?.sistema === 'op2';
}

export function envelopeDaFicha(ficha: FichaOp2, quando?: string): RegistroOp2 {
  return {
    id: ficha.id,
    ficha,
    atualizadoEm: quando ?? new Date().toISOString(),
  };
}

function colecao(uid: string) {
  const [raiz, id, sub] = caminhoDaBiblioteca(uid);
  return collection(db, raiz, id, sub);
}

export async function salvarFichaOp2NoPerfil(uid: string, ficha: FichaOp2): Promise<void> {
  await setDoc(doc(colecao(uid), ficha.id), removeUndefinedFields(envelopeDaFicha(ficha)));
}

export async function removerFichaOp2DoPerfil(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(colecao(uid), id));
}

export function assinarBibliotecaOp2(
  uid: string,
  aoMudar: (registros: RegistroOp2[]) => void,
  aoFalhar: (erro: unknown) => void,
): () => void {
  return onSnapshot(
    colecao(uid),
    (instantaneo: QuerySnapshot) => {
      const registros: RegistroOp2[] = [];
      instantaneo.forEach((documento) => {
        const dados = documento.data();
        if (ehRegistroOp2(dados)) registros.push(dados);
      });
      aoMudar(registros);
    },
    aoFalhar,
  );
}
