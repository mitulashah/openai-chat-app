import React from 'react';
import {
  Text,
  makeStyles,
  shorthands,
  tokens,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuButton,
  Button,
  Divider,
  Badge,
  Tooltip,
} from '@fluentui/react-components';
import { DeleteRegular, DataUsageRegular, InfoRegular } from '@fluentui/react-icons';
import { themes } from '../../theme';
import { useChat } from '../../contexts/ChatContext';

const useStyles = makeStyles({
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('20px'),
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('20px'),
  },
  themeSelector: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
  themePreview: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    marginRight: '8px',
  },
  menuItemContent: {
    display: 'flex',
    alignItems: 'center',
  },
  statusText: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  statusDotConfigured: {
    backgroundColor: tokens.colorPaletteGreenForeground1,
  },
  statusDotUnconfigured: {
    backgroundColor: tokens.colorPaletteRedForeground1,
  },
  divider: {
    height: '24px',
  },
  tokenUsageContainer: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('6px'),
    cursor: 'pointer',
  },
  tokenBadge: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  memoryModeText: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  tokenTooltipContent: {
    padding: '8px',
    maxWidth: '240px',
  },
  tokenStatsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    ...shorthands.gap('12px'),
    marginBottom: '4px',
  },
  tokenStatsLabel: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
  },
  tokenStatsValue: {
    fontSize: '12px',
    fontWeight: '600',
  },
  tooltipDivider: {
    margin: '6px 0',
  }
});

export const Footer = ({ 
  isConfigured, 
  currentTheme, 
  currentThemeName, 
  handleThemeChange,
  onClearChat,
  // Added props for memory management and token usage
  memorySettings: memorySettingsProps,
  tokenUsage: tokenUsageProps
}) => {
  const styles = useStyles();
  // Get from context or props (props take precedence)
  const contextValues = useChat();
  const memorySettings = memorySettingsProps || contextValues.memorySettings;
  const tokenUsage = tokenUsageProps || contextValues.tokenUsage;
  
  // Get background colors for both themes
  const lightBackground = themes?.light?.colorNeutralBackground1 || '#F8F8F2';
  const darkBackground = themes?.dark?.colorNeutralBackground1 || '#282A36';
  const lightNordBackground = themes?.lightNord?.colorNeutralBackground1 || '#ECEFF4';
  const darkNordBackground = themes?.darkNord?.colorNeutralBackground1 || '#2E3440';

  // Function to get the display name for the current theme
  const getThemeDisplayName = () => {
    switch(currentThemeName) {
      case 'light': return 'Light Dracula';
      case 'dark': return 'Dark Dracula';
      case 'lightNord': return 'Light Nord';
      case 'darkNord': return 'Dark Nord';
      default: return 'Light Dracula';
    }
  };

  // Function to get memory mode display name
  const getMemoryModeDisplay = () => {
    switch(memorySettings.memoryMode) {
      case 'none': return 'No Memory';
      case 'limited': return `Limited (${memorySettings.memoryLimit} messages)`;
      case 'full': return 'Full Memory';
      default: return 'Limited Memory';
    }
  };

  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className={styles.footer}>
      <div className={styles.footerLeft}>
        <div className={styles.statusText}>
          <div className={`${styles.statusDot} ${isConfigured ? styles.statusDotConfigured : styles.statusDotUnconfigured}`} />
          <Text size={200}>
            {isConfigured ? 'Azure OpenAI Configured' : 'Azure OpenAI Not Configured'}
          </Text>
        </div>
        
        {isConfigured && (
          <>
            <Divider vertical className={styles.divider} />
            
            <Tooltip
              content={
                <div className={styles.tokenTooltipContent}>
                  <div className={styles.tokenStatsRow}>
                    <Text className={styles.tokenStatsLabel}>Memory Mode:</Text>
                    <Text className={styles.tokenStatsValue}>{getMemoryModeDisplay()}</Text>
                  </div>
                  
                  <Divider className={styles.tooltipDivider} />
                  
                  <div className={styles.tokenStatsRow}>
                    <Text className={styles.tokenStatsLabel}>Current Prompt Tokens:</Text>
                    <Text className={styles.tokenStatsValue}>{formatNumber(tokenUsage.current.promptTokens || 0)}</Text>
                  </div>
                  <div className={styles.tokenStatsRow}>
                    <Text className={styles.tokenStatsLabel}>Current Completion Tokens:</Text>
                    <Text className={styles.tokenStatsValue}>{formatNumber(tokenUsage.current.completionTokens || 0)}</Text>
                  </div>
                  <div className={styles.tokenStatsRow}>
                    <Text className={styles.tokenStatsLabel}>Current Total:</Text>
                    <Text className={styles.tokenStatsValue}>{formatNumber(tokenUsage.current.totalTokens || 0)}</Text>
                  </div>
                  
                  <Divider className={styles.tooltipDivider} />
                  
                  <div className={styles.tokenStatsRow}>
                    <Text className={styles.tokenStatsLabel}>Session Total Tokens:</Text>
                    <Text className={styles.tokenStatsValue}>{formatNumber(tokenUsage.total || 0)}</Text>
                  </div>
                </div>
              }
              relationship="label"
              positioning="above"
            >
              <div className={styles.tokenUsageContainer}>
                <DataUsageRegular />
                <Badge appearance="filled" className={styles.tokenBadge}>
                  {formatNumber(tokenUsage.current.totalTokens || 0)}
                </Badge>
                <Text className={styles.memoryModeText}>
                  {getMemoryModeDisplay()}
                </Text>
              </div>
            </Tooltip>
          </>
        )}
      </div>
      <div className={styles.footerRight}>
        <div className={styles.themeSelector}>
          <Text size={200}>Theme:</Text>
          <Menu>
            <MenuTrigger>
              <MenuButton>
                {getThemeDisplayName()}
              </MenuButton>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem 
                  onClick={(e) => handleThemeChange(e, { value: 'light' })}
                >
                  <div className={styles.menuItemContent}>
                    <div 
                      className={styles.themePreview}
                      style={{ backgroundColor: lightBackground }}
                    />
                    Light Dracula
                  </div>
                </MenuItem>
                <MenuItem 
                  onClick={(e) => handleThemeChange(e, { value: 'dark' })}
                >
                  <div className={styles.menuItemContent}>
                    <div 
                      className={styles.themePreview}
                      style={{ backgroundColor: darkBackground }}
                    />
                    Dark Dracula
                  </div>
                </MenuItem>
                <MenuItem 
                  onClick={(e) => handleThemeChange(e, { value: 'lightNord' })}
                >
                  <div className={styles.menuItemContent}>
                    <div 
                      className={styles.themePreview}
                      style={{ backgroundColor: lightNordBackground }}
                    />
                    Light Nord
                  </div>
                </MenuItem>
                <MenuItem 
                  onClick={(e) => handleThemeChange(e, { value: 'darkNord' })}
                >
                  <div className={styles.menuItemContent}>
                    <div 
                      className={styles.themePreview}
                      style={{ backgroundColor: darkNordBackground }}
                    />
                    Dark Nord
                  </div>
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
        <Divider vertical className={styles.divider} />
        <Button 
          icon={<DeleteRegular />}
          appearance="subtle"
          onClick={onClearChat}
        >
          Clear Chat
        </Button>
      </div>
    </div>
  );
};