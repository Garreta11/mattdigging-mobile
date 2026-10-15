import { useAudioPlayerStatus } from 'expo-audio';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { colors, space } from '@/theme';

import { usePlayer } from './PlayerProvider';

const formatTime = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

type Props = {
  /** Tap the bar to jump to that point, and show times underneath. */
  interactive?: boolean;
};

// useAudioPlayerStatus re-renders twice a second while playing, so it lives here
// in a small component, not in PlayerProvider (that would re-render the whole app).
export function ProgressBar({ interactive }: Props) {
  const { player } = usePlayer();
  const status = useAudioPlayerStatus(player);
  const [width, setWidth] = useState(0);

  const progress = status.duration > 0 ? Math.min(status.currentTime / status.duration, 1) : 0;

  const bar = (
    <View style={[styles.track, interactive && styles.trackLarge]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <View style={[styles.fill, { width: `${progress * 100}%` }]} />
    </View>
  );

  if (!interactive) return bar;

  return (
    <View style={styles.wrapper}>
      <Pressable
        hitSlop={space[3]}
        onPress={(e) => {
          if (width > 0 && status.duration > 0) player.seekTo((e.nativeEvent.locationX / width) * status.duration);
        }}>
        {bar}
      </Pressable>
      <View style={styles.times}>
        <Text variant="small">{formatTime(status.currentTime)}</Text>
        <Text variant="small">{formatTime(status.duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: space[2],
  },
  track: {
    height: 2,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  trackLarge: {
    height: 4,
    borderRadius: 2,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  times: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
