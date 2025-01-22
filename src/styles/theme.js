import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4285f4',
    },
    secondary: {
      main: '#ff6f61',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Comic Sans MS"',
      'sans-serif',
    ].join(','),
  },
});

export default theme; 