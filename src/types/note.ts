import { AppColor, COLORS, COLORS_HEX } from '../theme/colors';

export interface Note {
  id: string;
  vault_id: string;
  note_name: string;
  content: string;
  color: string;
  image?: string;
  created_at: number;
  position: number;
}

export type NoteColor = AppColor;

export { COLORS as NOTE_COLORS, COLORS_HEX as NOTE_COLORS_HEX };
