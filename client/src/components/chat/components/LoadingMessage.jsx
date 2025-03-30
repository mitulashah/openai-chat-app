import React from 'react';
import { Spinner } from '@fluentui/react-components';
import { makeStyles } from '@fluentui/react-components';

const useStyles = makeStyles({
  messageContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
});

export const LoadingMessage = () => {
  const styles = useStyles();
  
  return (
    <div className={styles.messageContent}>
      <Spinner size="tiny" label="AI is thinking..." />
    </div>
  );
};