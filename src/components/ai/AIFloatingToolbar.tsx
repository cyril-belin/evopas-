"use client";

import { useEffect, useState, useRef } from "react";
import type { Editor } from "@tiptap/react";
import {
  Wand2,
  Languages,
  Expand,
  Shrink,
  CheckSquare,
  PenLine,
} from "lucide-react";

interface AIFloatingToolbarProps {
  editor: Editor;
  onAction: (action: string, options?: Record<string, string>) => void;
}

export function AIFloatingToolbar({ editor, onAction }: AIFloatingToolbarProps) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const { from, to } = editor.state.selection;
      if (from === to) {
        setShow(false);
        return;
      }

      // Get coordinates of the selection end
      const coords = editor.view.coordsAtPos(to);
      const editorRect = editor.view.dom.getBoundingClientRect();

      setPosition({
        top: coords.bottom - editorRect.top + 8,
        left: coords.left - editorRect.left,
      });
      setShow(true);
    };

    editor.on("selectionUpdate", handleSelectionChange);
    return () => {
      editor.off("selectionUpdate", handleSelectionChange);
    };
  }, [editor]);

  if (!show) return null;

  return (
    <div
      ref={toolbarRef}
      className="absolute z-50 flex items-center gap-0.5 p-1 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700"
      style={{ top: position.top, left: position.left }}
    >
      <FloatingBtn
        icon={<Wand2 size={13} />}
        label="Reformuler"
        onClick={() => { onAction("reformulate"); setShow(false); }}
      />
      <FloatingBtn
        icon={<PenLine size={13} />}
        label="Corriger"
        onClick={() => { onAction("correct"); setShow(false); }}
      />
      <FloatingBtn
        icon={<Expand size={13} />}
        label="Allonger"
        onClick={() => { onAction("expand"); setShow(false); }}
      />
      <FloatingBtn
        icon={<Shrink size={13} />}
        label="Raccourcir"
        onClick={() => { onAction("shorten"); setShow(false); }}
      />
      <FloatingBtn
        icon={<Languages size={13} />}
        label="Traduire"
        onClick={() => { onAction("translate"); setShow(false); }}
      />
      <FloatingBtn
        icon={<CheckSquare size={13} />}
        label="Todos"
        onClick={() => { onAction("generate-todos"); setShow(false); }}
      />
    </div>
  );
}

function FloatingBtn({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="flex items-center gap-1 px-2 py-1 text-xs rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
