import React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Tooltip,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuDivider
} from '@fluentui/react-components';
import { 
  DeleteRegular, 
  TextBulletListSquareRegular, 
  ArrowDownloadRegular,
  DocumentPdfRegular,
  DocumentRegular,
  CodeRegular
} from '@fluentui/react-icons';
// Replace useChat with useMessage
import { useMessage } from '../../contexts/MessageContext';
import { exportChat } from '../../utils/Utils';

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
  },
  exportMenuIcon: {
    marginRight: '8px',
  }
});

/**
 * Chat action bar component for chat-specific actions like clearing, saving, etc.
 * @param {Object} props - Component props
 * @param {Function} props.onClearChat - Function to clear chat
 * @param {Function} props.onSummarizeChat - Function to summarize chat
 * @param {boolean} props.isConfigured - Whether Azure OpenAI is configured
 * @returns {JSX.Element}
 */
export const ChatActionBar = ({ onClearChat, onSummarizeChat, isConfigured = true }) => {
  const styles = useStyles();
  // Get messages from MessageContext
  const { messages } = useMessage();
  
  const handleExport = (format) => {
    exportChat(messages, format);
  };

  return (
    <div className={styles.actionBar}>
      <Tooltip
        content="Get a summary of the conversation"
        relationship="label"
        positioning="above"
      >
        <Button 
          icon={<TextBulletListSquareRegular />}
          appearance="subtle"
          onClick={onSummarizeChat}
          disabled={!isConfigured}
        >
          Summarize
        </Button>
      </Tooltip>
      
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Tooltip
            content="Export the conversation"
            relationship="label"
            positioning="above"
          >
            <Button
              icon={<ArrowDownloadRegular />}
              appearance="subtle"
              disabled={!isConfigured || messages.length === 0}
            >
              Export
            </Button>
          </Tooltip>
        </MenuTrigger>
        
        <MenuPopover>
          <MenuList>
            <MenuItem 
              icon={<DocumentRegular className={styles.exportMenuIcon} />}
              onClick={() => handleExport('txt')}
            >
              Text (.txt)
            </MenuItem>
            <MenuItem 
              icon={<CodeRegular className={styles.exportMenuIcon} />}
              onClick={() => handleExport('md')}
            >
              Markdown (.md)
            </MenuItem>
            <MenuDivider />
            <MenuItem 
              icon={<DocumentPdfRegular className={styles.exportMenuIcon} />}
              onClick={() => handleExport('pdf')}
            >
              PDF Document
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
      
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