"use client";

import { useState, useCallback, useRef } from "react";
import type { AIAction } from "@/types";

interface UseAIOptions {
  onStream?: (text: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: string) => void;
}

export function useAI(options?: UseAIOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (
      action: AIAction["type"],
      payload: {
        content: string;
        selection?: string;
        tone?: string;
        targetLang?: string;
        notesContext?: string[];
        subject?: string;
        userId?: string;
      }
    ): Promise<string> => {
      setIsLoading(true);
      setStreamedText("");

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(`/api/ai/${action}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "AI request failed");
        }

        // Non-streaming responses
        const contentType = response.headers.get("Content-Type");
        if (contentType?.includes("application/json")) {
          const data = await response.json();
          setIsLoading(false);
          return JSON.stringify(data);
        }

        // Streaming response
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No readable stream");

        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                fullText += parsed.text;
                setStreamedText(fullText);
                options?.onStream?.(fullText);
              } catch {
                // skip malformed chunks
              }
            }
          }
        }

        options?.onComplete?.(fullText);
        setIsLoading(false);
        return fullText;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (message !== "The operation was aborted.") {
          options?.onError?.(message);
        }
        setIsLoading(false);
        throw error;
      }
    },
    [options]
  );

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  return { execute, abort, isLoading, streamedText };
}
