import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Import languages
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import html from 'react-syntax-highlighter/dist/esm/languages/prism/markup';

// Group related languages to avoid duplication
const languageMappings = {
  javascript: {
    implementation: javascript,
    aliases: ['js']
  },
  typescript: {
    implementation: typescript,
    aliases: ['ts']
  },
  jsx: {
    implementation: jsx,
    aliases: []
  },
  json: {
    implementation: json,
    aliases: []
  },
  python: {
    implementation: python,
    aliases: ['py']
  },
  bash: {
    implementation: bash,
    aliases: ['sh']
  },
  css: {
    implementation: css,
    aliases: []
  },
  html: {
    implementation: html,
    aliases: []
  }
};

// Register all languages and their aliases
Object.entries(languageMappings).forEach(([language, { implementation, aliases }]) => {
  SyntaxHighlighter.registerLanguage(language, implementation);
  aliases.forEach(alias => {
    SyntaxHighlighter.registerLanguage(alias, implementation);
  });
});

// Default styling options
const getDefaultStyle = (theme) => ({
  margin: 0, // Remove margin to avoid conflicts with wrapper
  borderRadius: 0, // Remove border radius as it's handled by the wrapper
  backgroundColor: 'transparent', // Make the highlighter background transparent
  color: theme?.codeForeground || '#F8F8F2', // Dracula foreground color
  fontSize: '0.75rem',
  paddingRight: '35px', // Make room for the copy button
});

export { SyntaxHighlighter, dracula, getDefaultStyle };