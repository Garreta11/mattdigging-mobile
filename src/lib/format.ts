import type { Selection } from '@/api/types';

const dayMonth = (date: Date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

// "3 Mar – 9 Mar, 2026": the week a selection covers, as on the website.
export function selectionDateRange(selection: Selection): string {
  const start = new Date(selection.published_at);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${dayMonth(start)} – ${dayMonth(end)}, ${selection.year}`;
}
