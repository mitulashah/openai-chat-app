import React, { useState } from 'react';
import { makeStyles, shorthands, tokens, Button, Tooltip } from '@fluentui/react-components';
import { CopyRegular, CheckmarkRegular } from '@fluentui/react-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
// Import languages you need to support
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import html from 'react-syntax-highlighter/dist/esm/languages/prism/markup';

// Register languages
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('ts', typescript);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('py', python);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('sh', bash);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('html', html);

const useStyles = makeStyles({
  markdown: {
    '& p': {
      margin: '0 0 12px 0',
      whiteSpace: 'pre-wrap',
    },
    '& p:last-child': {
      marginBottom: 0,
    },
    '& pre': {
      backgroundColor: '#2d3250', // Modified Dracula background with blue tint
      padding: '10px',
      borderRadius: '4px',
      overflowX: 'auto',
      whiteSpace: 'pre',
      margin: '8px 0',
      color: '#f8f8f2', // Dracula foreground color
      fontSize: '0.75rem', // Changed from 0.8rem to 0.75rem for code blocks
      position: 'relative', // For positioning the copy button
    },
    '& code': {
      backgroundColor: '#2d3250', // Same as pre for consistency
      padding: '1px 3px',
      borderRadius: '3px',
      fontFamily: 'monospace',
      whiteSpace: 'pre',
      color: '#f8f8f2', // Same as pre for consistency
      fontSize: '0.75rem', // Changed from 0.8rem to 0.75rem for inline code
    },
    '& pre code': {
      backgroundColor: 'transparent', // Remove background for code inside pre blocks
      padding: 0, // Remove padding as the parent pre already has padding
      borderRadius: 0, // Remove border radius
    },
    '& a': {
      color: tokens.colorBrandForeground1,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    '& img': {
      maxWidth: '100%',
      margin: '8px 0',
    },
    '& table': {
      borderCollapse: 'collapse',
      width: '100%',
      margin: '10px 0',
    },
    '& th, & td': {
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      padding: '8px',
      textAlign: 'left',
    },
    '& blockquote': {
      borderLeft: `4px solid ${tokens.colorBrandStroke1}`,
      margin: '10px 0',
      paddingLeft: '12px',
      color: tokens.colorNeutralForeground2,
    },
    '& ul, & ol': {
      paddingLeft: '24px',
      marginTop: '8px',
      marginBottom: '8px',
      boxSizing: 'border-box',
      width: '100%',
    },
    '& li': {
      marginBottom: '6px',
      paddingLeft: '4px',
      overflowWrap: 'break-word',
      wordWrap: 'break-word',
      wordBreak: 'break-word',
    },
    '& li:last-child': {
      marginBottom: '2px',
    },
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    width: '100%',
    '& > *:not(:last-child)': {
      marginBottom: '8px',
    },
  },
  codeBlockWrapper: {
    position: 'relative',
  },
  copyButton: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    minWidth: 'unset',
    width: '28px',
    height: '28px',
    padding: '2px',
    zIndex: 1,
    opacity: 0,
    transition: 'opacity 0.2s ease',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    color: tokens.colorNeutralForeground3,
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      color: tokens.colorNeutralForegroundOnBrand,
    },
  },
  codeBlockContainer: {
    position: 'relative',
    '&:hover': {
      '& > button': {
        opacity: 1,
      }
    }
  },
  markdownBlock: {
    position: 'relative',
  },
});

// Copy Button Component
const CopyButton = ({ text }) => {
  const styles = useStyles();
  const [isCopied, setIsCopied] = useState(false);
  
  const handleCopy = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };
  
  return (
    <Tooltip
      content={isCopied ? "Copied!" : "Copy to clipboard"}
      relationship="label"
    >
      <Button 
        className={styles.copyButton}
        appearance="subtle"
        icon={isCopied ? <CheckmarkRegular /> : <CopyRegular />}
        onClick={handleCopy}
        aria-label="Copy to clipboard"
      />
    </Tooltip>
  );
};

// Code Block Wrapper
const CodeBlockWrapper = ({ children, content }) => {
  const styles = useStyles();
  
  return (
    <div className={`${styles.codeBlockWrapper} ${styles.codeBlockContainer}`}>
      {children}
      <CopyButton text={content} />
    </div>
  );
};

// Common markdown rendering configuration
const markdownComponents = {
  code: ({node, inline, className, children, ...props}) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const content = String(children).replace(/\n$/, '');
    
    return !inline ? (
      <CodeBlockWrapper content={content}>
        <SyntaxHighlighter
          style={dracula}
          language={language || 'text'}
          PreTag="div"
          customStyle={{
            margin: '8px 0',
            borderRadius: '4px',
            backgroundColor: '#2d3250', // Keep consistent with our custom background
            fontSize: '0.75rem', // Updated from 0.8rem to 0.75rem to match the CSS
            paddingRight: '35px', // Make room for the copy button
          }}
          {...props}
        >
          {content}
        </SyntaxHighlighter>
      </CodeBlockWrapper>
    ) : (
      <code className={className} {...props}>
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
};

export const MarkdownContent = ({ text }) => {
  const styles = useStyles();
  
  if (!text) return null;
  
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