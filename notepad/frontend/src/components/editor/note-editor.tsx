"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Table as TableExtension } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import LinkExtension from "@tiptap/extension-link";
import UnderlineExtension from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import Highlight from "@tiptap/extension-highlight";
import { common, createLowlight } from "lowlight";
import { useEffect, useCallback, useRef, useState } from "react";
import { Toolbar } from "./toolbar";
import { useAutosave } from "@/hooks/use-autosave";
import { useNotesStore } from "@/stores/notes-store";
import { Input } from "@/components/ui/input";
import { countWords, readingTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const lowlight = createLowlight(common);

interface NoteEditorProps {
  noteId: string;
  initialContent: string;
  initialTitle: string;
  readOnly?: boolean;
}

export function NoteEditor({
  noteId,
  initialContent,
  initialTitle,
  readOnly = false,
}: NoteEditorProps) {
  const { saveStatus, focusMode } = useNotesStore();
  const { save, forceSave } = useAutosave();
  const [title, setTitle] = useState(initialTitle);
  const contentRef = useRef(initialContent);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing or type "/" for commands...',
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ lowlight }),
      TableExtension.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
        },
      }),
      UnderlineExtension,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CharacterCount,
      Highlight,
    ],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      contentRef.current = html;
      save(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[calc(100vh-200px)] px-8 py-4 lg:px-16",
      },
    },
    immediatelyRender: false,
  });

  // Reset editor content when note changes
  useEffect(() => {
    if (editor && initialContent !== contentRef.current) {
      editor.commands.setContent(initialContent);
      contentRef.current = initialContent;
    }
    setTitle(initialTitle);
  }, [noteId, initialContent, initialTitle, editor]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setTitle(newTitle);
      save(contentRef.current, newTitle);
    },
    [save]
  );

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        editor?.commands.focus("start");
      }
    },
    [editor]
  );

  // Cmd+S force save
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        forceSave(contentRef.current, title);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [forceSave, title]);

  const wordCount = editor
    ? countWords(editor.getHTML())
    : 0;
  const charCount = editor?.storage.characterCount?.characters() ?? 0;

  return (
    <div className={cn("flex h-full flex-col", focusMode && "fixed inset-0 z-50 bg-white dark:bg-neutral-950")}>
      {!readOnly && !focusMode && <Toolbar editor={editor} />}

      <div className="flex-1 overflow-y-auto">
        {!readOnly && (
          <div className="px-8 pt-8 lg:px-16">
            <Input
              value={title}
              onChange={handleTitleChange}
              onKeyDown={handleTitleKeyDown}
              placeholder="Untitled"
              className="border-none bg-transparent px-0 text-3xl font-bold shadow-none placeholder:text-neutral-300 focus-visible:ring-0 dark:placeholder:text-neutral-600"
            />
          </div>
        )}

        <EditorContent editor={editor} />
      </div>

      {!readOnly && (
        <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-2 text-xs text-neutral-500 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
            <span>{readingTime(wordCount)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex items-center gap-1",
                saveStatus === "saved" && "text-green-600 dark:text-green-400",
                saveStatus === "saving" && "text-yellow-600 dark:text-yellow-400",
                saveStatus === "unsaved" && "text-neutral-400"
              )}
            >
              {saveStatus === "saved" && "Saved"}
              {saveStatus === "saving" && "Saving..."}
              {saveStatus === "unsaved" && "Unsaved changes"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
