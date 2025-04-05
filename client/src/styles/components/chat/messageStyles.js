/**
 * Message styles for chat components
 */
import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useMessageStyles = makeStyles({
  // MessageContainer styles
  messageRow: {
    display: 'flex',
    width: '100%',
    padding: '4px 0',
    position: 'relative',
    '&[data-sender="user"]': {
      justifyContent: 'flex-end',
    },
    '&[data-sender="ai"]': {
      justifyContent: 'flex-start',
    },
    '&[data-is-last-message="true"]': {
      marginBottom: '20px',
    },
  },
  messageContainer: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '80%',
    padding: '6px 8px',
    borderRadius: '8px',
    ...shorthands.gap('3px'),
    position: 'relative',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    border: '1px solid transparent',
  },
  userMessage: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    borderImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05)) 1',
  },
  aiMessage: {
    backgroundColor: tokens.colorNeutralBackground3,
    borderImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.03)) 1',
  },
  summaryMessage: {
    backgroundColor: '#2d3250',
    color: '#f8f8f2',
    position: 'relative',
    marginTop: '16px',
    border: 'none',
    '&::before': {
      content: '"CONVERSATION SUMMARY"',
      position: 'absolute',
      top: '-20px',
      left: '-1px',
      fontSize: '12px',
      fontWeight: '700',
      color: '#FFB86C',
      backgroundColor: '#2d3250',
      padding: '5px 8px',
      lineHeight: '16px',
      borderRadius: '4px 4px 0 0',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
    },
  },
  messageContainerWithHover: {
    '&:hover .timestampTooltip, &:hover .senderLabel': {
      opacity: 1,
    },
    marginBottom: '8px',
    marginTop: '4px',
    '.summaryMessage & .timestampTooltip': {
      bottom: '-25px',
    },
  },
  senderLabel: {
    position: 'absolute',
    fontSize: '11px',
    fontWeight: '600',
    color: tokens.colorNeutralForeground3,
    opacity: 0,
    transition: 'opacity 0.2s ease',
    pointerEvents: 'none',
    backgroundColor: 'transparent',
    padding: '2px 6px',
    borderRadius: '4px',
    zIndex: 10,
    whiteSpace: 'nowrap',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  senderLabelUser: {
    left: '-40px',
  },
  senderLabelAi: {
    right: '-30px',
  },

  // MessageContent styles
  messageContent: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'),
  },
  messageImage: {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '4px',
    objectFit: 'contain',
  },
  messageAudio: {
    maxWidth: '100%',
  },

  // MessageTimestamp styles
  timestampTooltip: {
    position: 'absolute',
    bottom: '-23px',
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
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

  // MessageTokenInfo styles
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
  },

  // MessageError styles
  messageWithErrorContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...shorthands.gap('10px'),
    width: '100%',
    justifyContent: 'flex-end',
  },
  messageWithErrorContainerAi: {
    justifyContent: 'flex-start',
  },
  errorIndicatorLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    ...shorthands.gap('6px'),
    color: '#FF5555',
    backgroundColor: 'transparent',
    padding: '4px 8px',
    fontSize: '12px',
    maxWidth: '300px',
  },
  errorIndicatorRight: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    ...shorthands.gap('6px'),
    color: '#FF5555',
    backgroundColor: 'transparent',
    padding: '4px 8px',
    fontSize: '12px',
    maxWidth: '300px',
  },

  // LoadingMessage styles
  loadingMessage: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  // RetryingMessage styles
  retryingMessage: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  }
});