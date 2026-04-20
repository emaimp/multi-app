import { AppColor, COLORS, COLORS_HEX } from '../theme/colors';

export interface IdCard {
  id: string;
  vault_id: string;
  id_name: string;
  id_type: string;
  full_name: string;
  id_number: string;
  color: string;
  image?: string;
  created_at: number;
  position: number;
}

export type IdCardColor = AppColor;

export { COLORS as IDCARD_COLORS, COLORS_HEX as IDCARD_COLORS_HEX };