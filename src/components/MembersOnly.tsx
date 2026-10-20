import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { colors, space } from '@/theme';

// App Store / Google Play rules: memberships are sold on the website (Stripe), so the app must not
// link to checkout, show prices or promote the web-only coupon. Like Spotify or Netflix, it only says
// neutrally that a membership can't be started in the app. The website shows the real offer.
export function useMembershipNote() {
  const { profile } = useAuth();
  return profile?.trial_used
    ? 'Membership unlocks the full archive and new music every week. Memberships can’t be started in the app.'
    : 'Your account includes one free month of membership. Memberships can’t be started in the app.';
}

// Shown instead of member-only content. Mirrors frontend/src/components/MembersOnly.
export function MembersOnly() {
  const { session } = useAuth();
  const note = useMembershipNote();

  return (
    <View style={styles.container}>
      <Feather name="lock" size={28} color={colors.text} />
      <Text variant="h2">Members only</Text>
      <Text variant="small" style={styles.description}>
        {session ? note : 'Membership unlocks the full archive and new music every week.'}
      </Text>
      {!session && <Button title="Log in" onPress={() => router.push('/login')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[4],
    padding: space[5],
  },
  description: {
    textAlign: 'center',
  },
});
