import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { colors, radius, space } from '@/theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  /** Optional Feather icon shown before the title. */
  icon?: keyof typeof Feather.glyphMap;
  /** Any element shown before the title instead of a Feather icon (e.g. a brand logo). */
  leftIcon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

// The website's green pill <button>. `outline` is the secondary version.
export function Button({ title, onPress, variant = 'primary', icon, leftIcon, loading, disabled, style }: Props) {
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.base,
        variant === 'outline' && styles.outline,
        (pressed || inactive) && styles.dimmed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <>
          {leftIcon ?? (icon ? <Feather name={icon} size={18} color={colors.text} /> : null)}
          <Text>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
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
