import React from 'react';
import { makeStyles } from '@fluentui/react-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const useStyles = makeStyles({
  previewContainer: {
    padding: '16px',
    minHeight: '100%',
    width: '100%',
    backgroundColor: '#f8f9fa',
    color: '#212529',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '14px',
    lineHeight: '1.5',
    '& p': {
      marginTop: '0',
      marginBottom: '16px',
    },
    '& p:last-child': {
      marginBottom: '0',
    },
    '& h1, & h2, & h3, & h4, & h5, & h6': {
      marginTop: '24px',
      marginBottom: '16px',
      fontWeight: '600',
      lineHeight: '1.25',
    },
    '& h1:first-child, & h2:first-child, & h3:first-child': {
      marginTop: '0',
    },
    '& h1': { fontSize: '2em' },
    '& h2': { fontSize: '1.5em' },
    '& h3': { fontSize: '1.25em' },
    '& h4': { fontSize: '1em' },
    '& h5': { fontSize: '0.875em' },
    '& h6': { fontSize: '0.85em' },
    '& code': {
      padding: '0.2em 0.4em',
      margin: '0',
      fontSize: '85%',
      backgroundColor: 'rgba(27, 31, 35, 0.05)',
      borderRadius: '3px',
      fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    },
    '& pre': {
      padding: '16px',
      overflow: 'auto',
      fontSize: '85%',
      lineHeight: '1.45',
      backgroundColor: '#f6f8fa',
      borderRadius: '3px',
    },
    '& pre code': {
      padding: '0',
      margin: '0',
      fontSize: '100%',
      wordBreak: 'normal',
      whiteSpace: 'pre',
      background: 'transparent',
      border: '0',
    },
    '& ul, & ol': {
      paddingLeft: '2em',
      marginTop: '0',
      marginBottom: '16px',
    },
    '& ul:last-child, & ol:last-child': {
      marginBottom: '0',
    },
    '& table': {
      display: 'block',
      width: '100%',
      overflow: 'auto',
      marginTop: '0',
      marginBottom: '16px',
      borderSpacing: '0',
      borderCollapse: 'collapse',
    },
    '& table:last-child': {
      marginBottom: '0',
    },
    '& table th': {
      fontWeight: '600',
    },
    '& table th, & table td': {
      padding: '6px 13px',
      border: '1px solid #dfe2e5',
    },
    '& table tr': {
      backgroundColor: '#fff',
      borderTop: '1px solid #c6cbd1',
    },
    '& table tr:nth-child(2n)': {
      backgroundColor: '#f6f8fa',
    },
    '& img': {
      maxWidth: '100%',
      boxSizing: 'content-box',
      background: '#fff',
    },
    '& hr': {
      height: '0.25em',
      padding: '0',
      margin: '24px 0',
      backgroundColor: '#e1e4e8',
      border: '0',
    },
    '& blockquote': {
      padding: '0 1em',
      color: '#6a737d',
      borderLeft: '0.25em solid #dfe2e5',
      margin: '0 0 16px 0',
    },
    '& blockquote:last-child': {
      marginBottom: '0',
    },
  },
});

/**
 * Renders the provided markdown content as formatted HTML
 * 
 * @param {Object} props - Component props
 * @param {string} props.content - The raw markdown content to render
 * @returns {JSX.Element}
 */
export const MarkdownPreview = ({ content }) => {
  const styles = useStyles();
  
  // Simple component overrides that don't recurse into CodeBlockWrapper
  const previewComponents = {
    code: ({node, inline, className, children, ...props}) => {
      const match = /language-(\w+)/.exec(className || '');
      return inline ? (
        <code className={className} {...props}>
          {children}
        </code>
      ) : (
        <pre>
          <code className={match ? `language-${match[1]}` : ''} {...props}>
            {String(children).replace(/\n$/, '')}
          </code>
        </pre>
      );
    }
  };
  
  return (
    <div className={styles.previewContainer}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={previewComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};