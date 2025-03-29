import React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Tooltip
} from '@fluentui/react-components';
import { DeleteRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  actionBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '8px 20px',
    // Removed the border-top property
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.gap('12px'),
    flexShrink: 0,
  }
});

/**
 * Chat action bar component for chat-specific actions like clearing, saving, etc.
 * @param {Object} props - Component props
 * @param {Function} props.onClearChat - Function to clear chat
 * @param {boolean} props.isConfigured - Whether Azure OpenAI is configured
 * @returns {JSX.Element}
 */
export const ChatActionBar = ({ onClearChat, isConfigured = true }) => {
  const styles = useStyles();

  return (
    <div className={styles.actionBar}>
      {/* Only the clear chat button is kept and positioned on the right side */}
      <Tooltip
        content="Clear all messages"
        relationship="label"
        positioning="above"
      >
        <Button 
          icon={<DeleteRegular />}
          appearance="subtle"
          onClick={onClearChat}
          disabled={!isConfigured}
        >
          Clear Chat
        </Button>
      </Tooltip>
    </div>
  );
};