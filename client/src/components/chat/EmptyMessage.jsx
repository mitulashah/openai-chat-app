import React from 'react';
import { Text, makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  emptyStateContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
  },
});

/**
 * Empty message placeholder to display when no messages are present
 * @returns {JSX.Element}
 */
export const EmptyMessage = () => {
  const styles = useStyles();
  
  return (
    <div className={styles.emptyStateContainer}>
      <div className={styles.emptyState}>
        <Text size={400}>Type a message to start chatting</Text>
      </div>
    </div>
  );
};

export default EmptyMessage;