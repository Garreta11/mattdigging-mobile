import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { useHiddenGems } from '@/api/content';
import { useAuth } from '@/auth/AuthProvider';
import { MembersOnly } from '@/components/MembersOnly';
import { QueryState } from '@/components/QueryState';
import { Text } from '@/components/Text';
import { TrackRow } from '@/components/TrackRow';
import { usePlayer } from '@/player/PlayerProvider';
import { colors, space } from '@/theme';

export default function HiddenGems() {
  const { isReady, isMember } = useAuth();

  // Wait for the saved login to load, so members never see a flash of "Members only".
  if (!isReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }
  if (!isMember) return <MembersOnly />;
  return <HiddenGemsTracks />;
}

// Separate component so the request only happens for members.
function HiddenGemsTracks() {
  const { data, isPending, error, refetch } = useHiddenGems();
  const { current, playQueue } = usePlayer();

  if (!data) return <QueryState isPending={isPending} error={error} onRetry={refetch} />;

  return (
    <FlatList
      data={data.tracks}
      keyExtractor={(track) => track.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <Text variant="small" style={styles.header}>
          New additions every first of the month
        </Text>
      }
      renderItem={({ item, index }) => (
        <TrackRow
          track={item}
          index={index}
          isActive={current?.id === item.id}
          onPress={() => playQueue(data.tracks, index, 'Hidden Gems')}
        />
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
  header: {
    marginBottom: space[4],
  },
});
