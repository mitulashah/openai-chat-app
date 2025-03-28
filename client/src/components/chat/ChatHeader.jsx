import React from 'react';
import {
  Text,
  makeStyles,
  tokens,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuButton,
  useId,
} from '@fluentui/react-components';
import { 
  NavigationRegular, 
  SettingsRegular,
  InfoRegular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    '@media (max-width: 580px)': {
      padding: '8px 12px',
    },
  },
  title: {
    '@media (max-width: 580px)': {
      fontSize: tokens.fontSizeBase500,
    },
  },
  version: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    marginLeft: '8px',
    '@media (max-width: 580px)': {
      display: 'none',
    },
  }
});

export const ChatHeader = ({ 
  onOpenSettings, 
  appTitle = "AI Chat",
  appVersion = "1.0",
  onAbout
}) => {
  const styles = useStyles();
  const menuId = useId('app-menu');
  
  return (
    <div className={styles.header}>
      <Menu id={menuId}>
        <MenuTrigger>
          <MenuButton icon={<NavigationRegular />}>Menu</MenuButton>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem icon={<SettingsRegular />} onClick={onOpenSettings}>
              Settings
            </MenuItem>
            {onAbout && (
              <MenuItem icon={<InfoRegular />} onClick={onAbout}>
                About
              </MenuItem>
            )}
          </MenuList>
        </MenuPopover>
      </Menu>
      <div>
        <Text className={styles.title} size={600} weight="semibold">{appTitle}</Text>
        <Text className={styles.version}>{appVersion}</Text>
      </div>
    </div>
  );
};