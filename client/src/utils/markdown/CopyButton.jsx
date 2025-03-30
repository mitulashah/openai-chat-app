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
    transition: 'opacity 0.2s ease',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    color: tokens.colorNeutralForeground3,
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      color: tokens.colorNeutralForegroundOnBrand,
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