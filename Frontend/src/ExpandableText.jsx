import { useState } from "react";

/**
 * ExpandableText Component
 * 
 * Displays text with an expandable "Show more / Show less" toggle.
 * - If text is 50 words or fewer: shows full text without toggle
 * - If text is more than 50 words: shows first 50 words + toggle
 * 
 * @param {string} text - The text to display
 * @param {number} wordLimit - Number of words to show when collapsed (default: 50)
 */
export default function ExpandableText({ text, wordLimit = 50 }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Count words by splitting on whitespace
  const words = text.trim().split(/\s+/);
  const totalWords = words.length;
  const isLong = totalWords > wordLimit;

  // If text is short, show it all without toggle
  if (!isLong) {
    return <span>{text}</span>;
  }

  // If long, show preview or full text based on state
  const displayText = isExpanded
    ? text
    : words.slice(0, wordLimit).join(" ") + "…";

  return (
    <div>
      <span>{displayText}</span>
      <button
        className="expandable-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? "Show less" : "Show more"}
      >
        {isExpanded ? " Show less" : " Show more"}
      </button>
    </div>
  );
}
