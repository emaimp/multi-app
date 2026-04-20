import { AppColor, COLORS, COLORS_HEX } from '../theme/colors';

export interface LoginKey {
  id: string;
  vault_id: string;
  site_name: string;
  url: string | null;
  username: string;
  password: string;
  details: string | null;
  color: string;
  image: string | null;
  created_at: number;
  updated_at: number;
  position: number;
}

export type LoginKeyColor = AppColor;

export { COLORS as LOGINKEY_COLORS, COLORS_HEX as LOGINKEY_COLORS_HEX };
