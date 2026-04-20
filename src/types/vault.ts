import { AppColor, COLORS, COLORS_HEX } from '../theme/colors';

export interface Vault {
  id: string;
  user_id: number;
  name: string;
  color: string;
  image?: string;
  created_at: number;
  position: number;
}

export type VaultColor = AppColor;

export { COLORS as VAULT_COLORS, COLORS_HEX as VAULT_COLORS_HEX };
