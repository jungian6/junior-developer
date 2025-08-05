import { useState } from "react";
import { toast } from "sonner";

export interface UseCopyToClipboardReturn {
  copiedText: string | null;
  copyToClipboard: (text: string, successMessage?: string) => Promise<void>;
  isCopied: (text: string) => boolean;
}

export function useCopyToClipboard(): UseCopyToClipboardReturn {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = async (text: string, successMessage?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      
      // Clear the copied state after 1 second
      setTimeout(() => setCopiedText(null), 1000);
      
      toast(successMessage || "Copied to clipboard", {
        description: text,
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast("Failed to copy", {
        description: "Please try again",
      });
    }
  };

  const isCopied = (text: string) => copiedText === text;

  return {
    copiedText,
    copyToClipboard,
    isCopied,
  };
}