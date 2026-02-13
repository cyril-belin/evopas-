"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { useNotesStore } from "@/stores/notes-store";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  RotateCcw,
  X,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { deleteNote, restoreNote } from "@/lib/pocketbase";

export default function TrashPage() {
  const { user } = useAuthStore();
  const { notes, fetchNotes, loading } = useNotesStore();

  useEffect(() => {
    if (user) {
      fetchNotes(user.id, { deleted: true });
    }
  }, [user, fetchNotes]);

  const handleRestore = async (noteId: string) => {
    await restoreNote(noteId);
    if (user) fetchNotes(user.id, { deleted: true });
  };

  const handlePermanentDelete = async (noteId: string) => {
    if (!confirm("Permanently delete this note? This cannot be undone.")) return;
    await deleteNote(noteId, true);
    if (user) fetchNotes(user.id, { deleted: true });
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Trash
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Notes in trash are automatically deleted after 30 days
        </p>
      </div>

      {notes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <Trash2 className="mb-4 h-12 w-12 text-neutral-300 dark:text-neutral-600" />
          <p className="text-sm text-neutral-500">Trash is empty</p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {notes.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div>
                <p className="font-medium">
                  {note.icon} {note.title || "Untitled"}
                </p>
                <p className="text-xs text-neutral-500">
                  Deleted {formatDate(note.updated)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(note.id)}
                >
                  <RotateCcw className="mr-2 h-3 w-3" />
                  Restore
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 dark:text-red-400"
                  onClick={() => handlePermanentDelete(note.id)}
                >
                  <X className="mr-2 h-3 w-3" />
                  Delete forever
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
