import Constants from 'expo-constants';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/Button';
import { ListGroup, ListRow } from '@/components/ListGroup';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { env } from '@/lib/env';
import { colors, radius, space } from '@/theme';

// Shown in the footer; handy when someone reports a bug.
const APP_VERSION = Constants.expoConfig?.version ?? '';

export default function Profile() {
  const { session, isReady, profile, isMember, signOut } = useAuth();

  return (
    <Screen>
      {!isReady ? (
        <ActivityIndicator color={colors.text} />
      ) : session ? (
        <View style={styles.group}>
          <Text variant="label">Account</Text>
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
        </View>
      ) : (
        <ListGroup title="Account">
          <ListRow href="/login" icon="log-in" title="Log in" subtitle="Or create an account" />
        </ListGroup>
      )}

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

const styles = StyleSheet.create({
  group: {
    gap: space[2],
  },
  card: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.xs,
    backgroundColor: colors.surface,
  },
  logout: {
    marginTop: space[3],
  },
  footer: {
    textAlign: 'center',
    color: colors.textSubtle,
    marginTop: space[4],
  },
});
