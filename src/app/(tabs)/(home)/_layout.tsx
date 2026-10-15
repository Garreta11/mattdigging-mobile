import { Feather } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { Pressable } from 'react-native';

import { colors, stackScreenOptions } from '@/theme';

function SearchButton() {
  return (
    <Pressable onPress={() => router.push('/search')} hitSlop={12} accessibilityRole="button" accessibilityLabel="Search">
      <Feather name="search" size={22} color={colors.text} />
    </Pressable>
  );
}

// Each tab has its own Stack, so opening a screen keeps the tab bar and mini-player visible.
export default function HomeStack() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Mattdigging', headerRight: SearchButton }} />
      <Stack.Screen name="search" options={{ title: 'Search' }} />
      <Stack.Screen name="hidden-gems" options={{ title: 'Hidden Gems' }} />
      <Stack.Screen name="playlists" options={{ title: 'Playlists' }} />
      <Stack.Screen name="playlist" options={{ title: '' }} />
    </Stack>
  );
}
