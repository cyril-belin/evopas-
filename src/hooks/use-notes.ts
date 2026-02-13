"use client";

import { useState, useEffect, useCallback } from "react";
import type { Note } from "@/types";
import pb from "@/lib/pocketbase";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const userId = pb.authStore.record?.id || "demo-user";
      const records = await pb.collection("notes").getFullList({
        filter: `userId = "${userId}"`,
        sort: "-updated",
      });
      setNotes(
        records.map((r) => ({
          id: r.id,
          title: r.title || "",
          content: r.content || "",
          tags: r.tags || [],
          userId: r.userId,
          created: r.created,
          updated: r.updated,
        }))
      );
    } catch {
      // PocketBase not available, use local storage fallback
      const stored = localStorage.getItem("evopas-notes");
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const saveNote = useCallback(
    async (note: Partial<Note> & { id?: string }) => {
      try {
        if (note.id) {
          await pb.collection("notes").update(note.id, note);
        } else {
          const record = await pb.collection("notes").create({
            ...note,
            userId: pb.authStore.record?.id || "demo-user",
          });
          note.id = record.id;
        }
      } catch {
        // Fallback to local storage
        const existing = JSON.parse(localStorage.getItem("evopas-notes") || "[]");
        if (note.id) {
          const idx = existing.findIndex((n: Note) => n.id === note.id);
          if (idx >= 0) existing[idx] = { ...existing[idx], ...note, updated: new Date().toISOString() };
        } else {
          note.id = crypto.randomUUID();
          existing.unshift({
            ...note,
            id: note.id,
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            userId: "demo-user",
            tags: note.tags || [],
          });
        }
        localStorage.setItem("evopas-notes", JSON.stringify(existing));
      }
      await fetchNotes();
      return note;
    },
    [fetchNotes]
  );

  const removeNote = useCallback(
    async (id: string) => {
      try {
        await pb.collection("notes").delete(id);
      } catch {
        const existing = JSON.parse(localStorage.getItem("evopas-notes") || "[]");
        localStorage.setItem(
          "evopas-notes",
          JSON.stringify(existing.filter((n: Note) => n.id !== id))
        );
      }
      await fetchNotes();
    },
    [fetchNotes]
  );

  return { notes, loading, fetchNotes, saveNote, removeNote };
}
