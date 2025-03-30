import React from 'react';
import { makeStyles, shorthands, tokens, Spinner } from '@fluentui/react-components';

const useStyles = makeStyles({
  skeletonContainer: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('20px'),
    padding: '20px',
    width: '100%',
  },
  skeletonMessage: {
    padding: '15px',
    borderRadius: '8px',
    maxWidth: '70%',
  },
  skeletonUser: {
    alignSelf: 'flex-end',
    backgroundColor: `${tokens.colorBrandBackground}40`,
  },
  skeletonAi: {
    alignSelf: 'flex-start',
    backgroundColor: `${tokens.colorNeutralBackground3}80`,
  },
  skeletonContent: {
    height: '40px',
    width: '100%',
    borderRadius: '4px',
    animation: {
      '0%': {
        opacity: 0.6,
      },
      '50%': {
        opacity: 0.3,
      },
      '100%': {
        opacity: 0.6,
      }
    },
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
  },
  skeletonLoading: {
    alignSelf: 'center',
    padding: '10px',
  },
});

/**
 * Skeleton UI component to display while messages are loading
 * @returns {JSX.Element}
 */
export const ChatSkeleton = () => {
  const styles = useStyles();
  
  return (
    <div className={styles.skeletonContainer}>
      <div className={`${styles.skeletonMessage} ${styles.skeletonUser}`}>
        <div className={styles.skeletonContent} />
      </div>
      <div className={styles.skeletonLoading}>
        <Spinner size="tiny" label="Loading conversation..." />
      </div>
      <div className={`${styles.skeletonMessage} ${styles.skeletonAi}`}>
        <div className={styles.skeletonContent} />
      </div>
      <div className={`${styles.skeletonMessage} ${styles.skeletonUser}`}>
        <div className={styles.skeletonContent} />
      </div>
    </div>
  );
};

export default ChatSkeleton;