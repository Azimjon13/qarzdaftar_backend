import {
  UserStatus,
  Gender,
  Role,
} from 'database/migrations/20240409001219_users';

export interface IUserModel {
  id?: number;
  first_name?: string | null;
  last_name?: string | null;
  phone: string;
  avatar?: string | null;
  gender?: Gender;
  role: Role;
  status: UserStatus;
  score?: number;
  telegram_id?: string | null;
  is_banned?: boolean;
  is_tg_login?: boolean;
  created_at?: Date;
  meta?: Record<string, any>;
  password?: string;
}
