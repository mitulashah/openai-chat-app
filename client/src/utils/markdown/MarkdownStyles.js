import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useMarkdownStyles = makeStyles({
  markdown: {
    '& p': {
      margin: '0 0 12px 0',
      whiteSpace: 'pre-wrap',
    },
    '& p:last-child': {
      marginBottom: 0,
    },
    '& pre': {
      padding: '10px',
      overflowX: 'auto',
      whiteSpace: 'pre',
      margin: '0',
      position: 'relative',
      backgroundColor: 'transparent',
    },
    '& a': {
      color: tokens.colorBrandForeground1,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    '& img': {
      maxWidth: '100%',
      margin: '8px 0',
    },
    '& table': {
      borderCollapse: 'collapse',
      width: '100%',
      margin: '10px 0',
    },
    '& th, & td': {
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      padding: '8px',
      textAlign: 'left',
    },
    '& blockquote': {
      borderLeft: `4px solid ${tokens.colorBrandStroke1}`,
      margin: '10px 0',
      paddingLeft: '12px',
      color: tokens.colorNeutralForeground2,
    },
    '& ul, & ol': {
      paddingLeft: '24px',
      marginTop: '8px',
      marginBottom: '8px',
      boxSizing: 'border-box',
      width: '100%',
    },
    '& li': {
      marginBottom: '6px',
      paddingLeft: '4px',
      overflowWrap: 'break-word',
      wordWrap: 'break-word',
    },
    '& li:last-child': {
      marginBottom: '2px',
    },
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    width: '100%',
    '& > *:not(:last-child)': {
      marginBottom: '8px',
    },
  },
  
  // CodeBlockWrapper styles
  codeBlockWrapper: {
    position: 'relative',
    backgroundColor: '#2d3250', // Bluish-tinted Dracula background color
    borderRadius: '4px',
    margin: '8px 0',
    overflow: 'hidden', // Ensure content doesn't overflow the border radius
  },
  codeBlockContainer: {
    position: 'relative',
    '&:hover': {
      '& > button': {
        opacity: 1,
      }
    }
  },
});