"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { useNotesStore } from "@/stores/notes-store";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Settings,
  Moon,
  Sun,
  Pin,
  FolderIcon,
  Copy,
  Maximize,
  Grid,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    notes,
    createNewNote,
    setActiveNote,
    toggleFocusMode,
    viewMode,
    setViewMode,
    duplicateActiveNote,
    activeNote,
    togglePin,
  } = useNotesStore();
  const { resolvedTheme, setTheme } = useThemeStore();

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
    setSearch("");
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  const handleNewNote = async () => {
    if (!user) return;
    const note = await createNewNote(user.id);
    router.push(`/notes/${note.id}`);
    setOpen(false);
  };

  const handleSelectNote = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setActiveNote(note);
      router.push(`/notes/${note.id}`);
    }
    setOpen(false);
  };

  const filteredNotes = notes.filter(
    (n) =>
      !n.is_deleted &&
      (n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content
          .replace(/<[^>]*>/g, "")
          .toLowerCase()
          .includes(search.toLowerCase()))
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2"
          >
            <Command className="rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
              <div className="flex items-center border-b border-neutral-200 px-3 dark:border-neutral-700">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search notes, commands..."
                  className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-neutral-500">
                  No results found.
                </Command.Empty>

                {/* Actions */}
                <Command.Group
                  heading="Actions"
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-neutral-500"
                >
                  <CommandItem
                    icon={<Plus className="h-4 w-4" />}
                    onSelect={handleNewNote}
                  >
                    New note
                  </CommandItem>

                  <CommandItem
                    icon={
                      resolvedTheme === "dark" ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )
                    }
                    onSelect={() => {
                      setTheme(resolvedTheme === "dark" ? "light" : "dark");
                      setOpen(false);
                    }}
                  >
                    Toggle {resolvedTheme === "dark" ? "light" : "dark"} mode
                  </CommandItem>

                  <CommandItem
                    icon={<Maximize className="h-4 w-4" />}
                    onSelect={() => {
                      toggleFocusMode();
                      setOpen(false);
                    }}
                  >
                    Toggle focus mode
                  </CommandItem>

                  <CommandItem
                    icon={
                      viewMode === "grid" ? (
                        <List className="h-4 w-4" />
                      ) : (
                        <Grid className="h-4 w-4" />
                      )
                    }
                    onSelect={() => {
                      setViewMode(viewMode === "grid" ? "list" : "grid");
                      setOpen(false);
                    }}
                  >
                    Switch to {viewMode === "grid" ? "list" : "grid"} view
                  </CommandItem>

                  {activeNote && (
                    <>
                      <CommandItem
                        icon={<Pin className="h-4 w-4" />}
                        onSelect={() => {
                          togglePin(activeNote.id);
                          setOpen(false);
                        }}
                      >
                        {activeNote.is_pinned ? "Unpin" : "Pin"} current note
                      </CommandItem>
                      <CommandItem
                        icon={<Copy className="h-4 w-4" />}
                        onSelect={async () => {
                          if (user) {
                            const dup = await duplicateActiveNote(user.id);
                            if (dup) router.push(`/notes/${dup.id}`);
                          }
                          setOpen(false);
                        }}
                      >
                        Duplicate current note
                      </CommandItem>
                    </>
                  )}

                  <CommandItem
                    icon={<Trash2 className="h-4 w-4" />}
                    onSelect={() => {
                      router.push("/trash");
                      setOpen(false);
                    }}
                  >
                    Go to trash
                  </CommandItem>

                  <CommandItem
                    icon={<Settings className="h-4 w-4" />}
                    onSelect={() => {
                      router.push("/settings");
                      setOpen(false);
                    }}
                  >
                    Settings
                  </CommandItem>
                </Command.Group>

                {/* Notes */}
                {filteredNotes.length > 0 && (
                  <Command.Group
                    heading="Notes"
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-neutral-500"
                  >
                    {filteredNotes.slice(0, 10).map((note) => (
                      <CommandItem
                        key={note.id}
                        icon={
                          <span className="text-sm">{note.icon || "📝"}</span>
                        }
                        onSelect={() => handleSelectNote(note.id)}
                      >
                        {note.title || "Untitled"}
                      </CommandItem>
                    ))}
                  </Command.Group>
                )}
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CommandItem({
  children,
  icon,
  onSelect,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm aria-selected:bg-neutral-100 dark:aria-selected:bg-neutral-800"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-neutral-500">
        {icon}
      </span>
      {children}
    </Command.Item>
  );
}
