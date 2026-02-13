"use client";

import { useCallback, useRef, useEffect } from "react";
import { useNotesStore } from "@/stores/notes-store";

export function useAutosave(delay = 800) {
  const { activeNote, updateActiveNote, setSaveStatus } = useNotesStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSavedContent = useRef<string>("");

  useEffect(() => {
    if (activeNote) {
      lastSavedContent.current = activeNote.content;
    }
  }, [activeNote?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useCallback(
    (content: string, title?: string) => {
      if (!activeNote) return;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (content === lastSavedContent.current && !title) {
        return;
      }

      setSaveStatus("unsaved");

      timeoutRef.current = setTimeout(async () => {
        const data: Record<string, unknown> = { content };
        if (title !== undefined) {
          data.title = title;
        }
        // Count words from plain text
        const plainText = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        const wordCount = plainText.split(" ").filter((w) => w.length > 0).length;
        data.word_count = wordCount;

        await updateActiveNote(data);
        lastSavedContent.current = content;
      }, delay);
    },
    [activeNote, delay, updateActiveNote, setSaveStatus]
  );

  const forceSave = useCallback(
    async (content: string, title?: string) => {
      if (!activeNote) return;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      const data: Record<string, unknown> = { content };
      if (title !== undefined) data.title = title;
      const plainText = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      data.word_count = plainText.split(" ").filter((w) => w.length > 0).length;
      await updateActiveNote(data);
      lastSavedContent.current = content;
    },
    [activeNote, updateActiveNote]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { save, forceSave };
}
