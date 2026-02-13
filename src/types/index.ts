export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  userId: string;
  created: string;
  updated: string;
}

export interface AIAction {
  type:
    | "continue"
    | "reformulate"
    | "tone"
    | "expand"
    | "shorten"
    | "correct"
    | "translate"
    | "summarize"
    | "outline"
    | "bullets-to-prose"
    | "prose-to-bullets"
    | "generate-todos"
    | "ask-notes"
    | "auto-tag"
    | "auto-title"
    | "related-notes"
    | "weekly-summary"
    | "template-meeting"
    | "template-brainstorm"
    | "template-journal"
    | "template-email";
}

export interface AIRequest {
  action: AIAction["type"];
  content: string;
  selection?: string;
  tone?: "formal" | "casual" | "technical" | "persuasive";
  targetLang?: "fr" | "en";
  notesContext?: string[];
  subject?: string;
}

export interface AIResponse {
  text: string;
  tags?: string[];
  title?: string;
  relatedNotes?: { id: string; title: string; snippet: string }[];
  todos?: string[];
}

export interface DiffChange {
  type: "added" | "removed" | "unchanged";
  value: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}
