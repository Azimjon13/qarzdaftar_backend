import {
  UserStatus,
  Gender,
  Role,
} from 'database/migrations/20240409001219_users';
import { IUserModel } from '../models/user.model';

export class UserEntity implements IUserModel {
  id?: number;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  gender?: Gender;
  phone: string;
  role: Role;
  score?: number;
  status: UserStatus;
  telegram_id?: string;
  is_banned?: boolean;
  is_tg_login?: boolean;
  created_at?: Date;
  meta?: Record<string, any>;
  password?: string;

  constructor(user: IUserModel) {
    this.id = user.id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.avatar = user.avatar;
    this.gender = user.gender;
    this.phone = user.phone;
    this.role = user.role;
    this.score = user.score;
    this.status = user.status;
    this.is_banned = user.is_banned;
    this.is_tg_login = user.is_tg_login;
    this.telegram_id = user.telegram_id;
    this.created_at = user.created_at;
    this.meta = user.meta;
  }

  public updateData(
    setUpdate: Partial<
      Pick<
        IUserModel,
        | 'first_name'
        | 'last_name'
        | 'telegram_id'
        | 'is_tg_login'
        | 'status'
        | 'avatar'
      >
    >,
  ) {
    this.first_name = setUpdate.first_name ?? this.first_name;
    this.last_name = setUpdate.last_name ?? this.last_name;
    this.avatar = setUpdate.avatar ?? this.avatar;
    setUpdate.telegram_id ?? this.telegram_id;
    this.is_tg_login = setUpdate.is_tg_login ?? this.is_tg_login;
    this.status = setUpdate.status ?? this.status;
  }

  public updateEmployeeData(
    setUpdate: Partial<
      Pick<IUserModel, 'first_name' | 'last_name' | 'gender' | 'role' | 'phone'>
    >,
  ) {
    this.first_name = setUpdate.first_name ?? this.first_name;
    this.last_name = setUpdate.last_name ?? this.last_name;
    this.role = setUpdate.role ?? this.role;
    this.gender = setUpdate.gender ?? this.gender;
  }

  public deleteEmployeeData(data: Partial<Pick<IUserModel, 'id'>>) {
    this.id = data.id ?? this.id;
    this.status = UserStatus.DELETE;
  }

  public updateAccountPhone(data: Partial<Pick<IUserModel, 'phone'>>) {
    this.phone = data.phone ?? this.phone;
    return this;
  }

  public updateMeta(setMeta: Record<string, any> | object) {
    this.meta = { ...this.meta, ...setMeta };
    return this;
  }

  public scoreUp(countUp?: number) {
    this.score += countUp ?? 1;

    return this;
  }

  public setBanned(banned: boolean) {
    this.is_banned = banned;
  }
}
