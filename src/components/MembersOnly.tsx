import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { colors, space } from '@/theme';

// Shown instead of member-only content. Mirrors frontend/src/components/MembersOnly.
// No "Subscribe" button yet: buying a membership inside the app depends on the
// App Store / Google Play rules (to be decided in a later step).
export function MembersOnly() {
  const { session } = useAuth();

  return (
    <View style={styles.container}>
      <Feather name="lock" size={28} color={colors.text} />
      <Text variant="h2">Members only</Text>
      <Text variant="small" style={styles.description}>
        Membership unlocks the full archive and new music every week.
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
