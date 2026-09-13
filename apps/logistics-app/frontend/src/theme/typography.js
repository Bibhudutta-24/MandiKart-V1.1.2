/**
 * MandiKart Partner Typography System
 * Using Inter styling scale from Stitch
 */
import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'sans-serif',
});

export const typography = {
  headlineLg: {
    fontFamily,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.6,
    fontWeight: '700',
  },
  headlineLgMobile: {
    fontFamily,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.3,
    fontWeight: '700',
  },
  headlineMd: {
    fontFamily,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  headlineSm: {
    fontFamily,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  bodyLg: {
    fontFamily,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '400',
  },
  bodyMd: {
    fontFamily,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  bodySm: {
    fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  labelLg: {
    fontFamily,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.15,
    fontWeight: '600',
  },
  labelMd: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '500',
  },
  labelSm: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
    fontWeight: '600',
  },
  numericPrice: {
    fontFamily,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
    fontWeight: '700',
  },

  // Material Design 3 naming aliases
  headlineLarge: {
    fontFamily,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.6,
    fontWeight: '700',
  },
  headlineMedium: {
    fontFamily,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  headlineSmall: {
    fontFamily,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  titleLarge: {
    fontFamily,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  titleMedium: {
    fontFamily,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  titleSmall: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  bodyLarge: {
    fontFamily,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '400',
  },
  bodyMedium: {
    fontFamily,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  bodySmall: {
    fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  labelLarge: {
    fontFamily,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.15,
    fontWeight: '600',
  },
  labelMedium: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '500',
  },
  labelSmall: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
    fontWeight: '600',
  },
};

export default typography;
