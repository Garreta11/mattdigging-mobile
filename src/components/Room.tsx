import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View, type DimensionValue } from 'react-native';

import { storageUrl } from '@/lib/storage';
import { usePlayer } from '@/player/PlayerProvider';
import { colors, palette, radius, whiteAlpha } from '@/theme';

// A tappable area of the room photo, as fractions (0–1) of the square image, measured from the top-left.
type Zone = { left: number; top: number; width: number; height: number };

// Same zones as the website's mobile room (frontend/src/components/Room/Output.js),
// converted from "y up from the bottom" to "y down from the top".
const ZONES = {
  shelf: { left: 0.15, top: 0.12, width: 0.4, height: 0.48 }, // record shelf → Weekly Selections
  chest: { left: 0.2, top: 0.62, width: 0.36, height: 0.38 }, // chest under the table → Hidden Gems
  frame: { left: 0.6, top: 0.2, width: 0.3, height: 0.3 }, // picture on the wall → current track
  // The website's lamp zone is 5% wide: fine for a mouse, too small for a finger, so it is a bit wider here.
  lamp: { left: 0.87, top: 0.4, width: 0.11, height: 0.2 }, // lava lamp → Lava Lamp playlist
} satisfies Record<string, Zone>;

// Inside of the picture frame, where the playing track's cover is shown (like the website).
const COVER_AREA: Zone = { left: 0.628, top: 0.222, width: 0.233, height: 0.233 };

const pct = (fraction: number): DimensionValue => `${fraction * 100}%`;
const position = (zone: Zone) => ({
  left: pct(zone.left),
  top: pct(zone.top),
  width: pct(zone.width),
  height: pct(zone.height),
});

// The website's home page on mobile: a photo of the room where each object opens a section.
export function Room() {
  const { current } = usePlayer();
  const cover = storageUrl('covers', current?.cover_url, 400);

  return (
    <View style={styles.room}>
      <Image source={require('../../assets/images/room.jpg')} style={StyleSheet.absoluteFill} contentFit="cover" />

      {/* The playing track's cover appears inside the picture frame on the wall. */}
      {cover ? (
        <Image source={cover} style={[styles.cover, position(COVER_AREA)]} contentFit="cover" transition={400} />
      ) : null}

      {/* Film-style border on top of the photo. pointerEvents="none": it never blocks taps. */}
      <Image
        source={require('../../assets/images/room-frame.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        pointerEvents="none"
      />

      <Hotspot zone={ZONES.shelf} label="Weekly Selections" href="/selections" />
      <Hotspot zone={ZONES.chest} label="Hidden Gems" href="/hidden-gems" />
      <Hotspot
        zone={ZONES.lamp}
        label="Lava Lamp playlist"
        href={{ pathname: '/playlists/playlist', params: { type: 'mood', value: 'lava-lamp' } }}
      />
      {current ? (
        <Hotspot
          zone={ZONES.frame}
          label={`Details for ${current.title}`}
          href={{ pathname: '/track/[id]', params: { id: current.id } }}
        />
      ) : null}
    </View>
  );
}

// Invisible button over an object in the photo. Lights up softly while pressed.
function Hotspot({ zone, label, href }: { zone: Zone; label: string; href: Href }) {
  return (
    <Pressable
      onPress={() => router.push(href)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.hotspot, position(zone), pressed && styles.hotspotPressed]}
    />
  );
}

const styles = StyleSheet.create({
  room: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  cover: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: palette.black,
  },
  hotspot: {
    position: 'absolute',
    borderRadius: radius.xxs,
  },
  hotspotPressed: {
    backgroundColor: whiteAlpha(0.15),
  },
});
