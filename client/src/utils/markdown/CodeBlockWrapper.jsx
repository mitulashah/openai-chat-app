import React from 'react';
import { makeStyles } from '@fluentui/react-components';
import { CopyButton } from './CopyButton';

const useStyles = makeStyles({
  codeBlockWrapper: {
    position: 'relative',
    backgroundColor: '#2d3250', // Bluish-tinted Dracula background color
    borderRadius: '4px',
    margin: '8px 0',
    overflow: 'hidden', // Ensure content doesn't overflow the border radius
  },
  codeBlockContainer: {
    position: 'relative',
    '&:hover': {
      '& > button': {
        opacity: 1,
      }
    }
  },
});

/**
 * Wrapper for code blocks that adds a copy button
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The code block content
 * @param {string} props.content - The raw text content to copy
 * @returns {JSX.Element}
 */
export const CodeBlockWrapper = ({ children, content }) => {
  const styles = useStyles();
  
  return (
    <div className={`${styles.codeBlockWrapper} ${styles.codeBlockContainer}`}>
      {children}
      <CopyButton text={content} />
    </div>
  );
};