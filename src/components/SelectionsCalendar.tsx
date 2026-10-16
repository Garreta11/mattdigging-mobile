import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Selection } from '@/api/types';
import { openSelection, SelectionCard } from '@/components/SelectionCard';
import { Text } from '@/components/Text';
import { colors, radius, space } from '@/theme';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Months are counted as one number (year * 12 + month) so "next month" is just + 1.
const monthKey = (date: Date) => date.getFullYear() * 12 + date.getMonth();
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * Month calendar of weekly selections (the website's calendar view).
 * The day a selection is published is marked: green = available, outlined = coming soon.
 */
export function SelectionsCalendar({ selections }: { selections: Selection[] }) {
  const dated = selections.map((s) => ({ selection: s, date: new Date(s.published_at) }));
  const months = dated.map((d) => monthKey(d.date));
  const first = Math.min(...months);
  const last = Math.max(...months);

  // Start on the month of the latest available selection (or the last month with anything).
  const published = dated.filter((d) => d.selection.is_published);
  const latestPublished = published[published.length - 1];
  const [month, setMonth] = useState(latestPublished ? monthKey(latestPublished.date) : last);

  const year = Math.floor(month / 12);
  const monthIndex = month % 12;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  // Weeks start on Monday: getDay() is 0 for Sunday, so shift by 6.
  const leadingBlanks = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);

  const inMonth = dated.filter((d) => monthKey(d.date) === month).sort((a, b) => a.date.getTime() - b.date.getTime());
  const selectionOn = (day: number) => inMonth.find((d) => sameDay(d.date, new Date(year, monthIndex, day)));
  const today = new Date();
  const title = new Date(year, monthIndex, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <View style={styles.container}>
      <View style={styles.monthBar}>
        <MonthArrow icon="chevron-left" label="Previous month" disabled={month <= first} onPress={() => setMonth(month - 1)} />
        <Text variant="h3">{title}</Text>
        <MonthArrow icon="chevron-right" label="Next month" disabled={month >= last} onPress={() => setMonth(month + 1)} />
      </View>

      <View style={styles.grid}>
        {WEEKDAYS.map((d, i) => (
          <View key={`w${i}`} style={styles.cell}>
            <Text variant="label" style={styles.weekday}>
              {d}
            </Text>
          </View>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <View key={`b${i}`} style={styles.cell} />;
          const entry = selectionOn(day);
          const isToday = sameDay(today, new Date(year, monthIndex, day));
          return (
            <View key={`d${day}`} style={styles.cell}>
              <Pressable
                disabled={!entry?.selection.is_published}
                onPress={() => entry && openSelection(entry.selection)}
                accessibilityRole={entry ? 'button' : undefined}
                accessibilityLabel={entry ? `${entry.selection.title}, ${day} ${title}` : undefined}
                style={({ pressed }) => [
                  styles.day,
                  entry?.selection.is_published && styles.dayPublished,
                  entry && !entry.selection.is_published && styles.dayUpcoming,
                  isToday && !entry && styles.dayToday,
                  pressed && styles.pressed,
                ]}>
                <Text variant="small" style={entry ? styles.dayTextMarked : styles.dayText}>
                  {day}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        <LegendDot style={styles.dayPublished} label="Available" />
        <LegendDot style={styles.dayUpcoming} label="Coming soon" />
      </View>

      <View style={styles.monthList}>
        {inMonth.length === 0 ? (
          <Text variant="small">No selections this month.</Text>
        ) : (
          inMonth.map(({ selection }) => <SelectionCard key={selection.id} selection={selection} />)
        )}
      </View>
    </View>
  );
}

function MonthArrow({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: 'chevron-left' | 'chevron-right';
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={12} accessibilityRole="button" accessibilityLabel={label}>
      <Feather name={icon} size={24} color={disabled ? colors.border : colors.text} />
    </Pressable>
  );
}

function LegendDot({ style, label }: { style: object; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, style]} />
      <Text variant="small">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space[4],
  },
  monthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekday: {
    color: colors.textSubtle,
  },
  day: {
    width: '80%',
    height: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayPublished: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayUpcoming: {
    borderColor: colors.textSubtle,
  },
  dayToday: {
    borderColor: colors.accent,
  },
  pressed: {
    opacity: 0.6,
  },
  dayText: {
    color: colors.textMuted,
  },
  dayTextMarked: {
    color: colors.text,
  },
  legend: {
    flexDirection: 'row',
    gap: space[5],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  monthList: {
    gap: space[3],
  },
});
