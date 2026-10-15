import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { space } from '@/theme';

// Scrollable page body with the standard padding. Most screens start with this.
// keyboardShouldPersistTaps: tapping a button while the keyboard is open presses it
// (instead of only closing the keyboard). automaticallyAdjustKeyboardInsets: iOS scrolls
// focused inputs above the keyboard.
export function Screen({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: space[5],
    gap: space[4],
  },
});
