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

export type CreditCardColor = 'blue' | 'cyan' | 'green' | 'yellow' | 'orange' | 'red' | 'pink' | 'purple';

export const CREDITCARD_COLORS: CreditCardColor[] = [
  'blue',
  'cyan',
  'green',
  'yellow',
  'orange',
  'red',
  'pink',
  'purple',
];

export const CREDITCARD_COLORS_HEX: Record<string, string> = {
  blue: '#2563eb',
  cyan: '#0891b2',
  green: '#16a34a',
  yellow: '#facc15',
  orange: '#f97316',
  red: '#dc2626',
  pink: '#ec4899',
  purple: '#7c3aed',
};