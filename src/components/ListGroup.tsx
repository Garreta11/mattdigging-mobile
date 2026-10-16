import { Feather } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { colors, radius, space } from '@/theme';

// Settings-style grouped list: an optional small title above one rounded block of rows,
// with thin dividers between them (like the iOS / Android settings screens).
export function ListGroup({ title, children }: { title?: string; children: ReactNode }) {
  const rows = Children.toArray(children);

  return (
    <View style={styles.group}>
      {title ? <Text variant="label">{title}</Text> : null}
      <View style={styles.block}>
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 && <View style={styles.divider} />}
            {row}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

type RowProps = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  /** Screen to open. */
  href?: Href;
  /** Custom action instead of navigating (e.g. open a website). */
  onPress?: () => void;
  /** Shows an "opens outside the app" arrow instead of the chevron. */
  external?: boolean;
  /** Red, for actions like "Log out". */
  danger?: boolean;
};

// Rows without href/onPress are plain information: no chevron, not tappable.
export function ListRow({ icon, title, subtitle, href, onPress, external, danger }: RowProps) {
  const press = onPress ?? (href ? () => router.push(href) : undefined);
  const tint = danger ? colors.error : colors.text;

  return (
    <Pressable
      onPress={press}
      disabled={!press}
      accessibilityRole={press ? (external ? 'link' : 'button') : 'text'}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.icon}>
        <Feather name={icon} size={18} color={tint} />
      </View>
      <View style={styles.texts}>
        <Text style={{ color: tint }}>{title}</Text>
        {subtitle ? <Text variant="small">{subtitle}</Text> : null}
      </View>
      {press && !danger ? (
        <Feather name={external ? 'external-link' : 'chevron-right'} size={18} color={colors.textSubtle} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: space[2],
  },
  block: {
    borderRadius: radius.xs,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    // Starts after the icon, like native settings lists.
    marginLeft: space[4] + 32 + space[3],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: 56,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
  },
  pressed: {
    backgroundColor: colors.border,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: radius.xxs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.border,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
});
