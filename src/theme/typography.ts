import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_600SemiBold,
} from '@expo-google-fonts/playfair-display';
import type { TextStyle } from 'react-native';

import { colors } from './colors';
import { fontSize } from './tokens';

// Font files to load at startup (see src/app/_layout.tsx).
// The key is the name you use in `fontFamily`.
export const fontAssets = {
  Website: require('../../assets/fonts/Website-Regular.otf'),
  PlayfairDisplay: PlayfairDisplay_400Regular,
  'PlayfairDisplay-Italic': PlayfairDisplay_400Regular_Italic,
  'PlayfairDisplay-SemiBold': PlayfairDisplay_600SemiBold,
};

// In React Native each weight/style is its own family name;
// `fontWeight` does not switch files for custom fonts.
export const fonts = {
  body: 'Website',
  heading: 'PlayfairDisplay',
  headingItalic: 'PlayfairDisplay-Italic',
  headingSemiBold: 'PlayfairDisplay-SemiBold',
} as const;

// Text variants, mirroring the base styles for p / h1–h6 / labels on the website.
// The website's letter-spacing is in em; RN wants pixels, so it is size * em.
const heading = (size: number): TextStyle => ({
  fontFamily: fonts.heading,
  fontSize: size,
  lineHeight: size * 1.15,
  letterSpacing: size * 0.045,
  color: colors.text,
});

export const textVariants = {
  h1: heading(fontSize['2.5xl']),
  h2: heading(fontSize['2xl']),
  h3: heading(fontSize.xl),
  body: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
    color: colors.text,
  },
  small: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.5,
    color: colors.textMuted,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    letterSpacing: fontSize.sm * 0.14,
    textTransform: 'uppercase',
    color: colors.textSubtle,
  },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textVariants;
