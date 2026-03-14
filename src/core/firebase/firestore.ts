import { db, auth } from './config';
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Personagem } from '../types';
import { removeUndefinedFields } from './firestoreUtils';

interface AgentDocument extends Personagem {
    ownerId?: string;
    updatedAt?: string;
}

export const saveAgentToCloud = async (agentId: string, agentData: Personagem, ownerId?: string) => {
    try {
        const currentUserId = ownerId || auth.currentUser?.uid;

        const dataWithOwner: AgentDocument = {
            ...agentData,
            ownerId: currentUserId,
            updatedAt: new Date().toISOString(),
        };

        const cleanedData = removeUndefinedFields(dataWithOwner);
        await setDoc(doc(db, "agentes", agentId), cleanedData);
    } catch (e) {
        console.error("Erro ao salvar agente na nuvem: ", e);
        throw e;
    }
};

export const updateAgentInCloud = async (agentId: string, updates: Partial<Personagem>) => {
    try {
        const agentRef = doc(db, "agentes", agentId);
        const updatesWithTimestamp = {
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        const cleaned = removeUndefinedFields(updatesWithTimestamp as Record<string, unknown>);
        await updateDoc(agentRef, cleaned as Record<string, object | string | number | boolean | null>);
    } catch (e) {
        console.error("Erro ao atualizar agente: ", e);
    }
}

export const subscribeToAgent = (agentId: string, callback: (data: Personagem | null) => void) => {
    return onSnapshot(doc(db, "agentes", agentId), (doc) => {
        if (doc.exists()) {
            callback(doc.data() as Personagem);
        } else {
            callback(null);
        }
    });
};

export const getAgentFromCloud = async (agentId: string): Promise<Personagem | null> => {
    const docRef = doc(db, "agentes", agentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as Personagem;
    } else {
        return null;
    }
}
