import React from 'react';
import { makeStyles, tokens, Text, Button, shorthands } from '@fluentui/react-components';
import { ErrorCircleRegular, DismissRegular } from '@fluentui/react-icons';
import { useSettingsStyles } from './settings/SettingsStyles';

const useStyles = makeStyles({
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
    padding: '10px 12px',
    borderRadius: '0px',
    backgroundColor: tokens.colorPaletteRedBackground1,
    color: tokens.colorPaletteRedForeground1,
    fontSize: '14px',
    marginTop: '0px',
    position: 'relative',
  },
  successContainer: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
    padding: '10px 12px',
    borderRadius: '0px',
    backgroundColor: tokens.colorPaletteGreenBackground1,
    color: tokens.colorPaletteGreenForeground1,
    fontSize: '14px',
    marginTop: '0px',
  },
  warningContainer: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
    padding: '10px 12px',
    borderRadius: '0px',
    backgroundColor: tokens.colorPaletteYellowBackground1,
    color: tokens.colorPaletteYellowForeground1,
    fontSize: '14px',
    marginTop: '0px',
  },
  messageText: {
    flex: 1,
  },
  actionButton: {
    minWidth: 'unset',
    padding: '4px 8px',
  },
  dismissButton: {
    position: 'absolute',
    right: '8px',
    top: '8px',
    minWidth: 'unset',
    padding: '4px',
  }
});

/**
 * A reusable error display component
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - The error/success/warning message to display
 * @param {string} props.type - Type of message: 'error', 'success', or 'warning'
 * @param {Function} [props.onDismiss] - Optional callback for dismissing the message
 * @param {string} [props.actionLabel] - Optional label for action button
 * @param {Function} [props.onAction] - Optional callback for action button
 * @returns {JSX.Element|null} The error display component or null if no message
 */
export const ErrorDisplay = ({ 
  message, 
  type = 'error',
  onDismiss,
  actionLabel,
  onAction
}) => {
  const styles = useStyles();
  const settingsStyles = useSettingsStyles();
  
  if (!message) return null;
  
  let containerStyle;
  switch (type) {
    case 'success':
      containerStyle = styles.successContainer;
      break;
    case 'warning':
      containerStyle = styles.warningContainer;
      break;
    case 'error':
    default:
      containerStyle = styles.errorContainer;
      break;
  }
  
  return (
    <div className={containerStyle}>
      {type === 'error' && <ErrorCircleRegular />}
      <Text className={styles.messageText}>{message}</Text>
      
      {actionLabel && onAction && (
        <Button 
          appearance={type === 'warning' ? 'outline' : 'subtle'}
          size="small"
          onClick={onAction}
          className={`${styles.actionButton} ${type === 'warning' ? settingsStyles.warningActionButton : ''}`}
        >
          {actionLabel}
        </Button>
      )}
      
      {onDismiss && (
        <Button
          appearance="subtle"
          size="small"
          icon={<DismissRegular />}
          onClick={onDismiss}
          className={styles.dismissButton}
        />
      )}
    </div>
  );
};