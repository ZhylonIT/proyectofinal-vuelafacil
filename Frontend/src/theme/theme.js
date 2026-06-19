import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#D4CDC5',
      contrastText: '#191013',
    },
    secondary: {
      main: '#5B88A5',
      contrastText: '#F4F4F2',
    },
    background: {
      default: '#F4F4F2',
      paper: '#D4CDC5',
    },
    text: {
      primary: '#191013',
      secondary: '#5B88A5',
    },
    accent: {
      main: '#243A69',
      contrastText: '#F4F4F2',
    },
  },
  typography: {
    fontFamily: '"Josefin Sans", "Poppins", "Montserrat", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: '#191013',
    },
    h2: {
      fontWeight: 600,
      color: '#191013',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default theme;