"use client";

import { useEffect, useState, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import {
  PenLine,
  Wand2,
  FileText,
  Languages,
  CheckSquare,
  ListChecks,
  List,
  Tag,
  Type,
} from "lucide-react";

interface AISlashCommandProps {
  editor: Editor;
  onAction: (action: string, options?: Record<string, string>) => void;
}

const COMMANDS = [
  { command: "/ai continue", action: "continue", label: "Continuer à écrire", icon: PenLine },
  { command: "/ai reformuler", action: "reformulate", label: "Reformuler", icon: Wand2 },
  { command: "/ai corriger", action: "correct", label: "Corriger", icon: CheckSquare },
  { command: "/ai traduire", action: "translate", label: "Traduire FR↔EN", icon: Languages },
  { command: "/ai résumer", action: "summarize", label: "Résumer la note", icon: FileText },
  { command: "/ai resume", action: "summarize", label: "Résumer la note", icon: FileText },
  { command: "/ai plan", action: "outline", label: "Générer un plan", icon: ListChecks },
  { command: "/ai todos", action: "generate-todos", label: "Générer des todos", icon: CheckSquare },
  { command: "/ai bullets", action: "prose-to-bullets", label: "Prose → Bullets", icon: List },
  { command: "/ai prose", action: "bullets-to-prose", label: "Bullets → Prose", icon: PenLine },
  { command: "/ai tag", action: "auto-tag", label: "Auto-tag", icon: Tag },
  { command: "/ai titre", action: "auto-title", label: "Auto-titre", icon: Type },
];

export function AISlashCommand({ editor, onAction }: AISlashCommandProps) {
  const [show, setShow] = useState(false);
  const [filter, setFilter] = useState("");
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = COMMANDS.filter(
    (cmd) =>
      cmd.command.includes(filter.toLowerCase()) ||
      cmd.label.toLowerCase().includes(filter.replace("/ai ", "").toLowerCase())
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!show) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        // Delete the typed slash command from the editor
        const { from } = editor.state.selection;
        const text = editor.state.doc.textBetween(Math.max(0, from - 50), from);
        const slashIdx = text.lastIndexOf("/ai");
        if (slashIdx >= 0) {
          const deleteFrom = from - (text.length - slashIdx);
          editor.chain().focus().deleteRange({ from: deleteFrom, to: from }).run();
        }
        onAction(cmd.action);
        setShow(false);
      } else if (e.key === "Escape") {
        setShow(false);
      }
    },
    [show, filteredCommands, selectedIndex, editor, onAction]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const handleUpdate = () => {
      const { from } = editor.state.selection;
      const textBefore = editor.state.doc.textBetween(Math.max(0, from - 30), from);

      if (textBefore.includes("/ai")) {
        const slashIdx = textBefore.lastIndexOf("/ai");
        const typed = textBefore.slice(slashIdx);
        setFilter(typed);
        setSelectedIndex(0);

        const coords = editor.view.coordsAtPos(from);
        const editorRect = editor.view.dom.getBoundingClientRect();
        setPosition({
          top: coords.bottom - editorRect.top + 4,
          left: coords.left - editorRect.left,
        });
        setShow(true);
      } else {
        setShow(false);
      }
    };

    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor]);

  if (!show || filteredCommands.length === 0) return null;

  return (
    <div
      className="absolute z-50 w-64 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 py-1 overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      <div className="px-3 py-1.5 text-xs text-neutral-400 font-medium">
        Commandes AI
      </div>
      {filteredCommands.map((cmd, i) => {
        const Icon = cmd.icon;
        return (
          <button
            key={cmd.command}
            onClick={() => {
              const { from } = editor.state.selection;
              const text = editor.state.doc.textBetween(Math.max(0, from - 50), from);
              const slashIdx = text.lastIndexOf("/ai");
              if (slashIdx >= 0) {
                const deleteFrom = from - (text.length - slashIdx);
                editor.chain().focus().deleteRange({ from: deleteFrom, to: from }).run();
              }
              onAction(cmd.action);
              setShow(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
              i === selectedIndex
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
            }`}
          >
            <Icon size={14} className="text-blue-500" />
            <span>{cmd.label}</span>
            <span className="ml-auto text-xs text-neutral-400">{cmd.command}</span>
          </button>
        );
      })}
    </div>
  );
}
