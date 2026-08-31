import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { JournalEntry, InteractionTurn, UserProfile } from "../types";

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Initialize Cloud Firestore (supporting custom databaseId if configured)
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Zero-crash Payload Sanitizer (Strict Undefined Stripping)
export function sanitizePayload<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_key, value) => (value === undefined ? null : value)));
}

// Federated Google Sign-In
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (popupErr: any) {
    console.warn("Popup sign-in failed, trying redirect mode...", popupErr?.message);
    try {
      await signInWithRedirect(auth, googleProvider);
      return null;
    } catch (redirectErr) {
      console.error("Sign-in with redirect error:", redirectErr);
      throw redirectErr;
    }
  }
}

// Handle redirect result on page load
export async function checkRedirectResult(): Promise<FirebaseUser | null> {
  try {
    const result = await getRedirectResult(auth);
    return result ? result.user : null;
  } catch (err) {
    console.error("Error checking redirect result:", err);
    return null;
  }
}

// Sign Out
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

// Auth state observer
export function subscribeToAuthState(callback: (user: UserProfile | null) => void) {
  return onAuthStateChanged(auth, (fbUser) => {
    if (fbUser) {
      callback({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL,
      });
    } else {
      callback(null);
    }
  });
}

// Save an isolated interaction turn
export async function saveInteraction(userId: string, turn: InteractionTurn): Promise<void> {
  if (!userId) throw new Error("User ID is required to save interaction.");
  const sanitized = sanitizePayload(turn);
  const docRef = doc(db, `users/${userId}/interactions/${turn.id}`);
  await setDoc(docRef, sanitized, { merge: true });
}

// Fetch interaction history
export async function getInteractions(userId: string, maxLimit = 50): Promise<InteractionTurn[]> {
  if (!userId) return [];
  const colRef = collection(db, `users/${userId}/interactions`);
  const q = query(colRef, orderBy("timestamp", "desc"), limit(maxLimit));
  const snapshot = await getDocs(q);
  const list: InteractionTurn[] = [];
  snapshot.forEach((docSnap) => {
    list.push(docSnap.data() as InteractionTurn);
  });
  return list;
}

// Save complete Journal Entry
export async function saveJournalEntry(userId: string, entry: JournalEntry): Promise<void> {
  if (!userId) throw new Error("User ID is required to save journal entry.");
  const sanitized = sanitizePayload({
    ...entry,
    userId,
    updatedAt: Date.now(),
  });
  const docRef = doc(db, `users/${userId}/entries/${entry.id}`);
  await setDoc(docRef, sanitized, { merge: true });
}

// Fetch all Journal Entries for user
export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
  if (!userId) return [];
  const colRef = collection(db, `users/${userId}/entries`);
  const q = query(colRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  const entries: JournalEntry[] = [];
  snapshot.forEach((docSnap) => {
    entries.push(docSnap.data() as JournalEntry);
  });
  return entries;
}

// Delete a Journal Entry
export async function deleteJournalEntry(userId: string, entryId: string): Promise<void> {
  if (!userId || !entryId) return;
  const docRef = doc(db, `users/${userId}/entries/${entryId}`);
  await deleteDoc(docRef);
}
