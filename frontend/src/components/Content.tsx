"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Data } from "@/types/data";
import { Badge } from "@/components/ui/badge"
import { BadgeCheckIcon, Copy, Check, ExternalLink, Volume2, X, Pause, Play } from "lucide-react";
import { useState } from "react";
import { useSpeech } from "@/hooks/useSpeech";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

interface ContentProps {
  data: Data[];
}
  
// Styles for inline content badges/links
const CONTENT_STYLES = [
  "prose prose-sm max-w-none whitespace-pre-wrap",
  // Style links as inline badges
  "[&_a]:inline-flex [&_a]:items-center [&_a]:gap-1 [&_a]:px-2 [&_a]:py-1",
  "[&_a]:border [&_a]:border-border [&_a]:rounded [&_a]:text-sm [&_a]:no-underline",
  "[&_a]:bg-muted/50 [&_a]:hover:bg-muted [&_a]:transition-colors",
  // Style red spans as red badges  
  "[&_span[style*='color:_red']]:inline-block [&_span[style*='color:_red']]:px-2 [&_span[style*='color:_red']]:py-1",
  "[&_span[style*='color:_red']]:border [&_span[style*='color:_red']]:border-red-300 [&_span[style*='color:_red']]:rounded",
  "[&_span[style*='color:_red']]:text-sm [&_span[style*='color:_red']]:bg-red-50 [&_span[style*='color:_red']]:text-red-700"
].join(" ");

export default function Content({ data }: ContentProps) {
  // State to manage the confirmation dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<{
    title: string;
    source: string;
    favicon: string;
  } | null>(null);
  
  // Custom hooks for text-to-speech and clipboard
  const { speechStatus, currentSpeakingIndex, handleTextToSpeech, stopTextToSpeech } = useSpeech();
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  // Handle source click
  const handleSourceClick = (source: { title: string; source: string; favicon: string }) => {
    setSelectedSource(source);
    setDialogOpen(true);
  };

  // Navigate to the source website
  const navigateToSource = () => {
    if (selectedSource) {
      window.open(selectedSource.source, '_blank', 'noopener,noreferrer');
      setDialogOpen(false);
      setSelectedSource(null);
    }
  };

  // If no data is available, show a message
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No content available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: index * 0.1,
            ease: "easeOut"
          }}
        >
          <Card id={`content-${index}`} className="w-full max-w-4xl scroll-mt-20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="capitalize text-xl">
                  {item.category.replace(/_/g, ' ')}
                </CardTitle>
                <CardDescription>
                  {item.cited_sources.length} cited source{item.cited_sources.length !== 1 ? 's' : ''} 
                  {item.non_cited_sources.length > 0 && ` and ${item.non_cited_sources.length} additional source${item.non_cited_sources.length !== 1 ? 's' : ''}`}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTextToSpeech(item.content, index)}
                        disabled={currentSpeakingIndex !== null && currentSpeakingIndex !== index}
                        className="gap-2"
                      >
                        {currentSpeakingIndex === index && speechStatus === 'speaking' ? (
                          <Pause className="h-4 w-4" />
                        ) : currentSpeakingIndex === index && speechStatus === 'paused' ? (
                          <Play className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                        {currentSpeakingIndex === index && speechStatus !== 'idle' ? (
                          speechStatus === 'speaking' ? 'Pause' : 'Resume'
                        ) : (
                          'Read Aloud'
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {currentSpeakingIndex === index && speechStatus === 'speaking' 
                          ? 'Pause reading' 
                          : currentSpeakingIndex === index && speechStatus === 'paused'
                          ? 'Resume reading'
                          : 'Read content aloud'
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {currentSpeakingIndex === index && speechStatus !== 'idle' && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={stopTextToSpeech}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Stop reading</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Main Content */}
            <div 
              className={CONTENT_STYLES}
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
            
            {/* Cited Sources */}
            {item.cited_sources.length > 0 && (
              <div>
                <Badge variant="default" className="mb-3">
                  <BadgeCheckIcon />
                  Cited Sources
                </Badge>                
                <div className="flex flex-col gap-2">
                  {item.cited_sources.map((source) => (
                    <div key={source.id} className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-auto p-2 justify-start w-fit"
                        onClick={() => handleSourceClick(source)}
                      >
                        <Image 
                          src={source.favicon} 
                          alt="Site favicon" 
                          width={18}
                          height={18}
                          className="flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span>{source.title}</span>
                        <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
                      </Button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2"
                              onClick={() => copyToClipboard(source.source, "URL copied to clipboard")}
                            >
                              {isCopied(source.source) ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy URL</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Non-Cited Sources */}
            {item.non_cited_sources.length > 0 && (
              <div>
                <Badge variant="secondary" className="mb-3">Additional Sources</Badge>
                <div className="flex flex-col gap-2">
                  {item.non_cited_sources.map((source) => (
                    <div key={source.id} className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-auto p-2 justify-start w-fit"
                        onClick={() => handleSourceClick(source)}
                      >
                        <Image 
                          src={source.favicon} 
                          alt="Site favicon" 
                          width={18}
                          height={18}
                          className="flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span>{source.title}</span>
                        <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
                      </Button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2"
                              onClick={() => copyToClipboard(source.source, "URL copied to clipboard")}
                            >
                              {isCopied(source.source) ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy URL</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </motion.div>
      ))}
      
      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              
              External Link
            </DialogTitle>
            <DialogDescription>
              Do you want to visit this external website?
            </DialogDescription>
          </DialogHeader>
          
          {selectedSource && (
            <div className="flex flex-col gap-2 py-4">
              <div className="flex items-center gap-2 font-medium text-sm">
                <Image 
                  src={selectedSource.favicon} 
                  alt="Site favicon" 
                  width={18}
                  height={18}
                  className="flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {selectedSource.title}
              </div>
              <div className="text-xs text-muted-foreground break-all">
                {selectedSource.source}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={navigateToSource} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Visit Site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}