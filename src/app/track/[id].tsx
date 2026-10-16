import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { useTrack, type PlaylistFilter } from '@/api/content';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { FavoriteButton } from '@/components/FavoriteButton';
import { QueryState } from '@/components/QueryState';
import { Text } from '@/components/Text';
import { storageUrl } from '@/lib/storage';
import { usePlayer } from '@/player/PlayerProvider';
import { colors, radius, space } from '@/theme';

const ARTIST_PHOTO_SIZE = 40;

// Close every modal (this one, and the full player if it is open underneath),
// then show the destination inside the tabs.
const goTo = (href: Href) => {
  router.dismissAll();
  router.push(href);
};

const openPlaylist = (type: PlaylistFilter, value: string) =>
  goTo({ pathname: '/playlists/playlist', params: { type, value } });

// Track details, opened as a modal. Mirrors frontend/src/components/TrackModal.
export default function TrackDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: track, isPending, error, refetch } = useTrack(id);
  const { current, playQueue } = usePlayer();
  const { width } = useWindowDimensions();

  if (!track) return <QueryState isPending={isPending} error={error} onRetry={refetch} />;

  const coverSize = Math.min(width * 0.6, 280);
  const genres = track.track_genres?.map((tg) => tg.genre).filter(Boolean) ?? [];
  const moods = track.track_moods?.map((tm) => tm.mood).filter(Boolean) ?? [];
  const isCurrent = current?.id === track.id;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: '' }} />

      <Image
        source={storageUrl('covers', track.cover_url, Math.round(coverSize * 3))}
        style={[styles.cover, { width: coverSize, height: coverSize }]}
        contentFit="cover"
        transition={200}
      />

      <Text variant="h2">{track.title}</Text>

      {track.artist ? (
        <Pressable
          style={({ pressed }) => [styles.artist, pressed && styles.pressed]}
          onPress={() => goTo({ pathname: '/artists/[id]', params: { id: track.artist_id } })}>
          <Image
            source={storageUrl('artist_photos', track.artist.photo_url, ARTIST_PHOTO_SIZE * 3)}
            style={styles.artistPhoto}
            contentFit="cover"
          />
          <Text style={styles.link}>{track.artist.name}</Text>
        </Pressable>
      ) : null}

      <View style={styles.actions}>
        <Button
          title={isCurrent ? 'Playing' : 'Play'}
          icon="play"
          disabled={isCurrent}
          onPress={() => playQueue([track], 0, track.title)}
          style={styles.playButton}
        />
        <FavoriteButton trackId={track.id} size={28} />
      </View>

      {track.description ? <Text>{track.description}</Text> : null}

      <View style={styles.details}>
        {track.album_name ? <Detail label="Album" value={track.album_name} /> : null}
        {track.country ? (
          <Detail label="Country" value={track.country} onPress={() => openPlaylist('country', track.country!)} />
        ) : null}
        {track.year ? (
          <Detail label="Year" value={String(track.year)} onPress={() => openPlaylist('year', String(track.year))} />
        ) : null}
        {track.season ? (
          <Detail
            label="Season"
            value={track.season}
            onPress={() => openPlaylist('season', track.season!.toLowerCase())}
          />
        ) : null}
      </View>

      {genres.length > 0 && (
        <View style={styles.section}>
          <Text variant="label">Genres</Text>
          <View style={styles.chips}>
            {genres.map((genre) => (
              <Chip
                key={genre.id}
                label={genre.name}
                // Same special case as the website: this "genre" is the Hidden Gems selection.
                onPress={() => (genre.slug === 'hidden-gems' ? goTo('/hidden-gems') : openPlaylist('genre', genre.slug))}
              />
            ))}
          </View>
        </View>
      )}

      {moods.length > 0 && (
        <View style={styles.section}>
          <Text variant="label">Moods</Text>
          <View style={styles.chips}>
            {moods.map((mood) => (
              <Chip key={mood.id} label={mood.name} onPress={() => openPlaylist('mood', mood.slug)} />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// One "Label   Value" line; the value is a link when onPress is given.
function Detail({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  return (
    <View style={styles.detail}>
      <Text variant="label">{label}</Text>
      <Pressable disabled={!onPress} onPress={onPress} hitSlop={8} style={styles.detailValue}>
        <Text style={onPress ? styles.link : undefined} numberOfLines={2}>
          {value}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: space[5],
    gap: space[4],
  },
  cover: {
    alignSelf: 'center',
    borderRadius: radius.xs,
    backgroundColor: colors.surface,
  },
  artist: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    alignSelf: 'flex-start',
  },
  artistPhoto: {
    width: ARTIST_PHOTO_SIZE,
    height: ARTIST_PHOTO_SIZE,
    borderRadius: ARTIST_PHOTO_SIZE / 2,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.6,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
  },
  playButton: {
    flex: 1,
  },
  link: {
    textDecorationLine: 'underline',
  },
  details: {
    gap: space[3],
    paddingVertical: space[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[4],
  },
  detailValue: {
    flexShrink: 1,
  },
  section: {
    gap: space[2],
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
});
