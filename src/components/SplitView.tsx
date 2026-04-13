// src/components/SplitView.tsx

import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { GripVertical, GripHorizontal } from 'lucide-react';

interface SplitViewProps {
  inputContent: ReactNode;
  outputContent: ReactNode | null;
  viewMode: 'horizontal' | 'vertical';
  showOutput: boolean;
}

export function SplitView({ 
  inputContent, 
  outputContent, 
  viewMode,
  showOutput 
}: SplitViewProps) {
  const [splitPosition, setSplitPosition] = useState(50); // Percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      if (viewMode === 'horizontal') {
        // Top/bottom split
        const y = e.clientY - rect.top;
        const percentage = (y / rect.height) * 100;
        setSplitPosition(Math.min(Math.max(percentage, 10), 90));
      } else {
        // Left/right split
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        setSplitPosition(Math.min(Math.max(percentage, 10), 90));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = viewMode === 'horizontal' ? 'ns-resize' : 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, viewMode]);

  // If no output, show input only (full size)
  if (!showOutput) {
    return (
      <div className="h-full w-full">
        {inputContent}
      </div>
    );
  }

  // Show both input and output with divider
  if (viewMode === 'horizontal') {
    // Top/bottom split
    return (
      <div ref={containerRef} className="h-full w-full flex flex-col">
        {/* Input Section */}
        <div style={{ height: `${splitPosition}%` }} className="overflow-auto">
          {inputContent}
        </div>

        {/* Draggable Divider */}
        <div
          className="h-1 bg-border hover:bg-primary/50 cursor-ns-resize flex items-center justify-center group relative"
          onMouseDown={() => setIsDragging(true)}
        >
          <div className="absolute bg-background border rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripHorizontal className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>

        {/* Output Section */}
        <div style={{ height: `${100 - splitPosition}%` }} className="overflow-auto">
          {outputContent}
        </div>
      </div>
    );
  } else {
    // Left/right split
    return (
      <div ref={containerRef} className="h-full w-full flex">
        {/* Input Section */}
        <div style={{ width: `${splitPosition}%` }} className="overflow-auto">
          {inputContent}
        </div>

        {/* Draggable Divider */}
        <div
          className="w-1 bg-border hover:bg-primary/50 cursor-ew-resize flex items-center justify-center group relative"
          onMouseDown={() => setIsDragging(true)}
        >
          <div className="absolute bg-background border rounded px-1 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>

        {/* Output Section */}
        <div style={{ width: `${100 - splitPosition}%` }} className="overflow-auto">
          {outputContent}
        </div>
      </div>
    );
  }
}