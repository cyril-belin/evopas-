"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Note } from "@/types";
import { useNotes } from "@/hooks/use-notes";
import { Editor } from "@/components/editor/Editor";
import { RelatedNotes } from "@/components/ai/RelatedNotes";
import { ArrowLeft, BookOpen, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const { notes, saveNote, loading } = useNotes();
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    if (!loading && params.id) {
      const found = notes.find((n) => n.id === params.id);
      if (found) {
        setNote(found);
      }
    }
  }, [notes, params.id, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-neutral-500 mb-4">Note introuvable</p>
          <Link href="/" className="text-blue-500 hover:underline">
            Retour aux notes
          </Link>
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
          className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          title="Dashboard"
        >
          <LayoutDashboard size={16} />
        </Link>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        <div className="px-8 py-2 border-b border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            <ArrowLeft size={14} />
            Toutes les notes
          </button>
        </div>
        <Editor
          key={note.id}
          note={note}
          onSave={(data) => saveNote(data)}
          allNotes={notes}
        />
        <RelatedNotes
          currentNote={note}
          allNotes={notes}
          onNavigate={(id) => router.push(`/notes/${id}`)}
        />
      </div>
    </div>
  );
}
