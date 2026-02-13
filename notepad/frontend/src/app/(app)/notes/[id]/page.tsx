"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { useNotesStore } from "@/stores/notes-store";
import { NoteEditor } from "@/components/editor/note-editor";
import { ShareDialog } from "@/components/collaboration/share-dialog";
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
  Share2,
  MoreHorizontal,
  Pin,
  Copy,
  Trash2,
  History,
  Maximize,
  Download,
  Star,
  Tag,
  Palette,
  ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getNoteVersions, createNoteVersion, restoreNoteVersion, type NoteVersion } from "@/lib/pocketbase";
import { formatDate } from "@/lib/utils";

export default function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    activeNote,
    loadNote,
    togglePin,
    deleteActiveNote,
    duplicateActiveNote,
    updateActiveNote,
    toggleFocusMode,
    focusMode,
  } = useNotesStore();

  const [shareOpen, setShareOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [colorDialogOpen, setColorDialogOpen] = useState(false);

  useEffect(() => {
    loadNote(id);
  }, [id, loadNote]);

  const handleDelete = async () => {
    await deleteActiveNote();
    router.push("/notes");
  };

  const handleDuplicate = async () => {
    if (!user) return;
    const dup = await duplicateActiveNote(user.id);
    if (dup) router.push(`/notes/${dup.id}`);
  };

  const handleExportMd = () => {
    if (!activeNote) return;
    const content = activeNote.content
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    const blob = new Blob([`# ${activeNote.title}\n\n${content}`], {
      type: "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeNote.title || "untitled"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleViewHistory = async () => {
    if (!activeNote) return;
    // Create a snapshot of current state first
    if (user) {
      await createNoteVersion(activeNote.id, activeNote.content, user.id);
    }
    const v = await getNoteVersions(activeNote.id);
    setVersions(v);
    setHistoryOpen(true);
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!activeNote) return;
    await restoreNoteVersion(activeNote.id, versionId);
    await loadNote(activeNote.id);
    setHistoryOpen(false);
  };

  const handleAddTag = () => {
    if (!activeNote || !tagInput.trim()) return;
    const newTags = [...(activeNote.tags || []), tagInput.trim()];
    updateActiveNote({ tags: newTags });
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    if (!activeNote) return;
    const newTags = (activeNote.tags || []).filter((t: string) => t !== tag);
    updateActiveNote({ tags: newTags });
  };

  const noteColors = [
    "", "#ef4444", "#f97316", "#eab308", "#22c55e",
    "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  ];

  if (!activeNote) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-neutral-200 p-3 dark:border-neutral-700">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="mb-4 h-10 w-64" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      {!focusMode && (
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:hidden"
              onClick={() => router.push("/notes")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-neutral-500">
              {activeNote.icon || "📝"} {activeNote.title || "Untitled"}
            </span>
            {activeNote.tags?.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShareOpen(true)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => togglePin(activeNote.id)}>
                  <Star className="mr-2 h-4 w-4" />
                  {activeNote.is_pinned ? "Unpin" : "Pin"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleFocusMode}>
                  <Maximize className="mr-2 h-4 w-4" />
                  Focus mode
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTagDialogOpen(true)}>
                  <Tag className="mr-2 h-4 w-4" />
                  Edit tags
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setColorDialogOpen(true)}>
                  <Palette className="mr-2 h-4 w-4" />
                  Change color
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleViewHistory}>
                  <History className="mr-2 h-4 w-4" />
                  Version history
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportMd}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as Markdown
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Move to trash
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <NoteEditor
          noteId={activeNote.id}
          initialContent={activeNote.content}
          initialTitle={activeNote.title}
        />
      </div>

      {/* Focus mode exit */}
      {focusMode && (
        <button
          onClick={toggleFocusMode}
          className="fixed right-4 top-4 z-50 rounded-md bg-neutral-100 px-3 py-1.5 text-xs text-neutral-500 transition-opacity hover:opacity-100 opacity-30 dark:bg-neutral-800"
        >
          Exit focus mode (Cmd+Shift+F)
        </button>
      )}

      {/* Share dialog */}
      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        note={activeNote}
      />

      {/* Version history dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Version history</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {versions.length === 0 ? (
              <p className="py-4 text-center text-sm text-neutral-500">
                No versions saved yet
              </p>
            ) : (
              versions.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {formatDate(v.created)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {v.content.replace(/<[^>]*>/g, "").substring(0, 80)}...
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestoreVersion(v.id)}
                  >
                    Restore
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tags dialog */}
      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit tags</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {activeNote.tags?.map((tag: string) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag} &times;
                </Badge>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddTag();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
              />
              <Button type="submit" size="sm">
                Add
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Color dialog */}
      <Dialog open={colorDialogOpen} onOpenChange={setColorDialogOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Note color</DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap gap-3">
            {noteColors.map((color) => (
              <button
                key={color || "none"}
                className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: color || "#e5e5e5",
                  borderColor:
                    activeNote.color === color ? "#000" : "transparent",
                }}
                onClick={() => {
                  updateActiveNote({ color });
                  setColorDialogOpen(false);
                }}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
