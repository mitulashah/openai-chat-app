import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createMarkdownComponents } from '../../../utils/markdown/markdownComponents.jsx';
import { useMarkdownStyles } from '../../../styles/components/markdown/markdownStyles';

/**
 * Renders markdown content with syntax highlighting and copy button
 * 
 * @param {Object} props - Component props
 * @param {string} props.text - Markdown text to render
 * @returns {JSX.Element|null} The rendered markdown or null if no text
 */
export const MarkdownContent = ({ text }) => {
  const styles = useMarkdownStyles();
  
  if (!text) return null;
  
  // Dracula theme colors for code blocks with bluish tint
  const codeTheme = {
    codeBackground: '#2d3250', // Bluish-tinted Dracula background color
    codeForeground: '#F8F8F2', // Dracula foreground color
  };
  
  // Create components with current theme
  const markdownComponents = createMarkdownComponents(codeTheme);
  
  return (
    <div className={styles.markdown}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};