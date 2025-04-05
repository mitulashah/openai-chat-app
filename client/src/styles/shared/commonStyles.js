/**
 * Common shared styles used across multiple components
 */
import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

// Common flex layouts
export const useFlexStyles = makeStyles({
  row: {
    display: 'flex',
    flexDirection: 'row',
    ...shorthands.gap('8px'),
    alignItems: 'center',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Common animation styles
export const useAnimationStyles = makeStyles({
  fadeIn: {
    animation: {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 }
    },
    animationDuration: '0.3s',
    animationTimingFunction: 'ease-in',
  },
  pulse: {
    animation: {
      '0%': { opacity: 0.6 },
      '50%': { opacity: 0.3 },
      '100%': { opacity: 0.6 }
    },
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
  },
});

// Status indicator styles
export const useStatusStyles = makeStyles({
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  success: {
    backgroundColor: tokens.colorPaletteGreenForeground1,
  },
  error: {
    backgroundColor: tokens.colorPaletteRedForeground1,
  },
  warning: {
    backgroundColor: tokens.colorPaletteYellowForeground1,
  },
  info: {
    backgroundColor: tokens.colorPaletteBlueForeground1,
  },
});