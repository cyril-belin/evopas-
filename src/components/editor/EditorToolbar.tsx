"use client";

import type { Editor } from "@tiptap/react";
import { useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Undo,
  Redo,
  Sparkles,
  FileText,
  Wand2,
  Languages,
  ListChecks,
  PenLine,
  BookOpen,
  Mail,
  Brain,
  CalendarDays,
  Tag,
  Type,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor;
  onAIAction: (action: string, options?: Record<string, string>) => void;
  isAILoading: boolean;
}

export function EditorToolbar({ editor, onAIAction, isAILoading }: EditorToolbarProps) {
  const [showAIMenu, setShowAIMenu] = useState(false);

  const toolbarBtn = (
    isActive: boolean,
    onClick: () => void,
    icon: React.ReactNode,
    title: string
  ) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
        isActive ? "bg-neutral-200 dark:bg-neutral-700 text-blue-600 dark:text-blue-400" : "text-neutral-600 dark:text-neutral-400"
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex items-center gap-0.5 px-8 py-2 border-b border-neutral-200 dark:border-neutral-800 flex-wrap">
      {/* Formatting */}
      {toolbarBtn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), <Bold size={16} />, "Gras")}
      {toolbarBtn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), <Italic size={16} />, "Italique")}
      {toolbarBtn(editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), <UnderlineIcon size={16} />, "Souligné")}
      {toolbarBtn(editor.isActive("strike"), () => editor.chain().focus().toggleStrike().run(), <Strikethrough size={16} />, "Barré")}

      <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700 mx-1" />

      {/* Headings */}
      {toolbarBtn(editor.isActive("heading", { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), <Heading1 size={16} />, "Titre 1")}
      {toolbarBtn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 size={16} />, "Titre 2")}
      {toolbarBtn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), <Heading3 size={16} />, "Titre 3")}

      <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700 mx-1" />

      {/* Lists */}
      {toolbarBtn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), <List size={16} />, "Liste")}
      {toolbarBtn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered size={16} />, "Liste numérotée")}
      {toolbarBtn(editor.isActive("taskList"), () => editor.chain().focus().toggleTaskList().run(), <CheckSquare size={16} />, "Checklist")}
      {toolbarBtn(editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), <Quote size={16} />, "Citation")}
      {toolbarBtn(editor.isActive("codeBlock"), () => editor.chain().focus().toggleCodeBlock().run(), <Code size={16} />, "Code")}

      <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700 mx-1" />

      {/* Undo/Redo */}
      {toolbarBtn(false, () => editor.chain().focus().undo().run(), <Undo size={16} />, "Annuler")}
      {toolbarBtn(false, () => editor.chain().focus().redo().run(), <Redo size={16} />, "Rétablir")}

      <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700 mx-1" />

      {/* AI Button */}
      <div className="relative">
        <button
          onClick={() => setShowAIMenu(!showAIMenu)}
          disabled={isAILoading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isAILoading
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-500 cursor-wait"
              : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-sm"
          }`}
        >
          <Sparkles size={14} />
          {isAILoading ? "AI..." : "✨ AI"}
        </button>

        {showAIMenu && !isAILoading && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowAIMenu(false)} />
            <div className="absolute top-full left-0 mt-1 z-50 w-72 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 py-1 max-h-96 overflow-y-auto">
              <div className="px-3 py-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Écriture assistée
              </div>
              <AIMenuItem icon={<PenLine size={14} />} label="Continuer à écrire" onClick={() => { onAIAction("continue"); setShowAIMenu(false); }} />
              <AIMenuItem icon={<Wand2 size={14} />} label="Reformuler" onClick={() => { onAIAction("reformulate"); setShowAIMenu(false); }} />
              <AIMenuItem icon={<Wand2 size={14} />} label="Allonger" onClick={() => { onAIAction("expand"); setShowAIMenu(false); }} />
              <AIMenuItem icon={<Wand2 size={14} />} label="Raccourcir" onClick={() => { onAIAction("shorten"); setShowAIMenu(false); }} />
              <AIMenuItem icon={<CheckSquare size={14} />} label="Corriger" onClick={() => { onAIAction("correct"); setShowAIMenu(false); }} />
              <AIMenuItem icon={<Languages size={14} />} label="Traduire FR↔EN" onClick={() => { onAIAction("translate"); setShowAIMenu(false); }} />

              {/* Tone submenu */}
              <div className="px-3 py-1 text-xs font-semibold text-neutral-400 uppercase tracking-wider mt-1">
                Changer le ton
              </div>
              <AIMenuItem icon={<Wand2 size={14} />} label="Formel" onClick={() => { onAIAction("tone", { tone: "formal" }); setShowAIMenu(false); }} />
              <AIMenuItem icon={<Wand2 size={14} />} label="Décontracté" onClick={() => { onAIAction("tone", { tone: "casual" }); setShowAIMenu(false); }} />
              <AIMenuItem icon={<Wand2 size={14} />} label="Technique" onClick={() => { onAIAction("tone", { tone: "technical" }); setShowAIMenu(false); }} />
              <AIMenuItem icon={<Wand2 size={14} />} label="Persuasif" onClick={() => { onAIAction("tone", { tone: "persuasive" }); setShowAIMenu(false); }} />

              <div className="px-3 py-1 text-xs font-semibold text-neutral-400 uppercase tracking-wider mt-1">
                Génération de contenu
              </div>
              <AIMenuItem icon={<FileText size={14} />} label="Résumer la note" onClick={() => { onAIAction("summarize"); setShowAIMenu(false); }} />
              <AIMenuItem icon={<ListChecks size={14} />} label="Générer un plan" onClick={() => { onAIAction("outline"); setShowAIMenu(false); }} />
              <AIMenuItem icon={<PenLine size={14} />} label="Bullet points → Prose" onClick={() => { onAIAction("bullets-to-prose"); setShowAIMenu(false); }} />
              <AIMenuItem icon={<List size={14} />} label="Prose → Bullet points" onClick={() => { onAIAction("prose-to-bullets"); setShowAIMenu(false); }} />
              <AIMenuItem icon={<CheckSquare size={14} />} label="Générer des todos" onClick={() => { onAIAction("generate-todos"); setShowAIMenu(false); }} />

              <div className="px-3 py-1 text-xs font-semibold text-neutral-400 uppercase tracking-wider mt-1">
                Organisation
              </div>
              <AIMenuItem icon={<Tag size={14} />} label="Auto-tag" onClick={() => { onAIAction("auto-tag"); setShowAIMenu(false); }} />
              <AIMenuItem icon={<Type size={14} />} label="Auto-titre" onClick={() => { onAIAction("auto-title"); setShowAIMenu(false); }} />

              <div className="px-3 py-1 text-xs font-semibold text-neutral-400 uppercase tracking-wider mt-1">
                Templates AI
              </div>
              <AIMenuItem icon={<BookOpen size={14} />} label="Compte-rendu réunion" onClick={() => { onAIAction("template-meeting"); setShowAIMenu(false); }} />
              <AIMenuItem icon={<Brain size={14} />} label="Brainstorm" onClick={() => { onAIAction("template-brainstorm"); setShowAIMenu(false); }} />
              <AIMenuItem icon={<CalendarDays size={14} />} label="Journal" onClick={() => { onAIAction("template-journal"); setShowAIMenu(false); }} />
              <AIMenuItem icon={<Mail size={14} />} label="Email draft" onClick={() => { onAIAction("template-email"); setShowAIMenu(false); }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AIMenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors"
    >
      <span className="text-blue-500">{icon}</span>
      {label}
    </button>
  );
}
