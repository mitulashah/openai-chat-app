import React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Divider,
  Tooltip
} from '@fluentui/react-components';
import { 
  DeleteRegular, 
  SaveRegular, 
  BookmarkRegular,
  CopyRegular
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  actionBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '8px 20px',
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.gap('12px'),
    flexShrink: 0,
  },
  divider: {
    height: '20px',
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
      
      <Divider vertical className={styles.divider} />
      
      {/* Placeholder for future features */}
      <Tooltip
        content="Save conversation (Coming soon)"
        relationship="label"
        positioning="above"
      >
        <Button 
          icon={<SaveRegular />}
          appearance="subtle"
          disabled={true}
        >
          Save
        </Button>
      </Tooltip>
      
      <Tooltip
        content="Copy chat to clipboard (Coming soon)"
        relationship="label"
        positioning="above"
      >
        <Button 
          icon={<CopyRegular />}
          appearance="subtle"
          disabled={true}
        >
          Copy
        </Button>
      </Tooltip>
      
      <Tooltip
        content="Bookmark this conversation (Coming soon)"
        relationship="label"
        positioning="above"
      >
        <Button 
          icon={<BookmarkRegular />}
          appearance="subtle"
          disabled={true}
        >
          Bookmark
        </Button>
      </Tooltip>
    </div>
  );
};