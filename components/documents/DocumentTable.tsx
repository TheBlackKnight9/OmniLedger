"use client";

import React, { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  Download,
  Share2,
  Trash2,
  Eye,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Sparkles,
  Loader2,
  Tag,
  Calendar,
  Shield,
  Hash,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  X,
} from "lucide-react";
import {
  deleteDocument,
  retagDocument,
  shareDocument,
  updateDocumentType,
} from "@/lib/actions/documents";

interface DocumentWithShares {
  id: string;
  entityId: string;
  docType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  aiTags: any;
  ocrText: string | null;
  status: string;
  expiryDate: string | null;
  uploadedAt: string;
  uploadedBy: string | null;
  shares: any[];
}

const DOC_TYPE_LABELS: Record<string, string> = {
  PAN_CARD: "PAN Card",
  AADHAAR: "Aadhaar",
  GST_RETURN: "GST Return",
  GSTR1: "GSTR-1",
  GSTR3B: "GSTR-3B",
  ITR_ACK: "ITR Ack",
  FORM_16: "Form 16",
  FORM_26AS: "Form 26AS",
  TDS_CERTIFICATE: "TDS Cert",
  INVOICE: "Invoice",
  BALANCE_SHEET: "Balance Sheet",
  PROFIT_LOSS: "P&L",
  BANK_STATEMENT: "Bank Stmt",
  ROC_FILING: "ROC Filing",
  INCORPORATION_CERT: "Incorporation",
  MOA_AOA: "MOA/AOA",
  BOARD_RESOLUTION: "Board Res",
  OTHER: "Other",
};

const DOC_TYPE_COLORS: Record<string, string> = {
  PAN_CARD: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  AADHAAR: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  GST_RETURN: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  GSTR1: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  GSTR3B: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  ITR_ACK: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  FORM_16: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  FORM_26AS: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  TDS_CERTIFICATE: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  INVOICE: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  BALANCE_SHEET: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  PROFIT_LOSS: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  BANK_STATEMENT: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  ROC_FILING: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  INCORPORATION_CERT: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  MOA_AOA: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  BOARD_RESOLUTION: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  OTHER: "bg-neutral-500/15 text-neutral-300 border-neutral-500/30",
};

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/"))
    return <ImageIcon className="w-4 h-4 text-emerald-400" />;
  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    mimeType.includes("csv")
  )
    return <FileSpreadsheet className="w-4 h-4 text-green-400" />;
  return <FileText className="w-4 h-4 text-blue-400" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusConfig(status: string) {
  switch (status) {
    case "TAGGED":
      return {
        icon: CheckCircle2,
        label: "AI Tagged",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
      };
    case "PROCESSING":
      return {
        icon: Clock,
        label: "Processing",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
      };
    case "FAILED":
      return {
        icon: AlertTriangle,
        label: "Failed",
        color: "text-rose-400",
        bg: "bg-rose-500/10",
      };
    default:
      return {
        icon: Clock,
        label: status,
        color: "text-neutral-400",
        bg: "bg-neutral-500/10",
      };
  }
}

export default function DocumentTable({
  documents: initialDocs,
}: {
  documents: DocumentWithShares[];
}) {
  const [documents, setDocuments] = useState(initialDocs);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [selectedDoc, setSelectedDoc] = useState<DocumentWithShares | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareDocId, setShareDocId] = useState("");
  const [isPending, startTransition] = useTransition();

  // Filter and sort
  const filtered = documents
    .filter((doc) => {
      const matchesSearch =
        !searchQuery ||
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.docType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        filterType === "ALL" || doc.docType === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const dateA = new Date(a.uploadedAt).getTime();
      const dateB = new Date(b.uploadedAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const handleDelete = (docId: string) => {
    startTransition(async () => {
      await deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    });
  };

  const handleRetag = (docId: string) => {
    startTransition(async () => {
      await retagDocument(docId);
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId ? { ...d, status: "PROCESSING" } : d
        )
      );
    });
  };

  const handleShare = () => {
    if (!shareEmail || !shareDocId) return;
    startTransition(async () => {
      await shareDocument({
        documentId: shareDocId,
        sharedWith: shareEmail,
        permission: "VIEW",
      });
      setShowShareDialog(false);
      setShareEmail("");
      setShareDocId("");
    });
  };

  // Unique doc types for filter
  const uniqueTypes = Array.from(new Set(documents.map((d) => d.docType)));

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input
            id="document-search"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-neutral-900/50 border-neutral-800 text-neutral-200 placeholder:text-neutral-600 focus:border-indigo-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40 h-9 bg-neutral-900/50 border-neutral-800 text-neutral-300 text-xs">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800">
              <SelectItem
                value="ALL"
                className="text-xs text-neutral-300"
              >
                All Types
              </SelectItem>
              {uniqueTypes.map((type) => (
                <SelectItem
                  key={type}
                  value={type}
                  className="text-xs text-neutral-300"
                >
                  {DOC_TYPE_LABELS[type] || type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setSortOrder((o) => (o === "desc" ? "asc" : "desc"))
            }
            className="text-neutral-400 hover:text-neutral-200 h-9 px-2"
          >
            {sortOrder === "desc" ? (
              <SortDesc className="w-4 h-4" />
            ) : (
              <SortAsc className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-neutral-500">
        Showing {filtered.length} of {documents.length} documents
      </p>

      {/* Table */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-800 hover:bg-transparent">
              <TableHead className="text-neutral-500 font-semibold text-xs w-[40%]">
                Document
              </TableHead>
              <TableHead className="text-neutral-500 font-semibold text-xs">
                Type
              </TableHead>
              <TableHead className="text-neutral-500 font-semibold text-xs hidden md:table-cell">
                Size
              </TableHead>
              <TableHead className="text-neutral-500 font-semibold text-xs hidden lg:table-cell">
                Status
              </TableHead>
              <TableHead className="text-neutral-500 font-semibold text-xs hidden md:table-cell">
                Uploaded
              </TableHead>
              <TableHead className="text-neutral-500 font-semibold text-xs w-[50px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="border-neutral-800">
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-neutral-500"
                >
                  <FileText className="w-10 h-10 mx-auto mb-3 text-neutral-700" />
                  <p className="text-sm font-medium">No documents found</p>
                  <p className="text-xs mt-1">
                    Try adjusting your search or filter
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((doc) => {
                const statusConfig = getStatusConfig(doc.status);
                const StatusIcon = statusConfig.icon;
                const tags =
                  typeof doc.aiTags === "object" ? doc.aiTags : {};

                return (
                  <TableRow
                    key={doc.id}
                    className="border-neutral-800/50 hover:bg-neutral-900/40 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedDoc(doc);
                      setShowPreview(true);
                    }}
                  >
                    {/* Document Name + Icon */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 group-hover:border-neutral-700 transition-colors">
                          {getFileIcon(doc.mimeType)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-neutral-200 truncate max-w-[240px]">
                            {doc.fileName}
                          </p>
                          {tags.pan && (
                            <span className="text-[10px] text-neutral-500 font-mono">
                              PAN: {tags.pan}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Type Badge */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium ${
                          DOC_TYPE_COLORS[doc.docType] ||
                          DOC_TYPE_COLORS.OTHER
                        }`}
                      >
                        {DOC_TYPE_LABELS[doc.docType] || doc.docType}
                      </Badge>
                    </TableCell>

                    {/* Size */}
                    <TableCell className="hidden md:table-cell">
                      <span className="text-xs text-neutral-500 font-mono">
                        {formatFileSize(doc.fileSize)}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="hidden lg:table-cell">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium ${statusConfig.bg}`}
                      >
                        {doc.status === "PROCESSING" ? (
                          <Loader2
                            className={`w-3 h-3 ${statusConfig.color} animate-spin`}
                          />
                        ) : (
                          <StatusIcon
                            className={`w-3 h-3 ${statusConfig.color}`}
                          />
                        )}
                        <span className={statusConfig.color}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </TableCell>

                    {/* Uploaded Date */}
                    <TableCell className="hidden md:table-cell">
                      <span className="text-xs text-neutral-500">
                        {formatDate(doc.uploadedAt)}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0 text-neutral-600 hover:text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-neutral-900 border-neutral-800 w-48"
                        >
                          <DropdownMenuItem
                            className="text-xs text-neutral-300 gap-2 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDoc(doc);
                              setShowPreview(true);
                            }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-xs text-neutral-300 gap-2 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(doc.fileUrl, "_blank");
                            }}
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-xs text-neutral-300 gap-2 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShareDocId(doc.id);
                              setShowShareDialog(true);
                            }}
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-neutral-800" />
                          <DropdownMenuItem
                            className="text-xs text-indigo-300 gap-2 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRetag(doc.id);
                            }}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Re-tag with AI
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-neutral-800" />
                          <DropdownMenuItem
                            className="text-xs text-rose-400 gap-2 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(doc.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-lg bg-neutral-950 border-neutral-800 text-neutral-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-400" />
              Document Details
            </DialogTitle>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="flex items-start gap-3 p-3 bg-neutral-900/50 rounded-lg border border-neutral-800">
                <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                  {getFileIcon(selectedDoc.mimeType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-200 text-sm truncate">
                    {selectedDoc.fileName}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-neutral-500">
                      {formatFileSize(selectedDoc.fileSize)}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {selectedDoc.mimeType}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Tags */}
              {selectedDoc.aiTags &&
                typeof selectedDoc.aiTags === "object" &&
                Object.keys(selectedDoc.aiTags).length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm font-semibold text-neutral-300">
                        AI-Extracted Tags
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selectedDoc.aiTags as Record<string, string>).map(
                        ([key, value]) =>
                          value && (
                            <div
                              key={key}
                              className="flex items-center gap-2 p-2 bg-indigo-950/20 rounded-lg border border-indigo-500/10"
                            >
                              <Tag className="w-3 h-3 text-indigo-400" />
                              <div>
                                <p className="text-[10px] text-neutral-500 uppercase tracking-wider">
                                  {key.replace(/([A-Z])/g, " $1").trim()}
                                </p>
                                <p className="text-xs text-neutral-200 font-medium">
                                  {String(value)}
                                </p>
                              </div>
                            </div>
                          )
                      )}
                    </div>
                  </div>
                )}

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-2.5 bg-neutral-900/30 rounded-lg border border-neutral-800/50">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider">
                    Document Type
                  </p>
                  <Badge
                    variant="outline"
                    className={`mt-1 text-[10px] ${
                      DOC_TYPE_COLORS[selectedDoc.docType] ||
                      DOC_TYPE_COLORS.OTHER
                    }`}
                  >
                    {DOC_TYPE_LABELS[selectedDoc.docType] ||
                      selectedDoc.docType}
                  </Badge>
                </div>
                <div className="p-2.5 bg-neutral-900/30 rounded-lg border border-neutral-800/50">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider">
                    Status
                  </p>
                  <p className="text-xs text-neutral-200 mt-1 font-medium">
                    {getStatusConfig(selectedDoc.status).label}
                  </p>
                </div>
                <div className="p-2.5 bg-neutral-900/30 rounded-lg border border-neutral-800/50">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider">
                    Uploaded
                  </p>
                  <p className="text-xs text-neutral-200 mt-1">
                    {formatDate(selectedDoc.uploadedAt)}
                  </p>
                </div>
                <div className="p-2.5 bg-neutral-900/30 rounded-lg border border-neutral-800/50">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider">
                    Shares
                  </p>
                  <p className="text-xs text-neutral-200 mt-1">
                    {selectedDoc.shares?.length || 0} people
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(selectedDoc.fileUrl, "_blank")}
                  className="text-neutral-400 hover:text-neutral-200 text-xs gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open File
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRetag(selectedDoc.id)}
                  className="text-indigo-400 hover:text-indigo-300 text-xs gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Re-tag
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleDelete(selectedDoc.id);
                    setShowPreview(false);
                  }}
                  className="text-rose-400 hover:text-rose-300 text-xs gap-1.5 ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md bg-neutral-950 border-neutral-800 text-neutral-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-400" />
              Share Document
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-neutral-500 font-medium mb-1.5 block">
                Share with (email)
              </label>
              <Input
                id="share-email-input"
                placeholder="colleague@example.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="bg-neutral-900/50 border-neutral-800 text-neutral-200"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleShare}
                disabled={!shareEmail || isPending}
                className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                Share
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowShareDialog(false)}
                className="text-neutral-400"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
