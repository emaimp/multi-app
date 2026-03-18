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
