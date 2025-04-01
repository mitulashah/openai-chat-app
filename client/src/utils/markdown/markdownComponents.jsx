import React from 'react';
import { tokens } from '@fluentui/react-components';
import { SyntaxHighlighter, dracula, getDefaultStyle } from './syntaxHighlighter';
import { CodeBlockWrapper } from './CodeBlockWrapper';

/**
 * Determines if a code block potentially contains markdown content
 * @param {string} content - The content of the code block
 * @param {string} language - The language identifier of the code block
 * @returns {boolean} True if the content appears to be markdown
 */
const isMarkdownContent = (content, language) => {
  // If explicitly marked as markdown, return true
  if (language === 'markdown' || language === 'md') {
    return true;
  }
  
  // If explicitly marked as another language, it's probably not markdown
  if (language && language !== 'text' && language !== 'plaintext') {
    return false;
  }
  
  // Check for common markdown patterns - simplified and more robust patterns
  const hasHeader = /^#+\s+.+$/m.test(content);
  const hasListItem = /^[\s]*[-*+]\s+.+$/m.test(content);
  const hasNumberedList = /^[\s]*\d+\.\s+.+$/m.test(content);
  const hasLink = /\[.+?\]\(.+?\)/.test(content);
  const hasEmphasis = /(\*\*|__).+?(\*\*|__)/.test(content) || /(\*|_).+?(\*|_)/.test(content);
  const hasBlockquote = /^>\s+.+$/m.test(content);
  const hasCodeBlock = /^```[\s\S]+?```$/m.test(content);
  const hasTable = /^\|.+\|.+\|$/m.test(content);
  
  // If it has at least two markdown patterns, it's likely markdown
  const markdownFeatures = [
    hasHeader, 
    hasListItem, 
    hasNumberedList, 
    hasLink, 
    hasEmphasis, 
    hasBlockquote, 
    hasCodeBlock,
    hasTable
  ];
  
  const markdownFeatureCount = markdownFeatures.filter(Boolean).length;
  
  // If no language is specified and it has markdown features, or it has multiple markdown features
  return markdownFeatureCount >= 1;
};

/**
 * Creates a set of component renderers for ReactMarkdown
 * @param {Object} theme - The current theme tokens
 * @returns {Object} Component override mapping for ReactMarkdown
 */
export const createMarkdownComponents = (theme) => ({
  code: ({node, inline, className, children, ...props}) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const content = String(children).replace(/\n$/, '');
    
    // Dracula theme colors for code blocks
    const codeBackground = theme?.codeBackground || '#2d3250'; // Bluish-tinted Dracula background
    const codeForeground = theme?.codeForeground || '#F8F8F2'; // Dracula foreground
    
    // Determine if this is a markdown code block that should have preview capability
    const isMarkdown = isMarkdownContent(content, language);
    
    return !inline ? (
      <CodeBlockWrapper content={content} isMarkdown={isMarkdown}>
        <SyntaxHighlighter
          style={dracula}
          language={language || 'text'}
          PreTag="div"
          customStyle={{
            ...getDefaultStyle(theme),
            backgroundColor: codeBackground,
            color: codeForeground,
          }}
          {...props}
        >
          {content}
        </SyntaxHighlighter>
      </CodeBlockWrapper>
    ) : (
      <code 
        className={className} 
        style={{
          backgroundColor: inline ? '#3a405f' : codeBackground, // Slightly lighter bluish tint for inline code
          color: codeForeground,
          padding: '1px 3px',
          borderRadius: '3px',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
        }}
        {...props}
      >
        {children}
      </code>
    );
  },
  p: ({node, children, ...props}) => (
    <p style={{whiteSpace: 'pre-wrap'}} {...props}>{children}</p>
  ),
  li: ({node, children, ...props}) => (
    <li style={{paddingLeft: '4px'}} {...props}>{children}</li>
  )
});