export interface Vault {
  id: string;
  user_id: number;
  name: string;
  color: string;
  image?: string;
  created_at: number;
  position: number;
}

export type VaultColor = 'blue' | 'cyan' | 'green' | 'yellow' | 'orange' | 'red' | 'pink' | 'purple';

export const VAULT_COLORS: VaultColor[] = [
  'blue',
  'cyan',
  'green',
  'yellow',
  'orange',
  'red',
  'pink',
  'purple',
];

export const VAULT_COLORS_HEX: Record<string, string> = {
  blue: '#2563eb',
  cyan: '#0891b2',
  green: '#16a34a',
  yellow: '#facc15',
  orange: '#f97316',
  red: '#dc2626',
  pink: '#ec4899',
  purple: '#7c3aed',
};
