import React from 'react';
import { tokens } from '@fluentui/react-components';
import { SyntaxHighlighter, dracula, getDefaultStyle } from './syntaxHighlighter';
import { CodeBlockWrapper } from './CodeBlockWrapper';

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
    
    return !inline ? (
      <CodeBlockWrapper content={content}>
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