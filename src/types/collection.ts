export interface Collection {
  id: string;
  user_id: number;
  name: string;
  vault_ids: string[];
  created_at: number;
  position: number;
}
