import { Text as RNText, type TextProps } from 'react-native';

import { textVariants, type TextVariant } from '@/theme';

type Props = TextProps & { variant?: TextVariant };

// Use this instead of React Native's <Text> so every text gets the Mattdigging font and color.
// RN has no CSS inheritance: a parent cannot set the font for the text inside it.
export function Text({ variant = 'body', style, ...rest }: Props) {
  return <RNText style={[textVariants[variant], style]} {...rest} />;
}
