import { router } from 'expo-router';
import { Pressable, RefreshControl, SectionList, StyleSheet, View } from 'react-native';

import { useSelections } from '@/api/content';
import type { Selection } from '@/api/types';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/Button';
import { QueryState } from '@/components/QueryState';
import { SelectionCover } from '@/components/SelectionCover';
import { Text } from '@/components/Text';
import { selectionDateRange } from '@/lib/format';
import { colors, radius, space } from '@/theme';

// Same preview size as the website: non-members get the first 3 published selections.
const PREVIEW_COUNT = 3;

export default function Selections() {
  const { data, isPending, error, refetch, isRefetching } = useSelections();
  const { session, isMember } = useAuth();

  if (!data) return <QueryState isPending={isPending} error={error} onRetry={refetch} />;

  // The backend returns them oldest first. Hidden Gems has its own screen.
  const all = data.filter((s) => s.title.toLowerCase() !== 'hidden gems');
  const published = all.filter((s) => s.is_published);
  const upcoming = all.filter((s) => !s.is_published);

  const sections = isMember
    ? [
        { title: 'Available now', data: [...published].reverse() }, // newest first
        ...(upcoming.length ? [{ title: 'Coming soon', data: upcoming }] : []),
      ]
    : [{ title: 'Available now', data: published.slice(0, PREVIEW_COUNT) }];

  return (
    <SectionList
      sections={sections}
      keyExtractor={(selection) => selection.id}
      contentContainerStyle={styles.list}
      stickySectionHeadersEnabled={false}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.text} />}
      ListHeaderComponent={
        isMember ? null : (
          <View style={styles.notice}>
            <Text variant="small">A preview of our archive. Members unlock every selection.</Text>
            {!session && <Button title="Log in" onPress={() => router.push('/login')} />}
          </View>
        )
      }
      renderSectionHeader={({ section }) => (
        <Text variant="label" style={styles.sectionHeader}>
          {section.title}
        </Text>
      )}
      renderItem={({ item }) => <SelectionCard selection={item} />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={<Text variant="small">No selections yet.</Text>}
    />
  );
}

function SelectionCard({ selection }: { selection: Selection }) {
  const open = () => router.push({ pathname: '/selections/[id]', params: { id: selection.id } });

  return (
    <Pressable
      onPress={open}
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
  list: {
    padding: space[5],
  },
  notice: {
    gap: space[3],
    marginBottom: space[4],
  },
  sectionHeader: {
    marginTop: space[4],
    marginBottom: space[3],
  },
  separator: {
    height: space[3],
  },
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
