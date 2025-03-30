import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useSettingsStyles = makeStyles({
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'),
  },
  sliderGroup: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
  },
  valueDisplay: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
  labelContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    width: '100%',
  },
  settingLabel: {
    fontWeight: '600',
    color: tokens.colorNeutralForeground1,
    fontSize: '14px',
  },
  settingDescription: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    marginLeft: 'auto',
    textAlign: 'right',
    maxWidth: '50%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  settingContainer: {
    backgroundColor: tokens.colorNeutralBackground3,
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '12px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: tokens.colorBrandForeground1,
    marginBottom: '12px',
    marginTop: '8px',
  },
  warningActionButton: {
    backgroundColor: 'rgba(243, 242, 241, 0.1)',
    color: tokens.colorPaletteYellowForeground1,
    borderColor: tokens.colorPaletteYellowBorder1,
    '&:hover': {
      backgroundColor: 'rgba(243, 242, 241, 0.2)',
      color: tokens.colorPaletteYellowForeground1,
      borderColor: tokens.colorPaletteYellowBorder2,
    },
    '&:active': {
      backgroundColor: 'rgba(243, 242, 241, 0.3)',
      color: tokens.colorPaletteYellowForeground1,
      borderColor: tokens.colorPaletteYellowBorder2,
    }
  }
});