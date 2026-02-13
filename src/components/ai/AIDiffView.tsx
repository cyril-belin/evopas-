"use client";

import { useMemo } from "react";
import { diffWords } from "diff";
import { Check, X } from "lucide-react";

interface AIDiffViewProps {
  original: string;
  suggestion: string;
  onAccept: () => void;
  onReject: () => void;
}

export function AIDiffView({ original, suggestion, onAccept, onReject }: AIDiffViewProps) {
  const changes = useMemo(() => diffWords(original, suggestion), [original, suggestion]);

  return (
    <div className="mx-8 my-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-blue-100/50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800">
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          Suggestion AI
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onReject}
            className="flex items-center gap-1 px-3 py-1 text-xs rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            <X size={12} />
            Rejeter
          </button>
          <button
            onClick={onAccept}
            className="flex items-center gap-1 px-3 py-1 text-xs rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          >
            <Check size={12} />
            Accepter
          </button>
        </div>
      </div>

      <div className="p-4 text-sm leading-relaxed font-mono whitespace-pre-wrap">
        {changes.map((change, i) => {
          if (change.added) {
            return (
              <span
                key={i}
                className="bg-green-200 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded px-0.5"
              >
                {change.value}
              </span>
            );
          }
          if (change.removed) {
            return (
              <span
                key={i}
                className="bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-300 line-through rounded px-0.5"
              >
                {change.value}
              </span>
            );
          }
          return <span key={i}>{change.value}</span>;
        })}
      </div>
    </div>
  );
}
