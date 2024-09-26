import {
  TransactionStatus,
  TransactionType,
} from 'database/migrations/20240409005036_transactions';
import { ITransactionModel } from '../models/transaction.model';

export class TransactionEntity implements ITransactionModel {
  id?: number;
  author_id: number;
  operation_id: number;
  amount: number;
  type: TransactionType;
  status?: TransactionStatus;
  note?: string;
  changed_status_at?: Date;
  created_at?: Date;

  constructor(transaction: ITransactionModel) {
    this.id = transaction.id;
    this.author_id = transaction.author_id;
    this.operation_id = transaction.operation_id;
    this.amount = transaction.amount;
    this.type = transaction.type;
    this.status = transaction.status;
    this.note = transaction.note;
    this.changed_status_at = transaction.changed_status_at;
    this.created_at = transaction.created_at;
  }

  public confirm() {
    this.status = TransactionStatus.CONFIRM;
    this.changed_status_at = new Date();
  }

  public refusal() {
    this.status = TransactionStatus.REFUSAL;
    this.changed_status_at = new Date();
  }
}
