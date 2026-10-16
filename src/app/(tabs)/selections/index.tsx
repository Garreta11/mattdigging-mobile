import { router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, SectionList, StyleSheet, View } from 'react-native';

import { useSelections } from '@/api/content';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { QueryState } from '@/components/QueryState';
import { SelectionCard } from '@/components/SelectionCard';
import { SelectionsCalendar } from '@/components/SelectionsCalendar';
import { Text } from '@/components/Text';
import { colors, space } from '@/theme';

// Same preview size as the website: non-members get the first 3 published selections.
const PREVIEW_COUNT = 3;

type ViewMode = 'list' | 'calendar';

export default function Selections() {
  const { data, isPending, error, refetch, isRefetching } = useSelections();
  const { session, isMember } = useAuth();
  const [view, setView] = useState<ViewMode>('list');

  if (!data) return <QueryState isPending={isPending} error={error} onRetry={refetch} />;

  // The backend returns them oldest first. Hidden Gems has its own screen.
  const all = data.filter((s) => s.title.toLowerCase() !== 'hidden gems');
  const published = all.filter((s) => s.is_published);
  const upcoming = all.filter((s) => !s.is_published);
  const refreshControl = <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.text} />;

  // Non-members: the 3-selection preview only (no calendar, same as the website).
  if (!isMember) {
    return (
      <SectionList
        sections={[{ title: 'Available now', data: published.slice(0, PREVIEW_COUNT) }]}
        keyExtractor={(selection) => selection.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        refreshControl={refreshControl}
        ListHeaderComponent={
          <View style={styles.notice}>
            <Text variant="small">A preview of our archive. Members unlock every selection.</Text>
            {!session && <Button title="Log in" onPress={() => router.push('/login')} />}
          </View>
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

  const viewSwitch = (
    <View style={styles.switch}>
      <Chip label="List" selected={view === 'list'} onPress={() => setView('list')} />
      <Chip label="Calendar" selected={view === 'calendar'} onPress={() => setView('calendar')} />
    </View>
  );

  if (view === 'calendar') {
    return (
      <ScrollView contentContainerStyle={styles.list} refreshControl={refreshControl}>
        {viewSwitch}
        {all.length ? <SelectionsCalendar selections={all} /> : <Text variant="small">No selections yet.</Text>}
      </ScrollView>
    );
  }

  return (
    <SectionList
      sections={[
        { title: 'Available now', data: [...published].reverse() }, // newest first
        ...(upcoming.length ? [{ title: 'Coming soon', data: upcoming }] : []),
      ]}
      keyExtractor={(selection) => selection.id}
      contentContainerStyle={styles.list}
      stickySectionHeadersEnabled={false}
      refreshControl={refreshControl}
      ListHeaderComponent={viewSwitch}
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

const styles = StyleSheet.create({
  list: {
    padding: space[5],
  },
  notice: {
    gap: space[3],
    marginBottom: space[4],
  },
  switch: {
    flexDirection: 'row',
    gap: space[2],
    marginBottom: space[4],
  },
  sectionHeader: {
    marginTop: space[4],
    marginBottom: space[3],
  },
  separator: {
    height: space[3],
  },
});
