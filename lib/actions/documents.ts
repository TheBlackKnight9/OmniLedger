"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { tagDocument } from "@/lib/ai-tagger";

// ============================================================
// GET DOCUMENTS
// ============================================================
export async function getDocuments(
  entityId: string,
  filters?: {
    docType?: string;
    search?: string;
    sortBy?: "uploadedAt" | "fileName" | "docType";
    sortOrder?: "asc" | "desc";
  }
) {
  const where: any = { entityId };

  if (filters?.docType && filters.docType !== "ALL") {
    where.docType = filters.docType;
  }

  if (filters?.search) {
    where.OR = [
      { fileName: { contains: filters.search, mode: "insensitive" } },
      { docType: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const documents = await db.document.findMany({
    where,
    orderBy: {
      [filters?.sortBy || "uploadedAt"]: filters?.sortOrder || "desc",
    },
    include: {
      shares: true,
    },
  });

  return documents;
}

// ============================================================
// UPLOAD DOCUMENT (create record + trigger AI tagging)
// ============================================================
export async function uploadDocument(data: {
  entityId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  docType?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Create the document record with PROCESSING status
  const document = await db.document.create({
    data: {
      entityId: data.entityId,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      docType: data.docType || "OTHER",
      status: "PROCESSING",
      uploadedBy: session.user.id,
      aiTags: {},
    },
  });

  // Create audit log
  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPLOAD_DOC",
      resourceType: "Document",
      resourceId: document.id,
      ipAddress: "127.0.0.1",
    },
  });

  // Trigger AI tagging in background (non-blocking)
  triggerAITagging(document.id, data.fileName, data.mimeType).catch(
    console.error
  );

  revalidatePath("/dashboard/documents");

  return { success: true, document };
}

// ============================================================
// AI TAGGING (background)
// ============================================================
async function triggerAITagging(
  documentId: string,
  fileName: string,
  mimeType: string
) {
  try {
    const tags = await tagDocument(fileName, mimeType);

    await db.document.update({
      where: { id: documentId },
      data: {
        aiTags: tags as any,
        docType: tags.docType || "OTHER",
        status: "TAGGED",
      },
    });
  } catch (error) {
    console.error("AI tagging failed for document:", documentId, error);
    await db.document.update({
      where: { id: documentId },
      data: {
        status: "FAILED",
      },
    });
  }
}

// ============================================================
// RE-TAG DOCUMENT
// ============================================================
export async function retagDocument(documentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const document = await db.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  await db.document.update({
    where: { id: documentId },
    data: { status: "PROCESSING" },
  });

  triggerAITagging(documentId, document.fileName, document.mimeType).catch(
    console.error
  );

  revalidatePath("/dashboard/documents");
  return { success: true };
}

// ============================================================
// DELETE DOCUMENT
// ============================================================
export async function deleteDocument(documentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const document = await db.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  await db.document.delete({
    where: { id: documentId },
  });

  // Create audit log
  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "DELETE_DOC",
      resourceType: "Document",
      resourceId: documentId,
      ipAddress: "127.0.0.1",
    },
  });

  revalidatePath("/dashboard/documents");
  return { success: true };
}

// ============================================================
// SHARE DOCUMENT
// ============================================================
export async function shareDocument(data: {
  documentId: string;
  sharedWith: string;
  permission: "VIEW" | "DOWNLOAD";
  expiresAt?: Date;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const share = await db.documentShare.create({
    data: {
      documentId: data.documentId,
      sharedWith: data.sharedWith,
      permission: data.permission,
      expiresAt: data.expiresAt,
    },
  });

  // Audit log
  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "SHARE_DOC",
      resourceType: "Document",
      resourceId: data.documentId,
      ipAddress: "127.0.0.1",
    },
  });

  revalidatePath("/dashboard/documents");
  return { success: true, share };
}

// ============================================================
// UPDATE DOCUMENT TYPE (manual override)
// ============================================================
export async function updateDocumentType(
  documentId: string,
  docType: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const updated = await db.document.update({
    where: { id: documentId },
    data: { docType },
  });

  revalidatePath("/dashboard/documents");
  return { success: true, document: updated };
}

// ============================================================
// GET DOCUMENT STATS
// ============================================================
export async function getDocumentStats(entityId: string) {
  const total = await db.document.count({
    where: { entityId },
  });

  const tagged = await db.document.count({
    where: { entityId, status: "TAGGED" },
  });

  const processing = await db.document.count({
    where: { entityId, status: "PROCESSING" },
  });

  const failed = await db.document.count({
    where: { entityId, status: "FAILED" },
  });

  // Count by doc type
  const documents = await db.document.findMany({
    where: { entityId },
    select: { docType: true, fileSize: true },
  });

  const byType: Record<string, number> = {};
  let totalSize = 0;

  documents.forEach((doc) => {
    byType[doc.docType] = (byType[doc.docType] || 0) + 1;
    totalSize += doc.fileSize;
  });

  return {
    total,
    tagged,
    processing,
    failed,
    byType,
    totalSize,
  };
}
