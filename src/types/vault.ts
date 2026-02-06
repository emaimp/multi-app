export interface Vault {
  id: string;
  name: string;
  color: string;
  image?: string;
  createdAt: Date;
}

export type VaultColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

export const VAULT_COLORS: VaultColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
  'info',
];
