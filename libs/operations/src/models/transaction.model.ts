import {
  TransactionStatus,
  TransactionType,
} from 'database/migrations/20240409005036_transactions';

export interface ITransactionModel {
  id?: number;
  author_id: number;
  operation_id: number;
  type: TransactionType;
  status?: TransactionStatus;
  amount: number;
  note?: string;
  changed_status_at?: Date;
  created_at?: Date;
}
