import React, { useState } from 'react';
import { makeStyles, tokens, Button, Tooltip } from '@fluentui/react-components';
import { CopyRegular, CheckmarkRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
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
    transition: 'opacity 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
    backgroundColor: 'rgba(100, 100, 100, 0.6)',
    color: 'white',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    '&:hover': {
      backgroundColor: 'rgba(60, 60, 60, 0.85)',
      color: 'white',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.4)',
    },
  },
});

/**
 * A button that copies text to clipboard when clicked
 * 
 * @param {Object} props - Component props
 * @param {string} props.text - Text to copy to clipboard
 * @returns {JSX.Element}
 */
export const CopyButton = ({ text }) => {
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