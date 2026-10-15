import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/theme';

export default function SelectionsStack() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Weekly Selections' }} />
      <Stack.Screen name="[id]" options={{ title: '' }} />
    </Stack>
  );
}
