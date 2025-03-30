import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useLayoutStyles = makeStyles({
  // Header styles
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
  },

  // Footer styles
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
    position: 'relative',
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
  },
  menuButton: {
    position: 'relative',
  },

  // ChatMessages styles
  chatWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflow: 'auto',
    padding: '12px',
    ...shorthands.gap('6px'),
  },
  messagesContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    ...shorthands.gap('2px'),
    paddingBottom: '10px',
  },
  
  // ChatActionBar styles
  actionBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '8px 20px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.gap('12px'),
    flexShrink: 0,
  },
  exportMenuIcon: {
    marginRight: '8px',
  },
  
  // ChatSkeleton styles
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
  
  // EmptyMessage styles
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