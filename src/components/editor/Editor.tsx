"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Note } from "@/types";
import { EditorToolbar } from "./EditorToolbar";
import { AIFloatingToolbar } from "../ai/AIFloatingToolbar";
import { AIDiffView } from "../ai/AIDiffView";
import { AISlashCommand } from "../ai/AISlashCommand";
import { useAI } from "@/hooks/use-ai";

interface EditorProps {
  note: Note;
  onSave: (note: Partial<Note>) => void;
  allNotes?: Note[];
}

export function Editor({ note, onSave, allNotes = [] }: EditorProps) {
  const [title, setTitle] = useState(note.title);
  const [aiPending, setAiPending] = useState<{ original: string; suggestion: string; replaceSelection: boolean } | null>(null);
  const [aiInlineLoading, setAiInlineLoading] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>(null);
  const { execute: executeAI, isLoading: aiLoading, abort: abortAI } = useAI();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Commencez à écrire... (tapez /ai pour les commandes AI)",
      }),
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      Link.configure({ openOnClick: false }),
    ],
    content: note.content || "",
    editorProps: {
      attributes: {
        class: "prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-8 py-4",
      },
    },
    onUpdate: ({ editor }) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        onSave({ id: note.id, content: editor.getHTML(), title });
      }, 1000);
    },
  });

  useEffect(() => {
    if (editor && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content || "");
    }
    setTitle(note.title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id]);

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        onSave({ id: note.id, title: newTitle });
      }, 1000);
    },
    [note.id, onSave]
  );

  const handleAIAction = useCallback(
    async (
      action: string,
      options?: { tone?: string; targetLang?: string; subject?: string }
    ) => {
      if (!editor) return;

      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;
      const selectedText = hasSelection ? editor.state.doc.textBetween(from, to) : "";
      const fullContent = editor.getText();

      setAiInlineLoading(true);

      try {
        const result = await executeAI(action as never, {
          content: fullContent,
          selection: selectedText || undefined,
          tone: options?.tone,
          targetLang: options?.targetLang,
          subject: options?.subject,
          notesContext: allNotes.slice(0, 10).map((n) => `[${n.title}]\n${n.content}`),
          userId: "demo-user",
        });

        setAiInlineLoading(false);

        // Actions that modify text show diff view
        const modifyActions = [
          "continue", "reformulate", "tone", "expand", "shorten", "correct",
          "translate", "bullets-to-prose", "prose-to-bullets",
        ];

        if (modifyActions.includes(action)) {
          if (action === "continue") {
            // For continue, append text directly
            editor.commands.insertContentAt(editor.state.doc.content.size, result);
          } else {
            // Show diff for modifications
            setAiPending({
              original: selectedText || fullContent,
              suggestion: result,
              replaceSelection: hasSelection,
            });
          }
        } else if (action === "summarize") {
          // Insert summary at the top
          editor.commands.insertContentAt(0, `<p>${result}</p><hr>`);
        } else if (action === "outline" || action === "generate-todos") {
          editor.commands.insertContent(result);
        } else if (action === "auto-tag") {
          const parsed = JSON.parse(result);
          onSave({ id: note.id, tags: parsed.tags });
        } else if (action === "auto-title") {
          const parsed = JSON.parse(result);
          handleTitleChange(parsed.title);
        } else if (action.startsWith("template-")) {
          editor.commands.setContent(result);
        }
      } catch {
        setAiInlineLoading(false);
      }
    },
    [editor, executeAI, allNotes, onSave, note.id, handleTitleChange]
  );

  const handleAcceptDiff = useCallback(() => {
    if (!editor || !aiPending) return;
    if (aiPending.replaceSelection) {
      const { from, to } = editor.state.selection;
      editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, aiPending.suggestion).run();
    } else {
      editor.commands.setContent(aiPending.suggestion);
    }
    setAiPending(null);
  }, [editor, aiPending]);

  const handleRejectDiff = useCallback(() => {
    setAiPending(null);
  }, []);

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900">
      {/* Title */}
      <div className="px-8 pt-6">
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Sans titre"
          className="w-full text-3xl font-bold bg-transparent border-none outline-none text-neutral-900 dark:text-white placeholder:text-neutral-400"
        />
        {note.tags?.length > 0 && (
          <div className="flex gap-1.5 mt-2">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <EditorToolbar editor={editor} onAIAction={handleAIAction} isAILoading={aiLoading || aiInlineLoading} />

      {/* AI Loading indicator */}
      {(aiLoading || aiInlineLoading) && (
        <div className="flex items-center gap-2 px-8 py-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30">
          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          AI en cours de génération...
          <button onClick={abortAI} className="ml-auto text-xs hover:underline">
            Annuler
          </button>
        </div>
      )}

      {/* Diff View */}
      {aiPending && (
        <AIDiffView
          original={aiPending.original}
          suggestion={aiPending.suggestion}
          onAccept={handleAcceptDiff}
          onReject={handleRejectDiff}
        />
      )}

      {/* Editor */}
      <div className="flex-1 overflow-y-auto relative">
        <EditorContent editor={editor} />
        <AIFloatingToolbar editor={editor} onAction={handleAIAction} />
        <AISlashCommand editor={editor} onAction={handleAIAction} />
      </div>
    </div>
  );
}
