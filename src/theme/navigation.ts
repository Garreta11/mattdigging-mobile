import { colors } from './colors';
import { fonts } from './typography';

// Header look shared by every Stack (root and the one inside each tab).
export const stackScreenOptions = {
  contentStyle: { backgroundColor: colors.background },
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerTitleStyle: { fontFamily: fonts.heading },
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal',
} as const;
