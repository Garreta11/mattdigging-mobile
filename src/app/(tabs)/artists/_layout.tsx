import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/theme';

export default function ArtistsStack() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Artists' }} />
      <Stack.Screen name="[id]" options={{ title: '' }} />
    </Stack>
  );
}
