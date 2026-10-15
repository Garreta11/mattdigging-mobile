import { Image } from 'expo-image';
import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, RefreshControl, SectionList, StyleSheet, View } from 'react-native';

import { useArtists } from '@/api/content';
import type { Artist } from '@/api/types';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/Button';
import { QueryState } from '@/components/QueryState';
import { Text } from '@/components/Text';
import { storageUrl } from '@/lib/storage';
import { colors, radius, space } from '@/theme';

const PHOTO_SIZE = 56;

// "Åsa" → "A", "2Pac" → "#": the letter an artist is listed under.
const letterOf = (name: string) => {
  const letter = name.trim().charAt(0).normalize('NFD').charAt(0).toUpperCase();
  return /[A-Z]/.test(letter) ? letter : '#';
};

export default function Artists() {
  const { data, isPending, error, refetch, isRefetching } = useArtists();
  const { session, isMember } = useAuth();

  if (!data) return <QueryState isPending={isPending} error={error} onRetry={refetch} />;

  // Group the (already alphabetical) list into one section per letter, like the website.
  const sections: { title: string; data: Artist[] }[] = [];
  for (const artist of data) {
    const letter = letterOf(artist.name);
    const last = sections[sections.length - 1];
    if (last?.title === letter) last.data.push(artist);
    else sections.push({ title: letter, data: [artist] });
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(artist) => artist.id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.text} />}
      // Long list: render a bit at a time instead of all 675 rows at once.
      initialNumToRender={20}
      ListHeaderComponent={
        isMember ? null : (
          <View style={styles.notice}>
            <Text variant="small">A glimpse into the archive. Members can explore every artist.</Text>
            {!session && <Button title="Log in" onPress={() => router.push('/login')} />}
          </View>
        )
      }
      renderSectionHeader={({ section }) => (
        <Text variant="label" style={styles.sectionHeader}>
          {section.title}
        </Text>
      )}
      renderItem={({ item }) => <ArtistRow artist={item} locked={!isMember} />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={<Text variant="small">No artists yet.</Text>}
    />
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
        <Text variant="h3">{artist.name}</Text>
        {artist.country ? <Text variant="small">{artist.country}</Text> : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  list: {
    padding: space[5],
  },
  notice: {
    gap: space[3],
  },
  sectionHeader: {
    paddingTop: space[5],
    paddingBottom: space[2],
    backgroundColor: colors.background,
  },
  separator: {
    height: space[3],
  },
  row: {
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
