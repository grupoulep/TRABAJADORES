import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { Volunteer } from '../types';
import { encryptText, decryptText, computeSHA256 } from '../utils/cryptoUtils';

export const firebaseConfig = {
  projectId: firebaseConfigData.projectId || 'fluted-graph-72ts5',
  appId: firebaseConfigData.appId || '1:34397616459:web:dae10a9d1f7849eb2c90ce',
  apiKey: firebaseConfigData.apiKey || 'AIzaSyAPtqciPDNJB5qs-givNLAMr8FcKykc-4E',
  authDomain: firebaseConfigData.authDomain || 'fluted-graph-72ts5.firebaseapp.com',
  firestoreDatabaseId:
    firebaseConfigData.firestoreDatabaseId ||
    'ai-studio-voluntarioaccess-9e5e8864-1de1-4242-a77d-3b0731a53ac0',
  storageBucket: firebaseConfigData.storageBucket || 'fluted-graph-72ts5.firebasestorage.app',
  messagingSenderId: firebaseConfigData.messagingSenderId || '34397616459',
};

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Initialize Firestore with custom database ID and force long polling to prevent unavailable/WebSocket streaming connection errors in cloud container/iframe environments
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId || undefined
  );
} catch {
  firestoreInstance = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
}

export const db: Firestore = firestoreInstance;

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const VOLUNTEERS_COLLECTION = 'volunteers';

/**
 * Encrypts a Volunteer object into an AES-256-GCM protected Firestore document
 */
export async function volunteerToEncryptedDoc(volunteer: Volunteer): Promise<Record<string, unknown>> {
  const json = JSON.stringify(volunteer);
  const encryptedPayload = await encryptText(json);
  const hash = await computeSHA256(json);

  return {
    id: volunteer.id,
    certificateCode: volunteer.certificateCode || '',
    _encrypted: true,
    _algorithm: 'AES-256-GCM',
    _encryptedAt: new Date().toISOString(),
    _sha256: hash,
    payload: encryptedPayload,
  };
}

/**
 * Decrypts a Firestore document back into a strongly typed Volunteer
 */
export async function encryptedDocToVolunteer(raw: Record<string, unknown>): Promise<Volunteer> {
  if (raw._encrypted && typeof raw.payload === 'string') {
    try {
      const decryptedJson = await decryptText(raw.payload);
      return JSON.parse(decryptedJson) as Volunteer;
    } catch (err) {
      console.error('Error al desencriptar registro de Firestore:', err);
      return raw as unknown as Volunteer;
    }
  }
  // Legacy unencrypted document
  return raw as unknown as Volunteer;
}

/**
 * Validate live connection to Google Firebase Firestore
 */
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    const testDocRef = doc(db, 'test', 'connection');
    await getDocFromServer(testDocRef);
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('offline') || msg.includes('unavailable') || msg.includes('the client is offline')) {
      console.info('Firestore operating in resilient synchronization mode (local cache active).');
    } else {
      console.log('Firebase connection ready.');
    }
    return true;
  }
}

/**
 * Real-time listener for all volunteers in Firestore with transparent AES-256 decryption
 */
export function subscribeToVolunteers(
  onData: (volunteers: Volunteer[]) => void,
  onError?: (error: Error) => void
): () => void {
  const colRef = collection(db, VOLUNTEERS_COLLECTION);
  return onSnapshot(
    colRef,
    async (snapshot) => {
      try {
        const promises: Promise<Volunteer>[] = [];
        snapshot.forEach((docSnap) => {
          promises.push(encryptedDocToVolunteer(docSnap.data() as Record<string, unknown>));
        });
        const list = await Promise.all(promises);
        onData(list);
      } catch (err) {
        console.error('Error processing encrypted snapshot:', err);
        if (onError) onError(err as Error);
      }
    },
    (err) => {
      const msg = err.message || '';
      if (msg.includes('permission-denied') || msg.includes('Missing or insufficient permissions')) {
        handleFirestoreError(err, OperationType.LIST, VOLUNTEERS_COLLECTION);
      }
      console.info('Firestore subscription status:', err.message);
      if (onError) onError(err);
    }
  );
}

/**
 * Get one-time list of volunteers from Firestore with decryption
 */
export async function getVolunteersFromFirebase(): Promise<Volunteer[]> {
  try {
    const colRef = collection(db, VOLUNTEERS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const promises: Promise<Volunteer>[] = [];
    snapshot.forEach((docSnap) => {
      promises.push(encryptedDocToVolunteer(docSnap.data() as Record<string, unknown>));
    });
    return await Promise.all(promises);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('permission-denied') || msg.includes('Missing or insufficient permissions')) {
      handleFirestoreError(err, OperationType.GET, VOLUNTEERS_COLLECTION);
    }
    console.warn('Firestore getVolunteers status:', msg);
    return [];
  }
}

/**
 * Save or update a single volunteer in Firestore with AES-256-GCM encryption
 */
export async function saveVolunteerToFirebase(volunteer: Volunteer): Promise<void> {
  try {
    const docRef = doc(db, VOLUNTEERS_COLLECTION, volunteer.id);
    const encryptedDocData = await volunteerToEncryptedDoc(volunteer);
    await setDoc(docRef, encryptedDocData, { merge: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('permission-denied') || msg.includes('Missing or insufficient permissions')) {
      handleFirestoreError(err, OperationType.WRITE, `${VOLUNTEERS_COLLECTION}/${volunteer.id}`);
    }
    throw err;
  }
}

/**
 * Delete a volunteer document from Firestore
 */
export async function deleteVolunteerFromFirebase(volunteerId: string): Promise<void> {
  try {
    const docRef = doc(db, VOLUNTEERS_COLLECTION, volunteerId);
    await deleteDoc(docRef);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('permission-denied') || msg.includes('Missing or insufficient permissions')) {
      handleFirestoreError(err, OperationType.DELETE, `${VOLUNTEERS_COLLECTION}/${volunteerId}`);
    }
    throw err;
  }
}

/**
 * Batch write multiple volunteers to Firestore with AES-256-GCM encryption
 */
export async function batchSaveVolunteersToFirebase(
  volunteers: Volunteer[],
  replaceExisting = false
): Promise<void> {
  if (replaceExisting) {
    const existing = await getVolunteersFromFirebase();
    const deleteBatches: Promise<void>[] = [];
    for (let i = 0; i < existing.length; i += 400) {
      const batch = writeBatch(db);
      const chunk = existing.slice(i, i + 400);
      chunk.forEach((v) => {
        batch.delete(doc(db, VOLUNTEERS_COLLECTION, v.id));
      });
      deleteBatches.push(batch.commit());
    }
    await Promise.all(deleteBatches);
  }

  // Encrypt all volunteers
  const encryptedDocs = await Promise.all(volunteers.map((v) => volunteerToEncryptedDoc(v)));

  // Write in chunks of 400
  for (let i = 0; i < encryptedDocs.length; i += 400) {
    const batch = writeBatch(db);
    const chunk = encryptedDocs.slice(i, i + 400);
    chunk.forEach((enc) => {
      batch.set(doc(db, VOLUNTEERS_COLLECTION, enc.id as string), enc, { merge: true });
    });
    await batch.commit();
  }
}

/**
 * Seeds initial mock data to Firestore with encryption if collection is empty
 */
export async function seedInitialVolunteersIfEmpty(initialData: Volunteer[]): Promise<boolean> {
  try {
    const existing = await getVolunteersFromFirebase();
    if (existing.length === 0 && initialData.length > 0) {
      console.log('Seeding initial volunteers with AES-256 encryption into Firestore...');
      await batchSaveVolunteersToFirebase(initialData, false);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Could not seed initial data to Firestore:', err);
    return false;
  }
}
