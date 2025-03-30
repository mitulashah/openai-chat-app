import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useMediaStyles = makeStyles({
  // AudioPlayer styles
  audioContainer: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
    padding: '8px',
    backgroundColor: tokens.colorNeutralBackground4,
    borderRadius: '4px',
    marginTop: '4px',
  },
  audioControls: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
  audioProgress: {
    flexGrow: 1,
    height: '4px',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: '2px',
    position: 'relative',
    cursor: 'pointer',
  },
  audioProgressFill: {
    height: '100%',
    backgroundColor: tokens.colorBrandBackground,
    borderRadius: '2px',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  audioTime: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
    whiteSpace: 'nowrap',
  },
  audioError: {
    color: tokens.colorStatusDangerForeground1,
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('4px'),
    fontSize: '12px',
  },
});