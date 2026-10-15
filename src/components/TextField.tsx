import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Text } from '@/components/Text';
import { colors, fontSize, fonts, radius, space } from '@/theme';

type Props = TextInputProps & { label: string };

// Label + input, styled like the website's form fields (green border, transparent background).
export function TextField({ label, style, ...rest }: Props) {
  return (
    <View style={styles.field}>
      <Text variant="label">{label}</Text>
      <TextInput
        placeholderTextColor={colors.textSubtle}
        selectionColor={colors.accent}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: space[2],
  },
  input: {
    minHeight: 48,
    paddingHorizontal: space[4],
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.xs,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSize.md,
  },
});
