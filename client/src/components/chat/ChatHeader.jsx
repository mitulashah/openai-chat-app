import React from 'react';
import { Text } from '@fluentui/react-components';
import { HeaderMenu } from './HeaderMenu';
import { useLayoutStyles } from '../../styles/components/chat/layoutStyles';

export const ChatHeader = ({ 
  onOpenSettings, 
  appTitle = "AI Chat",
  appVersion = "1.0",
  onAbout
}) => {
  const styles = useLayoutStyles();
  
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