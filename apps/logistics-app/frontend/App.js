import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { DeliveryProvider } from './src/context/DeliveryContext';
import { AppNavigator } from './src/navigation/AppNavigator';

const AppContent = () => {
  const { isDarkMode, colors } = useTheme();

  const navigationTheme = isDarkMode
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          primary: colors.primary,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          primary: colors.primary,
        },
      };

  return (
    <>
      <StatusBar
        style="light"
        backgroundColor={isDarkMode ? '#000000' : '#005129'}
      />
      <NavigationContainer theme={navigationTheme}>
        <AppNavigator />
      </NavigationContainer>
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <DeliveryProvider>
            <AppContent />
          </DeliveryProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
