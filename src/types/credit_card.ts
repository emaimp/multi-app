import { AppColor, COLORS, COLORS_HEX } from '../theme/colors';

export interface CreditCard {
  id: string;
  vault_id: string;
  card_name: string;
  holder_name: string;
  card_number: string;
  expiry: string;
  cvv: string;
  color: string;
  image?: string;
  created_at: number;
  updated_at: number;
  position: number;
}

export type CreditCardColor = AppColor;

export { COLORS as CREDITCARD_COLORS, COLORS_HEX as CREDITCARD_COLORS_HEX };