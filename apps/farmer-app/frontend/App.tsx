import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuthStore } from './src/store/authStore';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <View style={styles.container}>
      {isAuthenticated ? <HomeScreen /> : <LoginScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
