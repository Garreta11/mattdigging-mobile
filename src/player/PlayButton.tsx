import { Feather } from '@expo/vector-icons';
import { useAudioPlayerStatus } from 'expo-audio';
import { ActivityIndicator, Pressable } from 'react-native';

import { colors } from '@/theme';

import { usePlayer } from './PlayerProvider';

// Play/pause that shows a spinner while the track is loading or buffering.
export function PlayButton({ size = 24 }: { size?: number }) {
  const { player, isLoading, togglePlay } = usePlayer();
  const status = useAudioPlayerStatus(player);

  if (isLoading || (status.isBuffering && !status.playing)) {
    return <ActivityIndicator color={colors.text} style={{ width: size, height: size }} />;
  }

  return (
    <Pressable onPress={togglePlay} hitSlop={12} accessibilityRole="button" accessibilityLabel={status.playing ? 'Pause' : 'Play'}>
      <Feather name={status.playing ? 'pause' : 'play'} size={size} color={colors.text} />
    </Pressable>
  );
}
