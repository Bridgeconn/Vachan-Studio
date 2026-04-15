// src/components/FeatureLayout.tsx

import { useState } from "react";
import type { ReactNode } from "react";
import {
  Home,
  ChevronLeft,
  ChevronRight,
  Trash2,
  SquareCenterlineDashedVertical,
  SquareCenterlineDashedHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface FeatureLayoutProps {
  featureName: string;
  featureType: "stt" | "tts" | "ttt" | "sts";
  children: ReactNode;
  settingsContent: ReactNode;
  showNewButton?: boolean; // Control visibility
  viewMode?: "horizontal" | "vertical"; // ← Add this
  onViewModeChange?: (mode: "horizontal" | "vertical") => void; // ← Add this
}

export function FeatureLayout({
  featureName,
  featureType,
  children,
  settingsContent,
  showNewButton = true, // For now, true to see layout
  viewMode = "horizontal", // ← Add this
  onViewModeChange, // ← Add this
}: FeatureLayoutProps) {
  const navigate = useNavigate();
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const toggleViewMode = () => {
    const newMode = viewMode === "horizontal" ? "vertical" : "horizontal";
    onViewModeChange?.(newMode); // ← Update this
  };

  return (
    <div className="h-screen pt-16 flex overflow-hidden">
      {/* Left Panel - History/Navigation */}
      <div
        className={`border-r bg-background transition-all duration-300 shrink-0 overflow-hidden ${
          leftPanelOpen ? "w-64" : "w-14"
        }`}
      >
        {leftPanelOpen ? (
          /* Expanded Left Panel */
          <div className="p-4 space-y-4 h-full flex flex-col">
            {/* Header with collapse and home */}
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="cursor-pointer"
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/")}
                  >
                    <Home className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Go to homepage</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="cursor-pointer"
                    variant="ghost"
                    size="icon"
                    onClick={() => setLeftPanelOpen(false)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Collapse panel</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Feature Name */}
            <h2 className="text-lg font-semibold">{featureName}</h2>

            {/* New Button - conditionally shown */}
            {showNewButton && (
              <Button variant="outline" className="w-full cursor-pointer">
                New
              </Button>
            )}

            {/* History Section */}
            <div className="flex-1 overflow-auto">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                History
              </h3>
              {/* Dummy history items */}
              <div className="space-y-1">
                <div className="text-xs p-2 hover:bg-accent rounded cursor-pointer flex items-center justify-between group">
                  <span className="truncate">file_1.mp3</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-xs p-2 hover:bg-accent rounded cursor-pointer flex items-center justify-between group">
                  <span className="truncate">file_2.mp3</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Collapsed Left Panel */
          <div className="p-2 space-y-2 flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLeftPanelOpen(true)}
              title="Expand panel"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              title="Go to homepage"
            >
              <Home className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Middle Panel - Input/Output */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* View controls - top right */}
        <div className="h-12 flex items-center justify-end px-2 gap-2 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="cursor-pointer"
                variant="ghost"
                size="icon"
                onClick={toggleViewMode}
              >
                {viewMode === "horizontal" ? (
                  <SquareCenterlineDashedVertical className="h-5 w-5" />
                ) : (
                  <SquareCenterlineDashedHorizontal className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {viewMode === "horizontal"
                  ? "Switch to vertical split"
                  : "Switch to horizontal split"}
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Only show settings icon when panel is closed */}
          {!rightPanelOpen && (
            <Button
              className="cursor-pointer"
              variant="ghost"
              size="icon"
              onClick={() => setRightPanelOpen(true)}
              title="Show settings"
            >
              ⚙️
            </Button>
          )}
        </div>

        {/* Content Area - passed as children */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>

      {/* Right Panel - Settings */}
      <div
        className={`border-l bg-background transition-all duration-300 shrink-0 ${
          rightPanelOpen ? "w-80" : "w-0"
        } overflow-hidden`}
      >
        {rightPanelOpen && (
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Settings</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="cursor-pointer"
                    variant="ghost"
                    size="icon"
                    onClick={() => setRightPanelOpen(false)}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Hide settings</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Settings content passed as prop */}
            <div className="flex-1 overflow-auto">{settingsContent}</div>
          </div>
        )}
      </div>
    </div>
  );
}
