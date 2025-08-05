"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import type { Data } from "@/types/data";

interface TableOfContentsProps {
  data: Data[];
}

export default function TableOfContents({ data }: TableOfContentsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Scroll to the section with the given index
  const scrollToSection = (index: number) => {
    const element = document.getElementById(`content-${index}`);
    const mainElement = document.querySelector('main');
    if (element && mainElement) {
      const elementTop = element.offsetTop;
      mainElement.scrollTo({
        top: elementTop - 80, // Small offset from top
        behavior: 'smooth'
      });
    }
  };

  // Handle scroll to highlight the active section
  useEffect(() => {
    const handleScroll = () => {
      const mainElement = document.querySelector('main');
      if (!mainElement) return;
      
      const scrollTop = mainElement.scrollTop;
      const viewportHeight = mainElement.clientHeight;

      let mostVisibleSectionIndex = 0;
      let largestVisibleArea = 0;

      // Check each section to see which one has the most visible area
      for (let i = 0; i < data.length; i++) {
        const element = document.getElementById(`content-${i}`);
        if (!element) continue;

        const elementTop = element.offsetTop;
        const elementBottom = elementTop + element.offsetHeight;
        const viewportTop = scrollTop;
        const viewportBottom = scrollTop + viewportHeight;

        // Calculate visible area of this section
        const visibleTop = Math.max(elementTop, viewportTop);
        const visibleBottom = Math.min(elementBottom, viewportBottom);
        const visibleArea = Math.max(0, visibleBottom - visibleTop);

        // If this section has more visible area than previous sections, make it active
        if (visibleArea > largestVisibleArea) {
          largestVisibleArea = visibleArea;
          mostVisibleSectionIndex = i;
        }
      }

      setActiveIndex(mostVisibleSectionIndex);
    };

    // Add scroll listener to the main element
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
      
      // Delay initial call to allow animations to complete
      const animationDelay = (data.length * 0.1) + 0.5 + 0.1;
      setTimeout(() => {
        handleScroll();
      }, animationDelay * 1000);
    }

    return () => {
      if (mainElement) {
        mainElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [data.length]);

  return (
    <div className="sticky top-4 h-fit">
      <Card className="w-full gap-3">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Jump to Section</CardTitle>
        </CardHeader>
        <CardContent>
          <nav className="space-y-2">
            {data.map((item, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(index)}
                className={`w-full text-left p-2 rounded-md transition-colors text-sm ${
                  activeIndex === index
                    ? 'bg-[#004b88] text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="font-medium capitalize">
                  {item.category.replace(/_/g, ' ')}
                </div>
                <div className="text-xs">
                  {item.cited_sources.length} cited source{item.cited_sources.length !== 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}