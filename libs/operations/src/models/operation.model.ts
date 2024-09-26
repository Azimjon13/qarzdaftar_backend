import {
  Currency,
  OperationStatus,
} from 'database/migrations/20240409003340_operations';

export interface IOperationModel {
  id?: number;
  lendinger_id: number;
  borrowinger_id: number;
  creator_id: number;
  actioner_id?: number | null;
  amount: number;
  debt: number;
  currency: Currency;
  status?: OperationStatus;
  is_blacklist: boolean;
  description?: string;
  medias_ids?: string[] | null;
  deadline: Date | string;
  actioned_at?: Date;
  closed_at?: Date;
  created_at?: Date;
}
