import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ChatInterface from "@/components/assistant/ChatInterface";
import { getChatHistory, getUpcomingDeadlines } from "@/lib/actions/assistant";

export const metadata = {
  title: "CA Assistant — CA OS",
  description: "AI-powered tax and compliance assistant.",
};

export default async function AssistantPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const entity = await db.entity.findFirst({
    where: { userId: session.user.id },
  });

  if (!entity) redirect("/onboarding");

  // Fetch initial data for the chat interface
  const [history, upcomingDeadlines] = await Promise.all([
    getChatHistory(entity.id),
    getUpcomingDeadlines(entity.id),
  ]);

  const upcomingTask = upcomingDeadlines.length > 0 ? upcomingDeadlines[0] : null;

  // Serialize dates for the client component
  const serializedHistory = history.map((msg) => ({
    ...msg,
    createdAt: msg.createdAt.toISOString(),
  }));

  const serializedUpcomingTask = upcomingTask ? {
    ...upcomingTask,
    dueDate: upcomingTask.dueDate.toISOString(),
    filedAt: upcomingTask.filedAt?.toISOString() || null,
  } : null;

  return (
    <div className="-m-6 md:-m-8">
      {/* The negative margins offset the default padding of DashboardLayout 
          so the chat interface can truly be full height and flush with the edges */}
      <ChatInterface 
        entityId={entity.id} 
        initialMessages={serializedHistory} 
        upcomingTask={serializedUpcomingTask}
      />
    </div>
  );
}
