import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Animated,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

export const AppButton = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent'
  size = 'large', // 'small' | 'medium' | 'large'
  icon,
  iconRight,
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const { colors: themeColors, isDarkMode } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 35,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 6,
    }).start();
  };

  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return [
          styles.secondary,
          isDarkMode && {
            backgroundColor: themeColors.surfaceContainerHigh,
            borderColor: themeColors.border,
            borderWidth: 1,
          },
        ];
      case 'outline':
        return [
          styles.outline,
          isDarkMode && {
            borderColor: themeColors.primary,
          },
        ];
      case 'ghost':
        return styles.ghost;
      case 'danger':
        return styles.danger;
      case 'accent':
        return [
          styles.accent,
          isDarkMode && {
            backgroundColor: themeColors.primary,
          },
        ];
      case 'primary':
      default:
        return [
          styles.primary,
          isDarkMode && {
            backgroundColor: themeColors.primary,
            shadowColor: '#00E676',
            shadowOpacity: 0.25,
          },
        ];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return [
          styles.outlineText,
          isDarkMode && { color: themeColors.primary },
        ];
      case 'secondary':
        return [
          styles.secondaryText,
          isDarkMode && { color: themeColors.textPrimary },
        ];
      case 'accent':
        return [
          styles.accentText,
          isDarkMode && { color: '#000000' },
        ];
      case 'danger':
        return styles.primaryText;
      case 'primary':
      default:
        return [
          styles.primaryText,
          { color: isDarkMode ? '#000000' : '#FFFFFF' },
        ];
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.sizeSmall;
      case 'medium':
        return styles.sizeMedium;
      case 'large':
      default:
        return styles.sizeLarge;
    }
  };

  const renderIcon = (iconName, isRight = false) => {
    if (!iconName) return null;
    const iconSize = size === 'small' ? 16 : 18;
    const iconColor = getTextStyle().color;
    const iconStyle = isRight ? styles.iconRight : styles.iconLeft;

    // Smart icon family selection based on glyphMap
    const inMaterial = Boolean(MaterialIcons?.glyphMap && (iconName in MaterialIcons.glyphMap));
    const inCommunity = Boolean(MaterialCommunityIcons?.glyphMap && (iconName in MaterialCommunityIcons.glyphMap));

    if (!inMaterial && inCommunity) {
      return (
        <MaterialCommunityIcons
          name={iconName}
          size={iconSize}
          color={iconColor}
          style={iconStyle}
        />
      );
    }

    return (
      <MaterialIcons
        name={iconName}
        size={iconSize}
        color={iconColor}
        style={iconStyle}
      />
    );
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.base,
          getSizeStyle(),
          getContainerStyle(),
          disabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.88}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.onPrimary}
          />
        ) : (
          <View style={styles.contentRow}>
            {icon ? renderIcon(icon, false) : null}
            <Text style={[getTextStyle(), textStyle]}>{title}</Text>
            {iconRight ? renderIcon(iconRight, true) : null}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeLarge: {
    height: 52,
    paddingHorizontal: 20,
  },
  sizeMedium: {
    height: 44,
    paddingHorizontal: 16,
  },
  sizeSmall: {
    height: 34,
    paddingHorizontal: 12,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceContainer,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.error,
  },
  accent: {
    backgroundColor: colors.tertiaryFixedDim,
  },
  primaryText: {
    ...typography.labelLg,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryText: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  outlineText: {
    ...typography.labelMd,
    color: colors.primary,
  },
  accentText: {
    ...typography.labelMd,
    color: colors.onTertiaryFixedVariant,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
  iconLeft: {
    marginRight: 6,
  },
  iconRight: {
    marginLeft: 6,
  },
});

export default AppButton;
