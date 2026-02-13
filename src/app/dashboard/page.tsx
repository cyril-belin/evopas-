"use client";

import { useState, useEffect, useCallback } from "react";
import { useNotes } from "@/hooks/use-notes";
import { useAI } from "@/hooks/use-ai";
import {
  BookOpen,
  LayoutDashboard,
  Sparkles,
  FileText,
  Tag,
  Calendar,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { format, isThisWeek } from "date-fns";
import { fr } from "date-fns/locale";

export default function DashboardPage() {
  const { notes, loading } = useNotes();
  const { execute, isLoading: aiLoading } = useAI();
  const [weeklySummary, setWeeklySummary] = useState("");

  const weekNotes = notes.filter((n) => isThisWeek(new Date(n.updated), { weekStartsOn: 1 }));
  const allTags = [...new Set(notes.flatMap((n) => n.tags || []))];

  const generateWeeklySummary = useCallback(async () => {
    if (weekNotes.length === 0) return;
    try {
      const result = await execute("weekly-summary", {
        content: "Résumé hebdomadaire",
        notesContext: weekNotes.map((n) => `[${n.title || "Sans titre"}]\n${n.content}`),
        userId: "demo-user",
      });
      setWeeklySummary(result);
    } catch {
      // silently fail
    }
  }, [weekNotes, execute]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Sidebar nav */}
      <div className="w-12 flex flex-col items-center py-4 gap-3 bg-neutral-100 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800">
        <Link
          href="/"
          className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          title="Notes"
        >
          <BookOpen size={16} />
        </Link>
        <Link href="/dashboard" className="p-2 rounded-lg bg-blue-500 text-white" title="Dashboard">
          <LayoutDashboard size={16} />
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/" className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400">
              <ArrowLeft size={16} />
            </Link>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Dashboard</h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <FileText size={14} />
                <span className="text-xs font-medium uppercase tracking-wider">Total notes</span>
              </div>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white">{notes.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <Calendar size={14} />
                <span className="text-xs font-medium uppercase tracking-wider">Cette semaine</span>
              </div>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white">{weekNotes.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <Tag size={14} />
                <span className="text-xs font-medium uppercase tracking-wider">Tags</span>
              </div>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white">{allTags.length}</p>
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Sparkles size={18} className="text-blue-500" />
                Résumé hebdomadaire AI
              </h2>
              <button
                onClick={generateWeeklySummary}
                disabled={aiLoading || weekNotes.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {aiLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Générer le résumé
                  </>
                )}
              </button>
            </div>

            {weeklySummary ? (
              <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap">
                {weeklySummary}
              </div>
            ) : (
              <p className="text-sm text-neutral-400">
                {weekNotes.length === 0
                  ? "Aucune note cette semaine. Commencez à écrire !"
                  : "Cliquez sur \"Générer le résumé\" pour obtenir un résumé AI de vos notes de la semaine."}
              </p>
            )}
          </div>

          {/* Recent notes */}
          <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 mb-8">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
              Notes récentes
            </h2>
            <div className="space-y-3">
              {notes.slice(0, 10).map((note) => (
                <Link
                  key={note.id}
                  href={`/notes/${note.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={14} className="text-neutral-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {note.title || "Sans titre"}
                    </span>
                    {note.tags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-neutral-400">
                    {format(new Date(note.updated), "d MMM yyyy", { locale: fr })}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Tags cloud */}
          {allTags.length > 0 && (
            <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const count = notes.filter((n) => n.tags?.includes(tag)).length;
                  return (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-full text-sm bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900"
                    >
                      {tag}
                      <span className="ml-1.5 text-xs text-blue-400">({count})</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
