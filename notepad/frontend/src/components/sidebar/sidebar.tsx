"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { useNotesStore } from "@/stores/notes-store";
import { useThemeStore } from "@/stores/theme-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  FolderIcon,
  Plus,
  Search,
  Trash2,
  Settings,
  LogOut,
  Pin,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Moon,
  Sun,
  MoreHorizontal,
  Star,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { Note, Folder } from "@/lib/pocketbase";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const {
    notes,
    folders,
    activeNote,
    activeFolder,
    sidebarOpen,
    fetchNotes,
    fetchFolders,
    createNewNote,
    setActiveNote,
    setActiveFolder,
    toggleSidebar,
    togglePin,
    subscribeRealtime,
    unsubscribeRealtime,
  } = useNotesStore();
  const { theme, setTheme, resolvedTheme } = useThemeStore();
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchNotes(user.id, {
      folder: activeFolder || undefined,
      deleted: pathname === "/trash",
    });
    fetchFolders(user.id);
    subscribeRealtime(user.id);
    return () => unsubscribeRealtime();
  }, [user, activeFolder, pathname, fetchNotes, fetchFolders, subscribeRealtime, unsubscribeRealtime]);

  const handleNewNote = async () => {
    if (!user) return;
    const note = await createNewNote(user.id, activeFolder || undefined);
    router.push(`/notes/${note.id}`);
  };

  const handleCreateFolder = async () => {
    if (!user || !folderName.trim()) return;
    const { createNewFolder } = useNotesStore.getState();
    await createNewFolder(user.id, folderName.trim());
    setFolderName("");
    setCreatingFolder(false);
  };

  const handleSelectNote = (note: Note) => {
    setActiveNote(note);
    router.push(`/notes/${note.id}`);
  };

  const handleSelectFolder = (folder: Folder | null) => {
    setActiveFolder(folder?.id || null);
    if (folder) {
      router.push(`/notes?folder=${folder.id}`);
    } else {
      router.push("/notes");
    }
  };

  const pinnedNotes = notes.filter((n) => n.is_pinned);
  const regularNotes = notes.filter((n) => !n.is_pinned);

  if (!user) return null;

  return (
    <AnimatePresence initial={false}>
      {sidebarOpen ? (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex h-screen flex-col border-r border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900 dark:bg-neutral-100">
                <FileText className="h-3.5 w-3.5 text-white dark:text-neutral-900" />
              </div>
              <span className="text-sm font-semibold">Notepad</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={toggleSidebar}
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>

          {/* Search & New Note */}
          <div className="space-y-1 px-3 pb-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm text-neutral-500"
              onClick={() => {
                // Trigger command palette
                document.dispatchEvent(
                  new KeyboardEvent("keydown", {
                    key: "k",
                    metaKey: true,
                  })
                );
              }}
            >
              <Search className="h-4 w-4" />
              Search
              <kbd className="ml-auto rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-medium dark:bg-neutral-700">
                Cmd+K
              </kbd>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm"
              onClick={handleNewNote}
            >
              <Plus className="h-4 w-4" />
              New note
              <kbd className="ml-auto rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-medium dark:bg-neutral-700">
                Cmd+N
              </kbd>
            </Button>
          </div>

          <Separator />

          {/* Folders */}
          <div className="px-3 py-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                Folders
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => setCreatingFolder(true)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <button
              onClick={() => handleSelectFolder(null)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                !activeFolder
                  ? "bg-neutral-200 dark:bg-neutral-700"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              )}
            >
              <FileText className="h-4 w-4 text-neutral-500" />
              All notes
            </button>

            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleSelectFolder(folder)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                  activeFolder === folder.id
                    ? "bg-neutral-200 dark:bg-neutral-700"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                )}
              >
                <span className="text-sm">{folder.icon || "📁"}</span>
                <span className="truncate">{folder.name}</span>
                <ChevronRight className="ml-auto h-3 w-3 text-neutral-400" />
              </button>
            ))}

            {creatingFolder && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateFolder();
                }}
                className="mt-1"
              >
                <Input
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="h-7 text-sm"
                  autoFocus
                  onBlur={() => {
                    if (!folderName.trim()) setCreatingFolder(false);
                  }}
                />
              </form>
            )}
          </div>

          <Separator />

          {/* Notes list */}
          <ScrollArea className="flex-1">
            <div className="px-3 py-2">
              {/* Pinned */}
              {pinnedNotes.length > 0 && (
                <div className="mb-3">
                  <span className="mb-1 flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-neutral-400">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </span>
                  {pinnedNotes.map((note) => (
                    <NoteItem
                      key={note.id}
                      note={note}
                      isActive={activeNote?.id === note.id}
                      onSelect={handleSelectNote}
                      onTogglePin={togglePin}
                    />
                  ))}
                </div>
              )}

              {/* Regular notes */}
              {regularNotes.length > 0 && (
                <div>
                  {pinnedNotes.length > 0 && (
                    <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-neutral-400">
                      Notes
                    </span>
                  )}
                  {regularNotes.map((note) => (
                    <NoteItem
                      key={note.id}
                      note={note}
                      isActive={activeNote?.id === note.id}
                      onSelect={handleSelectNote}
                      onTogglePin={togglePin}
                    />
                  ))}
                </div>
              )}

              {notes.length === 0 && (
                <div className="py-8 text-center text-sm text-neutral-400">
                  No notes yet
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <Separator />
          <div className="space-y-1 p-3">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 text-sm",
                pathname === "/trash" && "bg-neutral-200 dark:bg-neutral-700"
              )}
              onClick={() => router.push("/trash")}
            >
              <Trash2 className="h-4 w-4" />
              Trash
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm"
              onClick={() => router.push("/settings")}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-sm text-neutral-500 truncate">
                {user.email}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    setTheme(resolvedTheme === "dark" ? "light" : "dark");
                  }}
                >
                  {resolvedTheme === "dark" ? (
                    <Sun className="h-3.5 w-3.5" />
                  ) : (
                    <Moon className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    logout();
                    router.push("/auth/login");
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.aside>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex h-screen w-12 flex-col items-center border-r border-neutral-200 py-3 dark:border-neutral-800"
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={toggleSidebar}
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NoteItem({
  note,
  isActive,
  onSelect,
  onTogglePin,
}: {
  note: Note;
  isActive: boolean;
  onSelect: (note: Note) => void;
  onTogglePin: (noteId: string) => void;
}) {
  return (
    <div
      className={cn(
        "group flex cursor-pointer items-start gap-2 rounded-md px-2 py-2 text-left transition-colors",
        isActive
          ? "bg-neutral-200 dark:bg-neutral-700"
          : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
      )}
      onClick={() => onSelect(note)}
    >
      <span className="mt-0.5 text-sm">{note.icon || "📝"}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {note.title || "Untitled"}
        </p>
        <p className="truncate text-xs text-neutral-400">
          {formatDate(note.last_edited_at || note.updated)}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3 w-3" />
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
