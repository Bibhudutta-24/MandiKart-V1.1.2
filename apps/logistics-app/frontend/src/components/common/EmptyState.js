import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography } from '../../theme';
import AppButton from './AppButton';

export const EmptyState = ({
  icon = 'inbox',
  title = 'No items found',
  description = 'There are no active entries available right now.',
  actionTitle,
  onActionPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialIcons name={icon} size={36} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionTitle && onActionPress ? (
        <AppButton
          title={actionTitle}
          onPress={onActionPress}
          variant="outline"
          size="medium"
          style={styles.button}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginVertical: 16,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 81, 41, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 260,
  },
  button: {
    marginTop: 18,
    minWidth: 160,
  },
});

export default EmptyState;
