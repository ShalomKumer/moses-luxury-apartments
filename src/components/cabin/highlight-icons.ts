import type { HighlightKind } from '@domain/apartments/highlights';
import type { IconName } from '@components/ui/icons/icon-paths';

/** The small icon drawn beside each kind of badge; it is decoration, the badge's words carry the meaning (A2, A4). */
export const HIGHLIGHT_ICONS: Record<HighlightKind, IconName> = {
  wifi: 'wifi',
  'shabbos-kitchen': 'utensils',
  jacuzzi: 'bath',
  sauna: 'flame',
  pool: 'waves',
  view: 'mountain',
  balcony: 'balcony',
  courtyard: 'trees',
  loft: 'bed',
  'separate-bedroom': 'bed',
  stone: 'brick-wall',
  murals: 'paintbrush',
};
