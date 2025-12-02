import { createTheme } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';

// Tema corporativo luxuoso e profissional
const theme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#2d5a3d', // Verde escuro principal
      light: '#4a7c59',
      dark: '#1a4d3a',
      contrastText: '#fff',
    },
    secondary: {
      main: '#5d8f6c', // Verde médio complementar
      light: '#7da688',
      dark: '#3e6b4a',
      contrastText: '#fff',
    },
    error: {
      main: '#dc3545',
    },
    background: {
      default: '#fafbfc', // Branco quase puro com leve tom acinzentado
      paper: '#ffffff',
    },
    text: {
      primary: '#000000', // Preto
      secondary: '#000000', // Preto
    },
    grey: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923',
    },
  },
  typography: {
    fontFamily: '"Playfair Display", "Crimson Text", "Libre Baskerville", "Georgia", serif',
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 800,
      fontSize: '3rem',
      lineHeight: 1.25,
      letterSpacing: '-0.02em',
      color: '#000000',
      textShadow: '0 2px 4px rgba(26, 54, 93, 0.1)',
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.3,
      letterSpacing: '-0.015em',
      color: '#000000',
    },
    h3: {
      fontFamily: '"Crimson Text", serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.35,
      letterSpacing: '-0.01em',
      color: '#000000',
    },
    h4: {
      fontFamily: '"Libre Baskerville", serif',
      fontWeight: 600,
      fontSize: '1.375rem',
      lineHeight: 1.4,
      letterSpacing: '-0.005em',
      color: '#000000',
    },
    h5: {
      fontFamily: '"Cormorant Garamond", serif',
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.45,
      color: '#000000',
    },
    h6: {
      fontFamily: '"Cormorant Garamond", serif',
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#000000',
    },
    body1: {
      fontFamily: '"Libre Baskerville", "Crimson Text", "Georgia", serif',
      fontSize: '1.05rem',
      lineHeight: 1.75,
      color: '#000000',
      fontWeight: 400,
      letterSpacing: '0.01em',
    },
    body2: {
      fontFamily: '"Crimson Text", "Georgia", serif',
      fontSize: '0.925rem',
      lineHeight: 1.6,
      color: '#000000',
      fontWeight: 400,
      letterSpacing: '0.005em',
    },
    button: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
      fontSize: '0.925rem',
      textTransform: 'none',
      letterSpacing: '0.05em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  ],
  overrides: {
    MuiButton: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 500,
        padding: '10px 24px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-1px)',
        },
      },
      contained: {
        backgroundColor: '#1a365d',
        color: '#ffffff',
        '&:hover': {
          backgroundColor: '#0d1b2a',
        },
      },
      outlined: {
        borderColor: '#1a365d',
        color: '#1a365d',
        '&:hover': {
          backgroundColor: 'rgba(26, 54, 93, 0.04)',
        },
      },
    },
    MuiPaper: {
      root: {
        backgroundColor: '#ffffff',
      },
      rounded: {
        borderRadius: 12,
      },
      elevation1: {
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
      elevation2: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      elevation3: {
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
    MuiCard: {
      root: {
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        '&:hover': {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.2s ease-in-out',
      },
    },
    MuiTextField: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
          '& fieldset': {
            borderColor: '#e2e8f0',
          },
          '&:hover fieldset': {
            borderColor: '#1a365d',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#1a365d',
            borderWidth: 2,
          },
        },
      },
    },
  },
});

export default theme;