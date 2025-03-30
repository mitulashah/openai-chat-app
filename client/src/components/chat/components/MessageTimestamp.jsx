import React from 'react';
import { makeStyles } from '@fluentui/react-components';
import { formatTimestamp } from '../../../utils/Utils';

const useStyles = makeStyles({
  timestampTooltip: {
    position: 'absolute',
    bottom: '-23px',
    fontSize: '11px',
    color: 'rgba(0, 0, 0, 0.6)',
    opacity: 0,
    transition: 'opacity 0.2s ease',
    pointerEvents: 'none',
    backgroundColor: 'transparent',
    padding: '2px 6px',
    borderRadius: '4px',
    zIndex: 10,
    whiteSpace: 'nowrap',
    boxShadow: 'none',
  },
});

export const MessageTimestamp = ({ timestamp }) => {
  const styles = useStyles();
  const formattedTime = formatTimestamp(timestamp);
  
  return (
    <div className={`${styles.timestampTooltip} timestampTooltip`}>
      {formattedTime}
    </div>
  );
};