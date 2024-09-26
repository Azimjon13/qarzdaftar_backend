import {
  TransactionType,
  TransactionStatus,
} from '../migrations/20240409005036_transactions';

export const transactions = [
  {
    author_id: 4,
    operation_id: 1,
    type: TransactionType.PARTIAL_PAY,
    status: TransactionStatus.NOT_CONFIRM,
    amount: 100,
  },
  {
    author_id: 5,
    operation_id: 2,
    type: TransactionType.PAY_ALL,
    status: TransactionStatus.NOT_CONFIRM,
    amount: 233,
  },
];
