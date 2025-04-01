import React from 'react';
import { makeStyles, tokens, Button, Tooltip } from '@fluentui/react-components';
import { EyeRegular, CodeRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  previewButton: {
    position: 'absolute',
    top: '5px',
    right: '38px', // Positioned to the left of the copy button
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
 * A button that toggles between code view and preview mode
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isPreviewMode - Whether the preview mode is active
 * @param {function} props.onToggle - Function to call when toggling preview mode
 * @returns {JSX.Element}
 */
export const PreviewButton = ({ isPreviewMode, onToggle }) => {
  const styles = useStyles();
  
  return (
    <Tooltip
      content={isPreviewMode ? "Show code" : "Preview markdown"}
      relationship="label"
    >
      <Button 
        className={styles.previewButton}
        appearance="subtle"
        icon={isPreviewMode ? <CodeRegular /> : <EyeRegular />}
        onClick={onToggle}
        aria-label={isPreviewMode ? "Show code" : "Preview markdown"}
      />
    </Tooltip>
  );
};