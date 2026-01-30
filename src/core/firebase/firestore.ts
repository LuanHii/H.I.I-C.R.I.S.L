import { db, auth } from './config';
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Personagem } from '../types';
interface AgentDocument extends Personagem {
    ownerId?: string;
    updatedAt?: string;
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
        await updateDoc(agentRef, updatesWithTimestamp);
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
