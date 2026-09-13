import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

export const AppInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  rightIcon,
  onRightIconPress,
  isPassword = false,
  error,
  keyboardType = 'default',
  maxLength,
  multiline = false,
  numberOfLines = 1,
  editable = true,
  prefix,
  containerStyle,
  inputStyle,
}) => {
  const { colors: themeColors, isDarkMode } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Text style={[styles.label, isDarkMode && { color: themeColors.textSecondary }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          isDarkMode && {
            backgroundColor: themeColors.surfaceContainerHigh,
            borderColor: themeColors.border,
          },
          isFocused && [
            styles.inputFocused,
            isDarkMode && {
              borderColor: themeColors.primary,
              backgroundColor: themeColors.surfaceContainerHigh,
            },
          ],
          Boolean(error) && styles.inputError,
          multiline && { minHeight: numberOfLines * 24 + 24, alignItems: 'flex-start' },
        ]}
      >
        {prefix ? (
          <View style={styles.prefixContainer}>
            <Text style={[styles.prefixText, isDarkMode && { color: themeColors.textSecondary }]}>
              {prefix}
            </Text>
          </View>
        ) : icon ? (
          <MaterialIcons
            name={icon}
            size={20}
            color={isFocused ? themeColors.primary : (isDarkMode ? themeColors.textSecondary : colors.outline)}
            style={styles.iconLeft}
          />
        ) : null}

        <TextInput
          style={[
            styles.input,
            isDarkMode && { color: themeColors.textPrimary },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDarkMode ? '#6B9E83' : 'rgba(111, 122, 112, 0.7)'}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {isPassword ? (
          <TouchableOpacity
            style={styles.rightButton}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={20}
              color={colors.outline}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            style={styles.rightButton}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            activeOpacity={0.7}
          >
            <MaterialIcons name={rightIcon} size={20} color={colors.outline} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginBottom: 6,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.md,
    borderWidth: 1.2,
    borderColor: colors.outlineVariant,
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceContainerLowest,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
    paddingVertical: 12,
  },
  iconLeft: {
    marginRight: 10,
  },
  rightButton: {
    padding: 4,
  },
  prefixContainer: {
    paddingRight: 10,
    marginRight: 8,
    borderRightWidth: 1,
    borderRightColor: colors.outlineVariant,
  },
  prefixText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  errorText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default AppInput;
