import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CopyButton } from './CopyButton';
import { PreviewButton } from './PreviewButton';
import { MarkdownPreview } from './MarkdownPreview';
import { useMarkdownStyles } from '../../styles/components/markdown/markdownStyles';

// Generate a unique hash for the content to use as an identifier
const generateContentHash = (content) => {
  let hash = 0;
  if (content.length === 0) return hash;
  
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(16).substring(0, 8);
};

/**
 * Wrapper for code blocks that adds copy and preview buttons
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The code block content
 * @param {string} props.content - The raw text content to copy
 * @param {boolean} props.isMarkdown - Whether this content is likely markdown that can be previewed
 * @returns {JSX.Element}
 */
export const CodeBlockWrapper = ({ children, content, isMarkdown = false }) => {
  const styles = useMarkdownStyles();
  const wrapperRef = useRef(null);
  const [height, setHeight] = useState('auto');
  
  // Generate a stable content identifier for this code block
  const contentId = useMemo(() => `md-preview-${generateContentHash(content)}`, [content]);
  
  // Initialize state from localStorage if available, otherwise default to false
  const [isPreviewMode, setIsPreviewMode] = useState(() => {
    try {
      const savedState = localStorage.getItem(contentId);
      return savedState === 'true';
    } catch (e) {
      return false;
    }
  });
  
  // Toggle between code view and preview mode
  const togglePreviewMode = () => {
    const newState = !isPreviewMode;
    setIsPreviewMode(newState);
    
    // Save state to localStorage
    try {
      localStorage.setItem(contentId, newState.toString());
    } catch (e) {
      // Ignore storage errors
    }
  };
  
  // Preserve height when switching modes to prevent layout shifts
  useEffect(() => {
    if (wrapperRef.current) {
      // Set fixed height only when needed - after initial render
      if (wrapperRef.current.offsetHeight > 0) {
        setHeight(`${wrapperRef.current.offsetHeight}px`);
      }
    }
  }, []);
  
  return (
    <div 
      ref={wrapperRef}
      className={`${styles.codeBlockWrapper} ${isPreviewMode ? styles.previewMode : ''} ${styles.codeBlockContainer}`}
      style={{ height: height }}
      data-preview-id={contentId}
    >
      {/* Code View */}
      <div className={`${styles.codeView} ${isPreviewMode ? styles.codeInactive : styles.codeActive}`}>
        {children}
      </div>
      
      {/* Preview View */}
      <div className={`${styles.previewView} ${isPreviewMode ? styles.previewActive : ''}`}>
        <MarkdownPreview content={content} />
      </div>
      
      {/* Control buttons */}
      {isMarkdown && <PreviewButton isPreviewMode={isPreviewMode} onToggle={togglePreviewMode} />}
      <CopyButton text={content} />
    </div>
  );
};