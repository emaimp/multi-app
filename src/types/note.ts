export interface Note {
  id: string;
  name: string;
  color: string;
  image?: string;
  createdAt: Date;
}

export type NoteColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

export const NOTE_COLORS: NoteColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
  'info',
];
