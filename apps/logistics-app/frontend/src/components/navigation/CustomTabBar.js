import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, shadows } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

const TabItem = ({
  route,
  isFocused,
  label,
  iconName,
  onPress,
  onLongPress,
  themeColors,
  isDarkMode,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const iconBounce = useRef(new Animated.Value(isFocused ? 1 : 0.95)).current;

  useEffect(() => {
    if (isFocused) {
      Animated.sequence([
        Animated.timing(iconBounce, {
          toValue: 1.18,
          duration: 110,
          useNativeDriver: true,
        }),
        Animated.spring(iconBounce, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 9,
        }),
      ]).start();
    }
  }, [isFocused]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 35,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 22,
      bounciness: 7,
    }).start();
  };

  const activeColor = themeColors.primary;
  const inactiveColor = isDarkMode ? '#64748B' : colors.onSurfaceVariant;

  return (
    <Animated.View style={[styles.tabItem, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.92}
        style={styles.tabTouchArea}
      >
        <Animated.View
          style={[
            styles.iconWrapper,
            isFocused && (isDarkMode ? styles.iconWrapperActiveDark : styles.iconWrapperActive),
            { transform: [{ scale: iconBounce }] },
          ]}
        >
          <MaterialIcons
            name={iconName}
            size={23}
            color={isFocused ? activeColor : inactiveColor}
          />
        </Animated.View>
        <Text
          style={[
            styles.tabLabel,
            { color: isFocused ? activeColor : inactiveColor, fontWeight: isFocused ? '800' : '500' },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors: themeColors, isDarkMode } = useTheme();

  const getIconName = (routeName) => {
    switch (routeName) {
      case 'Home':
        return 'home';
      case 'Deliveries':
        return 'local-shipping';
      case 'Earnings':
        return 'account-balance-wallet';
      case 'Ranking':
        return 'leaderboard';
      case 'Profile':
        return 'person';
      default:
        return 'circle';
    }
  };

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: themeColors.surface,
          borderTopColor: isDarkMode ? themeColors.border : themeColors.outlineVariant,
        },
      ]}
    >
      <View style={styles.tabBarContent}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              route={route}
              isFocused={isFocused}
              label={label}
              iconName={getIconName(route.name)}
              onPress={onPress}
              onLongPress={onLongPress}
              themeColors={themeColors}
              isDarkMode={isDarkMode}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    ...shadows.md,
  },
  tabBarContent: {
    flexDirection: 'row',
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTouchArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    width: '100%',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    minWidth: 44,
    minHeight: 30,
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(0, 103, 56, 0.12)',
  },
  iconWrapperActiveDark: {
    backgroundColor: 'rgba(0, 230, 118, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.35)',
  },
  tabLabel: {
    ...typography.labelSm,
    fontSize: 10,
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: colors.onSurfaceVariant,
    fontWeight: '500',
  },
});

export default CustomTabBar;

