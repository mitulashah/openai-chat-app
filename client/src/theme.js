import { webLightTheme, webDarkTheme } from '@fluentui/react-components';

/**
 * Dracula theme color palette
 * These colors are based on the Dracula theme, a popular dark theme for code editors
 */
const draculaColors = {
  background: '#282A36',  // Main background color
  current: '#44475A',     // Current line/selection background
  foreground: '#F8F8F2',  // Main text color
  comment: '#6272A4',     // Comment text color
  cyan: '#8BE9FD',        // Cyan accent color
  green: '#50FA7B',       // Green accent color
  orange: '#FFB86C',      // Orange accent color
  pink: '#FF79C6',        // Pink accent color
  purple: '#BD93F9',      // Purple accent color (primary)
  red: '#FF5555',         // Red accent color
  yellow: '#F1FA8C',      // Yellow accent color
};

/**
 * Light Dracula theme
 * A light variant of the Dracula theme that maintains the color scheme
 * but with a light background for better readability in bright environments
 */
const lightDraculaTheme = {
  ...webLightTheme,
  // Background colors
  colorNeutralBackground1: '#F8F8F2', // Main background (Dracula foreground)
  colorNeutralBackground2: '#F1F1F1', // Secondary background
  colorNeutralBackground3: '#E8E8E8', // Tertiary background

  // Text colors
  colorNeutralForeground1: '#282A36', // Primary text (Dracula background)
  colorNeutralForeground2: '#6272A4', // Secondary text (Dracula comment)

  // Brand colors
  colorBrandBackground: '#BD93F9',    // Primary brand color (Dracula purple)
  colorBrandForeground1: '#F8F8F2',   // Brand text color (Dracula foreground)

  // Border colors
  colorNeutralStroke1: '#E8E8E8',     // Primary border
  colorNeutralStroke2: '#E8E8E8',     // Secondary border
  colorNeutralStroke3: '#E8E8E8',     // Tertiary border

  // Focus states
  colorNeutralStrokeAccessible: '#BD93F9', // Accessible focus indicator
  colorNeutralStrokeFocus1: '#BD93F9',     // Primary focus indicator
};

/**
 * Dark Dracula theme
 * The original Dracula theme with dark background
 * Provides a classic dark mode experience
 */
const darkDraculaTheme = {
  ...webDarkTheme,
  // Background colors
  colorNeutralBackground1: draculaColors.background, // Main background
  colorNeutralBackground2: draculaColors.current,    // Secondary background
  colorNeutralBackground3: draculaColors.current,    // Tertiary background

  // Text colors
  colorNeutralForeground1: draculaColors.foreground, // Primary text
  colorNeutralForeground2: draculaColors.comment,    // Secondary text

  // Brand colors
  colorBrandBackground: draculaColors.purple,        // Primary brand color
  colorBrandForeground1: draculaColors.foreground,   // Brand text color

  // Border colors
  colorNeutralStroke1: draculaColors.current,        // Primary border
  colorNeutralStroke2: draculaColors.current,        // Secondary border
  colorNeutralStroke3: draculaColors.current,        // Tertiary border

  // Focus states
  colorNeutralStrokeAccessible: draculaColors.purple, // Accessible focus indicator
  colorNeutralStrokeFocus1: draculaColors.purple,     // Primary focus indicator
};

/**
 * Export theme configurations
 * Provides both light and dark variants of the Dracula theme
 */
export const themes = {
  light: lightDraculaTheme,
  dark: darkDraculaTheme,
}; 