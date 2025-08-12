export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  subscription: 'free' | 'premium';
  usage_count: number;
  is_active: boolean;
}

export interface CreateUserData {
  email: string;
  name: string;
  password_hash: string;
  subscription?: 'free' | 'premium';
}

export interface UpdateUserData {
  name?: string;
  subscription?: 'free' | 'premium';
  usage_count?: number;
  is_active?: boolean;
}