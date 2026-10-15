import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import type { Selection } from '@/api/types';
import { storageUrl } from '@/lib/storage';
import { colors, palette, radius } from '@/theme';

// Same artwork as the website's <canvas> SelectionCover: up to 3 circular track covers
// on a yellow square, the first one big in the middle and two faded ones behind it.
// Here it is just absolutely positioned images; no canvas needed.
export function SelectionCover({ selection, size = 80 }: { selection: Selection; size?: number }) {
  const covers = (selection.selection_tracks ?? [])
    .map((st) => st.tracks?.cover_url)
    .filter(Boolean)
    .slice(0, 3)
    .map((path) => storageUrl('covers', path, Math.round(size * 0.64 * 3)));

  const circle = (diameter: number, centerX: number, opacity: number) => ({
    position: 'absolute' as const,
    width: diameter,
    height: diameter,
    borderRadius: diameter / 2,
    left: centerX - diameter / 2,
    top: size / 2 - diameter / 2,
    opacity,
    borderWidth: 1.5,
    borderColor: palette.green,
  });

  const big = size * 0.64;
  const small = size * 0.44;
  const offset = size * 0.25;

  return (
    <View style={[styles.square, { width: size, height: size }, covers.length === 0 && styles.empty]}>
      {covers[1] && <Image source={covers[1]} style={circle(small, size / 2 - offset, 0.7)} />}
      {covers[2] && <Image source={covers[2]} style={circle(small, size / 2 + offset, 0.7)} />}
      {covers[0] && <Image source={covers[0]} style={circle(big, size / 2, 1)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  square: {
    backgroundColor: palette.yellow,
    borderRadius: radius.xxs,
    overflow: 'hidden',
  },
  empty: {
    backgroundColor: colors.surface,
  },
});
