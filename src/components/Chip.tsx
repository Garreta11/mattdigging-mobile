import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/Text';
import { colors, radius, space } from '@/theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

// Small pill button: playlist categories, genres, moods.
export function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}>
      <Text variant="small" style={styles.text}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: space[2],
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.6,
  },
  text: {
    color: colors.text,
  },
});
