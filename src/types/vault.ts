export interface Vault {
  id: string;
  name: string;
  color: string;
  image?: string;
  createdAt: Date;
}

export type VaultColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'orange' | 'pink';

export const VAULT_COLORS: VaultColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
  'info',
  'orange',
  'pink',
];

export const VAULT_COLORS_HEX: Record<string, string> = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  success: '#16a34a',
  warning: '#facc15',
  error: '#dc2626',
  info: '#0891b2',
  orange: '#f97316',
  pink: '#ec4899',
};
