import { IBannedUserModel } from '../models/banned-user.model';

export class BannedUserEntity implements IBannedUserModel {
  id?: number;
  author_id: number;
  banned_id: number;
  operation_id: number;
  score: number;
  created_at?: Date;

  constructor(bannedUser: IBannedUserModel) {
    this.id = bannedUser.id;
    this.author_id = bannedUser.author_id;
    this.banned_id = bannedUser.banned_id;
    this.score = bannedUser.score;
    this.created_at = bannedUser.created_at;
  }
}
