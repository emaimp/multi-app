export interface User {
  id: number;
  username: string;
  avatar?: string;
  password_hash: string;
  master_key_hash: string;
}
