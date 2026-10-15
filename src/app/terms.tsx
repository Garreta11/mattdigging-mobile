import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { termsContent, type TermsLang } from '@/content/terms';
import { colors, space } from '@/theme';

// Same content and EN/DE toggle as the website's /terms page.
export default function Terms() {
  const [lang, setLang] = useState<TermsLang>('en');
  const t = termsContent[lang];

  return (
    <Screen>
      <View style={styles.top}>
        <Text variant="label">{t.label}</Text>
        <View style={styles.langs}>
          <Chip label="EN" selected={lang === 'en'} onPress={() => setLang('en')} />
          <Chip label="DE" selected={lang === 'de'} onPress={() => setLang('de')} />
        </View>
      </View>

      <View>
        <Text variant="h1">{t.title}</Text>
        <Text variant="small">{t.subtitle}</Text>
      </View>

      {t.sections.map((section) => (
        <View key={section.number} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="label" style={styles.number}>
              {section.number}
            </Text>
            <Text variant="h3" style={styles.sectionTitle}>
              {section.title}
            </Text>
          </View>
          {section.items.map((item, i) => (
            <View key={i} style={styles.item}>
              <Text variant="small" style={styles.itemNumber}>
                {i + 1}.
              </Text>
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  langs: {
    flexDirection: 'row',
    gap: space[2],
  },
  section: {
    gap: space[2],
    paddingTop: space[4],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space[3],
  },
  number: {
    color: colors.accent,
  },
  sectionTitle: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    gap: space[2],
  },
  itemNumber: {
    width: 20,
    lineHeight: 24,
  },
  itemText: {
    flex: 1,
  },
});
