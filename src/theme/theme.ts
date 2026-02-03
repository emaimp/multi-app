import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
    },
    background: {
      default: '#ffffff',
      paper: '#fcfcfc',
    },
  },
  cssVariables: {
    colorSchemeSelector: 'class',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#60a5fa',
    },
    background: {
      default: '#000000',
      paper: '#141414',
    },
  },
  cssVariables: {
    colorSchemeSelector: 'class',
  },
});

export { lightTheme, darkTheme };
