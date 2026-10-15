import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PLAYLIST_FILTERS, usePlaylistOptions, type PlaylistFilter } from '@/api/content';
import { Chip } from '@/components/Chip';
import { QueryState } from '@/components/QueryState';
import { space } from '@/theme';

const FILTER_LABELS: Record<PlaylistFilter, string> = {
  mood: 'Mood',
  genre: 'Genre',
  country: 'Country',
  year: 'Year',
  season: 'Season',
};

// Browse playlists: pick a category, then a chip. Replaces the website's dropdown menus,
// which are awkward on a phone with 100+ options.
export default function Playlists() {
  const [type, setType] = useState<PlaylistFilter>('mood');
  const { options, isPending, error, refetch } = usePlaylistOptions(type);

  return (
    <View style={styles.container}>
      {/* Horizontal row of categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
        {PLAYLIST_FILTERS.map((filter) => (
          <Chip key={filter} label={FILTER_LABELS[filter]} selected={filter === type} onPress={() => setType(filter)} />
        ))}
      </ScrollView>

      {!options ? (
        <QueryState isPending={isPending} error={error} onRetry={refetch} />
      ) : (
        <ScrollView contentContainerStyle={styles.options}>
          {options.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              onPress={() => router.push({ pathname: '/playlist', params: { type, value: option.value } })}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categories: {
    gap: space[2],
    paddingHorizontal: space[5],
    paddingVertical: space[3],
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
    padding: space[5],
    paddingTop: space[2],
  },
});
