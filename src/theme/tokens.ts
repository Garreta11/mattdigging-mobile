// Mirrors the spacing / font-size / radius scales in frontend/src/index.scss.
// React Native has no rem: every value is a plain number of density-independent pixels.

export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 40,
  8: 48,
  10: 64,
  12: 96,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '2.5xl': 40,
  '3xl': 48,
  '4xl': 64,
} as const;

export const radius = {
  pill: 98,
  sm: 24,
  xs: 16,
  xxs: 8,
} as const;
