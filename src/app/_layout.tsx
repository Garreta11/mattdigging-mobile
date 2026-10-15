import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider } from '@/auth/AuthProvider';
import { PlayerProvider } from '@/player/PlayerProvider';
import { fontAssets, stackScreenOptions } from '@/theme';

// Keep the splash screen visible until the fonts are ready,
// otherwise the first frame flashes in the system font.
SplashScreen.preventAutoHideAsync();

// Shared cache for all backend data (see src/api/content.ts).
// Data counts as fresh for 5 minutes, matching the backend's Cache-Control.
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  // The root Stack holds the tabs (each with its own Stack inside) and the screens
  // that should cover the tab bar: modals, About and Terms.
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PlayerProvider>
          <StatusBar style="light" />
          <Stack screenOptions={stackScreenOptions}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="about" options={{ title: 'About' }} />
            <Stack.Screen name="terms" options={{ title: 'Terms' }} />
            <Stack.Screen name="login" options={{ title: 'Log in', presentation: 'modal' }} />
            <Stack.Screen name="now-playing" options={{ title: '', presentation: 'modal' }} />
            <Stack.Screen name="track/[id]" options={{ title: '', presentation: 'modal' }} />
          </Stack>
        </PlayerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
