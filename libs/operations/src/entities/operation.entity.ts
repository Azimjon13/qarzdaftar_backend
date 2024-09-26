import {
  Currency,
  OperationStatus,
} from 'database/migrations/20240409003340_operations';
import { IOperationModel } from '../models/operation.model';

export class OperationEntity implements IOperationModel {
  id?: number;
  borrowinger_id: number;
  lendinger_id: number;
  actioner_id?: number;
  creator_id: number;
  amount: number;
  debt: number;
  currency: Currency;
  deadline: Date | string;
  is_blacklist: boolean;
  description?: string;
  status?: OperationStatus;
  medias_ids?: string[];
  closed_at?: Date;
  actioned_at?: Date;
  created_at?: Date;

  constructor(operation: IOperationModel) {
    this.id = operation.id;
    this.borrowinger_id = operation.borrowinger_id;
    this.lendinger_id = operation.lendinger_id;
    this.creator_id = operation.creator_id;
    this.actioner_id = operation.actioner_id;
    this.currency = operation.currency;
    this.amount = operation.amount;
    this.debt = operation.debt;
    this.deadline = operation.deadline;
    this.is_blacklist = operation.is_blacklist;
    this.description = operation.description;
    this.status = operation.status;
    this.medias_ids = operation.medias_ids;
    this.actioned_at = operation.actioned_at;
    this.created_at = this.created_at;
  }

  public confirm(confirmerId: number) {
    this.actioner_id = confirmerId;
    this.status = OperationStatus.ACTIVE;
    this.actioned_at = new Date();
  }

  public refusal(refusalerId: number) {
    this.actioner_id = refusalerId;
    this.status = OperationStatus.REFUSAL;
    this.actioned_at = new Date();
  }

  public close() {
    this.status = OperationStatus.CLOSED;
    this.closed_at = new Date();
  }

  public editDeadline(
    setEdit: Partial<Pick<IOperationModel, 'deadline' | 'is_blacklist'>>,
  ) {
    this.deadline = setEdit.deadline ?? this.deadline;
    this.is_blacklist = setEdit.is_blacklist ?? this.is_blacklist;
  }

  public debtDecrement(decrementAmount: number) {
    const debtAmount = this.debt - decrementAmount;
    if (debtAmount >= 0) {
      this.debt = debtAmount;
    } else if (this.debt > 0) {
      decrementAmount = this.debt;
      this.debt -= this.debt;
    }
    return decrementAmount;
  }
}
