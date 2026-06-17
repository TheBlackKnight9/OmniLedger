"use client";

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CloudUpload,
  Sparkles,
  Plus,
} from "lucide-react";
import { uploadDocument } from "@/lib/actions/documents";

interface UploadFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  docType: string;
  error?: string;
}

const DOC_TYPES = [
  { value: "PAN_CARD", label: "PAN Card" },
  { value: "AADHAAR", label: "Aadhaar Card" },
  { value: "GST_RETURN", label: "GST Return" },
  { value: "GSTR1", label: "GSTR-1" },
  { value: "GSTR3B", label: "GSTR-3B" },
  { value: "ITR_ACK", label: "ITR Acknowledgement" },
  { value: "FORM_16", label: "Form 16" },
  { value: "FORM_26AS", label: "Form 26AS" },
  { value: "TDS_CERTIFICATE", label: "TDS Certificate" },
  { value: "INVOICE", label: "Invoice" },
  { value: "BALANCE_SHEET", label: "Balance Sheet" },
  { value: "PROFIT_LOSS", label: "Profit & Loss" },
  { value: "BANK_STATEMENT", label: "Bank Statement" },
  { value: "ROC_FILING", label: "ROC Filing" },
  { value: "INCORPORATION_CERT", label: "Incorporation Certificate" },
  { value: "MOA_AOA", label: "MOA / AOA" },
  { value: "BOARD_RESOLUTION", label: "Board Resolution" },
  { value: "OTHER", label: "Other" },
];

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/"))
    return <ImageIcon className="w-5 h-5 text-emerald-400" />;
  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    mimeType.includes("csv")
  )
    return <FileSpreadsheet className="w-5 h-5 text-green-400" />;
  return <FileText className="w-5 h-5 text-blue-400" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function DocumentUploadDialog({
  entityId,
}: {
  entityId: string;
}) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [autoTag, setAutoTag] = useState(true);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    addFiles(dropped);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map((file) => ({
      file,
      progress: 0,
      status: "pending" as const,
      docType: "OTHER",
    }));
    setFiles((prev) => [...prev, ...uploadFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFileDocType = (index: number, docType: string) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, docType } : f))
    );
  };

  const handleUploadAll = async () => {
    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const uploadFile = files[i];
      if (uploadFile.status === "complete") continue;

      // Update status to uploading
      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: "uploading" as const, progress: 20 } : f
        )
      );

      try {
        // Simulate progress steps
        await new Promise((r) => setTimeout(r, 300));
        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, progress: 50 } : f))
        );

        // For now, we create a mock fileUrl (in production, UploadThing would handle this)
        // In real implementation, you would use the UploadThing upload endpoint
        const mockFileUrl = `/uploads/${Date.now()}-${uploadFile.file.name}`;

        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, progress: 75 } : f))
        );

        // Call server action to save document record
        await uploadDocument({
          entityId,
          fileName: uploadFile.file.name,
          fileUrl: mockFileUrl,
          fileSize: uploadFile.file.size,
          mimeType: uploadFile.file.type || "application/pdf",
          docType: autoTag ? undefined : uploadFile.docType,
        });

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, status: "complete" as const, progress: 100 }
              : f
          )
        );
      } catch (error) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? {
                  ...f,
                  status: "error" as const,
                  error: "Upload failed",
                  progress: 0,
                }
              : f
          )
        );
      }
    }

    setIsUploading(false);

    // Close dialog after a brief delay if all successful
    const allDone = files.every(
      (f) => f.status === "complete" || f.status === "error"
    );
    if (allDone) {
      setTimeout(() => {
        setOpen(false);
        setFiles([]);
      }, 1500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          id="upload-document-btn"
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:shadow-indigo-500/40"
        >
          <Plus className="w-4 h-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-neutral-950 border-neutral-800 text-neutral-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CloudUpload className="w-5 h-5 text-indigo-400" />
            Upload Documents
          </DialogTitle>
        </DialogHeader>

        {/* AI Tag Toggle */}
        <div className="flex items-center justify-between py-2 px-3 bg-indigo-950/30 border border-indigo-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-200">
              AI Auto-Tagging
            </span>
            <Badge
              variant="outline"
              className="border-indigo-500/30 text-indigo-300 text-[10px]"
            >
              Powered by Claude
            </Badge>
          </div>
          <button
            onClick={() => setAutoTag(!autoTag)}
            className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
              autoTag ? "bg-indigo-600" : "bg-neutral-700"
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
                autoTag ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
            isDragOver
              ? "border-indigo-500 bg-indigo-950/30 scale-[1.02]"
              : "border-neutral-800 bg-neutral-900/30 hover:border-neutral-700 hover:bg-neutral-900/50"
          }`}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = true;
            input.accept =
              ".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv,.doc,.docx";
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              if (target.files) addFiles(Array.from(target.files));
            };
            input.click();
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isDragOver
                  ? "bg-indigo-600/30 text-indigo-400 scale-110"
                  : "bg-neutral-800/60 text-neutral-400"
              }`}
            >
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-200">
                Drag & drop files here, or click to browse
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                PDF, Images, Excel, CSV • Max 16MB per file
              </p>
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {files.map((uploadFile, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                  uploadFile.status === "complete"
                    ? "bg-emerald-950/20 border-emerald-500/20"
                    : uploadFile.status === "error"
                    ? "bg-rose-950/20 border-rose-500/20"
                    : uploadFile.status === "uploading"
                    ? "bg-indigo-950/20 border-indigo-500/20"
                    : "bg-neutral-900/30 border-neutral-800"
                }`}
              >
                {/* File Icon */}
                {getFileIcon(uploadFile.file.type)}

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-200 truncate">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatFileSize(uploadFile.file.size)}
                  </p>
                  {uploadFile.status === "uploading" && (
                    <Progress
                      value={uploadFile.progress}
                      className="h-1 mt-1.5 bg-neutral-800"
                    />
                  )}
                </div>

                {/* Doc Type (manual only if autoTag off) */}
                {!autoTag && uploadFile.status === "pending" && (
                  <Select
                    value={uploadFile.docType}
                    onValueChange={(v) => updateFileDocType(index, v)}
                  >
                    <SelectTrigger className="w-36 h-8 text-xs bg-neutral-900 border-neutral-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800">
                      {DOC_TYPES.map((dt) => (
                        <SelectItem
                          key={dt.value}
                          value={dt.value}
                          className="text-xs text-neutral-300"
                        >
                          {dt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Status Icon */}
                {uploadFile.status === "complete" && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                )}
                {uploadFile.status === "error" && (
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                )}
                {uploadFile.status === "uploading" && (
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin flex-shrink-0" />
                )}

                {/* Remove button */}
                {uploadFile.status === "pending" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="text-neutral-600 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {files.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-neutral-500">
              {files.filter((f) => f.status === "complete").length} of{" "}
              {files.length} uploaded
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setFiles([])}
                disabled={isUploading}
                className="text-neutral-400 hover:text-neutral-200"
              >
                Clear All
              </Button>
              <Button
                onClick={handleUploadAll}
                disabled={
                  isUploading ||
                  files.every((f) => f.status === "complete")
                }
                className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload {files.filter((f) => f.status === "pending").length}{" "}
                    File
                    {files.filter((f) => f.status === "pending").length !== 1
                      ? "s"
                      : ""}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
