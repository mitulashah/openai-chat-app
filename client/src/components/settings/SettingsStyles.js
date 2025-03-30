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
  settingLabel: {
    fontWeight: '600',
    color: tokens.colorNeutralForeground1,
    marginBottom: '4px',
    fontSize: '14px',
  },
  settingDescription: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    marginBottom: '8px',
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
  }
});