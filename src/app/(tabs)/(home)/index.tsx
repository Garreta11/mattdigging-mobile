import { NavRow } from '@/components/NavRow';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';

// Native replacement for the website's 3D room: one card per object in the room.
export default function Home() {
  return (
    <Screen>
      <Text variant="label">Start digging</Text>
      <Text>Rare tracks, hidden gems and weekly selections handpicked for the true music digger.</Text>

      <NavRow href="/hidden-gems" icon="archive" title="Hidden Gems" subtitle="Open the chest" />
      <NavRow
        href={{ pathname: '/playlist', params: { type: 'mood', value: 'lava-lamp' } }}
        icon="sun"
        title="Lava Lamp"
        subtitle="Switch on the lamp"
      />
      <NavRow href="/playlists" icon="sliders" title="Playlists" subtitle="By mood, genre, country, year or season" />
      <NavRow href="/selections" icon="book-open" title="Weekly Selections" subtitle="From the shelf" />
    </Screen>
  );
}
