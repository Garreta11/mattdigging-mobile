import { Stack, useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';

import { useSelections, useSelectionTracks } from '@/api/content';
import { QueryState } from '@/components/QueryState';
import { SelectionCover } from '@/components/SelectionCover';
import { Text } from '@/components/Text';
import { TrackRow } from '@/components/TrackRow';
import { selectionDateRange } from '@/lib/format';
import { usePlayer } from '@/player/PlayerProvider';
import { space } from '@/theme';

// Dynamic route: /selections/abc123 → id = "abc123" (like `:id` in react-router).
export default function SelectionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { current, playQueue } = usePlayer();

  // The selection itself comes from the list already in the cache (same queryKey as the
  // Selections tab), so the header shows instantly. Only the tracks are a new request.
  const selection = useSelections().data?.find((s) => s.id === id);
  const { data: tracks, isPending, error, refetch } = useSelectionTracks(id);

  return (
    <>
      <Stack.Screen options={{ title: selection?.title ?? '' }} />
      {!tracks ? (
        <QueryState isPending={isPending} error={error} onRetry={refetch} />
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(track) => track.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            selection ? (
              <View style={styles.header}>
                <SelectionCover selection={selection} size={140} />
                <Text variant="h2">{selection.title}</Text>
                <Text variant="small">{selectionDateRange(selection)}</Text>
                {selection.description ? <Text>{selection.description}</Text> : null}
              </View>
            ) : null
          }
          // Tapping a track plays the whole selection, starting from that track.
          renderItem={({ item, index }) => (
            <TrackRow
              track={item}
              index={index}
              isActive={current?.id === item.id}
              onPress={() => playQueue(tracks, index, selection?.title ?? 'Weekly Selection')}
            />
          )}
          ListEmptyComponent={<Text variant="small">No tracks found.</Text>}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: space[5],
  },
  header: {
    gap: space[2],
    marginBottom: space[5],
  },
});
