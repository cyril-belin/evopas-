import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getSystemPrompt, buildUserMessage } from "@/lib/ai-prompts";
import { checkRateLimit } from "@/lib/rate-limit";
import type { AIAction } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const VALID_ACTIONS: AIAction["type"][] = [
  "continue",
  "reformulate",
  "tone",
  "expand",
  "shorten",
  "correct",
  "translate",
  "summarize",
  "outline",
  "bullets-to-prose",
  "prose-to-bullets",
  "generate-todos",
  "ask-notes",
  "auto-tag",
  "auto-title",
  "related-notes",
  "weekly-summary",
  "template-meeting",
  "template-brainstorm",
  "template-journal",
  "template-email",
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;

  if (!VALID_ACTIONS.includes(action as AIAction["type"])) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const body = await request.json();
  const { content, selection, tone, targetLang, notesContext, subject, userId } = body;

  if (!content && !selection) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  // Rate limiting
  const rateCheck = checkRateLimit(userId || "anonymous");
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", resetIn: rateCheck.resetIn },
      { status: 429 }
    );
  }

  const systemPrompt = getSystemPrompt(action as AIAction["type"]);
  const userMessage = buildUserMessage(action as AIAction["type"], content, {
    selection,
    tone,
    targetLang,
    notesContext,
    subject,
  });

  // For non-streaming actions (auto-tag, auto-title, related-notes), return JSON
  const nonStreamingActions = ["auto-tag", "auto-title", "related-notes"];
  if (nonStreamingActions.includes(action)) {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    if (action === "auto-tag") {
      const tags = text.split(",").map((t: string) => t.trim()).filter(Boolean);
      return NextResponse.json({ tags });
    }
    if (action === "auto-title") {
      return NextResponse.json({ title: text.trim() });
    }
    if (action === "related-notes") {
      try {
        const relatedNotes = JSON.parse(text);
        return NextResponse.json({ relatedNotes });
      } catch {
        return NextResponse.json({ relatedNotes: [] });
      }
    }
  }

  // Streaming response for all other actions
  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-RateLimit-Remaining": rateCheck.remaining.toString(),
    },
  });
}
