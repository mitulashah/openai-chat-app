import React from 'react';
import { 
  makeStyles, 
  shorthands, 
  Text, 
  Tooltip 
} from '@fluentui/react-components';
import { DataUsageRegular } from '@fluentui/react-icons';
import { formatNumber } from '../../../utils/Utils';

const useStyles = makeStyles({
  tokenInfo: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('4px'),
    marginTop: '4px',
    justifyContent: 'flex-end',
  },
  tokenText: {
    fontSize: '11px',
    color: 'inherit',
    opacity: 0.7,
  },
  tokenIcon: {
    fontSize: '10px',
    color: 'inherit',
    opacity: 0.7,
  },
  tokenTooltipContent: {
    padding: '6px',
    maxWidth: '200px',
  },
  tokenStatsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    ...shorthands.gap('12px'),
    marginBottom: '4px',
    fontSize: '12px',
  },
});

export const MessageTokenInfo = ({ 
  tokenUsage, 
  promptTokens,
  isUser 
}) => {
  const styles = useStyles();
  
  // Handle user message with prompt tokens
  if (isUser && promptTokens) {
    return (
      <div className={styles.tokenInfo}>
        <Tooltip
          content={
            <div className={styles.tokenTooltipContent}>
              <div className={styles.tokenStatsRow}>
                <Text>Prompt Tokens:</Text>
                <Text weight="semibold">{formatNumber(promptTokens)}</Text>
              </div>
            </div>
          }
          relationship="label"
          positioning="above"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <DataUsageRegular className={styles.tokenIcon} />
            <Text className={styles.tokenText}>
              {formatNumber(promptTokens)} tokens
            </Text>
          </div>
        </Tooltip>
      </div>
    );
  }
  
  // Handle AI message with token usage
  if (!isUser && tokenUsage) {
    return (
      <div className={styles.tokenInfo}>
        <Tooltip
          content={
            <div className={styles.tokenTooltipContent}>
              <div className={styles.tokenStatsRow}>
                <Text>Prompt Tokens:</Text>
                <Text weight="semibold">{formatNumber(tokenUsage.promptTokens)}</Text>
              </div>
              <div className={styles.tokenStatsRow}>
                <Text>Completion Tokens:</Text>
                <Text weight="semibold">{formatNumber(tokenUsage.completionTokens)}</Text>
              </div>
              <div className={styles.tokenStatsRow}>
                <Text>Total Tokens:</Text>
                <Text weight="semibold">{formatNumber(tokenUsage.totalTokens)}</Text>
              </div>
            </div>
          }
          relationship="label"
          positioning="above"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <DataUsageRegular className={styles.tokenIcon} />
            <Text className={styles.tokenText}>
              {formatNumber(tokenUsage.completionTokens)} tokens
            </Text>
          </div>
        </Tooltip>
      </div>
    );
  }
  
  return null;
};