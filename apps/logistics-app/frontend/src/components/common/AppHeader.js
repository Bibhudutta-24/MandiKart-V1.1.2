import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, Animated } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES } from '../../navigation/routes';

export const AppHeader = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  onBackPress,
  showOnlineToggle = !showBack,
  showNotifications = !showBack,
  onNotificationsPress,
  showProfileAvatar = !showBack,
  onProfilePress,
  rightElement,
  rightAction,
  style,
}) => {
  const { isOnline, toggleOnline, partner } = useAuth();
  const { colors: themeColors, isDarkMode } = useTheme();
  
  const dutySwitchAnim = useRef(new Animated.Value(isOnline ? 1 : 0)).current;
  const dutyScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(dutySwitchAnim, {
      toValue: isOnline ? 1 : 0,
      useNativeDriver: true,
      speed: 28,
      bounciness: 6,
    }).start();
  }, [isOnline]);

  const thumbTranslateX = dutySwitchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 14],
  });

  const handleDutyPressIn = () => {
    Animated.spring(dutyScaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 35,
      bounciness: 4,
    }).start();
  };

  const handleDutyPressOut = () => {
    Animated.spring(dutyScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 24,
      bounciness: 7,
    }).start();
  };

  let navigation;
  try {
    navigation = useNavigation();
  } catch (e) {
    // In case header is mounted outside navigation container
  }

  const handleBack = () => {
    if (onBackPress) return onBackPress();
    if (onBack) return onBack();
    if (navigation && navigation.canGoBack()) navigation.goBack();
  };

  const handleNotifications = () => {
    if (onNotificationsPress) return onNotificationsPress();
    if (navigation) navigation.navigate(ROUTES.NOTIFICATIONS);
  };

  const handleProfile = () => {
    if (onProfilePress) return onProfilePress();
    if (navigation) navigation.navigate(ROUTES.MAIN_TABS, { screen: ROUTES.PROFILE });
  };

  // 1. Sub-screen Back Header Mode
  if (showBack) {
    return (
      <View
        style={[
          styles.container,
          styles.backHeaderContainer,
          {
            backgroundColor: themeColors.surface,
            borderBottomColor: themeColors.border,
          },
          style,
        ]}
      >
        <View style={styles.backRow}>
          <TouchableOpacity
            style={[
              styles.backIconButton,
              {
                backgroundColor: isDarkMode ? '#080C0A' : '#f1f5f9',
                borderColor: isDarkMode ? '#14261B' : '#e2e8f0',
              },
            ]}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="arrow-back" size={22} color={themeColors.onSurface} />
          </TouchableOpacity>

          <View style={styles.backTitleCol}>
            {title ? (
              <Text style={[styles.backTitle, { color: themeColors.onSurface }]} numberOfLines={1}>
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text style={[styles.backSubtitle, { color: themeColors.onSurfaceVariant }]} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          {/* Right Action / Balance */}
          <View style={styles.rightActionsRow}>
            {rightElement ? (
              rightElement
            ) : rightAction ? (
              <TouchableOpacity
                style={[
                  styles.actionIconButton,
                  { backgroundColor: isDarkMode ? '#063B22' : '#ecfdf5', borderColor: isDarkMode ? '#00E676' : '#a7f3d0' },
                ]}
                onPress={rightAction.onPress}
                activeOpacity={0.7}
              >
                {rightAction.icon ? (
                  rightAction.icon.includes('-') ? (
                    <MaterialCommunityIcons
                      name={rightAction.icon}
                      size={22}
                      color={themeColors.primary}
                    />
                  ) : (
                    <MaterialIcons
                      name={rightAction.icon}
                      size={22}
                      color={themeColors.primary}
                    />
                  )
                ) : null}
                {rightAction.label ? (
                  <Text style={[styles.actionLabelText, { color: themeColors.primary }]}>{rightAction.label}</Text>
                ) : null}
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholderBox} />
            )}
          </View>
        </View>
      </View>
    );
  }

  // 2. Main Dashboard & Tab Screen Header Mode
  return (
    <View
      style={[
        styles.container,
        styles.mainHeaderContainer,
        {
          backgroundColor: themeColors.surface,
          borderBottomColor: themeColors.border,
        },
        style,
      ]}
    >
      {/* Top Meta Bar: Brand Logo, Hub Tag & Quick Actions */}
      <View style={styles.topMetaRow}>
        <View style={styles.brandGroup}>
          <View style={[styles.logoBadge, { backgroundColor: themeColors.primary }]}>
            <MaterialIcons name="agriculture" size={19} color="#000000" />
          </View>
          <View style={styles.brandTextCol}>
            <View style={styles.brandNameRow}>
              <Text style={[styles.brandTitle, { color: themeColors.primary }]}>MandiKart</Text>
              <View style={[styles.partnerTag, { backgroundColor: themeColors.primary }]}>
                <Text style={[styles.partnerTagText, { color: isDarkMode ? '#000000' : '#ffffff' }]}>PARTNER</Text>
              </View>
            </View>
            <View style={styles.hubLocationRow}>
              <MaterialIcons name="location-on" size={11} color={themeColors.primary} />
              <Text style={[styles.hubLocationText, { color: themeColors.onSurfaceVariant }]} numberOfLines={1}>
                {partner?.hub || partner?.city || 'Bhubaneswar Main Mandi'}
              </Text>
            </View>
          </View>
        </View>

        {/* Right Utilities (Notifications + Profile Avatar + Custom) */}
        <View style={styles.rightUtilitiesRow}>
          {rightElement ? (
            rightElement
          ) : (
            <>
              {rightAction && (
                <TouchableOpacity
                  style={[
                    styles.utilityIconButton,
                    {
                      backgroundColor: isDarkMode ? '#080C0A' : '#f1f5f9',
                      borderColor: isDarkMode ? '#14261B' : '#e2e8f0',
                    },
                  ]}
                  onPress={rightAction.onPress}
                  activeOpacity={0.7}
                  accessibilityLabel={rightAction.label || 'Action'}
                >
                  {rightAction.icon ? (
                    rightAction.icon.includes('-') ? (
                      <MaterialCommunityIcons
                        name={rightAction.icon}
                        size={20}
                        color={themeColors.onSurface}
                      />
                    ) : (
                      <MaterialIcons
                        name={rightAction.icon}
                        size={20}
                        color={themeColors.onSurface}
                      />
                    )
                  ) : null}
                </TouchableOpacity>
              )}

              {showNotifications && (
                <TouchableOpacity
                  style={[
                    styles.utilityIconButton,
                    {
                      backgroundColor: isDarkMode ? '#080C0A' : '#f1f5f9',
                      borderColor: isDarkMode ? '#14261B' : '#e2e8f0',
                    },
                  ]}
                  onPress={handleNotifications}
                  activeOpacity={0.7}
                  accessibilityLabel="Notifications"
                >
                  <MaterialIcons name="notifications-none" size={22} color={themeColors.onSurface} />
                  <View style={styles.unreadDot} />
                </TouchableOpacity>
              )}

              {showProfileAvatar && (
                <TouchableOpacity
                  style={styles.avatarButton}
                  onPress={handleProfile}
                  activeOpacity={0.8}
                  accessibilityLabel="Driver Profile"
                >
                  <View style={[styles.avatarCircle, { backgroundColor: themeColors.primary, borderColor: isDarkMode ? '#14261B' : '#ffffff' }]}>
                    {partner?.avatarUri ? (
                      <Image source={{ uri: partner.avatarUri }} style={styles.avatarImage} />
                    ) : (
                      <Text style={[styles.avatarText, { color: isDarkMode ? '#000000' : '#ffffff' }]}>
                        {partner?.avatarInitials || 'RS'}
                      </Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.avatarStatusDot,
                      { backgroundColor: isOnline ? '#00E676' : '#94a3b8', borderColor: isDarkMode ? '#080C0A' : '#ffffff' },
                    ]}
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>

      {/* Main Greeting / Screen Title & Interactive Duty Toggle */}
      {(title || showOnlineToggle) && (
        <View style={styles.titleSectionRow}>
          <View style={styles.titleContentCol}>
            {title && <Text style={[styles.screenTitle, { color: themeColors.onSurface }]}>{title}</Text>}
            {subtitle ? <Text style={[styles.screenSubtitle, { color: themeColors.onSurfaceVariant }]}>{subtitle}</Text> : null}
          </View>

          {showOnlineToggle && (
            <Animated.View style={{ transform: [{ scale: dutyScaleAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.dutyPillContainer,
                  isOnline
                    ? (isDarkMode ? { backgroundColor: '#063B22', borderColor: '#00E676' } : styles.dutyPillOnline)
                    : (isDarkMode ? { backgroundColor: '#080C0A', borderColor: '#14261B' } : styles.dutyPillOffline),
                ]}
                onPress={toggleOnline}
                onPressIn={handleDutyPressIn}
                onPressOut={handleDutyPressOut}
                activeOpacity={0.9}
                accessibilityRole="switch"
                accessibilityState={{ checked: isOnline }}
                accessibilityLabel={`Duty toggle, currently ${isOnline ? 'Online' : 'Offline'}`}
              >
                <View
                  style={[
                    styles.dutyPulseDot,
                    { backgroundColor: isOnline ? '#00E676' : '#94a3b8' },
                  ]}
                />
                <Text
                  style={[
                    styles.dutyLabelText,
                    { color: isOnline ? (isDarkMode ? '#00E676' : '#065f46') : (isDarkMode ? '#94A3B8' : '#475569') },
                  ]}
                >
                  {isOnline ? 'ON DUTY' : 'OFFLINE'}
                </Text>
                <View
                  style={[
                    styles.dutySwitchTrack,
                    { backgroundColor: isOnline ? themeColors.primary : isDarkMode ? '#14261B' : '#cbd5e1' },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.dutySwitchThumb,
                      { transform: [{ translateX: thumbTranslateX }] },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    ...shadows.sm,
  },
  // Sub-screen header styling
  backHeaderContainer: {
    paddingHorizontal: spacing.containerMargin,
    paddingTop: 10,
    paddingBottom: 12,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  backIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  backTitleCol: {
    flex: 1,
    marginHorizontal: 12,
  },
  backTitle: {
    ...typography.headlineSm,
    fontSize: 17,
    fontWeight: '700',
    color: colors.onSurface,
  },
  backSubtitle: {
    ...typography.labelSm,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 1,
  },
  rightActionsRow: {
    minWidth: 38,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  placeholderBox: {
    width: 38,
    height: 38,
  },
  actionIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    backgroundColor: '#ecfdf5',
  },
  actionLabelText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: '700',
  },

  // Main screen header styling
  mainHeaderContainer: {
    paddingHorizontal: spacing.containerMargin,
    paddingTop: 10,
    paddingBottom: 14,
  },
  topMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  brandTextCol: {
    justifyContent: 'center',
  },
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    ...typography.headlineMd,
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  partnerTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  partnerTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  hubLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 1,
  },
  hubLocationText: {
    ...typography.labelSm,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
  },
  rightUtilitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  utilityIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.error,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  avatarButton: {
    position: 'relative',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 19,
  },
  avatarText: {
    ...typography.labelSm,
    color: colors.onPrimary,
    fontWeight: '800',
    fontSize: 13,
  },
  avatarStatusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },

  // Title & Duty Status Row
  titleSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  titleContentCol: {
    flex: 1,
    paddingRight: 8,
  },
  screenTitle: {
    ...typography.headlineMd,
    fontSize: 19,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.2,
  },
  screenSubtitle: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },

  // Duty Toggle Pill
  dutyPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingVertical: 5,
    paddingLeft: 10,
    paddingRight: 6,
    gap: 7,
    borderWidth: 1,
  },
  dutyPillOnline: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  dutyPillOffline: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  dutyPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dutyLabelText: {
    ...typography.labelSm,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  dutySwitchTrack: {
    width: 32,
    height: 18,
    borderRadius: 9,
    padding: 2,
    justifyContent: 'center',
  },
  dutySwitchThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffffff',
  },
  dutySwitchThumbActive: {
    alignSelf: 'flex-end',
  },
  dutySwitchThumbInactive: {
    alignSelf: 'flex-start',
  },
});

export default AppHeader;
