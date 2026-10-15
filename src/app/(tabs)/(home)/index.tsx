import { StyleSheet, View } from 'react-native';

import { Room } from '@/components/Room';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { space } from '@/theme';

// Home: the website's room. Tap the shelf, the chest, the lava lamp or the picture on the wall.
export default function Home() {
  return (
    <Screen>
      <Room />

      <View style={styles.hint}>
        <Text variant="label">Start digging</Text>
        <Text variant="small">
          Tap the record shelf for weekly selections, the chest for hidden gems, or switch on the lava lamp.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: {
    gap: space[2],
  },
});
