import { ScrollView, StyleSheet, View } from 'react-native';

import { usePlayerTracks } from '@/api/content';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/Button';
import { Room } from '@/components/Room';
import { Text } from '@/components/Text';
import { shuffle } from '@/lib/shuffle';
import { usePlayer } from '@/player/PlayerProvider';
import { space } from '@/theme';

// Home: the website's room. Tap the shelf, the chest, the lava lamp or the picture on the wall.
export default function Home() {
  const { isReady, isMember } = useAuth();
  const { playQueue } = usePlayer();
  // Wait until we know who is logged in, so members never get the free-only list.
  const { data: tracks, isPending, error, refetch } = usePlayerTracks(isMember, isReady);

  // Same as the website's "click to play a random track" with shuffle on:
  // a random order, no repeats until everything has played, "previous" goes back.
  const playRandom = () => {
    if (tracks?.length) playQueue(shuffle(tracks), 0, 'Random');
    else refetch();
  };

  return (
    // flexGrow + justifyContent: the room sits in the middle of the screen,
    // and still scrolls on phones too short to fit it.
    <ScrollView contentContainerStyle={styles.content}>
      <Room />

      <Button
        title="Play a random track"
        icon="shuffle"
        onPress={playRandom}
        loading={!isReady || (isPending && !error)}
        style={styles.play}
      />

      <View style={styles.hint}>
        <Text variant="label">Start digging</Text>
        <Text variant="small" style={styles.hintText}>
          Tap the record shelf for weekly selections, the chest for hidden gems, or switch on the lava lamp.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: space[5],
    gap: space[5],
  },
  play: {
    alignSelf: 'center',
  },
  hint: {
    alignItems: 'center',
    gap: space[2],
  },
  hintText: {
    textAlign: 'center',
  },
});
