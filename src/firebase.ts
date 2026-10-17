import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, onSnapshot, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { TournamentStore } from './types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID (CRITICAL: Required for Enterprise edition)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Whitelist of emails granted full editing rights (Ban Tổ Chức)
export const AUTHORIZED_EMAILS: readonly string[] = [
  'daovankhuonbtvn@gmail.com',
  'nguyentoan255715@gmail.com',
  'daovankhuon_thpt_tts@bentre.edu.vn',
  'thao0311@gmail.com',
];

export function isAuthorizedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return AUTHORIZED_EMAILS.some((authorized) => authorized.toLowerCase() === normalized);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot as mandated by guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'tournaments', 'main_tournament'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using offline cache.');
    }
  }
}

// Sign in with Google Popup
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Sign out
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

const TOURNAMENT_DOC_PATH = 'tournaments/main_tournament';

// Subscribe to real-time tournament changes
export function subscribeTournament(
  onData: (data: TournamentStore) => void,
  onError?: (err: any) => void
) {
  const tournamentDocRef = doc(db, 'tournaments', 'main_tournament');
  return onSnapshot(
    tournamentDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const docData = snapshot.data();
        if (docData && docData.divisions) {
          onData({
            title: docData.title || undefined,
            subtitle: docData.subtitle || undefined,
            divisions: docData.divisions,
            sheetSyncUrl: docData.sheetSyncUrl || undefined,
            lastSheetSync: docData.lastSheetSync || undefined,
          } as TournamentStore);
        }
      }
    },
    (error) => {
      console.warn('Subscription error:', error);
      if (onError) onError(error);
    }
  );
}

// Save tournament data to Firestore
export async function syncTournamentToFirestore(
  data: TournamentStore,
  user?: User | null
): Promise<void> {
  const tournamentDocRef = doc(db, 'tournaments', 'main_tournament');
  try {
    await setDoc(tournamentDocRef, {
      id: 'main_tournament',
      title: data.title || 'ĐẠI HỘI TDTT 2026-2027',
      subtitle: data.subtitle || 'THCS-THPT TRẦN TRƯỜNG SINH',
      divisions: data.divisions,
      sheetSyncUrl: data.sheetSyncUrl || null,
      lastSheetSync: data.lastSheetSync || null,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email || user?.uid || 'authenticated_btc'
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, TOURNAMENT_DOC_PATH);
  }
}
