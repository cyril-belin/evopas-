"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Command } from "cmdk";
import { Search, Sparkles, X, ExternalLink } from "lucide-react";
import { useAI } from "@/hooks/use-ai";
import type { Note } from "@/types";

interface AskNotesDialogProps {
  open: boolean;
  onClose: () => void;
  notes: Note[];
  onNavigateToNote?: (noteId: string) => void;
}

export function AskNotesDialog({ open, onClose, notes, onNavigateToNote }: AskNotesDialogProps) {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const { execute, abort, isLoading, streamedText } = useAI({
    onStream: (text) => setAnswer(text),
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setAnswer("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Keyboard shortcut Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleAsk = useCallback(async () => {
    if (!query.trim() || isLoading) return;
    setIsAnswering(true);
    setAnswer("");
    try {
      await execute("ask-notes", {
        content: query,
        notesContext: notes.slice(0, 10).map((n) => `[${n.title || "Sans titre"}]\n${n.content}`),
        userId: "demo-user",
      });
    } catch {
      // handled by hook
    }
    setIsAnswering(false);
  }, [query, notes, execute, isLoading]);

  // Parse source references [Note Title] in answer
  const renderAnswer = (text: string) => {
    const parts = text.split(/\[([^\]]+)\]/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        // This is a note title reference
        const matchedNote = notes.find(
          (n) => n.title.toLowerCase() === part.toLowerCase()
        );
        if (matchedNote) {
          return (
            <button
              key={i}
              onClick={() => onNavigateToNote?.(matchedNote.id)}
              className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              [{part}]
              <ExternalLink size={10} />
            </button>
          );
        }
        return <span key={i} className="text-blue-600 dark:text-blue-400 font-medium">[{part}]</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <Command className="w-full" shouldFilter={false}>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
            <Search size={18} className="text-neutral-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAsk();
                if (e.key === "Escape") onClose();
              }}
              placeholder="Pose une question à tes notes..."
              className="flex-1 bg-transparent border-none outline-none text-neutral-900 dark:text-white placeholder:text-neutral-400"
            />
            <button
              onClick={handleAsk}
              disabled={isLoading || !query.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Sparkles size={14} />
              Demander
            </button>
            <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600">
              <X size={16} />
            </button>
          </div>

          {/* Answer area */}
          {(answer || isLoading) && (
            <div className="px-4 py-4 max-h-80 overflow-y-auto">
              {isLoading && !answer && (
                <div className="flex items-center gap-2 text-sm text-blue-500">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Recherche dans tes notes...
                </div>
              )}
              {answer && (
                <div className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {renderAnswer(answer)}
                  {isLoading && (
                    <span className="inline-block w-1.5 h-4 bg-blue-500 animate-pulse ml-0.5" />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick note suggestions */}
          {!answer && !isLoading && (
            <Command.List className="max-h-60 overflow-y-auto p-2">
              <Command.Empty className="px-4 py-8 text-center text-sm text-neutral-400">
                Tape une question et appuie sur Entrée
              </Command.Empty>
              {notes.slice(0, 5).map((note) => (
                <Command.Item
                  key={note.id}
                  onSelect={() => {
                    setQuery(`Que dit la note "${note.title}" ?`);
                    inputRef.current?.focus();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <span className="truncate">{note.title || "Sans titre"}</span>
                  <span className="ml-auto text-xs text-neutral-400">
                    {new Date(note.updated).toLocaleDateString("fr-FR")}
                  </span>
                </Command.Item>
              ))}
            </Command.List>
          )}
        </Command>
      </div>
    </div>
  );
}
