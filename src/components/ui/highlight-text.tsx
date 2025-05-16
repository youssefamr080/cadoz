"use client";

import React from "react";
import { highlightFuseMatches } from "@/lib/utils/string-utils";

interface HighlightTextProps {
  text: string;
  searchTerms?: string[];
  matches?: readonly { indices: readonly [number, number][] }[];
  className?: string;
  highlightClassName?: string;
  useFuse?: boolean;
}

/**
 * A component that highlights search terms or Fuse.js matches within text
 */
export function HighlightText({
  text,
  searchTerms = [],
  matches,
  className = "",
  highlightClassName = "bg-yellow-200 text-black px-0.5 rounded",
  useFuse = false
}: HighlightTextProps) {
  if (!text) {
    return <span className={className}>{text}</span>;
  }
  
  // Use Fuse.js matches if available and useFuse is true
  if (useFuse && matches && matches.length > 0) {
    const segments = highlightFuseMatches(text, matches);
    
    return (
      <span className={className}>
        {segments.map((segment, index) => (
          segment.isMatch ? (
            <span key={`highlight-${index}`} className={highlightClassName}>
              {segment.text}
            </span>
          ) : (
            <span key={`text-${index}`}>{segment.text}</span>
          )
        ))}
      </span>
    );
  }
  
  // Fall back to traditional search term highlighting
  if (!searchTerms.length) {
    return <span className={className}>{text}</span>;
  }

  // Normalize text and search terms for matching
  const normalizedText = text.normalize("NFD").replace(/[\u0300-\u036f\u064B-\u065F\u0670]/g, "").toLowerCase();
  const normalizedSearchTerms = searchTerms
    .map(term => term.normalize("NFD").replace(/[\u0300-\u036f\u064B-\u065F\u0670]/g, "").toLowerCase())
    .filter(term => term.length > 0);

  if (!normalizedSearchTerms.length) {
    return <span className={className}>{text}</span>;
  }

  // Find all matches
  const textMatches: Array<{ start: number; end: number; term: string }> = [];
  
  normalizedSearchTerms.forEach(term => {
    let index = normalizedText.indexOf(term);
    while (index !== -1) {
      textMatches.push({
        start: index,
        end: index + term.length,
        term: text.substring(index, index + term.length)
      });
      index = normalizedText.indexOf(term, index + 1);
    }
  });

  // Sort matches by start position
  textMatches.sort((a, b) => a.start - b.start);

  // Merge overlapping matches
  const mergedMatches: Array<{ start: number; end: number }> = [];
  
  textMatches.forEach(match => {
    if (mergedMatches.length === 0) {
      mergedMatches.push(match);
      return;
    }

    const lastMatch = mergedMatches[mergedMatches.length - 1];
    
    if (match.start <= lastMatch.end) {
      // Overlapping match, merge them
      lastMatch.end = Math.max(lastMatch.end, match.end);
    } else {
      // Non-overlapping match, add it
      mergedMatches.push(match);
    }
  });

  // Build the highlighted text
  const result: React.ReactNode[] = [];
  let lastEnd = 0;

  mergedMatches.forEach((match, index) => {
    // Add text before the match
    if (match.start > lastEnd) {
      result.push(
        <span key={`text-${index}`}>
          {text.substring(lastEnd, match.start)}
        </span>
      );
    }

    // Add the highlighted match
    result.push(
      <span key={`highlight-${index}`} className={highlightClassName}>
        {text.substring(match.start, match.end)}
      </span>
    );

    lastEnd = match.end;
  });

  // Add any remaining text
  if (lastEnd < text.length) {
    result.push(
      <span key="text-end">{text.substring(lastEnd)}</span>
    );
  }

  return <span className={className}>{result}</span>;
}
