import React, { useState, useEffect, useCallback } from "react";
import { UserProfile, JournalEntry } from "./types";
import {
  signInWithGoogle,
  signOutUser,
  subscribeToAuthState,
  checkRedirectResult,
  getJournalEntries,
  deleteJournalEntry,
} from "./lib/firebase";
import { LandingPage } from "./components/LandingPage";
import { DashboardHeader } from "./components/DashboardHeader";
import { EntryComposer } from "./components/EntryComposer";
import { EntryHistory } from "./components/EntryHistory";
import { EntryDetailModal } from "./components/EntryDetailModal";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<"compose" | "history">("compose");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Check auth state observer
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    // Check for redirect sign-in results if any
    checkRedirectResult()
      .then((user) => {
        if (user) {
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          });
        }
      })
      .catch((err) => {
        console.error("Auth redirect handling error:", err);
      });

    return () => unsubscribe();
  }, []);

  // Fetch entries when user is authenticated
  const fetchEntries = useCallback(async () => {
    if (!currentUser?.uid) return;
    setEntriesLoading(true);
    try {
      const data = await getJournalEntries(currentUser.uid);
      setEntries(data);
    } catch (err: any) {
      console.error("Error loading journal entries:", err);
    } finally {
      setEntriesLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    if (currentUser?.uid) {
      fetchEntries();
    } else {
      setEntries([]);
    }
  }, [currentUser?.uid, fetchEntries]);

  // Sign In handler
  const handleSignIn = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Sign in failed:", err);
      setAuthError(
        err?.message ||
          "Could not sign in with Google. If popups are blocked in preview, please allow popups or open in a new tab."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign Out handler
  const handleSignOut = async () => {
    try {
      await signOutUser();
      setCurrentUser(null);
      setActiveView("compose");
      setSelectedEntry(null);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  // After an entry is saved in composer
  const handleEntrySaved = (newEntry: JournalEntry) => {
    setEntries((prev) => [newEntry, ...prev.filter((e) => e.id !== newEntry.id)]);
    setActiveView("history");
  };

  // Delete an entry from Firestore
  const handleDeleteEntry = async (entryId: string) => {
    if (!currentUser?.uid) return;
    try {
      await deleteJournalEntry(currentUser.uid, entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null);
      }
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  // Initial Auth Loading Screen
  if (authLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-zinc-400 gap-3">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-amber-400 rounded-full animate-spin" />
        <span className="text-xs font-medium tracking-wide text-zinc-400">Connecting to Secure Session...</span>
      </div>
    );
  }

  // If not authenticated, display Landing Page with Google Sign-In prompt
  if (!currentUser) {
    return (
      <LandingPage
        onSignIn={handleSignIn}
        loading={authLoading}
        error={authError}
      />
    );
  }

  // Authenticated Private Dashboard
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col selection:bg-amber-500/20 selection:text-amber-200 font-sans">
      <DashboardHeader
        user={currentUser}
        activeView={activeView}
        onViewChange={(view) => setActiveView(view)}
        onSignOut={handleSignOut}
        entriesCount={entries.length}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-8">
        {activeView === "compose" ? (
          <EntryComposer
            userId={currentUser.uid}
            onEntrySaved={handleEntrySaved}
          />
        ) : (
          <EntryHistory
            entries={entries}
            loading={entriesLoading}
            onSelectEntry={(entry) => setSelectedEntry(entry)}
            onNewReflection={() => setActiveView("compose")}
            onRefresh={fetchEntries}
            onDeleteEntry={handleDeleteEntry}
          />
        )}
      </main>

      {/* Entry Detail Inspection Modal */}
      {selectedEntry && (
        <EntryDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onDelete={handleDeleteEntry}
        />
      )}
    </div>
  );
}
