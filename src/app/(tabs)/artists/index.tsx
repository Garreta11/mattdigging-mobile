import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { memo, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { useArtists } from '@/api/content';
import type { Artist } from '@/api/types';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/Button';
import { QueryState } from '@/components/QueryState';
import { Text } from '@/components/Text';
import { storageUrl } from '@/lib/storage';
import { colors, fontSize, fonts, radius, space } from '@/theme';

const PHOTO_SIZE = 56;
// Fixed heights let the list jump straight to any letter (getItemLayout),
// even with 600+ artists that have not been drawn yet.
const ROW_HEIGHT = PHOTO_SIZE + space[3];
const HEADER_HEIGHT = 44;
const ALPHABET = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

// "Åsa" → "A", "2Pac" → "#": the letter an artist is listed under.
const letterOf = (name: string) => {
  const letter = name.trim().charAt(0).normalize('NFD').charAt(0).toUpperCase();
  return /[A-Z]/.test(letter) ? letter : '#';
};

// Letter headers and artists in one flat list.
type Item = { type: 'header'; key: string; letter: string } | { type: 'artist'; key: string; artist: Artist };

function buildItems(artists: Artist[]) {
  const items: Item[] = [];
  const letterIndex = new Map<string, number>(); // letter → position of its header
  let last = '';
  for (const artist of artists) {
    const letter = letterOf(artist.name);
    if (letter !== last) {
      letterIndex.set(letter, items.length);
      items.push({ type: 'header', key: `h-${letter}`, letter });
      last = letter;
    }
    items.push({ type: 'artist', key: artist.id, artist });
  }
  // Offset of every item from the top of the list, for getItemLayout.
  const offsets: number[] = [];
  let y = 0;
  for (const item of items) {
    offsets.push(y);
    y += item.type === 'header' ? HEADER_HEIGHT : ROW_HEIGHT;
  }
  return { items, letterIndex, offsets };
}

export default function Artists() {
  const { data, isPending, error, refetch, isRefetching } = useArtists();
  const { session, isMember } = useAuth();
  const [query, setQuery] = useState('');
  const listRef = useRef<FlatList<Item>>(null);

  // Search only among artists, on the list already loaded (no extra requests).
  const needle = query.trim().toLowerCase();
  const visible = useMemo(
    () => (needle ? data?.filter((a) => a.name.toLowerCase().includes(needle)) : data) ?? [],
    [data, needle],
  );
  const { items, letterIndex, offsets } = useMemo(() => buildItems(visible), [visible]);

  if (!data) return <QueryState isPending={isPending} error={error} onRetry={refetch} />;

  const jumpTo = (letter: string) => {
    const index = letterIndex.get(letter);
    if (index !== undefined) listRef.current?.scrollToIndex({ index, animated: false });
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        {/* Kept out of the list: the A–Z jumps assume the list has only fixed-height items. */}
        {isMember ? null : (
          <View style={styles.notice}>
            <Text variant="small">A glimpse into the archive. Members can explore every artist.</Text>
            {!session && <Button title="Log in" onPress={() => router.push('/login')} />}
          </View>
        )}
        <View style={styles.search}>
          <Feather name="search" size={16} color={colors.textSubtle} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={`Search ${data.length} artists…`}
            placeholderTextColor={colors.textSubtle}
            selectionColor={colors.accent}
            style={styles.searchInput}
            autoCorrect={false}
            returnKeyType="search"
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={12} accessibilityLabel="Clear search">
              <Feather name="x" size={16} color={colors.textSubtle} />
            </Pressable>
          ) : null}
        </View>

        {/* A–Z: letters without artists (in the current search) are dimmed and disabled */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.alphabet}>
          {ALPHABET.map((letter) => {
            const enabled = letterIndex.has(letter);
            return (
              <Pressable
                key={letter}
                disabled={!enabled}
                onPress={() => jumpTo(letter)}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel={`Jump to ${letter}`}
                style={({ pressed }) => [styles.letter, pressed && styles.letterPressed]}>
                <Text style={[styles.letterText, !enabled && styles.letterDisabled]}>{letter}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(item) => item.key}
        getItemLayout={(_, index) => ({
          length: items[index]?.type === 'header' ? HEADER_HEIGHT : ROW_HEIGHT,
          offset: offsets[index] ?? 0,
          index,
        })}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={20}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.text} />}
        renderItem={({ item }) =>
          item.type === 'header' ? (
            <View style={styles.header}>
              <Text variant="label">{item.letter}</Text>
            </View>
          ) : (
            <ArtistRow artist={item.artist} locked={!isMember} />
          )
        }
        ListEmptyComponent={
          <Text variant="small">{needle ? `No artists match “${query.trim()}”.` : 'No artists yet.'}</Text>
        }
      />
    </View>
  );
}

const ArtistRow = memo(function ArtistRow({ artist, locked }: { artist: Artist; locked: boolean }) {
  const photo = storageUrl('artist_photos', artist.photo_url, PHOTO_SIZE * 3);

  return (
    <Pressable
      disabled={locked}
      onPress={() => router.push({ pathname: '/artists/[id]', params: { id: artist.id } })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, locked && styles.locked]}>
      <Image source={photo} style={styles.photo} contentFit="cover" transition={200} />
      <View style={styles.texts}>
        {/* One line each: rows must keep their fixed height */}
        <Text variant="h3" numberOfLines={1}>
          {artist.name}
        </Text>
        {artist.country ? (
          <Text variant="small" numberOfLines={1}>
            {artist.country}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top: {
    paddingTop: space[3],
    gap: space[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    marginHorizontal: space[5],
    paddingHorizontal: space[4],
    minHeight: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
  },
  alphabet: {
    paddingHorizontal: space[4],
    paddingBottom: space[1],
  },
  letter: {
    minWidth: 30,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xxs,
  },
  letterPressed: {
    backgroundColor: colors.border,
  },
  letterText: {
    fontFamily: fonts.heading,
    fontSize: fontSize.md,
  },
  letterDisabled: {
    color: colors.border,
  },
  list: {
    paddingHorizontal: space[5],
    paddingBottom: space[5],
  },
  notice: {
    gap: space[3],
    marginHorizontal: space[5],
  },
  header: {
    height: HEADER_HEIGHT,
    justifyContent: 'flex-end',
    paddingBottom: space[2],
  },
  row: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
  },
  pressed: {
    opacity: 0.6,
  },
  locked: {
    opacity: 0.4,
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: radius.xxs,
    backgroundColor: colors.surface,
  },
  texts: {
    flex: 1,
    gap: space[1],
  },
});
