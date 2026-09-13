import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

export const AppCard = ({
  children,
  style,
  onPress,
  variant = 'lowest', // 'lowest' | 'low' | 'container' | 'high' | 'primary'
  bordered = true,
}) => {
  const { colors: themeColors, isDarkMode } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'low':
        return themeColors.surfaceContainerLow;
      case 'container':
        return themeColors.surfaceContainer;
      case 'high':
        return themeColors.surfaceContainerHigh;
      case 'primary':
        return themeColors.primaryContainer;
      case 'lowest':
      default:
        return themeColors.card;
    }
  };

  const cardStyle = [
    styles.card,
    {
      backgroundColor: getBackgroundColor(),
      borderColor: isDarkMode ? themeColors.border : themeColors.borderLight,
    },
    bordered && { borderWidth: 1 },
    shadows.sm,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: 16,
  },
});

export default AppCard;
