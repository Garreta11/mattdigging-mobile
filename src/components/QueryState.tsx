import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { colors, space } from '@/theme';

type Props = {
  isPending: boolean;
  error: Error | null;
  onRetry: () => void;
};

// Full-screen loading spinner or error message with a retry button.
// Returns null once data is ready, so screens can do: `if (!data) return <QueryState … />`.
export function QueryState({ isPending, error, onRetry }: Props) {
  if (isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text variant="small">{error.message}</Text>
        <Button title="Try again" onPress={onRetry} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[4],
    padding: space[5],
  },
});
