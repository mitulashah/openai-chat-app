/**
 * Theme styles and utilities
 */
import { tokens } from '@fluentui/react-components';
import { makeStyles } from '@fluentui/react-components';

// Theme preview swatches
export const useThemeStyles = makeStyles({
  themeSwatch: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  lightDraculaSwatch: {
    background: 'linear-gradient(135deg, #f8f8f2 50%, #bd93f9 50%)',
  },
  darkDraculaSwatch: {
    background: 'linear-gradient(135deg, #282a36 50%, #bd93f9 50%)',
  },
  lightNordSwatch: {
    background: 'linear-gradient(135deg, #ECEFF4 50%, #88C0D0 50%)',
  },
  darkNordSwatch: {
    background: 'linear-gradient(135deg, #2E3440 50%, #88C0D0 50%)',
  },
});

// Theme transition styles
export const useThemeTransitionStyles = makeStyles({
  themeTransition: {
    transitionProperty: 'background-color, background, color, border-color, box-shadow, fill, stroke',
    transitionDuration: '300ms',
    transitionTimingFunction: 'ease',
  }
});