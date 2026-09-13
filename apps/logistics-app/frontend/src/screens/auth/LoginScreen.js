import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, borderRadius, shadows } from '../../theme';
import AppButton from '../../components/common/AppButton';
import AppInput from '../../components/common/AppInput';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../navigation/routes';

export const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { sendLoginOtp, verifyLoginOtp, loginWithGoogle } = useAuth();

  // Mobile and OTP state
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Countdown timer for OTP
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);

  // OTP input reference
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (otpSent && countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [otpSent, countdown]);

  const handleSendOtp = async () => {
    setError('');
    const cleanMobile = mobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      await sendLoginOtp(cleanMobile);
      setOtpSent(true);
      setCountdown(30);
      setCanResend(false);
      setTimeout(() => otpInputRef.current?.focus(), 300);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      setError('Please enter the 4-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      await verifyLoginOtp(mobile, cleanOtp);
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please check the code received.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle({
        name: 'Google Partner',
        email: 'partner.driver@mandikart.com',
      });
    } catch (err) {
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleChangeNumber = () => {
    setOtpSent(false);
    setOtp('');
    setError('');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <View style={styles.brandRow}>
          <View style={styles.brandIconWrapper}>
            <MaterialIcons name="local-shipping" size={26} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.brandName}>MandiKart</Text>
            <Text style={styles.brandSub}>DELIVERY PARTNER</Text>
          </View>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroBox}>
          <View style={styles.heroIconCircle}>
            <MaterialIcons
              name={otpSent ? 'mark-email-read' : 'phone-android'}
              size={32}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>
              {otpSent ? 'Enter Verification Code' : 'Partner Sign In'}
            </Text>
            <Text style={styles.heroSub}>
              {otpSent
                ? 'Enter the 4-digit OTP sent to your registered mobile number'
                : 'Sign in with Google or continue with Mobile OTP'}
            </Text>
          </View>
        </View>

        {/* Main Card */}
        <View style={styles.card}>
          <View style={styles.accentBar} />

          {/* Error Banner */}
          {Boolean(error) && (
            <View style={styles.errorBox}>
              <MaterialIcons name="error-outline" size={18} color={colors.error} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {!otpSent ? (
            /* STEP 1: Enter Mobile Number or Google Sign In */
            <View>
              {/* Google Sign In Button */}
              <TouchableOpacity
                style={styles.googleBtn}
                onPress={handleGoogleSignIn}
                disabled={googleLoading || loading}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="google" size={20} color="#EA4335" style={{ marginRight: 10 }} />
                <Text style={styles.googleBtnText}>
                  {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with Mobile OTP</Text>
                <View style={styles.dividerLine} />
              </View>

              <AppInput
                label="Registered Mobile Number"
                placeholder="Enter 10-digit mobile number"
                value={mobile}
                onChangeText={(txt) => {
                  setMobile(txt.replace(/\D/g, ''));
                  if (error) setError('');
                }}
                keyboardType="phone-pad"
                maxLength={10}
                prefix="+91"
                icon="phone-android"
              />

              {/* Send OTP Button */}
              <AppButton
                title="Send OTP"
                iconRight="arrow-forward"
                onPress={handleSendOtp}
                loading={loading}
                style={styles.primaryBtn}
              />
            </View>
          ) : (
            /* STEP 2: Enter OTP */
            <View>
              {/* Target Phone Pill */}
              <View style={styles.phonePill}>
                <View style={styles.phonePillLeft}>
                  <MaterialIcons name="phone" size={16} color={colors.primary} />
                  <Text style={styles.phonePillText}>+91 {mobile}</Text>
                </View>
                <TouchableOpacity onPress={handleChangeNumber} activeOpacity={0.7}>
                  <Text style={styles.changePhoneText}>Change Number</Text>
                </TouchableOpacity>
              </View>

              {/* OTP Input Field */}
              <Text style={styles.otpLabel}>Enter 4-Digit OTP</Text>
              <View style={styles.otpInputContainer}>
                <TextInput
                  ref={otpInputRef}
                  style={styles.otpTextInput}
                  value={otp}
                  onChangeText={(txt) => {
                    setOtp(txt.replace(/\D/g, '').slice(0, 4));
                    if (error) setError('');
                  }}
                  keyboardType="number-pad"
                  maxLength={4}
                  placeholder="• • • •"
                  placeholderTextColor={colors.outline}
                  letterSpacing={14}
                  autoFocus
                />
              </View>

              {/* Timer & Resend */}
              <View style={styles.timerRow}>
                {canResend ? (
                  <TouchableOpacity onPress={handleSendOtp} disabled={loading}>
                    <Text style={styles.resendActiveText}>Resend OTP</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.timerText}>
                    Resend code in{' '}
                    <Text style={styles.timerHighlight}>{countdown}s</Text>
                  </Text>
                )}
              </View>

              {/* Verify & Login Button */}
              <AppButton
                title="Verify & Sign In"
                iconRight="check-circle"
                onPress={handleVerifyOtp}
                loading={loading}
                style={styles.primaryBtn}
              />
            </View>
          )}
        </View>

        {/* Register Section */}
        <View style={styles.registerContainer}>
          <Text style={styles.newPartnerText}>New delivery partner?</Text>
          <AppButton
            title="Register with Documents & Vehicle"
            variant="outline"
            icon="app-registration"
            onPress={() => navigation.navigate(ROUTES.REGISTER)}
            style={styles.registerBtn}
          />
        </View>

        {/* Feature Highlights */}
        <View style={styles.trustBadgesRow}>
          <View style={styles.trustItem}>
            <View style={styles.trustIconCircle}>
              <MaterialIcons name="verified-user" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.trustText}>Secure OTP{'\n'}Authentication</Text>
          </View>

          <View style={styles.trustItem}>
            <View style={styles.trustIconCircle}>
              <MaterialIcons name="account-balance-wallet" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.trustText}>Daily Direct{'\n'}Bank Payout</Text>
          </View>

          <View style={styles.trustItem}>
            <View style={styles.trustIconCircle}>
              <MaterialIcons name="navigation" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.trustText}>Smart 3D{'\n'}Navigation</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>MandiKart Partner App • Real Production Engine</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6F3',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  brandIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  brandName: {
    ...typography.h2,
    color: colors.onSurface,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandSub: {
    ...typography.overline,
    color: colors.primary,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  heroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: 16,
    marginBottom: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E2EBE2',
    ...shadows.sm,
  },
  heroIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    ...typography.h3,
    color: colors.onSurface,
    fontWeight: '700',
  },
  heroSub: {
    ...typography.caption,
    color: colors.outline,
    marginTop: 2,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8E2',
    ...shadows.md,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.primary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE8E8',
    padding: 12,
    borderRadius: borderRadius.md,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F8B4B4',
  },
  errorBannerText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
    flex: 1,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    marginBottom: 16,
    ...shadows.xs,
  },
  googleBtnText: {
    ...typography.button,
    color: '#1E293B',
    fontWeight: '700',
    fontSize: 15,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8E2',
  },
  dividerText: {
    ...typography.caption,
    color: colors.outline,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  phonePill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 16,
  },
  phonePillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phonePillText: {
    ...typography.body2,
    fontWeight: '700',
    color: colors.onSurface,
  },
  changePhoneText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  otpLabel: {
    ...typography.subtitle2,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 8,
  },
  otpInputContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  otpTextInput: {
    ...typography.h2,
    color: colors.onSurface,
    fontWeight: '800',
    textAlign: 'center',
    width: '100%',
  },
  timerRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    ...typography.caption,
    color: colors.outline,
  },
  timerHighlight: {
    fontWeight: '700',
    color: colors.primary,
  },
  resendActiveText: {
    ...typography.body2,
    fontWeight: '700',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  primaryBtn: {
    marginTop: 8,
  },
  registerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: 16,
    marginTop: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2EBE2',
    ...shadows.sm,
  },
  newPartnerText: {
    ...typography.body2,
    color: colors.outline,
    marginBottom: 10,
    fontWeight: '500',
  },
  registerBtn: {
    width: '100%',
  },
  trustBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
    gap: 8,
  },
  trustItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E2EBE2',
    ...shadows.xs,
  },
  trustIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  trustText: {
    ...typography.caption,
    fontSize: 10,
    lineHeight: 13,
    color: colors.onSurface,
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  versionText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.outline,
  },
});

export default LoginScreen;
