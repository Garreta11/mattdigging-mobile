import { Feather } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { colors, radius, space } from '@/theme';

type Props = {
  href: Href;
  title: string;
  subtitle?: string;
  icon: keyof typeof Feather.glyphMap;
};

// A tappable card that navigates to another screen.
// <Link asChild> passes the navigation onPress to the Pressable inside it.
export function NavRow({ href, title, subtitle, icon }: Props) {
  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        <Feather name={icon} size={22} color={colors.text} />
        <View style={styles.texts}>
          <Text variant="h3">{title}</Text>
          {subtitle ? <Text variant="small">{subtitle}</Text> : null}
        </View>
        <Feather name="chevron-right" size={20} color={colors.textSubtle} />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    padding: space[4],
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.6,
  },
  texts: {
    flex: 1,
    gap: space[1],
  },
});
