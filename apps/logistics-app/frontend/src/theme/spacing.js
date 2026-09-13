/**
 * MandiKart Partner Spacing and Dimensions System
 * Standard 8px grid scale from Stitch design
 */
export const spacing = {
  // Base scale
  base: 8,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,

  // Semantic spacing
  stackSm: 4,
  stackMd: 12,
  gutter: 16,
  containerMargin: 20,
  stackLg: 24,
  stackXl: 32,
  touchTargetMin: 48,
  touchTarget: 56,

  // Border radius aliases on spacing
  radiusXs: 4,
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 9999,
};

export const borderRadius = {
  xs: 4,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#131e17',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0f6b3a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#005129',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
};

export default {
  spacing,
  borderRadius,
  shadows,
};
