import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#2563eb' },
        background: { default: '#ffffff', paper: '#fafbfd' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#60a5fa' },
        background: { default: '#000000', paper: '#0c0c15' },
      },
    },
  },
  cssVariables: {
    colorSchemeSelector: 'class',
  },
});
