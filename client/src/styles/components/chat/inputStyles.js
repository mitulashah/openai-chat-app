/**
 * Input styles for chat components
 */
import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useInputStyles = makeStyles({
  // MessageInput styles
  inputContainer: {
    display: 'flex',
    padding: '20px',
    ...shorthands.gap('10px'),
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    alignItems: 'center',
  },
  input: {
    flexGrow: 1,
  },
  imageButtonActive: {
    backgroundColor: tokens.colorBrandBackgroundHover,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  voiceButtonActive: {
    backgroundColor: tokens.colorStatusDangerBackground1,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  recordingActive: {
    animation: {
      '0%': {
        backgroundColor: tokens.colorStatusDangerBackground1,
      },
      '50%': {
        backgroundColor: tokens.colorStatusDangerBackground2,
      },
      '100%': {
        backgroundColor: tokens.colorStatusDangerBackground1,
      }
    },
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
    color: tokens.colorNeutralForegroundOnBrand,
  }
});