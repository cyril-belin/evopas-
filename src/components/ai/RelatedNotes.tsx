"use client";

import { useEffect, useState, useCallback } from "react";
import { Link2, Loader2 } from "lucide-react";
import type { Note } from "@/types";

interface RelatedNotesProps {
  currentNote: Note;
  allNotes: Note[];
  onNavigate: (noteId: string) => void;
}

interface RelatedNote {
  id: string;
  title: string;
  reason: string;
}

export function RelatedNotes({ currentNote, allNotes, onNavigate }: RelatedNotesProps) {
  const [relatedNotes, setRelatedNotes] = useState<RelatedNote[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRelatedNotes = useCallback(async () => {
    if (!currentNote.content || allNotes.length < 2) return;

    setLoading(true);
    try {
      const response = await fetch("/api/ai/related-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: currentNote.content,
          notesContext: allNotes
            .filter((n) => n.id !== currentNote.id)
            .slice(0, 10)
            .map((n) => `[ID:${n.id}][${n.title || "Sans titre"}]\n${n.content}`),
          userId: "demo-user",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRelatedNotes(data.relatedNotes?.slice(0, 3) || []);
      }
    } catch {
      // silently fail
    }
    setLoading(false);
  }, [currentNote.id, currentNote.content, allNotes]);

  useEffect(() => {
    const timeout = setTimeout(fetchRelatedNotes, 2000);
    return () => clearTimeout(timeout);
  }, [fetchRelatedNotes]);

  if (!relatedNotes.length && !loading) return null;

  return (
    <div className="px-8 py-4 border-t border-neutral-200 dark:border-neutral-800">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
        <Link2 size={12} />
        Notes similaires
      </h3>
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Loader2 size={12} className="animate-spin" />
          Recherche de notes similaires...
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {relatedNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => onNavigate(note.id)}
              className="flex items-start gap-2 p-2 rounded-lg text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
            >
              <span className="font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {note.title || "Sans titre"}
              </span>
              <span className="text-xs text-neutral-400 mt-0.5">{note.reason}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
