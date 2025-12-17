import React, { createContext, useContext, useState, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return context;
};

const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('dark');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
              primary: {
                main: '#1976d2',
              },
              secondary: {
                main: '#dc004e',
              },
              background: {
                default: '#ffffff',
                paper: '#f5f5f5',
              },
              text: {
                primary: '#000000',
                secondary: '#666666',
              },
            }
            : {
              primary: {
                main: '#64b5f6',
              },
              secondary: {
                main: '#f48fb1',
              },
              background: {
                default: '#0a1929',
                paper: '#001e3c',
              },
              text: {
                primary: '#ffffff',
                secondary: '#b0bec5',
              },
            }),
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'light' ? '#ffffff' : '#001e3c',
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderColor: mode === 'light' ? '#e0e0e0' : '#1e3a5f',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === 'light' ? '#f5f5f5' : '#001e3c',
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export { ThemeProvider, useThemeMode };
