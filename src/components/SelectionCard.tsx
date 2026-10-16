import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Selection } from '@/api/types';
import { SelectionCover } from '@/components/SelectionCover';
import { Text } from '@/components/Text';
import { selectionDateRange } from '@/lib/format';
import { colors, radius, space } from '@/theme';

export const openSelection = (selection: Selection) =>
  router.push({ pathname: '/selections/[id]', params: { id: selection.id } });

// One weekly selection: artwork, title, dates, description. Upcoming ones are dimmed and can't be opened.
export function SelectionCard({ selection }: { selection: Selection }) {
  return (
    <Pressable
      onPress={() => openSelection(selection)}
      disabled={!selection.is_published}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, !selection.is_published && styles.upcoming]}>
      <SelectionCover selection={selection} size={80} />
      <View style={styles.cardText}>
        <Text variant="h3" numberOfLines={2}>
          {selection.title}
        </Text>
        <Text variant="small">{selectionDateRange(selection)}</Text>
        {selection.description ? (
          <Text variant="small" numberOfLines={2}>
            {selection.description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: space[4],
    padding: space[3],
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.6,
  },
  upcoming: {
    opacity: 0.5,
  },
  cardText: {
    flex: 1,
    gap: space[1],
    justifyContent: 'center',
  },
});
