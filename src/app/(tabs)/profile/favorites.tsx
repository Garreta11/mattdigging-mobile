import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useFavoriteTracks } from '@/api/favorites';
import { Button } from '@/components/Button';
import { FAVORITES_QUEUE_NAME, FavoriteTrackList } from '@/components/FavoriteTrackList';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { usePlayer } from '@/player/PlayerProvider';
import { colors } from '@/theme';

// All favourite tracks, newest first ("See all" from Profile).
export default function Favorites() {
  const { favorites, isLoading } = useFavoriteTracks();
  const { playQueue } = usePlayer();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  return (
    <Screen>
      {favorites.length === 0 ? (
        <Text variant="small">No favourites yet. Tap the ♡ on any track to save it here.</Text>
      ) : (
        <>
          <View style={styles.header}>
            <Text variant="label">{favorites.length} tracks</Text>
            <Button title="Play all" icon="play" onPress={() => playQueue(favorites, 0, FAVORITES_QUEUE_NAME)} />
          </View>
          <View>
            <FavoriteTrackList favorites={favorites} />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
