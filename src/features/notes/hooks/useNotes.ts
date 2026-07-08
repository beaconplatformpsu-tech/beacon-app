"use client";

import { useState, useEffect } from "react";
import { noteService } from "../services/noteService";
import type { Note } from "../types";

/**
 * Subscribes to the current user's notes in Firebase Realtime DB.
 * Returns a live-updating list of notes (pinned first, then newest), and a loading flag.
 */
export function useNotes(userId: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = noteService.subscribeToNotes(userId, (liveNotes) => {
      setNotes(liveNotes as Note[]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { notes, loading };
}

