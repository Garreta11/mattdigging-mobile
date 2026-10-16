import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/theme';

export default function ProfileStack() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Profile' }} />
      <Stack.Screen name="favorites" options={{ title: 'Favourite tracks' }} />
    </Stack>
  );
}
