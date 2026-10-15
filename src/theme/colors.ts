// Mirrors the :root color variables in frontend/src/index.scss.
export const palette = {
  black: '#0A1111',
  white: '#F5F1E8',
  green: '#375D2C',
  neon: '#00FF87',
  yellow: '#FFF2A3',
  blue: '#009FB7',
  pink: '#D991BA',
  red: '#FF8A80',
} as const;

// The website uses cream white (245, 241, 232) at many opacities instead of greys.
export const whiteAlpha = (opacity: number) => `rgba(245, 241, 232, ${opacity})`;

// Semantic names: screens should use these, not the raw palette.
export const colors = {
  background: palette.black,
  text: palette.white,
  textMuted: whiteAlpha(0.5),
  textSubtle: whiteAlpha(0.35),
  border: whiteAlpha(0.12),
  surface: whiteAlpha(0.05),
  primary: palette.green,
  accent: palette.neon,
  error: palette.red,
} as const;
