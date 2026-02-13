"use client";

import { useEffect, useState, use } from "react";
import { getNoteBySlug, type Note } from "@/lib/pocketbase";
import { NoteEditor } from "@/components/editor/note-editor";
import { FileText, Lock } from "lucide-react";
import { countWords, readingTime } from "@/lib/utils";

export default function SharePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [note, setNote] = useState<Note | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const n = await getNoteBySlug(slug);
        setNote(n);
      } catch {
        setError(true);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Lock className="mb-4 h-12 w-12 text-neutral-300" />
        <h1 className="text-xl font-semibold">Note not found</h1>
        <p className="mt-1 text-sm text-neutral-500">
          This note doesn&apos;t exist or is no longer shared.
        </p>
      </div>
    );
  }

  const wordCount = countWords(note.content);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900 dark:bg-neutral-100">
              <FileText className="h-3.5 w-3.5 text-white dark:text-neutral-900" />
            </div>
            <span className="text-sm font-medium text-neutral-500">
              Shared note
            </span>
          </div>
          <div className="text-xs text-neutral-400">
            {wordCount} words &middot; {readingTime(wordCount)}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {note.icon && <span className="mr-2">{note.icon}</span>}
            {note.title || "Untitled"}
          </h1>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <NoteEditor
            noteId={note.id}
            initialContent={note.content}
            initialTitle={note.title}
            readOnly={!note.allow_edit}
          />
        </div>
      </main>
    </div>
  );
}
