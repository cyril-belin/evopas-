"use client";

import { useState, useCallback, useEffect } from "react";
import type { Note } from "@/types";
import { NotesList } from "../notes/NotesList";
import { Editor } from "../editor/Editor";
import { AskNotesDialog } from "../ai/AskNotesDialog";
import { RelatedNotes } from "../ai/RelatedNotes";
import { useNotes } from "@/hooks/use-notes";
import { BookOpen, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";

export function AppLayout() {
  const { notes, loading, saveNote, removeNote } = useNotes();
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [askNotesOpen, setAskNotesOpen] = useState(false);

  // Set active note to first note on load
  useEffect(() => {
    if (notes.length > 0 && !activeNote) {
      setActiveNote(notes[0]);
    }
  }, [notes, activeNote]);

  // Update active note when notes change
  useEffect(() => {
    if (activeNote) {
      const updated = notes.find((n) => n.id === activeNote.id);
      if (updated) setActiveNote(updated);
    }
  }, [notes, activeNote]);

  // Cmd+K handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setAskNotesOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleCreateNote = useCallback(async () => {
    const newNote = await saveNote({
      title: "",
      content: "",
      tags: [],
    });
    if (newNote) {
      setActiveNote(newNote as Note);
    }
  }, [saveNote]);

  const handleSaveNote = useCallback(
    (data: Partial<Note>) => {
      saveNote(data);
    },
    [saveNote]
  );

  const handleDeleteNote = useCallback(
    async (id: string) => {
      await removeNote(id);
      if (activeNote?.id === id) {
        setActiveNote(notes.find((n) => n.id !== id) || null);
      }
    },
    [removeNote, activeNote, notes]
  );

  const handleNavigateToNote = useCallback(
    (noteId: string) => {
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        setActiveNote(note);
        setAskNotesOpen(false);
      }
    },
    [notes]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-neutral-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-neutral-500">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-neutral-900">
      {/* Sidebar nav */}
      <div className="w-12 flex flex-col items-center py-4 gap-3 bg-neutral-100 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800">
        <Link href="/" className="p-2 rounded-lg bg-blue-500 text-white" title="Notes">
          <BookOpen size={16} />
        </Link>
        <Link
          href="/dashboard"
          className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          title="Dashboard"
        >
          <LayoutDashboard size={16} />
        </Link>
        <div className="mt-auto">
          <button className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors" title="Paramètres">
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Notes list */}
      <div className="w-72 shrink-0">
        <NotesList
          notes={notes}
          activeNoteId={activeNote?.id}
          onSelect={setActiveNote}
          onCreate={handleCreateNote}
          onDelete={handleDeleteNote}
        />
      </div>

      {/* Editor area */}
      <div className="flex-1 flex flex-col">
        {activeNote ? (
          <>
            <Editor
              key={activeNote.id}
              note={activeNote}
              onSave={handleSaveNote}
              allNotes={notes}
            />
            <RelatedNotes
              currentNote={activeNote}
              allNotes={notes}
              onNavigate={handleNavigateToNote}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BookOpen size={48} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
              <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                Sélectionnez une note ou créez-en une nouvelle
              </p>
              <button
                onClick={handleCreateNote}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors"
              >
                Nouvelle note
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ask Notes Dialog */}
      <AskNotesDialog
        open={askNotesOpen}
        onClose={() => setAskNotesOpen(false)}
        notes={notes}
        onNavigateToNote={handleNavigateToNote}
      />
    </div>
  );
}
