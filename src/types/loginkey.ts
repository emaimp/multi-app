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

export const LOGINKEY_COLORS = ['blue', 'green', 'orange', 'red', 'purple', 'yellow'] as const;

export const LOGINKEY_COLORS_HEX: Record<string, string> = {
  blue: '#2563eb',
  green: '#16a34a',
  orange: '#ea580c',
  red: '#dc2626',
  purple: '#9333ea',
  yellow: '#ca8a04',
};
