"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { AlertCircle, Paperclip, Send, Loader2, FileText, X, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface ChatInterfaceProps {
  entityId: string;
  initialMessages: any[];
  upcomingTask: any | null;
}

const SUGGESTED_PROMPTS = [
  "What deductions can I claim?",
  "Explain my GST notice",
  "Old vs new regime for me",
  "Next due date?",
];

export default function ChatInterface({ entityId, initialMessages, upcomingTask }: ChatInterfaceProps) {
  const [attachments, setAttachments] = useState<{ file: File; base64: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: "/api/assistant/chat",
    body: { entityId },
    initialMessages: initialMessages.map(m => ({
      id: m.id,
      role: m.role as any,
      content: m.content,
    })),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments(prev => [
          ...prev,
          { file, base64: event.target?.result as string }
        ]);
      };
      reader.readAsDataURL(file);
    });
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && attachments.length === 0) return;

    const currentAttachments = attachments.map(a => ({
      name: a.file.name,
      contentType: a.file.type,
      url: a.base64,
    }));

    if (attachments.length > 0) {
      // Use append if there are attachments
      append({
        role: "user",
        content: input || "Attached document for review.",
        experimental_attachments: currentAttachments,
      } as any);
    } else {
      // Standard submit
      const mockEvent = new Event('submit') as unknown as React.FormEvent<HTMLFormElement>;
      handleSubmit(mockEvent);
    }
    
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleSuggestedPrompt = (prompt: string) => {
    append({
      role: "user",
      content: prompt,
    });
  };

  // Helper to calculate days left for banner
  const getDaysLeft = (dueDateStr: string) => {
    const due = new Date(dueDateStr).getTime();
    const now = new Date().getTime();
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] bg-neutral-950 overflow-hidden relative">
      
      {/* Context-Aware Banner */}
      {upcomingTask && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-amber-200">
              Your <strong className="font-semibold">{upcomingTask.taskType}</strong> is due in {getDaysLeft(upcomingTask.dueDate)} days — want help filing?
            </span>
          </div>
          <Link href={`/dashboard/calendar`} className={buttonVariants({ variant: "outline", size: "sm" }) + " h-8 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 gap-1"}>
             Start filing <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 relative scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-8 mt-12 md:mt-0">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.15)]">
               <span className="text-3xl font-bold bg-gradient-to-br from-indigo-400 to-purple-400 bg-clip-text text-transparent">C</span>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-neutral-100 mb-3">Hi, I'm your CA Assistant</h2>
              <p className="text-neutral-400 text-sm md:text-base">I can help you understand tax notices, calculate deductions, or check your compliance status.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mt-8">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 text-neutral-300 text-sm font-medium hover:bg-neutral-800/50 hover:border-neutral-700 hover:text-indigo-300 transition-all text-left flex items-center justify-between group"
                >
                  {prompt}
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6 pb-4">
            {messages.map((m: any) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div 
                  className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${
                    m.role === "user" 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20" 
                      : "bg-neutral-900 border border-neutral-800 text-neutral-100 shadow-sm"
                  }`}
                >
                  {/* Attachments rendering */}
                  {m.experimental_attachments && m.experimental_attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {m.experimental_attachments.map((att: any, i: number) => (
                        <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${m.role === "user" ? "bg-indigo-700/50" : "bg-neutral-800"}`}>
                          <FileText className="w-4 h-4" />
                          <span className="truncate max-w-[150px] font-medium">{att.name || 'Document'}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                    {m.content}
                  </div>

                  {/* Actions for notices (simulated based on content trigger for demo) */}
                  {m.role === "assistant" && m.content.toLowerCase().includes("notice") && !isLoading && (
                    <div className="mt-4 pt-3 border-t border-neutral-800 flex flex-wrap gap-2">
                       <Button variant="outline" size="sm" className="h-7 text-xs bg-neutral-800 border-neutral-700 text-neutral-300" onClick={() => handleSuggestedPrompt("Save to notices")}>
                         Save to notices
                       </Button>
                       <Button variant="outline" size="sm" className="h-7 text-xs bg-neutral-800 border-neutral-700 text-neutral-300" onClick={() => handleSuggestedPrompt("Get reply draft")}>
                         Get reply draft
                       </Button>
                       <Button variant="outline" size="sm" className="h-7 text-xs bg-neutral-800 border-neutral-700 text-neutral-300" onClick={() => handleSuggestedPrompt("Set reminder")}>
                         Set reminder
                       </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-5 py-4 flex items-center gap-2 shadow-sm">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-neutral-500 animate-[bounce_1s_infinite_0ms]"></div>
                    <div className="w-2 h-2 rounded-full bg-neutral-500 animate-[bounce_1s_infinite_200ms]"></div>
                    <div className="w-2 h-2 rounded-full bg-neutral-500 animate-[bounce_1s_infinite_400ms]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-neutral-950 border-t border-neutral-900 shrink-0">
        <div className="max-w-3xl mx-auto">
          {/* Staged Attachments */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 px-2">
              {attachments.map((att, i) => (
                <Badge key={i} variant="secondary" className="bg-neutral-800 text-neutral-300 gap-1.5 py-1.5 pl-3 pr-2">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="max-w-[120px] truncate">{att.file.name}</span>
                  <button onClick={() => removeAttachment(i)} className="ml-1 text-neutral-500 hover:text-rose-400 rounded-full hover:bg-neutral-700 p-0.5 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="relative flex items-end gap-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-2 shadow-sm focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,.png,.jpg,.jpeg"
              multiple
              onChange={handleFileSelect}
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-neutral-400 hover:text-indigo-400 hover:bg-neutral-800 rounded-xl transition-colors mb-0.5"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <textarea
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask about taxes, compliance, or upload a notice..."
              className="flex-1 bg-transparent border-0 resize-none max-h-[120px] min-h-[24px] py-2.5 px-2 text-[15px] text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-0 leading-relaxed scrollbar-hide"
              rows={1}
            />
            
            <Button 
              onClick={onSubmit}
              disabled={isLoading || (!input.trim() && attachments.length === 0)}
              className="mb-0.5 w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white p-0 flex items-center justify-center shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:shadow-none transition-all"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
            </Button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] text-neutral-600">
              AI can make mistakes. Always verify with a qualified Chartered Accountant.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
