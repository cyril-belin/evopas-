import type { AIAction } from "@/types";

export function getSystemPrompt(action: AIAction["type"]): string {
  const base =
    "Tu es un assistant d'écriture intégré dans un éditeur de notes. Réponds directement avec le contenu demandé, sans introduction ni explication.";

  const prompts: Record<AIAction["type"], string> = {
    continue: `${base} Continue le texte naturellement en gardant le même style, ton et sujet. Ne répète pas le texte existant.`,
    reformulate: `${base} Reformule le texte sélectionné pour qu'il soit plus clair et professionnel. Garde le même sens.`,
    tone: `${base} Réécris le texte avec le ton demandé tout en conservant le sens original.`,
    expand: `${base} Développe et allonge le texte sélectionné en ajoutant des détails, exemples ou explications. Garde le même style.`,
    shorten: `${base} Raccourcis le texte sélectionné en gardant les idées essentielles. Sois concis.`,
    correct: `${base} Corrige l'orthographe et la grammaire du texte. Ne change pas le style ni le sens. Retourne uniquement le texte corrigé.`,
    translate: `${base} Traduis le texte. Si c'est du français, traduis en anglais. Si c'est de l'anglais, traduis en français. Retourne uniquement la traduction.`,
    summarize: `${base} Génère un résumé concis (TL;DR) de cette note. Format: commence par "**TL;DR:** " suivi du résumé en 2-3 phrases.`,
    outline: `${base} Crée un plan structuré (outline) pour une note sur ce sujet. Utilise des titres avec ## et des sous-points avec -.`,
    "bullets-to-prose": `${base} Transforme ces bullet points en texte rédigé fluide et cohérent.`,
    "prose-to-bullets": `${base} Extrais les points clés de ce texte et présente-les en bullet points (- ).`,
    "generate-todos": `${base} Analyse cette note et extrais toutes les actions à faire. Format chaque action comme une checkbox: - [ ] action`,
    "ask-notes": `${base} Tu as accès au contenu de plusieurs notes de l'utilisateur. Réponds à la question en te basant sur ces notes. Cite les sources (titres des notes) entre crochets [Titre de la note].`,
    "auto-tag": `${base} Analyse cette note et suggère 3-5 tags pertinents. Retourne uniquement les tags séparés par des virgules, sans # ni autre formatage.`,
    "auto-title": `${base} Génère un titre court et pertinent pour cette note basé sur son contenu. Retourne uniquement le titre, sans guillemets.`,
    "related-notes": `${base} En analysant le contenu de cette note et des autres notes fournies, identifie les notes les plus similaires ou liées thématiquement. Retourne un JSON array: [{"id":"...", "title":"...", "reason":"..."}]`,
    "weekly-summary": `${base} Génère un résumé hebdomadaire structuré de ces notes. Utilise des sections: ## Points clés, ## Thèmes récurrents, ## Actions en cours.`,
    "template-meeting": `${base} Structure ce transcript de réunion en compte-rendu. Sections: ## Participants, ## Sujets abordés, ## Décisions prises, ## Actions à suivre (avec responsables).`,
    "template-brainstorm": `${base} À partir de ce sujet, génère un brainstorm organisé. Structure: ## Idée centrale, ## Branches principales (3-5), sous chaque branche 3-4 sous-idées. Format mind-map textuel avec indentation.`,
    "template-journal": `${base} Génère 3 prompts de journaling personnalisés et introspectifs pour aujourd'hui. Format: 1. prompt\\n2. prompt\\n3. prompt`,
    "template-email": `${base} Transforme ces notes en un email professionnel prêt à envoyer. Inclus: Objet, Salutation, Corps, Conclusion, Signature placeholder.`,
  };

  return prompts[action];
}

export function buildUserMessage(
  action: AIAction["type"],
  content: string,
  options?: {
    selection?: string;
    tone?: string;
    targetLang?: string;
    notesContext?: string[];
    subject?: string;
  }
): string {
  const text = options?.selection || content;

  switch (action) {
    case "continue":
      return `Voici le texte à continuer:\n\n${content}`;
    case "reformulate":
    case "expand":
    case "shorten":
    case "correct":
      return text;
    case "tone":
      return `Ton demandé: ${options?.tone || "professionnel"}\n\nTexte:\n${text}`;
    case "translate":
      return `Langue cible: ${options?.targetLang === "en" ? "anglais" : "français"}\n\nTexte:\n${text}`;
    case "summarize":
    case "generate-todos":
    case "auto-tag":
    case "auto-title":
    case "prose-to-bullets":
    case "bullets-to-prose":
      return content;
    case "outline":
      return `Sujet: ${options?.subject || content}`;
    case "ask-notes": {
      let ctx = "";
      if (options?.notesContext?.length) {
        ctx = "\n\nNotes de l'utilisateur:\n" + options.notesContext.join("\n---\n");
      }
      return `Question: ${content}${ctx}`;
    }
    case "related-notes": {
      let ctx = "";
      if (options?.notesContext?.length) {
        ctx = "\n\nAutres notes:\n" + options.notesContext.join("\n---\n");
      }
      return `Note actuelle:\n${content}${ctx}`;
    }
    case "weekly-summary":
      return `Notes de la semaine:\n\n${options?.notesContext?.join("\n---\n") || content}`;
    case "template-meeting":
    case "template-email":
      return content;
    case "template-brainstorm":
      return `Sujet: ${options?.subject || content}`;
    case "template-journal":
      return `Date: ${new Date().toLocaleDateString("fr-FR")}\nContexte: ${content || "journée ordinaire"}`;
    default:
      return text;
  }
}
