import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { PLAYLIST_FILTERS, usePlaylistOptions, usePlaylistTracks, type PlaylistFilter } from '@/api/content';
import { useAuth } from '@/auth/AuthProvider';
import { MembersOnly } from '@/components/MembersOnly';
import { QueryState } from '@/components/QueryState';
import { Text } from '@/components/Text';
import { TrackRow } from '@/components/TrackRow';
import { usePlayer } from '@/player/PlayerProvider';
import { colors, space } from '@/theme';

// One playlist: /playlist?type=mood&value=lava-lamp (same filters as the website's /playlists?mood=…).
export default function Playlist() {
  const params = useLocalSearchParams<{ type: string; value: string }>();
  const type = (PLAYLIST_FILTERS as readonly string[]).includes(params.type) ? (params.type as PlaylistFilter) : 'mood';
  const value = params.value ?? '';

  const { isReady, isMember } = useAuth();
  // Readable title: "lava-lamp" → "Lava Lamp", from the cached list of options.
  const title = usePlaylistOptions(type).options?.find((o) => o.value === value)?.label ?? value;

  return (
    <>
      <Stack.Screen options={{ title }} />
      {!isReady ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.text} />
        </View>
      ) : isMember ? (
        <PlaylistTracks type={type} value={value} title={title} />
      ) : (
        <MembersOnly />
      )}
    </>
  );
}

function PlaylistTracks({ type, value, title }: { type: PlaylistFilter; value: string; title: string }) {
  const { data, isPending, error, refetch } = usePlaylistTracks(type, value);
  const { current, playQueue } = usePlayer();

  if (!data) return <QueryState isPending={isPending} error={error} onRetry={refetch} />;

  return (
    <FlatList
      data={data}
      keyExtractor={(track) => track.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <Text variant="label" style={styles.count}>
          {data.length} tracks
        </Text>
      }
      renderItem={({ item, index }) => (
        <TrackRow track={item} isActive={current?.id === item.id} onPress={() => playQueue(data, index, title)} />
      )}
      ListEmptyComponent={<Text variant="small">No tracks found.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: space[5],
  },
  count: {
    marginBottom: space[3],
  },
});
