import { Feather } from '@expo/vector-icons';
import { BottomTabBar, Tabs } from 'expo-router/tabs';
import type { ColorValue } from 'react-native';

import { MiniPlayer } from '@/player/MiniPlayer';
import { colors, fonts } from '@/theme';

type IconName = keyof typeof Feather.glyphMap;

const tabIcon = (name: IconName) =>
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Feather name={name} color={color} size={size} />;
  };

// Bottom tab bar. Each <Tabs.Screen name> matches a file or folder in this folder.
// Each tab has its own Stack (its _layout.tsx) that draws the header, so the tabs' own header is hidden.
export default function TabsLayout() {
  return (
    <Tabs
      // Custom tab bar = the mini-player stacked on top of the normal tab bar.
      tabBar={(props) => (
        <>
          <MiniPlayer />
          <BottomTabBar {...props} />
        </>
      )}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarLabelStyle: { fontFamily: fonts.body },
      }}>
      <Tabs.Screen name="(home)" options={{ title: 'Home', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="playlists" options={{ title: 'Playlists', tabBarIcon: tabIcon('disc') }} />
      <Tabs.Screen name="artists" options={{ title: 'Artists', tabBarIcon: tabIcon('users') }} />
      <Tabs.Screen name="selections" options={{ title: 'Selections', tabBarIcon: tabIcon('calendar') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('user') }} />
    </Tabs>
  );
}
