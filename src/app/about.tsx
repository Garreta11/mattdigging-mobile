import { Image } from 'expo-image';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { colors, radius, space } from '@/theme';

// Text from frontend/src/pages/About/About.tsx.
const PARAGRAPHS = [
  'Happy you found your way into this space of vintage sounds with soul. Hand-picked gems, curated by a digging nerd. Want to pay homage with this site to musical heritage from all over the world, giving your heart and ears some great variety of emotions, impressions and love. This living room can be your space and supporter for any mood and emotional state you might be in.',
  "Get a deep look into my collection. Over the past two decades I gathered thousands and thousands of sweet tracks, coming from over 1500 records and endless other releases. Now it's time to share those goodies with each other.",
  'A lush and infinite source of digging pleasure is waiting for you to be discovered, with one new selection (containing a playlist of 10 well curated songs) adding up to the library each week. Happy Sundays!',
  'A constantly evolving collection of moods, countries and genres will be accessible through plenty of different playlists and weekly selections. Also, if you pay attention, you can discover all sorts of musical obscurities (hidden gems).',
  'Sit back, relax and enjoy the dive into the wonderful world of sounds, curated by a music enthusiast.',
];

export default function About() {
  const { width } = useWindowDimensions();

  return (
    <Screen>
      {/* Bundled with the app (assets/images), so it shows instantly and offline. */}
      <Image
        source={require('../../assets/images/about.jpg')}
        style={[styles.image, { height: (width - space[5] * 2) * 1.1 }]}
        contentFit="cover"
      />
      <Text variant="h2">Welcome dear music lovers & listeners,</Text>
      {PARAGRAPHS.map((paragraph) => (
        <Text key={paragraph.slice(0, 20)}>{paragraph}</Text>
      ))}
      <Text style={styles.italic}>Much love,</Text>
      <Text variant="h3">Matti / mattmosphere</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    borderRadius: radius.xs,
    backgroundColor: colors.surface,
  },
  italic: {
    fontStyle: 'italic',
  },
});
