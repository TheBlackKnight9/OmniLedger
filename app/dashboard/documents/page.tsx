import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getDocuments, getDocumentStats } from "@/lib/actions/documents";
import DocumentUploadDialog from "@/components/documents/DocumentUploadDialog";
import DocumentTable from "@/components/documents/DocumentTable";
import {
  FileText,
  Sparkles,
  Clock,
  AlertTriangle,
  HardDrive,
  FolderOpen,
} from "lucide-react";

export const metadata = {
  title: "Document Vault — CA OS",
  description:
    "AI-powered document management with automatic tagging and classification for Indian tax and compliance documents.",
};

export default async function DocumentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const entity = await db.entity.findFirst({
    where: { userId: session.user.id },
  });

  if (!entity) redirect("/onboarding");

  const [documents, stats] = await Promise.all([
    getDocuments(entity.id),
    getDocumentStats(entity.id),
  ]);

  // Serialize dates for client components
  const serializedDocs = documents.map((doc) => ({
    ...doc,
    uploadedAt: doc.uploadedAt.toISOString(),
    expiryDate: doc.expiryDate ? doc.expiryDate.toISOString() : null,
    shares: doc.shares.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      expiresAt: s.expiresAt ? s.expiresAt.toISOString() : null,
    })),
  }));

  function formatSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  const statCards = [
    {
      label: "Total Documents",
      value: stats.total,
      icon: FolderOpen,
      color: "text-indigo-400",
      bgGlow: "from-indigo-500/10 to-transparent",
      borderColor: "border-indigo-500/20",
    },
    {
      label: "AI Tagged",
      value: stats.tagged,
      icon: Sparkles,
      color: "text-emerald-400",
      bgGlow: "from-emerald-500/10 to-transparent",
      borderColor: "border-emerald-500/20",
    },
    {
      label: "Processing",
      value: stats.processing,
      icon: Clock,
      color: "text-amber-400",
      bgGlow: "from-amber-500/10 to-transparent",
      borderColor: "border-amber-500/20",
    },
    {
      label: "Storage Used",
      value: formatSize(stats.totalSize),
      icon: HardDrive,
      color: "text-purple-400",
      bgGlow: "from-purple-500/10 to-transparent",
      borderColor: "border-purple-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-indigo-400" />
            </div>
            Document Vault
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Upload, organize, and auto-tag your compliance documents with AI
          </p>
        </div>
        <DocumentUploadDialog entityId={entity.id} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`relative p-4 rounded-xl border ${card.borderColor} bg-neutral-950/40 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:scale-[1.02]`}
            >
              {/* Glow gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.bgGlow} pointer-events-none`}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <p className="text-2xl font-bold text-neutral-100">
                  {card.value}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                  {card.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Document Type Distribution */}
      {Object.keys(stats.byType).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.byType)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 8)
            .map(([type, count]) => (
              <div
                key={type}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/50 border border-neutral-800/50 text-xs"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span className="text-neutral-400">
                  {type.replace(/_/g, " ")}
                </span>
                <span className="text-neutral-200 font-semibold">{count}</span>
              </div>
            ))}
        </div>
      )}

      {/* Documents Table */}
      <DocumentTable documents={serializedDocs} />

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-neutral-700" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-300">
            No documents yet
          </h3>
          <p className="text-sm text-neutral-500 mt-1 max-w-sm">
            Upload your first document and our AI will automatically classify
            and tag it for easy retrieval.
          </p>
          <div className="mt-6">
            <DocumentUploadDialog entityId={entity.id} />
          </div>
        </div>
      )}
    </div>
  );
}
