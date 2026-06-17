import { streamText, Message as AIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { messages, entityId } = await req.json();

    if (!entityId) {
      return new NextResponse("Missing entityId", { status: 400 });
    }

    // Fetch entity profile
    const entity = await db.entity.findFirst({
      where: { id: entityId, userId: session.user.id },
      include: {
        complianceTasks: {
          where: { status: { not: "FILED" } },
          orderBy: { dueDate: "asc" },
        },
      },
    });

    if (!entity) {
      return new NextResponse("Entity not found", { status: 404 });
    }

    // Format pending tasks for context
    const pendingTasksContext = entity.complianceTasks.length > 0
      ? entity.complianceTasks
          .map(t => `- ${t.taskType} for ${t.period} (Due: ${t.dueDate.toISOString().split('T')[0]})`)
          .join("\n")
      : "No pending tasks.";

    const systemPrompt = `You are CA OS Assistant, an expert in Indian taxation. Speak in clear simple English (Hindi if user writes Hindi). Always cite sections (e.g. 'under Section 80C').
End advice with: 'This is informational — consult a CA for complex matters.'

User context: 
Entity type: ${entity.entityType}
Pending tasks: 
${pendingTasksContext}

Current FY: 2025-26
New regime slabs: 0-3L=0%, 3-7L=5%, 7-10L=10%, 10-12L=15%, 12-15L=20%, >15L=30%
Old regime slabs: 0-2.5L=0%, 2.5-5L=5%, 5-10L=20%, >10L=30%
GST rates: 0%, 5%, 12%, 18%, 28%
Key TDS: 192(salary), 194C(contractor 1/2%), 194J(professional 10%), 194I(rent 10%)`;

    // Process attachments for the latest message if any
    const latestMessage = messages[messages.length - 1];
    if (latestMessage.role === 'user' && latestMessage.experimental_attachments) {
      // The AI SDK handles attachments automatically if properly structured
      // But we can also handle them specifically if needed. The useChat hook with `experimental_attachments` will send them as part of the message.
    }

    // Save user message to DB
    // Vercel AI SDK provides the ID, or we can use the one sent
    if (latestMessage.role === "user") {
      await db.chatMessage.create({
        data: {
          entityId,
          role: "user",
          content: latestMessage.content,
          metadata: latestMessage.experimental_attachments ? { attachments: latestMessage.experimental_attachments.length } : undefined,
        },
      });
    }

    const result = await streamText({
      model: anthropic("claude-3-5-sonnet-20240620"),
      system: systemPrompt,
      messages,
      maxTokens: 2000,
      async onFinish({ text }) {
        // Save assistant message to DB
        await db.chatMessage.create({
          data: {
            entityId,
            role: "assistant",
            content: text,
          },
        });
      },
    });

    return result.toAIStreamResponse();
  } catch (error) {
    console.error("Assistant chat error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
