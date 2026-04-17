// src/components/HighlightedTranscription.tsx

import { useEffect, useState, useRef } from "react";
import { parseSRT, type WordTimestamp } from "@/utils/srtParser";

interface HighlightedTranscriptionProps {
  srtText: string;
  wavesurfer: any; // WaveSurfer instance
  fontSize: "small" | "medium" | "large";
}

export function HighlightedTranscription({
  srtText,
  wavesurfer,
  fontSize,
}: HighlightedTranscriptionProps) {
  const [words, setWords] = useState<WordTimestamp[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse SRT on mount
  useEffect(() => {
    const parsed = parseSRT(srtText);
    setWords(parsed);
    console.log("Parsed words with timestamps:", parsed.length);
  }, [srtText]);

  // Update current word based on audio time
  useEffect(() => {
    if (!wavesurfer) return;

    const handleTimeUpdate = () => {
      const currentTime = wavesurfer.getCurrentTime();
      updateHighlightFromTime(currentTime);
    };

    wavesurfer.on("audioprocess", handleTimeUpdate);
    wavesurfer.on("seek", handleTimeUpdate);
    wavesurfer.on("interaction", handleTimeUpdate);

    return () => {
      wavesurfer.un("audioprocess", handleTimeUpdate);
      wavesurfer.un("seek", handleTimeUpdate);
      wavesurfer.un("interaction", handleTimeUpdate);
    };
  }, [wavesurfer, words, currentWordIndex]);

  const handleWordClick = (word: WordTimestamp, index: number) => {
    if (wavesurfer) {
      // Seek to word start time
      const duration = wavesurfer.getDuration();
      const seekTo = word.start / duration;
      wavesurfer.seekTo(seekTo);

      // Force highlight update immediately (works when paused)
      setCurrentWordIndex(index);

      // Play just this word
      wavesurfer.play();

      // Stop at word end
      const wordDuration = (word.end - word.start) * 1000; // Convert to ms
      setTimeout(() => {
        if (wavesurfer.isPlaying()) {
          wavesurfer.pause();
        }
      }, wordDuration);

      // Auto-scroll to word
      if (containerRef.current) {
        const wordElement = containerRef.current.querySelector(
          `[data-word-index="${index}"]`,
        );
        if (wordElement) {
          wordElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    }
  };

  const updateHighlightFromTime = (currentTime: number) => {
    const index = words.findIndex(
      (word) => currentTime >= word.start && currentTime < word.end,
    );

    if (index !== currentWordIndex) {
      setCurrentWordIndex(index);
    }
  };

  const fontSizeClass =
    fontSize === "small"
      ? "text-sm"
      : fontSize === "medium"
        ? "text-base"
        : "text-lg";

  return (
    <div ref={containerRef} className={`${fontSizeClass} leading-relaxed`}>
      {words.map((word, index) => (
        <span
          key={index}
          data-word-index={index}
          onClick={() => handleWordClick(word, index)}
          className={`inline-block cursor-pointer px-1  transition-none rounded ${
            index === currentWordIndex
              ? "bg-primary text-primary-foreground font-semibold scale-105"
              : "hover:bg-muted"
          }`}
        >
          {word.word}{" "}
        </span>
      ))}
    </div>
  );
}
