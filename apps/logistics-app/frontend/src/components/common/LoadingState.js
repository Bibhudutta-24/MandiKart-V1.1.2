import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography } from '../../theme';

export const LoadingState = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  text: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginTop: 12,
  },
});

export default LoadingState;
