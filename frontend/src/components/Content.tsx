"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Data } from "@/types/data";
import { Badge } from "@/components/ui/badge"
import { BadgeCheckIcon, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface ContentProps {
  data: Data[];
}
  
export default function Content({ data }: ContentProps) {
  // State to track the URL that was copied
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  
  // State to manage the confirmation dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<{
    title: string;
    source: string;
    favicon: string;
  } | null>(null);

  // Function to copy the URL to the clipboard
  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 1000);
      toast("URL copied to clipboard", {
        description: url,
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast("Failed to copy URL", {
        description: "Please try again",
      });
    }
  };

  // Function to handle source click
  const handleSourceClick = (source: { title: string; source: string; favicon: string }) => {
    setSelectedSource(source);
    setDialogOpen(true);
  };

  // Function to navigate to the source
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
            <CardTitle className="capitalize text-xl">
              {item.category.replace(/_/g, ' ')}
            </CardTitle>
            <CardDescription>
              {item.cited_sources.length} cited source{item.cited_sources.length !== 1 ? 's' : ''} 
              {item.non_cited_sources.length > 0 && ` and ${item.non_cited_sources.length} additional source${item.non_cited_sources.length !== 1 ? 's' : ''}`}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Main Content */}
            <div 
              className="prose prose-sm max-w-none whitespace-pre-wrap [&_a]:inline-flex [&_a]:items-center [&_a]:gap-1 [&_a]:px-2 [&_a]:py-1 [&_a]:border [&_a]:border-border [&_a]:rounded [&_a]:text-sm [&_a]:no-underline [&_a]:bg-muted/50 [&_a]:hover:bg-muted [&_a]:transition-colors [&_span[style*='color:_red']]:inline-block [&_span[style*='color:_red']]:px-2 [&_span[style*='color:_red']]:py-1 [&_span[style*='color:_red']]:border [&_span[style*='color:_red']]:border-red-300 [&_span[style*='color:_red']]:rounded [&_span[style*='color:_red']]:text-sm [&_span[style*='color:_red']]:bg-red-50 [&_span[style*='color:_red']]:text-red-700"
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
                              onClick={() => copyToClipboard(source.source)}
                            >
                              {copiedUrl === source.source ? (
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
                              onClick={() => copyToClipboard(source.source)}
                            >
                              {copiedUrl === source.source ? (
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