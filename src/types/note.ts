export interface Note {
  id: string;
  vault_id: string;
  title: string;
  content: string;
  color: string;
  image?: string;
  created_at: number;
  position: number;
}

export type NoteColor = 'blue' | 'cyan' | 'green' | 'yellow' | 'orange' | 'red' | 'pink' | 'purple';

export const NOTE_COLORS: NoteColor[] = [
  'blue',
  'cyan',
  'green',
  'yellow',
  'orange',
  'red',
  'pink',
  'purple',
];

export const NOTE_COLORS_HEX: Record<string, string> = {
  blue: '#2563eb',
  cyan: '#0891b2',
  green: '#16a34a',
  yellow: '#facc15',
  orange: '#f97316',
  red: '#dc2626',
  pink: '#ec4899',
  purple: '#7c3aed',
};
