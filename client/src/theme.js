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
 * Nord theme color palette
 * These colors are based on the Nord theme, a popular arctic/bluish theme for interfaces
 */
const nordColors = {
  polarNight: {
    nord0: '#2E3440',  // Dark background
    nord1: '#3B4252',  // Light background
    nord2: '#434C5E',  // Selection background
    nord3: '#4C566A',  // Comments, invisibles
  },
  snowStorm: {
    nord4: '#D8DEE9',  // Content text
    nord5: '#E5E9F0',  // Content text secondary
    nord6: '#ECEFF4',  // Content text bright
  },
  frost: {
    nord7: '#8FBCBB',  // Primary accent
    nord8: '#88C0D0',  // Secondary accent
    nord9: '#81A1C1',  // Tertiary accent
    nord10: '#5E81AC', // Primary blue 
  },
  aurora: {
    nord11: '#BF616A', // Red
    nord12: '#D08770', // Orange
    nord13: '#EBCB8B', // Yellow
    nord14: '#A3BE8C', // Green
    nord15: '#B48EAD', // Purple
  }
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

  // Brand colors (primary buttons)
  colorBrandBackground: '#BD93F9',    // Primary brand color (Dracula purple)
  colorBrandForeground1: '#F8F8F2',   // Brand text color (Dracula foreground)
  
  // Brand button states
  colorBrandBackgroundHover: '#FF79C6',       // Primary button hover (Dracula pink)
  colorBrandBackgroundPressed: '#FF79C6',     // Primary button pressed
  
  // Secondary button states (used for other buttons like Upload Image)
  colorNeutralBackgroundHover: '#FFB86C',     // Secondary button hover (Dracula orange)
  colorNeutralBackgroundPressed: '#FFB86C',   // Secondary button pressed
  
  // Subtle button states (used for menu buttons)
  colorSubtleBackgroundHover: '#8BE9FD',      // Subtle button hover (Dracula cyan)
  colorSubtleBackgroundPressed: '#8BE9FD',    // Subtle button pressed
  
  // Menu button/item states
  colorNeutralForeground2Hover: '#FF79C6',    // Menu item hover text (Dracula pink)
  colorNeutralForeground2Pressed: '#FF79C6',  // Menu item pressed text

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

  // Brand colors (primary buttons)
  colorBrandBackground: draculaColors.purple,        // Primary brand color
  colorBrandForeground1: draculaColors.foreground,   // Brand text color
  
  // Brand button states
  colorBrandBackgroundHover: draculaColors.pink,     // Primary button hover
  colorBrandBackgroundPressed: draculaColors.pink,   // Primary button pressed
  
  // Secondary button states (used for other buttons like Upload Image)
  colorNeutralBackgroundHover: draculaColors.orange, // Secondary button hover
  colorNeutralBackgroundPressed: draculaColors.orange, // Secondary button pressed
  
  // Subtle button states (used for menu buttons)
  colorSubtleBackgroundHover: draculaColors.cyan,    // Subtle button hover
  colorSubtleBackgroundPressed: draculaColors.cyan,  // Subtle button pressed
  
  // Menu button/item states
  colorNeutralForeground2Hover: draculaColors.pink,  // Menu item hover text
  colorNeutralForeground2Pressed: draculaColors.pink, // Menu item pressed text

  // Border colors
  colorNeutralStroke1: draculaColors.current,        // Primary border
  colorNeutralStroke2: draculaColors.current,        // Secondary border
  colorNeutralStroke3: draculaColors.current,        // Tertiary border

  // Focus states
  colorNeutralStrokeAccessible: draculaColors.purple, // Accessible focus indicator
  colorNeutralStrokeFocus1: draculaColors.purple,     // Primary focus indicator
};

/**
 * Light Nord theme
 * A light variant based on the Nord color palette
 * with improved readability for bright environments
 */
const lightNordTheme = {
  ...webLightTheme,
  // Background colors
  colorNeutralBackground1: nordColors.snowStorm.nord6, // Main background
  colorNeutralBackground2: nordColors.snowStorm.nord5, // Secondary background
  colorNeutralBackground3: nordColors.snowStorm.nord4, // Tertiary background

  // Text colors
  colorNeutralForeground1: nordColors.polarNight.nord0, // Primary text
  colorNeutralForeground2: nordColors.polarNight.nord3, // Secondary text

  // Brand colors (primary buttons)
  colorBrandBackground: nordColors.frost.nord9,    // Primary brand color
  colorBrandForeground1: nordColors.snowStorm.nord6,   // Brand text color
  
  // Brand button states
  colorBrandBackgroundHover: nordColors.frost.nord8,       // Primary button hover
  colorBrandBackgroundPressed: nordColors.frost.nord7,     // Primary button pressed
  
  // Secondary button states (used for other buttons like Upload Image)
  colorNeutralBackgroundHover: nordColors.aurora.nord13,     // Secondary button hover
  colorNeutralBackgroundPressed: nordColors.aurora.nord13,   // Secondary button pressed
  
  // Subtle button states (used for menu buttons)
  colorSubtleBackgroundHover: nordColors.frost.nord8,      // Subtle button hover
  colorSubtleBackgroundPressed: nordColors.frost.nord7,    // Subtle button pressed
  
  // Menu button/item states
  colorNeutralForeground2Hover: nordColors.frost.nord10,    // Menu item hover text
  colorNeutralForeground2Pressed: nordColors.frost.nord10,  // Menu item pressed text

  // Border colors
  colorNeutralStroke1: nordColors.snowStorm.nord4,     // Primary border
  colorNeutralStroke2: nordColors.snowStorm.nord4,     // Secondary border
  colorNeutralStroke3: nordColors.snowStorm.nord4,     // Tertiary border

  // Focus states
  colorNeutralStrokeAccessible: nordColors.frost.nord9, // Accessible focus indicator
  colorNeutralStrokeFocus1: nordColors.frost.nord9,     // Primary focus indicator
};

/**
 * Dark Nord theme
 * The standard Nord theme with dark background
 * Provides a calm blue-based dark mode experience
 */
const darkNordTheme = {
  ...webDarkTheme,
  // Background colors
  colorNeutralBackground1: nordColors.polarNight.nord0, // Main background
  colorNeutralBackground2: nordColors.polarNight.nord1, // Secondary background
  colorNeutralBackground3: nordColors.polarNight.nord2, // Tertiary background

  // Text colors
  colorNeutralForeground1: nordColors.snowStorm.nord6, // Primary text
  colorNeutralForeground2: nordColors.snowStorm.nord4, // Secondary text

  // Brand colors (primary buttons)
  colorBrandBackground: nordColors.frost.nord9,        // Primary brand color
  colorBrandForeground1: nordColors.snowStorm.nord6,   // Brand text color
  
  // Brand button states
  colorBrandBackgroundHover: nordColors.frost.nord8,     // Primary button hover
  colorBrandBackgroundPressed: nordColors.frost.nord7,   // Primary button pressed
  
  // Secondary button states (used for other buttons like Upload Image)
  colorNeutralBackgroundHover: nordColors.aurora.nord13, // Secondary button hover
  colorNeutralBackgroundPressed: nordColors.aurora.nord13, // Secondary button pressed
  
  // Subtle button states (used for menu buttons)
  colorSubtleBackgroundHover: nordColors.frost.nord7,    // Subtle button hover
  colorSubtleBackgroundPressed: nordColors.frost.nord7,  // Subtle button pressed
  
  // Menu button/item states
  colorNeutralForeground2Hover: nordColors.frost.nord8,  // Menu item hover text
  colorNeutralForeground2Pressed: nordColors.frost.nord8, // Menu item pressed text

  // Border colors
  colorNeutralStroke1: nordColors.polarNight.nord2,        // Primary border
  colorNeutralStroke2: nordColors.polarNight.nord2,        // Secondary border
  colorNeutralStroke3: nordColors.polarNight.nord2,        // Tertiary border

  // Focus states
  colorNeutralStrokeAccessible: nordColors.frost.nord9, // Accessible focus indicator
  colorNeutralStrokeFocus1: nordColors.frost.nord9,     // Primary focus indicator
};

/**
 * Export theme configurations
 * Provides both light and dark variants of the Dracula and Nord themes
 */
export const themes = {
  light: lightDraculaTheme,
  dark: darkDraculaTheme,
  lightNord: lightNordTheme,
  darkNord: darkNordTheme
};