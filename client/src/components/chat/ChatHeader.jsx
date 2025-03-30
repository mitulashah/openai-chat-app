import React from 'react';
import {
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { HeaderMenu } from './HeaderMenu';

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
  
  return (
    <div className={styles.header}>
      <HeaderMenu 
        onOpenSettings={onOpenSettings}
        onAbout={onAbout}
      />
      <div>
        <Text className={styles.title} size={600} weight="semibold">{appTitle}</Text>
        <Text className={styles.version}>{appVersion}</Text>
      </div>
    </div>
  );
};