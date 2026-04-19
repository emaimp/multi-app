import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#2563eb' },
        background: { default: '#ffffff', paper: '#fcfcfc' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#60a5fa' },
        background: { default: '#000000', paper: '#141414' },
      },
    },
  },
  cssVariables: {
    colorSchemeSelector: 'class',
  },
});
