export interface IBannedUserModel {
  id?: number;
  author_id: number;
  banned_id: number;
  operation_id: number;
  score: number;
  created_at?: Date;
}
