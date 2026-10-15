import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { storageUrl } from '@/lib/storage';
import { colors, radius, space } from '@/theme';

import { PlayButton } from './PlayButton';
import { usePlayer } from './PlayerProvider';
import { ProgressBar } from './ProgressBar';

const COVER_SIZE = 40;

// Bar above the tabs while something is playing. Tap it to open the full player.
export function MiniPlayer() {
  const { current, error, next } = usePlayer();
  if (!current) return null;

  return (
    <View style={styles.container}>
      <ProgressBar />
      <Pressable style={styles.row} onPress={() => router.push('/now-playing')}>
        <Image
          source={storageUrl('covers', current.cover_url, COVER_SIZE * 3)}
          style={styles.cover}
          contentFit="cover"
        />
        <View style={styles.texts}>
          <Text numberOfLines={1}>{current.title}</Text>
          <Text variant="small" numberOfLines={1} style={error ? styles.error : undefined}>
            {error ?? current.artist?.name}
          </Text>
        </View>
        <PlayButton />
        <Pressable onPress={next} hitSlop={12} accessibilityRole="button" accessibilityLabel="Next track">
          <Feather name="skip-forward" size={22} color={colors.text} />
        </Pressable>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[4],
    paddingVertical: space[2],
  },
  cover: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: radius.xxs,
    backgroundColor: colors.surface,
  },
  texts: {
    flex: 1,
  },
  error: {
    color: colors.error,
  },
});
