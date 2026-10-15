import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/theme';

export default function PlaylistsStack() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Playlists' }} />
      <Stack.Screen name="playlist" options={{ title: '' }} />
    </Stack>
  );
}
