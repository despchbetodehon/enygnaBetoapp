import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ThemeProvider, createGlobalStyle, DefaultTheme } from 'styled-components';
import { AutenticacaoProvider } from '@/data/contexts/AutenticacaoContext';
import { MantineProvider } from '@mantine/core';
import { ThemeProvider as MuiThemeProvider, makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import muiTheme from '@/theme';
import type { AppProps } from 'next/app';
import { AUTHORSHIP, SIGNATURE } from '@/metadata/authorship';
import { __METADATA__ as HIDDEN_SIG, verify } from '@/metadata/signature';

import MenuTopBeto from '@/components/home/home';

import '@/styles/globals.css';

// Dynamic imports
const ChatBot = dynamic(() => import('../components/chat/ChatBot'), {
  ssr: false,
  loading: () => null
});

const Particles = dynamic(() => import('@/components/landing/particles'), {
  ssr: false,
  loading: () => null
});

const ChatFlutuante = dynamic(() => import('../components/chat/ChatFlutuante'), {
  ssr: false,
  loading: () => null
});

// Temas
const lightTheme: DefaultTheme = {
  backgroundColor: '#f4f6fa',
  textColor: '#222',
};

const darkTheme: DefaultTheme = {
  backgroundColor: '#15161a',
  textColor: '#fafafa',
};

// Estilo global corrigido
const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    background-color: ${(props: any) => props.theme.backgroundColor};
    color: ${(props: any) => props.theme.textColor};
    font-family: 'Montserrat', 'Poppins', 'Segoe UI', 'Roboto', Arial, sans-serif;
    transition: background-color 0.3s, color 0.3s;
    min-height: 100vh;
    width: 100%;
    overflow-x: hidden;
  }

  #__next {
    min-height: 100vh;
    width: 100%;
  }

  img, video, iframe, embed, object {
    max-width: 100% !important;
    height: auto !important;
  }
`;

// Estilos com makeStyles
const useStyles = makeStyles(() => ({
  mainWrapper: {
    minHeight: '100vh',
    paddingBottom: '30px',
    overflowX: 'hidden',
    backgroundColor: 'inherit',
  },
}));

function App({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const classes = useStyles();

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Registrar autoria do sistema
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Verificar integridade
      const isValid = verify();
      if (!isValid) {
        console.warn('⚠️ Assinatura digital inválida');
      }

      // Logs de desenvolvimento
      console.log('​', AUTHORSHIP);
      console.log('​‌‍', HIDDEN_SIG);

      // Marcar no objeto window (não aparece em Object.keys())
      Object.defineProperty(window, '__AUTHORSHIP__', {
        value: AUTHORERSHIP,
        writable: false,
        enumerable: false,
        configurable: false
      });

      Object.defineProperty(window, '__HIDDEN_SIGNATURE__', {
        value: HIDDEN_SIG,
        writable: false,
        enumerable: false,
        configurable: false
      });

      // Proteção adicional
      Object.freeze(AUTHORSHIP);
      Object.freeze(HIDDEN_SIG);
    }
  }, []);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
        <GlobalStyles />
        <MantineProvider withGlobalStyles withNormalizeCSS>
          <AutenticacaoProvider>

            <MenuTopBeto />

            <div className={classes.mainWrapper}>
              <Component {...pageProps} />
            </div>

            <ChatFlutuante />

          </AutenticacaoProvider>
        </MantineProvider>
      </ThemeProvider>
    </MuiThemeProvider>
  );
}

export default App;