import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { PLAYLIST_FILTERS, usePlaylistOptions, type PlaylistFilter } from '@/api/content';
import { QueryState } from '@/components/QueryState';
import { Text } from '@/components/Text';
import { colors, fontSize, fonts, radius, space } from '@/theme';

const FILTER_LABELS: Record<PlaylistFilter, { tab: string; plural: string }> = {
  mood: { tab: 'Mood', plural: 'moods' },
  genre: { tab: 'Genre', plural: 'genres' },
  country: { tab: 'Country', plural: 'countries' },
  year: { tab: 'Year', plural: 'years' },
  season: { tab: 'Season', plural: 'seasons' },
};

// Short lists (the 4 seasons) don't need a filter field.
const MIN_OPTIONS_FOR_FILTER = 10;

// Browse playlists: pick a category tab, then an item from the list.
export default function Playlists() {
  const [type, setType] = useState<PlaylistFilter>('mood');
  const [filter, setFilter] = useState('');
  const { options, isPending, error, refetch } = usePlaylistOptions(type);

  const selectType = (next: PlaylistFilter) => {
    setType(next);
    setFilter('');
  };

  const needle = filter.trim().toLowerCase();
  const visible = needle ? options?.filter((o) => o.label.toLowerCase().includes(needle)) : options;
  const labels = FILTER_LABELS[type];

  return (
    <View style={styles.container}>
      {/* Category tabs: text with an underline under the active one */}
      <View style={styles.tabs} accessibilityRole="tablist">
        {PLAYLIST_FILTERS.map((item) => {
          const active = item === type;
          return (
            <Pressable
              key={item}
              onPress={() => selectType(item)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={[styles.tab, active && styles.tabActive]}>
              <Text variant="label" numberOfLines={1} style={[styles.tabText, active && styles.tabTextActive]}>
                {FILTER_LABELS[item].tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!options ? (
        <QueryState isPending={isPending} error={error} onRetry={refetch} />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(option) => option.value}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListHeaderComponent={
            options.length >= MIN_OPTIONS_FOR_FILTER ? (
              <View style={styles.filter}>
                <Feather name="search" size={16} color={colors.textSubtle} />
                <TextInput
                  value={filter}
                  onChangeText={setFilter}
                  placeholder={`Filter ${options.length} ${labels.plural}…`}
                  placeholderTextColor={colors.textSubtle}
                  selectionColor={colors.accent}
                  style={styles.filterInput}
                  autoCorrect={false}
                />
                {filter ? (
                  <Pressable onPress={() => setFilter('')} hitSlop={12} accessibilityLabel="Clear filter">
                    <Feather name="x" size={16} color={colors.textSubtle} />
                  </Pressable>
                ) : null}
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: '/playlists/playlist', params: { type, value: item.value } })}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <Text style={styles.rowText} numberOfLines={1}>
                {item.label}
              </Text>
              <Feather name="chevron-right" size={18} color={colors.textSubtle} />
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<Text variant="small">No {labels.plural} match “{filter.trim()}”.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: space[5],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: space[3],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -StyleSheet.hairlineWidth,
  },
  tabActive: {
    borderBottomColor: colors.accent,
  },
  // Smaller than the default label so five tabs fit on narrow phones.
  tabText: {
    fontSize: fontSize.xs,
    letterSpacing: 1,
  },
  tabTextActive: {
    color: colors.text,
  },
  list: {
    paddingHorizontal: space[5],
    paddingBottom: space[5],
  },
  filter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    marginTop: space[4],
    marginBottom: space[2],
    paddingHorizontal: space[4],
    minHeight: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  filterInput: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: 52,
  },
  pressed: {
    opacity: 0.6,
  },
  rowText: {
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
