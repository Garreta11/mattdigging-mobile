import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, View } from 'react-native';

import { useFavoriteIds, useFavoriteTracks } from '@/api/favorites';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/Button';
import { FAVORITES_QUEUE_NAME, FavoriteTrackList } from '@/components/FavoriteTrackList';
import { ListGroup, ListRow } from '@/components/ListGroup';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { env } from '@/lib/env';
import { usePlayer } from '@/player/PlayerProvider';
import { colors, fonts, radius, space } from '@/theme';

// Shown in the footer; handy when someone reports a bug.
const APP_VERSION = Constants.expoConfig?.version ?? '';
// Profile shows the latest few favourites; "See all" opens the full list.
const FAVORITES_PREVIEW = 5;

export default function Profile() {
  const { session, isReady, profile, isMember, signOut } = useAuth();

  if (!isReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  return (
    <Screen>
      {session ? <AccountHeader /> : <Welcome />}

      {isMember ? <FavoritesPreview /> : null}

      {session ? (
        <ListGroup title="Account">
          {isMember && profile?.member_since ? (
            <ListRow
              icon="calendar"
              title="Member since"
              subtitle={new Date(profile.member_since).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            />
          ) : null}
          <ListRow icon="log-out" title="Log out" danger onPress={signOut} />
          <DeleteAccountRow />
        </ListGroup>
      ) : null}

      <ListGroup title="Mattdigging">
        <ListRow href="/about" icon="info" title="About" subtitle="The story behind the collection" />
        <ListRow href="/terms" icon="file-text" title="Terms & Conditions" subtitle="English · Deutsch" />
        <ListRow
          icon="globe"
          title="Visit mattdigging.com"
          external
          // Opens in the phone's browser, outside the app.
          onPress={() => Linking.openURL(env.websiteUrl)}
        />
      </ListGroup>

      <Text variant="small" style={styles.footer}>
        Mattdigging{APP_VERSION ? ` · v${APP_VERSION}` : ''}
      </Text>
    </Screen>
  );
}

// Avatar with the initial, name, email and membership badge.
function AccountHeader() {
  const { session, profile, isMember } = useAuth();
  const email = session?.user.email ?? '';
  const name = profile?.username ? `@${profile.username}` : email;
  const initial = (profile?.username || email || '?').charAt(0).toUpperCase();
  const plan = profile?.subscription_type;

  return (
    <View style={styles.header}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.headerTexts}>
        <Text variant="h3" numberOfLines={1}>
          {name}
        </Text>
        {profile?.username ? (
          <Text variant="small" numberOfLines={1}>
            {email}
          </Text>
        ) : null}
        <View style={[styles.badge, isMember && styles.badgeMember]}>
          <Text variant="label" style={[styles.badgeText, isMember && styles.badgeTextMember]}>
            {isMember ? `Member${plan ? ` · ${plan}` : ''}` : 'Free account'}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Logged out: a short welcome instead of an empty account section.
function Welcome() {
  return (
    <View style={styles.welcome}>
      <Image
        source={require('../../../../assets/images/logo.png')}
        style={styles.welcomeLogo}
        contentFit="contain"
        accessibilityLabel="Mattdigging"
      />
      <Text variant="h2" style={styles.centerText}>
        Welcome, digger
      </Text>
      <Text variant="small" style={styles.centerText}>
        Log in to keep your favourite tracks and, as a member, explore the whole archive.
      </Text>
      <Button title="Log in" icon="log-in" onPress={() => router.push('/login')} style={styles.welcomeButton} />
    </View>
  );
}

// Latest favourites with "Play all"; the full list is one tap away.
function FavoritesPreview() {
  const { canFavorite } = useFavoriteIds();
  const { favorites, isLoading } = useFavoriteTracks();
  const { playQueue } = usePlayer();
  if (!canFavorite) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text variant="label">Favourite tracks</Text>
        {favorites.length > 0 && (
          <Pressable
            onPress={() => playQueue(favorites, 0, FAVORITES_QUEUE_NAME)}
            hitSlop={12}
            accessibilityRole="button"
            style={styles.playAll}>
            <Feather name="play" size={14} color={colors.accent} />
            <Text variant="label" style={styles.accent}>
              Play all
            </Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.text} />
      ) : favorites.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="heart" size={20} color={colors.textSubtle} />
          <Text variant="small" style={styles.emptyText}>
            No favourites yet. Tap the ♡ on any track to save it here.
          </Text>
        </View>
      ) : (
        <View>
          <FavoriteTrackList favorites={favorites} limit={FAVORITES_PREVIEW} />
          {favorites.length > FAVORITES_PREVIEW && (
            <Pressable
              onPress={() => router.push('/profile/favorites')}
              style={({ pressed }) => [styles.seeAll, pressed && styles.pressed]}
              accessibilityRole="button">
              <Text>See all {favorites.length} favourites</Text>
              <Feather name="chevron-right" size={18} color={colors.textSubtle} />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const AVATAR_SIZE = 64;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    paddingVertical: space[2],
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  avatarText: {
    fontFamily: fonts.heading,
    fontSize: 28,
    lineHeight: 34,
  },
  headerTexts: {
    flex: 1,
    gap: space[1],
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: space[1],
    paddingVertical: 2,
    paddingHorizontal: space[2],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeMember: {
    borderColor: colors.accent,
  },
  badgeText: {
    fontSize: 11,
    letterSpacing: 1,
  },
  badgeTextMember: {
    color: colors.accent,
  },
  welcome: {
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[4],
  },
  welcomeLogo: {
    width: 88,
    height: 88,
    marginBottom: space[2],
  },
  welcomeButton: {
    alignSelf: 'stretch',
    marginTop: space[2],
  },
  section: {
    gap: space[2],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
  },
  accent: {
    color: colors.accent,
  },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[4],
    borderRadius: radius.xs,
    backgroundColor: colors.surface,
  },
  emptyText: {
    flex: 1,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    marginTop: space[1],
    paddingHorizontal: space[4],
    borderRadius: radius.xs,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.6,
  },
  footer: {
    textAlign: 'center',
    color: colors.textSubtle,
    marginTop: space[2],
  },
});

// Required by the App Store and Google Play: users must be able to delete their account in the app.
// Two-step confirmation, because it cannot be undone.
function DeleteAccountRow() {
  const { deleteAccount, isMember } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = () =>
    Alert.alert(
      'Delete account?',
      [
        'Your account, favourites and login will be deleted permanently. This cannot be undone.',
        isMember ? 'Your membership will be cancelled immediately and will not renew.' : '',
      ]
        .filter(Boolean)
        .join('\n\n'),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
              Alert.alert('Account deleted', 'Your account and data have been deleted.');
            } catch (err) {
              setDeleting(false);
              Alert.alert(
                'Could not delete your account',
                `${err instanceof Error ? err.message : 'Please try again.'}\n\nYou can also write to mattdigging@gmx.de.`,
              );
            }
          },
        },
      ],
    );

  return (
    <ListRow
      icon="trash-2"
      title={deleting ? 'Deleting account…' : 'Delete account'}
      subtitle="Permanently delete your account and data"
      danger
      onPress={deleting ? undefined : confirmDelete}
    />
  );
}
