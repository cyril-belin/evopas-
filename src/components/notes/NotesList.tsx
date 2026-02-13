"use client";

import { useState } from "react";
import { Plus, Search, FileText, Trash2, Tag } from "lucide-react";
import type { Note } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface NotesListProps {
  notes: Note[];
  activeNoteId?: string;
  onSelect: (note: Note) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export function NotesList({ notes, activeNoteId, onSelect, onCreate, onDelete }: NotesListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Notes</h2>
          <button
            onClick={onCreate}
            className="p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            title="Nouvelle note"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 outline-none focus:ring-2 focus:ring-blue-500/30 text-neutral-900 dark:text-white placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-neutral-400">
            {searchQuery ? "Aucun résultat" : "Aucune note"}
          </div>
        ) : (
          filtered.map((note) => (
            <button
              key={note.id}
              onClick={() => onSelect(note)}
              className={`w-full text-left px-4 py-3 border-b border-neutral-100 dark:border-neutral-900 transition-colors group ${
                activeNoteId === note.id
                  ? "bg-blue-50 dark:bg-blue-950/30 border-l-2 border-l-blue-500"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <FileText size={12} className="text-neutral-400 shrink-0" />
                    <span className="font-medium text-sm text-neutral-900 dark:text-white truncate">
                      {note.title || "Sans titre"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                    {stripHtml(note.content) || "Note vide"}
                  </p>
                  {note.tags?.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <Tag size={10} className="text-neutral-400" />
                      {note.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-[10px] text-neutral-400 mt-1 block">
                    {formatDistanceToNow(new Date(note.updated), { addSuffix: true, locale: fr })}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(note.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-400">
        {notes.length} note{notes.length !== 1 ? "s" : ""} • Cmd+K pour chercher
      </div>
    </div>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}
