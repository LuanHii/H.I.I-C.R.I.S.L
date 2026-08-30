import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

/**
 * Inicialização do Firebase tolerante à ausência de credenciais.
 *
 * O problema original: `getAuth(app)` roda no carregamento do módulo e LANÇA
 * `auth/invalid-api-key` quando não há credencial. Como Firebase é importado
 * transitivamente por vários componentes, isso derrubava o app inteiro no boot
 * — e a nuvem aqui é opcional: as fichas vivem em localStorage.
 *
 * Só `getAuth` lança. `initializeApp` e `getFirestore` aceitam config vazia sem
 * reclamar, e devolvem objetos reais.
 *
 * IMPORTANTE — não use Proxy aqui. Uma tentativa anterior embrulhou `db` num
 * Proxy preguiçoso e quebrou o app com "Expected first argument to collection()
 * to be a CollectionReference, a DocumentReference or FirebaseFirestore":
 * o SDK do Firestore valida o TIPO REAL do objeto que recebe, e um Proxy não
 * passa nessa checagem por mais fiel que seja o encaminhamento de propriedades.
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/** Há credencial configurada? Se não, o app roda apenas em modo local. */
export function firebaseConfigurado(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

/** Instância real do Firestore — nunca um Proxy. Ver comentário no topo. */
export const db: Firestore = getFirestore(app);

/**
 * `auth` é `null` quando não há credencial, em vez de lançar no import.
 *
 * O tipo continua sendo `Auth` para não obrigar cada call site a tratar null: os
 * consumidores checam `firebaseConfigurado()` antes de usar (ver `auth.ts`), e
 * é isso que mantém o modo local funcionando.
 */
export const auth: Auth = firebaseConfigurado()
  ? getAuth(app)
  : (null as unknown as Auth);

if (!firebaseConfigurado() && typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.warn(
    '[firebase] Sem credenciais (NEXT_PUBLIC_FIREBASE_API_KEY). ' +
    'O app segue em modo local; a sincronização com a nuvem fica indisponível.',
  );
}

/** `GoogleAuthProvider` é puro: não toca no app, então pode ser construído já. */
export const googleProvider = new GoogleAuthProvider();
