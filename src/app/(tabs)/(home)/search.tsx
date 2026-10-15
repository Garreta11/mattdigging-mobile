import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, SectionList, StyleSheet, TextInput, View } from 'react-native';

import { useSearch, type SearchResults } from '@/api/content';
import type { Artist, Track } from '@/api/types';
import { Text } from '@/components/Text';
import { TrackRow } from '@/components/TrackRow';
import { storageUrl } from '@/lib/storage';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { usePlayer } from '@/player/PlayerProvider';
import { colors, fontSize, fonts, radius, space } from '@/theme';

const PHOTO_SIZE = 44;

// One row of results. `kind` tells renderItem what to draw and where a tap goes.
type Item =
  | { kind: 'artist'; key: string; artist: Artist }
  | { kind: 'track'; key: string; track: Track; index: number }
  | { kind: 'playlist'; key: string; label: string; icon: keyof typeof Feather.glyphMap; type: 'genre' | 'mood' | 'country'; value: string };

function toSections(results: SearchResults) {
  const sections: { title: string; data: Item[] }[] = [
    { title: 'Artists', data: results.artists.map((artist) => ({ kind: 'artist', key: `a-${artist.id}`, artist })) },
    { title: 'Tracks', data: results.tracks.map((track, index) => ({ kind: 'track', key: `t-${track.id}`, track, index })) },
    {
      title: 'Genres',
      data: results.genres.map((g) => ({ kind: 'playlist', key: `g-${g.id}`, label: g.name, icon: 'disc', type: 'genre', value: g.slug })),
    },
    {
      title: 'Moods',
      data: results.moods.map((m) => ({ kind: 'playlist', key: `m-${m.id}`, label: m.name, icon: 'sun', type: 'mood', value: m.slug })),
    },
    {
      title: 'Countries',
      data: results.countries.map((c) => ({
        kind: 'playlist',
        key: `c-${c.country}`,
        label: c.country,
        icon: 'globe',
        type: 'country',
        value: c.country,
      })),
    },
  ];
  return sections.filter((section) => section.data.length > 0);
}

export default function Search() {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 300);
  const { data, isFetching, error } = useSearch(debounced);
  const { current, playQueue } = usePlayer();

  const tooShort = debounced.trim().length < 2;
  const sections = data && !tooShort ? toSections(data) : [];

  const renderItem = ({ item }: { item: Item }) => {
    switch (item.kind) {
      case 'artist':
        return (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            onPress={() => router.push({ pathname: '/artists/[id]', params: { id: item.artist.id } })}>
            <Image
              source={storageUrl('artist_photos', item.artist.photo_url, PHOTO_SIZE * 3)}
              style={styles.photo}
              contentFit="cover"
            />
            <View style={styles.texts}>
              <Text>{item.artist.name}</Text>
              {item.artist.country ? <Text variant="small">{item.artist.country}</Text> : null}
            </View>
          </Pressable>
        );
      case 'track':
        return (
          <TrackRow
            track={item.track}
            isActive={current?.id === item.track.id}
            onPress={() => playQueue(data!.tracks, item.index, `Search: ${debounced.trim()}`)}
          />
        );
      case 'playlist':
        return (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            onPress={() => router.push({ pathname: '/playlist', params: { type: item.type, value: item.value } })}>
            <View style={[styles.photo, styles.iconBox]}>
              <Feather name={item.icon} size={20} color={colors.text} />
            </View>
            <Text style={styles.texts}>{item.label}</Text>
          </Pressable>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <Feather name="search" size={18} color={colors.textSubtle} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Artists, tracks, genres, moods…"
          placeholderTextColor={colors.textSubtle}
          selectionColor={colors.accent}
          style={styles.input}
          autoFocus
          autoCorrect={false}
          returnKeyType="search"
        />
        {isFetching ? (
          <ActivityIndicator size="small" color={colors.text} />
        ) : query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={12} accessibilityLabel="Clear search">
            <Feather name="x" size={18} color={colors.textSubtle} />
          </Pressable>
        ) : null}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <Text variant="label" style={styles.sectionHeader}>
            {section.title}
          </Text>
        )}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.list}
        // Tapping a result works while the keyboard is open; scrolling hides the keyboard.
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <Text variant="small">
            {tooShort
              ? 'Type at least 2 characters.'
              : error
                ? error.message
                : isFetching
                  ? ''
                  : `No results for "${debounced.trim()}".`}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    marginHorizontal: space[5],
    marginVertical: space[3],
    paddingHorizontal: space[4],
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
  },
  list: {
    paddingHorizontal: space[5],
    paddingBottom: space[5],
  },
  sectionHeader: {
    paddingTop: space[4],
    paddingBottom: space[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[2],
  },
  pressed: {
    opacity: 0.6,
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: radius.xxs,
    backgroundColor: colors.surface,
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
  },
});
