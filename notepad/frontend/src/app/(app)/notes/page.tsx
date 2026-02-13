"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { useNotesStore } from "@/stores/notes-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Grid,
  List,
  Pin,
  MoreHorizontal,
  Copy,
  Trash2,
  Star,
  FileText,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { Note } from "@/lib/pocketbase";

export default function NotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folder");
  const { user } = useAuthStore();
  const {
    notes,
    loading,
    viewMode,
    setViewMode,
    fetchNotes,
    createNewNote,
    setActiveNote,
    setActiveFolder,
    togglePin,
    deleteActiveNote,
  } = useNotesStore();

  useEffect(() => {
    if (folderId) {
      setActiveFolder(folderId);
    }
  }, [folderId, setActiveFolder]);

  const handleNewNote = async () => {
    if (!user) return;
    const note = await createNewNote(user.id, folderId || undefined);
    router.push(`/notes/${note.id}`);
  };

  const handleSelectNote = (note: Note) => {
    setActiveNote(note);
    router.push(`/notes/${note.id}`);
  };

  const handleDeleteNote = async (note: Note) => {
    setActiveNote(note);
    const store = useNotesStore.getState();
    await store.deleteActiveNote();
  };

  const handleDuplicateNote = async (note: Note) => {
    if (!user) return;
    setActiveNote(note);
    const store = useNotesStore.getState();
    const dup = await store.duplicateActiveNote(user.id);
    if (dup) router.push(`/notes/${dup.id}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className={cn(
          "gap-4",
          viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col"
        )}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notes</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? (
              <List className="h-4 w-4" />
            ) : (
              <Grid className="h-4 w-4" />
            )}
          </Button>
          <Button onClick={handleNewNote} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New note
          </Button>
        </div>
      </div>

      {/* Notes grid/list */}
      {notes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            <FileText className="h-8 w-8 text-neutral-400" />
          </div>
          <h2 className="mb-1 text-lg font-medium">No notes yet</h2>
          <p className="mb-4 text-sm text-neutral-500">
            Create your first note to get started
          </p>
          <Button onClick={handleNewNote} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New note
          </Button>
        </motion.div>
      ) : (
        <div
          className={cn(
            "gap-3",
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "flex flex-col"
          )}
        >
          {notes.map((note, index) => (
            <NoteCard
              key={note.id}
              note={note}
              viewMode={viewMode}
              index={index}
              onSelect={handleSelectNote}
              onTogglePin={togglePin}
              onDelete={handleDeleteNote}
              onDuplicate={handleDuplicateNote}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteCard({
  note,
  viewMode,
  index,
  onSelect,
  onTogglePin,
  onDelete,
  onDuplicate,
}: {
  note: Note;
  viewMode: "grid" | "list";
  index: number;
  onSelect: (note: Note) => void;
  onTogglePin: (id: string) => void;
  onDelete: (note: Note) => void;
  onDuplicate: (note: Note) => void;
}) {
  const plainContent = note.content
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "group relative cursor-pointer rounded-lg border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700",
        note.color && `border-l-4`,
        viewMode === "list" && "flex items-center gap-4"
      )}
      style={note.color ? { borderLeftColor: note.color } : undefined}
      onClick={() => onSelect(note)}
    >
      <div className={cn("min-w-0 flex-1", viewMode === "grid" && "space-y-2")}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {note.icon && <span className="text-sm">{note.icon}</span>}
            <h3 className="truncate font-medium">
              {note.title || "Untitled"}
            </h3>
          </div>
          {note.is_pinned && (
            <Pin className="h-3 w-3 shrink-0 text-yellow-500" />
          )}
        </div>

        {viewMode === "grid" && (
          <p className="line-clamp-3 text-sm text-neutral-500">
            {plainContent || "Empty note"}
          </p>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">
            {formatDate(note.last_edited_at || note.updated)}
          </span>
          {note.tags?.map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note.id);
            }}
          >
            <Star className="mr-2 h-4 w-4" />
            {note.is_pinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(note);
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note);
            }}
            className="text-red-600 dark:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
