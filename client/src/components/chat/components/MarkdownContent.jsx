import React, { useContext } from 'react';
import { makeStyles, shorthands, tokens } from '@fluentui/react-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createMarkdownComponents } from '../../../utils/markdown/markdownComponents.jsx';

// Define theme-aware styles
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
      padding: '10px',
      overflowX: 'auto',
      whiteSpace: 'pre',
      margin: '0',
      position: 'relative',
      backgroundColor: 'transparent',
    },
    '& code': {
      // Styling moved to the markdownComponents.js
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
});

/**
 * Renders markdown content with syntax highlighting and copy button
 * 
 * @param {Object} props - Component props
 * @param {string} props.text - Markdown text to render
 * @returns {JSX.Element|null} The rendered markdown or null if no text
 */
export const MarkdownContent = ({ text }) => {
  const styles = useStyles();
  
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