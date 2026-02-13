"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { useNotesStore } from "@/stores/notes-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FolderIcon,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Folder } from "@/lib/pocketbase";

export default function FoldersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    folders,
    fetchFolders,
    createNewFolder,
    updateExistingFolder,
    deleteExistingFolder,
    setActiveFolder,
  } = useNotesStore();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (user) fetchFolders(user.id);
  }, [user, fetchFolders]);

  const handleCreate = async () => {
    if (!user || !newName.trim()) return;
    await createNewFolder(user.id, newName.trim());
    setNewName("");
    setCreating(false);
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) return;
    await updateExistingFolder(id, { name: editName.trim() });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this folder? Notes inside will not be deleted."))
      return;
    await deleteExistingFolder(id);
  };

  const handleSelectFolder = (folder: Folder) => {
    setActiveFolder(folder.id);
    router.push(`/notes?folder=${folder.id}`);
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <FolderIcon className="h-5 w-5" />
          Folders
        </h1>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New folder
        </Button>
      </div>

      {creating && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
          className="mb-4 flex gap-2"
        >
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Folder name"
            autoFocus
          />
          <Button type="submit" size="sm">
            Create
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCreating(false)}
          >
            Cancel
          </Button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {folders.map((folder, i) => (
          <motion.div
            key={folder.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative cursor-pointer rounded-lg border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
            onClick={() => handleSelectFolder(folder)}
          >
            {editingId === folder.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRename(folder.id);
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  onBlur={() => setEditingId(null)}
                />
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl">{folder.icon || "📁"}</span>
                <div>
                  <p className="font-medium">{folder.name}</p>
                </div>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(folder.id);
                    setEditName(folder.name);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(folder.id);
                  }}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        ))}
      </div>

      {folders.length === 0 && !creating && (
        <div className="flex flex-col items-center justify-center py-16">
          <FolderIcon className="mb-4 h-12 w-12 text-neutral-300 dark:text-neutral-600" />
          <p className="text-sm text-neutral-500">No folders yet</p>
        </div>
      )}
    </div>
  );
}
