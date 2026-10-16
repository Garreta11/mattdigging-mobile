import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Track } from '@/api/types';
import { FavoriteButton } from '@/components/FavoriteButton';
import { Text } from '@/components/Text';
import { storageUrl } from '@/lib/storage';
import { colors, radius, space } from '@/theme';

const COVER_SIZE = 52;

type Props = {
  track: Pick<Track, 'id' | 'title' | 'cover_url' | 'album_name' | 'year'> & { artist?: Track['artist'] };
  index?: number;
  isActive?: boolean;
  onPress?: () => void;
};

// One track in a list. Mirrors frontend/src/components/TrackItem.
// memo(): long lists re-render often (e.g. when the playing track changes);
// this skips rows whose props did not change.
export const TrackRow = memo(function TrackRow({ track, index, isActive, onPress }: Props) {
  const cover = storageUrl('covers', track.cover_url, COVER_SIZE * 3);
  const meta = [track.album_name, track.year].filter(Boolean).join(' · ');

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {index !== undefined && (
        <Text variant="small" style={[styles.index, isActive && styles.active]}>
          {String(index + 1).padStart(2, '0')}
        </Text>
      )}
      <Image source={cover} style={styles.cover} contentFit="cover" transition={150} />
      <View style={styles.info}>
        <Text numberOfLines={1} style={isActive && styles.active}>
          {track.title}
        </Text>
        {track.artist ? (
          <Text variant="small" numberOfLines={1}>
            {track.artist.name}
          </Text>
        ) : null}
        {meta ? (
          <Text variant="small" numberOfLines={1} style={styles.meta}>
            {meta}
          </Text>
        ) : null}
      </View>
      {/* Separate Pressables (heart, details), so tapping them does not start playback. */}
      <FavoriteButton trackId={track.id} />
      <Pressable
        onPress={() => router.push({ pathname: '/track/[id]', params: { id: track.id } })}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={`Details for ${track.title}`}>
        <Feather name="more-horizontal" size={20} color={colors.textSubtle} />
      </Pressable>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[2],
  },
  pressed: {
    opacity: 0.6,
  },
  index: {
    width: 24,
  },
  active: {
    color: colors.accent,
  },
  cover: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: radius.xxs,
    backgroundColor: colors.surface,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  meta: {
    color: colors.textSubtle,
  },
});
