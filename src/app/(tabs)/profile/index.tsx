import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/Button';
import { NavRow } from '@/components/NavRow';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { colors, radius, space } from '@/theme';

export default function Profile() {
  const { session, isReady, profile, isMember, signOut } = useAuth();

  return (
    <Screen>
      <Text variant="label">Account</Text>

      {!isReady ? (
        <ActivityIndicator color={colors.text} />
      ) : session ? (
        <View style={styles.card}>
          {profile?.username ? <Text variant="h3">@{profile.username}</Text> : null}
          <Text>{session.user.email}</Text>
          <Text variant="small">
            {isMember
              ? `Member${profile?.subscription_type ? ` · ${profile.subscription_type}` : ''}`
              : 'Not a member yet'}
          </Text>
          {isMember && profile?.member_since ? (
            <Text variant="small">Since {new Date(profile.member_since).toLocaleDateString()}</Text>
          ) : null}
          <Button variant="outline" title="Log out" onPress={signOut} style={styles.logout} />
        </View>
      ) : (
        <NavRow href="/login" icon="log-in" title="Log in" subtitle="Or create an account" />
      )}

      <Text variant="label">Mattdigging</Text>
      <NavRow href="/about" icon="info" title="About" />
      <NavRow href="/terms" icon="file-text" title="Terms" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  logout: {
    marginTop: space[3],
  },
});
