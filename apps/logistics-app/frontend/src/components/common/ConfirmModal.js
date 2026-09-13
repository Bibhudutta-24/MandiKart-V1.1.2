import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, borderRadius } from '../../theme';
import AppButton from './AppButton';

export const ConfirmModal = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon = 'help-outline',
  isDestructive = false,
  loading = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isDestructive
                  ? colors.errorContainer
                  : 'rgba(0, 81, 41, 0.1)',
              },
            ]}
          >
            <MaterialIcons
              name={icon}
              size={32}
              color={isDestructive ? colors.error : colors.primary}
            />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>

            <AppButton
              title={confirmText}
              onPress={onConfirm}
              variant={isDestructive ? 'danger' : 'primary'}
              size="medium"
              loading={loading}
              style={styles.confirmButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(19, 30, 23, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.xl,
    padding: 24,
    alignItems: 'center',
    elevation: 6,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceContainerHigh,
  },
  cancelText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  confirmButton: {
    flex: 1,
  },
});

export default ConfirmModal;
