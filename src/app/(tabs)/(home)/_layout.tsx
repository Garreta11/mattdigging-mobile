import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
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

// The Mattdigging badge instead of a text title.
function HeaderLogo() {
  return (
    <Image
      source={require('../../../../assets/images/logo.png')}
      style={{ width: 40, height: 40 }}
      contentFit="contain"
      accessibilityLabel="Mattdigging"
    />
  );
}

// Each tab has its own Stack, so opening a screen keeps the tab bar and mini-player visible.
export default function HomeStack() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Mattdigging', // still used by screen readers and the back button
          headerTitle: HeaderLogo,
          headerTitleAlign: 'center', // Android left-aligns titles by default
          headerRight: SearchButton,
        }}
      />
      <Stack.Screen name="search" options={{ title: 'Search' }} />
      <Stack.Screen name="hidden-gems" options={{ title: 'Hidden Gems' }} />
    </Stack>
  );
}
