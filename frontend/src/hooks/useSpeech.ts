import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export type SpeechStatus = 'idle' | 'speaking' | 'paused';

export interface UseSpeechReturn {
  speechStatus: SpeechStatus;
  currentSpeakingIndex: number | null;
  handleTextToSpeech: (content: string, index: number) => void;
  stopTextToSpeech: () => void;
}

export function useSpeech(): UseSpeechReturn {
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>('idle');
  const [currentSpeakingIndex, setCurrentSpeakingIndex] = useState<number | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Function to extract text content from HTML
  const extractTextFromHtml = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // Function to handle text-to-speech
  const handleTextToSpeech = (content: string, index: number) => {
    // Check if Web Speech API is supported
    if (!('speechSynthesis' in window)) {
      toast("Text-to-speech not supported", {
        description: "Your browser doesn't support this feature",
      });
      return;
    }

    // If currently speaking the same content, toggle pause/resume
    if (currentSpeakingIndex === index && speechStatus === 'speaking') {
      window.speechSynthesis.pause();
      setSpeechStatus('paused');
      return;
    }

    // If paused and clicking the same content, resume
    if (currentSpeakingIndex === index && speechStatus === 'paused') {
      window.speechSynthesis.resume();
      setSpeechStatus('speaking');
      return;
    }

    // Stop any current speech
    if (utteranceRef.current) {
      utteranceRef.current.onerror = null;
    }
    window.speechSynthesis.cancel();

    // Extract text from HTML content
    const textToSpeak = extractTextFromHtml(content);
    
    if (!textToSpeak.trim()) {
      toast("No text to read", {
        description: "This content appears to be empty",
      });
      return;
    }

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    // recommended speech settings from docs
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Set up event handlers
    utterance.onstart = () => {
      setSpeechStatus('speaking');
      setCurrentSpeakingIndex(index);
    };

    // When the speech ends, set the status to idle and clear the current speaking index
    utterance.onend = () => {
      setSpeechStatus('idle');
      setCurrentSpeakingIndex(null);
    };

    // When an error occurs, set the status to idle and clear the current speaking index
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setSpeechStatus('idle');
      setCurrentSpeakingIndex(null);
      
      // Only show user-facing errors for actual problems, not cancellations
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        toast("Speech error", {
          description: "Failed to read the content aloud",
        });
      }
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
  };

  // Function to stop text-to-speech
  const stopTextToSpeech = () => {
    // Remove error handler before cancelling to avoid false error reports
    if (utteranceRef.current) {
      utteranceRef.current.onerror = null;
    }
    window.speechSynthesis.cancel();
    setSpeechStatus('idle');
    setCurrentSpeakingIndex(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Remove error handler before cancelling to avoid false error reports
      if (utteranceRef.current) {
        utteranceRef.current.onerror = null;
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  return {
    speechStatus,
    currentSpeakingIndex,
    handleTextToSpeech,
    stopTextToSpeech,
  };
}