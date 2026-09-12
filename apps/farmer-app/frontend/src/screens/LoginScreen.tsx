import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, colors } from '../theme';
import { useAuthStore } from '../store/authStore';

export const LoginScreen = () => {
  const [authMode, setAuthMode] = useState<'PASSWORD' | 'OTP'>('OTP');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const {
    loginWithPassword,
    requestOtp,
    verifyOtp,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const handlePhoneChange = (text: string) => {
    // Only accept numeric characters up to 10 digits
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
    if (error) clearError();
  };

  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      Alert.alert('Notice', 'Please enter a valid 10-digit mobile number');
      return;
    }
    const success = await requestOtp(phoneNumber);
    if (success) {
      setOtpSent(true);
    }
  };

  const handleSubmit = async () => {
    if (phoneNumber.length !== 10) {
      Alert.alert('Notice', 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (authMode === 'OTP') {
      if (!otpSent) {
        await handleSendOtp();
        return;
      }
      if (otp.length !== 6) {
        Alert.alert('Notice', 'Please enter the 6-digit verification code');
        return;
      }
      await verifyOtp(phoneNumber, otp);
    } else {
      if (password.length < 6) {
        Alert.alert('Notice', 'Password must be at least 6 characters');
        return;
      }
      await loginWithPassword(phoneNumber, password);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />

      {/* Ambient background glow elements */}
      <View style={styles.organicBg}>
        <View style={styles.blobOrange} />
        <View style={styles.blobGreen} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Branding Header */}
        <View style={styles.branding}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="sprout" size={38} color={colors.primary} />
          </View>
          <Text style={styles.brandTitle}>MandiKart</Text>
          <Text style={styles.brandSubtitle}>Farmer Platform</Text>
        </View>

        {/* Login Surface Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>
          <Text style={styles.cardSubtitle}>Sign in to manage and sell produce</Text>

          {/* Mode Switcher Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, authMode === 'OTP' && styles.activeTab]}
              onPress={() => {
                setAuthMode('OTP');
                clearError();
              }}
            >
              <Text style={[styles.tabText, authMode === 'OTP' && styles.activeTabText]}>
                Login with OTP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, authMode === 'PASSWORD' && styles.activeTab]}
              onPress={() => {
                setAuthMode('PASSWORD');
                clearError();
              }}
            >
              <Text style={[styles.tabText, authMode === 'PASSWORD' && styles.activeTabText]}>
                Password
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Mobile Input Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.textInput}
                placeholder="10-digit mobile number"
                placeholderTextColor="#9e8e84"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                maxLength={10}
              />
              <Ionicons name="phone-portrait-outline" size={20} color={colors.outline} style={styles.inputIconRight} />
            </View>
          </View>

          {/* Conditional Input: OTP or Password */}
          {authMode === 'OTP' ? (
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Verification Code (OTP)</Text>
                {otpSent && (
                  <TouchableOpacity onPress={handleSendOtp} disabled={isLoading}>
                    <Text style={styles.resendLink}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="keypad-outline" size={20} color={colors.outline} style={styles.inputIconLeft} />
                <TextInput
                  style={[styles.textInput, { paddingLeft: 40 }]}
                  placeholder={otpSent ? "Enter 6-digit OTP" : "Press button to receive OTP"}
                  placeholderTextColor="#9e8e84"
                  keyboardType="numeric"
                  value={otp}
                  onChangeText={(val) => setOtp(val.replace(/[^0-9]/g, '').slice(0, 6))}
                  maxLength={6}
                  editable={otpSent}
                />
              </View>
            </View>
          ) : (
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Password</Text>
                <TouchableOpacity>
                  <Text style={styles.forgotLink}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.outline} style={styles.inputIconLeft} />
                <TextInput
                  style={[styles.textInput, { paddingLeft: 40, paddingRight: 40 }]}
                  placeholder="Enter your password"
                  placeholderTextColor="#9e8e84"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (error) clearError();
                  }}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.outline}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Primary Action Button */}
          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.88}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.primaryButtonText}>
                  {authMode === 'OTP' ? (otpSent ? 'VERIFY & SIGN IN' : 'GET OTP') : 'LOG IN'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>New to MandiKart? </Text>
          <TouchableOpacity>
            <Text style={styles.signUpLink}>Register Farm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  organicBg: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blobOrange: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.backgroundAccentOrange,
    opacity: 0.25,
  },
  blobGreen: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.backgroundAccentGreen,
    opacity: 0.25,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.marginPage,
    paddingVertical: 40,
  },
  branding: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.card,
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 2,
    fontWeight: '500',
  },
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    ...theme.shadows.soft3D,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onSurface,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md - 2,
  },
  activeTab: {
    backgroundColor: colors.surfaceCard,
    ...theme.shadows.card,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  activeTabText: {
    color: colors.secondary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorContainer,
    borderRadius: theme.borderRadius.md,
    padding: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: colors.error,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    marginBottom: 6,
    paddingLeft: 2,
  },
  forgotLink: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
  },
  resendLink: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderRadius: theme.borderRadius.md,
    height: 50,
    paddingHorizontal: 12,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.secondary,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: colors.outlineVariant,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.onSurface,
    fontWeight: '500',
  },
  inputIconLeft: {
    position: 'absolute',
    left: 12,
  },
  inputIconRight: {
    marginLeft: 8,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  primaryButton: {
    backgroundColor: colors.secondary,
    height: 52,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...theme.shadows.button,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
  },
});
