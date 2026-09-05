import { doc, getDoc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/core/firebase/config';
import { removeUndefinedFields } from '@/core/firebase/firestoreUtils';
import type { FichaOp2 } from '../regras/tipos';

const COLECAO = 'agentes';

export interface DocumentoAgenteOp2 extends FichaOp2 {
  ownerId?: string;
  updatedAt?: string;
}

export function ehDocumentoOp2(dados: unknown): dados is DocumentoAgenteOp2 {
  return (
    typeof dados === 'object' &&
    dados !== null &&
    (dados as { sistema?: unknown }).sistema === 'op2'
  );
}

export async function publicarFichaOp2(
  agenteId: string,
  ficha: FichaOp2,
  ownerId?: string,
): Promise<void> {
  const dono = ownerId ?? auth.currentUser?.uid;

  const documento: DocumentoAgenteOp2 = {
    ...ficha,
    ownerId: dono,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, COLECAO, agenteId), removeUndefinedFields(documento));
}

export async function despublicarFichaOp2(agenteId: string): Promise<void> {
  await deleteDoc(doc(db, COLECAO, agenteId));
}

export async function buscarFichaOp2(agenteId: string): Promise<DocumentoAgenteOp2 | null> {
  const referencia = await getDoc(doc(db, COLECAO, agenteId));
  if (!referencia.exists()) return null;
  const dados = referencia.data();
  return ehDocumentoOp2(dados) ? dados : null;
}

export function assinarFichaOp2(
  agenteId: string,
  aoMudar: (ficha: DocumentoAgenteOp2 | null) => void,
): () => void {
  return onSnapshot(
    doc(db, COLECAO, agenteId),
    (referencia) => {
      if (!referencia.exists()) {
        aoMudar(null);
        return;
      }
      const dados = referencia.data();
      aoMudar(ehDocumentoOp2(dados) ? dados : null);
    },
    (erro) => {
      console.error('Falha ao assinar a ficha de Ordem 2:', erro);
      aoMudar(null);
    },
  );
}

export function urlDaFicha(agenteId: string, origem: string): string {
  return `${origem}/ficha/${agenteId}`;
}

export function urlDoOverlay(
  agenteId: string,
  origem: string,
  modo: 'mini' | 'full' = 'mini',
  fundo: 'transparente' | 'verde' = 'transparente',
): string {
  const parametros = new URLSearchParams();
  if (modo === 'full') parametros.set('modo', 'full');
  if (fundo === 'verde') parametros.set('fundo', 'verde');
  const busca = parametros.toString();
  return `${origem}/op2/overlay/${agenteId}${busca ? `?${busca}` : ''}`;
}
