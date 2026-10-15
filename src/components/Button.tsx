import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { colors, radius, space } from '@/theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

// The website's green pill <button>. `outline` is the secondary version.
export function Button({ title, onPress, variant = 'primary', loading, disabled, style }: Props) {
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        variant === 'outline' && styles.outline,
        (pressed || inactive) && styles.dimmed,
        style,
      ]}>
      {loading ? <ActivityIndicator color={colors.text} /> : <Text>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[5],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  dimmed: {
    opacity: 0.6,
  },
});
