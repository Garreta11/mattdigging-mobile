import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';

import { useArtists, useArtistTracks } from '@/api/content';
import { useAuth } from '@/auth/AuthProvider';
import { QueryState } from '@/components/QueryState';
import { Text } from '@/components/Text';
import { TrackRow } from '@/components/TrackRow';
import { storageUrl } from '@/lib/storage';
import { usePlayer } from '@/player/PlayerProvider';
import { colors, radius, space } from '@/theme';

// Same preview limit as the website's ArtistModal for non-members.
const PREVIEW_SELECTIONS = 3;

export default function ArtistDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isMember } = useAuth();
  const { current, playQueue } = usePlayer();
  const { width } = useWindowDimensions();

  // Name, photo and bio come from the cached artist list (instant if the Artists tab was opened).
  const artist = useArtists().data?.find((a) => a.id === id);
  const { data: tracks, isPending, error, refetch } = useArtistTracks(id, isMember ? undefined : PREVIEW_SELECTIONS);

  const photoSize = width - space[5] * 2;
  const photo = storageUrl('artist_photos', artist?.photo_url, Math.round(photoSize * 2));

  return (
    <>
      <Stack.Screen options={{ title: artist?.name ?? '' }} />
      {!tracks ? (
        <QueryState isPending={isPending} error={error} onRetry={refetch} />
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(track) => track.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            artist ? (
              <View style={styles.header}>
                {photo ? (
                  <Image source={photo} style={[styles.photo, { height: photoSize * 0.75 }]} contentFit="cover" transition={200} />
                ) : null}
                <Text variant="h1">{artist.name}</Text>
                {artist.country ? <Text variant="label">{artist.country}</Text> : null}
                {artist.bio ? <Text>{artist.bio}</Text> : null}
                {tracks.length > 0 && (
                  <Text variant="label" style={styles.tracksTitle}>
                    Tracks ({tracks.length})
                  </Text>
                )}
              </View>
            ) : null
          }
          renderItem={({ item, index }) => (
            <TrackRow
              track={item}
              isActive={current?.id === item.id}
              onPress={() => playQueue(tracks, index, artist?.name ?? 'Artist')}
            />
          )}
          ListEmptyComponent={
            <Text variant="small">
              {isMember ? 'No tracks yet.' : 'Members can listen to every track by this artist.'}
            </Text>
          }
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
    gap: space[3],
    marginBottom: space[3],
  },
  photo: {
    width: '100%',
    borderRadius: radius.xs,
    backgroundColor: colors.surface,
  },
  tracksTitle: {
    marginTop: space[4],
  },
});
