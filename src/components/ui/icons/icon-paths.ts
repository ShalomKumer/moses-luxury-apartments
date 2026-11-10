/**
 * The outlines of the icons, as plain path data on a 24 x 24 grid, so a component draws them without any markup
 * from outside (the site never writes HTML from a string, S1). Their licences sit beside this file: the phone, the envelope and the apartment features (Wi-Fi, bath, flame, waves, mountain, door, trees, bed, wall,
 * brush, utensils; the back-to-top arrow; the viewer's two arrows and its cross; the date picker's calendar; Lucide v0.469.0) are from Lucide (ISC,
 * LICENSE-lucide.txt), the WhatsApp mark is from Simple Icons (CC0, LICENSE-simple-icons.txt). The WhatsApp name and mark
 * stay Meta's trademark: the mark is drawn unchanged, only to say "this opens WhatsApp", next to the word (C2).
 */

/** The icons the site draws. */
export type IconName =
  | 'whatsapp'
  | 'mail'
  | 'phone'
  | 'wifi'
  | 'bath'
  | 'flame'
  | 'waves'
  | 'mountain'
  | 'balcony'
  | 'trees'
  | 'bed'
  | 'brick-wall'
  | 'paintbrush'
  | 'utensils'
  | 'arrow-up'
  | 'chevron-left'
  | 'chevron-right'
  | 'x'
  | 'calendar';

/** One icon: drawn as an outline (a stroke) or as a solid shape (a fill), from one or more paths. */
export interface IconShape {
  style: 'stroke' | 'fill';
  paths: readonly string[];
}

export const ICONS: Record<IconName, IconShape> = {
  whatsapp: {
    style: 'fill',
    paths: [
      'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z',
    ],
  },
  mail: {
    style: 'stroke',
    // The envelope's frame is Lucide's rounded rectangle written as one path, then the flap.
    paths: [
      'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
      'm22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7',
    ],
  },
  phone: {
    style: 'stroke',
    paths: [
      'M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384',
    ],
  },
  wifi: {
    style: 'stroke',
    paths: ['M12 20h.01', 'M2 8.82a15 15 0 0 1 20 0', 'M5 12.859a10 10 0 0 1 14 0', 'M8.5 16.429a5 5 0 0 1 7 0'],
  },
  bath: {
    style: 'stroke',
    paths: [
      'M10 4 8 6',
      'M17 19v2',
      'M2 12h20',
      'M7 19v2',
      'M9 5 7.621 3.621A2.121 2.121 0 0 0 4 5v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5',
    ],
  },
  flame: {
    style: 'stroke',
    paths: [
      'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z',
    ],
  },
  waves: {
    style: 'stroke',
    paths: [
      'M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
      'M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
      'M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
    ],
  },
  mountain: { style: 'stroke', paths: ['m8 3 4 8 5-5 5 15H2L8 3z'] },
  // Lucide's "door-open"
  balcony: {
    style: 'stroke',
    paths: [
      'M13 4h3a2 2 0 0 1 2 2v14',
      'M2 20h3',
      'M13 20h9',
      'M10 12v.01',
      'M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z',
    ],
  },
  trees: {
    style: 'stroke',
    paths: [
      'M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z',
      'M7 16v6',
      'M13 19v3',
      'M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5',
    ],
  },
  // Lucide's "bed-double"
  bed: {
    style: 'stroke',
    paths: [
      'M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8',
      'M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4',
      'M12 4v6',
      'M2 18h20',
    ],
  },
  // Lucide's "brick-wall" (its rectangle written as a path)
  'brick-wall': {
    style: 'stroke',
    paths: [
      'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
      'M12 9v6',
      'M16 15v6',
      'M16 3v6',
      'M3 15h18',
      'M3 9h18',
      'M8 15v6',
      'M8 3v6',
    ],
  },
  paintbrush: {
    style: 'stroke',
    paths: [
      'm14.622 17.897-10.68-2.913',
      'M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z',
      'M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15',
    ],
  },
  // Lucide's "chevron-left", "chevron-right" and "x" (the photo viewer's arrows and its close button)
  'chevron-left': { style: 'stroke', paths: ['m15 18-6-6 6-6'] },
  'chevron-right': { style: 'stroke', paths: ['m9 18 6-6-6-6'] },
  x: { style: 'stroke', paths: ['M18 6 6 18', 'm6 6 12 12'] },
  // the date picker's field (Lucide calendar: its rectangle written as a path)
  calendar: {
    style: 'stroke',
    paths: ['M8 2v4', 'M16 2v4', 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M3 10h18'],
  },
  // Lucide's "arrow-up"
  'arrow-up': { style: 'stroke', paths: ['m5 12 7-7 7 7', 'M12 19V5'] },
  utensils: {
    style: 'stroke',
    paths: ['M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2', 'M7 2v20', 'M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7'],
  },
};
