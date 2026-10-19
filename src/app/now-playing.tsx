import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/Button';
import { FavoriteButton } from '@/components/FavoriteButton';
import { Text } from '@/components/Text';
import { storageUrl } from '@/lib/storage';
import { PlayButton } from '@/player/PlayButton';
import { usePlayer } from '@/player/PlayerProvider';
import { ProgressBar } from '@/player/ProgressBar';
import { colors, radius, space } from '@/theme';

// Full-screen player, opened as a modal from the mini-player.
export default function NowPlaying() {
  const { current, queueName, error, errorStatus, next, previous, isShuffled, toggleShuffle } = usePlayer();
  const { width } = useWindowDimensions();
  const coverSize = Math.min(width - space[5] * 2, 420);

  if (!current) {
    return (
      <View style={styles.center}>
        <Text variant="small">Nothing is playing.</Text>
      </View>
    );
  }

  const meta = [current.album_name, current.year].filter(Boolean).join(' · ');

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: queueName ?? '',
          headerRight: () => (
            <Pressable
              onPress={() => router.push({ pathname: '/track/[id]', params: { id: current.id } })}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Track details">
              <Feather name="info" size={22} color={colors.text} />
            </Pressable>
          ),
        }}
      />

      <Image
        source={storageUrl('covers', current.cover_url, Math.round(coverSize * 3))}
        style={[styles.cover, { width: coverSize, height: coverSize }]}
        contentFit="cover"
        transition={200}
      />

      <View style={styles.texts}>
        <View style={styles.titleRow}>
          <Text variant="h2" numberOfLines={2} style={styles.title}>
            {current.title}
          </Text>
          <FavoriteButton trackId={current.id} size={26} />
        </View>
        {current.artist ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => {
              // Close this modal, then show the artist inside the Artists tab.
              router.dismissAll();
              router.push({ pathname: '/artists/[id]', params: { id: current.artist_id } });
            }}>
            <Text style={styles.artistLink}>{current.artist.name}</Text>
          </Pressable>
        ) : null}
        {meta ? <Text variant="small">{meta}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {/* 401 = not logged in: logging in fixes it. (403 = not a member: the message says so.) */}
        {errorStatus === 401 ? (
          <Button title="Log in" onPress={() => router.push('/login')} style={styles.loginButton} />
        ) : null}
      </View>

      <ProgressBar interactive />

      <View style={styles.controls}>
        {/* Random order on/off: neon with a dot when on, like most music apps. */}
        <Pressable
          onPress={toggleShuffle}
          hitSlop={12}
          style={styles.sideButton}
          accessibilityRole="switch"
          accessibilityState={{ checked: isShuffled }}
          accessibilityLabel="Shuffle">
          <Feather name="shuffle" size={24} color={isShuffled ? colors.accent : colors.textMuted} />
          <View style={[styles.dot, isShuffled && styles.dotOn]} />
        </Pressable>
        <Pressable onPress={previous} hitSlop={12} accessibilityRole="button" accessibilityLabel="Previous track">
          <Feather name="skip-back" size={32} color={colors.text} />
        </Pressable>
        <View style={styles.playCircle}>
          <PlayButton size={32} />
        </View>
        <Pressable onPress={next} hitSlop={12} accessibilityRole="button" accessibilityLabel="Next track">
          <Feather name="skip-forward" size={32} color={colors.text} />
        </Pressable>
        {/* Same width as the shuffle button, so play stays in the centre. */}
        <View style={styles.sideButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: space[5],
    gap: space[5],
  },
  cover: {
    alignSelf: 'center',
    borderRadius: radius.xs,
    backgroundColor: colors.surface,
  },
  texts: {
    gap: space[1],
  },
  error: {
    color: colors.error,
  },
  loginButton: {
    alignSelf: 'flex-start',
    marginTop: space[2],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[3],
  },
  title: {
    flex: 1,
  },
  artistLink: {
    textDecorationLine: 'underline',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[2],
  },
  sideButton: {
    width: 32,
    alignItems: 'center',
    gap: space[1],
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dotOn: {
    backgroundColor: colors.accent,
  },
  playCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
});
