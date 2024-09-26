import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContractorType, CreateOperationDto } from './dto/create-operation.dto';
import { EditOperationDeadlineDto } from './dto/edit-operation-deadline.dto';
import { OperationsRepository } from './repositories/operations.repository';
import { OperationEntity } from './entities/operation.entity';
import { HTTPMessages } from '@app/shared/constants/http-messages';
import { GetOperationListDto } from './dto/get-operation-list.dto';
import { IOperationModel } from './models/operation.model';
import { TransactionsService as KnexTransactionsService } from '@app/shared';
import { OperationPayDto } from './dto/operation-pay.dto';
import { TransactionEntity } from './entities/transaction.entity';
import { TransactionsRepository } from './repositories/transactions.repository';
import { OperationStatus } from 'database/migrations/20240409003340_operations';
import { TransactionStatus } from 'database/migrations/20240409005036_transactions';
import { GetOperationTransactionListDto } from './dto/get-operation-transaction-list.dto';
import { GetMeGraphicStatisticsDto } from './dto/get-me-graphic-statistics.dto';
import { BannedUsersService } from '@app/accounts/services/banned_users.service';
import { AccountsService } from '@app/accounts';
import { NotificationsService } from '@app/notifications';
import { NotificationType } from 'database/migrations/20240409005250_notifications';
import { notificationMesseges } from '@app/shared/constants/notification-messages';
import { textReplace } from '@app/shared/utils/text-replace';
import { SettingsService } from '@app/settings';

@Injectable()
export class OperationsService {
  constructor(
    private readonly operationsRepository: OperationsRepository,
    private readonly transactionsRepository: TransactionsRepository,
    private readonly knexTransactionsService: KnexTransactionsService,
    private readonly bannedUsersService: BannedUsersService,
    private readonly accountsService: AccountsService,
    private readonly notificationsService: NotificationsService,
    private readonly settingsService: SettingsService,
  ) {}

  public getOperationsList(userId: number, dto: GetOperationListDto) {
    return this.operationsRepository.findAllByUserId(userId, dto);
  }

  public async getOperationById(userId: number, id: number) {
    const operation = await this.operationsRepository.findOneByUserId(
      id,
      userId,
    );
    if (!operation) {
      throw new NotFoundException(HTTPMessages.operation.errors.notFound);
    }
    return operation;
  }

  public getMeGivenAmountStatistics(userId: number) {
    return this.operationsRepository.findAllStatistics('lendinger_id', userId);
  }

  public getMeTakenAmountStatistics(userId: number) {
    return this.operationsRepository.findAllStatistics(
      'borrowinger_id',
      userId,
    );
  }

  public getMeGraphcStatistics(userId: number, dto: GetMeGraphicStatisticsDto) {
    this.bannedUsersService.getCountUserBanned(userId);
    return this.operationsRepository.findAllStatisticsByDays(userId, dto);
  }

  public getOperationTakenStatistics(userId: number) {
    return this.operationsRepository.findAllStatistics(
      'borrowinger_id',
      userId,
    );
  }

  public async createOperation(
    userId: number,
    dto: Required<CreateOperationDto>,
  ) {
    return this.knexTransactionsService.useTransaction(async (trx) => {
      const { contractor_id, contractor_type, ...restDto } = dto;
      let restEntityData: Pick<
        IOperationModel,
        'borrowinger_id' | 'lendinger_id'
      > | null = null;

      if (contractor_type === ContractorType.LENDING) {
        restEntityData = {
          lendinger_id: contractor_id,
          borrowinger_id: userId,
        };
      }

      if (contractor_type === ContractorType.BORROWING) {
        restEntityData = {
          lendinger_id: userId,
          borrowinger_id: contractor_id,
        };
      }

      if (userId === contractor_id) {
        throw new NotFoundException(
          HTTPMessages.operation.errors.notContractor,
        );
      }

      const [setting, { count }] = await Promise.all([
        this.settingsService.getSetting(),
        this.bannedUsersService.getCountUserBanned(contractor_id),
      ]);

      if (count > setting.global_blacklist_count) {
        throw new NotFoundException(
          HTTPMessages.operation.errors.contractorBanned,
        );
      }

      const operationEntity = new OperationEntity({
        ...restDto,
        ...restEntityData,
        creator_id: userId,
        debt: dto.amount,
      });

      const operation = await this.operationsRepository.createOne(
        operationEntity,
        trx,
      );
      // Notification send
      await this.notificationsService.sendNotification(
        {
          author_id: userId,
          item_id: operation.id,
          item_type: NotificationType.OPERATION,
          title: notificationMesseges.operation.create.title,
          description: textReplace(
            notificationMesseges.operation.create.description,
            [`${restDto.amount} ${restDto.currency}`],
          ),
          reciver_ids: [contractor_id],
        },
        trx,
      );

      return operation;
    });
  }

  public async editOperationDeadline(
    userId: number,
    id: number,
    dto: EditOperationDeadlineDto,
  ) {
    const operation = await this.operationsRepository.findById(userId, id);

    if (!operation) {
      throw new NotFoundException(HTTPMessages.operation.errors.notFound);
    }

    if (operation.lendinger_id !== userId) {
      throw new BadRequestException(HTTPMessages.operation.errors.notLendinger);
    }

    const operationEntity = new OperationEntity(
      operation,
    ) as Required<OperationEntity>;
    operationEntity.editDeadline(dto);
    return this.operationsRepository.updateOne(operationEntity);
  }

  public async operationAction(
    userId: number,
    id: number,
    actionType: keyof Pick<OperationEntity, 'confirm' | 'refusal'>,
  ) {
    return this.knexTransactionsService.useTransaction(async (trx) => {
      const operation = await this.operationsRepository.findById(userId, id);

      if (!operation) {
        throw new NotFoundException(HTTPMessages.operation.errors.notFound);
      }

      const {
        creator_id,
        status,
        lendinger_id,
        borrowinger_id,
        amount,
        currency,
      } = operation;

      if (creator_id === userId && actionType === 'confirm') {
        throw new BadRequestException(
          HTTPMessages.operation.errors.creatorConnotConfirm,
        );
      }

      if (status === OperationStatus.REFUSAL) {
        throw new BadRequestException(HTTPMessages.operation.errors.refusal);
      }

      if (status === OperationStatus.CLOSED) {
        throw new BadRequestException(
          HTTPMessages.operation.errors.alreadyCloused,
        );
      }

      if (actionType === 'confirm') {
        const { count } =
          await this.operationsRepository.findCountByCreatedDate(
            'active_or_closed',
            {
              lendinger_id,
              borrowinger_id,
              created_at: new Date(),
            },
          );

        if (count === 0) {
          await this.accountsService.userScoreUp(lendinger_id, trx);
        }
      }

      const operationEntity = new OperationEntity(
        operation,
      ) as Required<OperationEntity>;
      operationEntity[actionType](userId);

      // Notification send
      const reciver_id =
        userId === lendinger_id ? borrowinger_id : lendinger_id;
      await this.notificationsService.sendNotification(
        {
          author_id: userId,
          item_id: operation.id,
          item_type: NotificationType.OPERATION,
          title: notificationMesseges.operation[actionType].title,
          description: textReplace(
            notificationMesseges.operation[actionType].description,
            [`${amount} ${currency}`],
          ),
          reciver_ids: [reciver_id],
        },
        trx,
      );

      return this.operationsRepository.updateOne(operationEntity);
    });
  }

  public createOperationTransaction(
    author_id: number,
    operation_id: number,
    dto: Required<OperationPayDto>,
  ) {
    return this.knexTransactionsService.useTransaction(async (trx) => {
      const operation = await this.operationsRepository.findById(
        author_id,
        operation_id,
      );

      if (!operation) {
        throw new NotFoundException(HTTPMessages.operation.errors.notFound);
      }

      if (operation.status === OperationStatus.NOT_CONFIRM) {
        throw new BadRequestException(HTTPMessages.operation.errors.notConfirm);
      }

      if (operation.status === OperationStatus.REFUSAL) {
        throw new BadRequestException(HTTPMessages.operation.errors.refusal);
      }

      if (operation.status === OperationStatus.CLOSED) {
        throw new BadRequestException(
          HTTPMessages.operation.errors.alreadyCloused,
        );
      }

      // Update debt operation
      const operationEntity = new OperationEntity(
        operation,
      ) as Required<OperationEntity>;
      const { amount, ...restDto } = dto;
      const debtAmount = operationEntity.debtDecrement(amount);

      // Create operation transaction
      const transactionEntity = new TransactionEntity({
        author_id,
        operation_id,
        amount: debtAmount,
        ...restDto,
      });

      let reciver_id: number | null = null;
      let title: string | null = null;
      let description: string | null = null;

      const { lendinger_id, borrowinger_id, created_at } = operation;
      // Agar transaksiyani yaratvotkyan odam,
      // usha operation ga lendinger ni ro'lini oynagan odam bo'lsa,
      // unda transaksiyani confirimga aylanadi by default
      if (lendinger_id === author_id) {
        reciver_id = borrowinger_id;
        title = notificationMesseges.transaction.lendingerPay.title;
        description = notificationMesseges.transaction.lendingerPay.description;
        // Agar qarizi qolmagan bo'lsa unda yopvoramiza operation ni
        if (operationEntity.debt === 0) {
          operationEntity.close();
        }
        // Transaction ni confirimga o'tkazamiza
        transactionEntity.confirm();

        await this.operationsRepository.updateOne(operationEntity, trx);

        const [countByCreatedDate, countDeadlineExpired] = await Promise.all([
          this.operationsRepository.findCountByCreatedDate(
            'closed_not_expired',
            {
              lendinger_id,
              borrowinger_id,
              created_at,
            },
            trx,
          ),
          this.operationsRepository.findCountDeadlineExpired(
            lendinger_id,
            borrowinger_id,
            trx,
          ),
        ]);
        // Agar birkunda bir necha marta operatsiya create bo'lgan bo'lsa
        // va usha kundigidan birontasini o'z vaqtida topshirgan bo'lsa,
        // bitta score qoshamiza
        if (countByCreatedDate.count === 1) {
          await this.accountsService.userScoreUp(borrowinger_id, trx);
        }

        if (countDeadlineExpired.count === 0) {
          // Agar qarizdor hamma qarizlaridan qutilgan bo'lsa,
          // unda ban royhatidan olib tashlimiza
          await this.bannedUsersService.unbanedUser(
            lendinger_id,
            borrowinger_id,
            trx,
          );
        }
      } else {
        reciver_id = lendinger_id;
        title = notificationMesseges.transaction.borrowingerPay.title;
        description =
          notificationMesseges.transaction.borrowingerPay.description;
      }

      const res = await this.transactionsRepository.createOne(
        transactionEntity,
        trx,
      );

      // Notification send
      await this.notificationsService.sendNotification(
        {
          author_id,
          item_id: res.id,
          item_type: NotificationType.TRANSACTION,
          title,
          description: textReplace(description, [
            `${debtAmount} ${operation.currency}`,
          ]),
          reciver_ids: [reciver_id],
        },
        trx,
      );

      return res;
    });
  }

  public async operationTransactionConfirm(
    userId: number,
    transactionId: number,
  ) {
    return this.knexTransactionsService.useTransaction(async (trx) => {
      const transaction =
        await this.transactionsRepository.findById(transactionId);

      if (!transaction) {
        throw new NotFoundException(HTTPMessages.transaction.errors.notFound);
      }

      if (transaction.status === TransactionStatus.REFUSAL) {
        throw new BadRequestException(
          HTTPMessages.transaction.errors.connotConfirmAlreadyRefusal,
        );
      }

      const operation = await this.operationsRepository.findById(
        userId,
        transaction.operation_id,
      );

      if (!operation) {
        throw new NotFoundException(HTTPMessages.operation.errors.notFound);
      }

      const { lendinger_id, borrowinger_id, created_at, currency } = operation;

      if (operation.lendinger_id !== userId) {
        throw new BadRequestException(
          HTTPMessages.transaction.errors.onlyLendingerConirm,
        );
      }

      const transactionEntity = new TransactionEntity(
        transaction,
      ) as Required<TransactionEntity>;
      transactionEntity.confirm();

      const operationEntity = new OperationEntity(
        operation,
      ) as Required<OperationEntity>;
      operationEntity.debtDecrement(transactionEntity.amount);

      if (operationEntity.debt === 0) {
        operationEntity.close();
      }

      const [updatedTransaction] = await Promise.all([
        this.transactionsRepository.updateOne(transactionEntity, trx),
        this.operationsRepository.updateOne(operationEntity, trx),
      ]);

      const [countByCreatedDate, countDeadlineExpired] = await Promise.all([
        this.operationsRepository.findCountByCreatedDate(
          'closed_not_expired',
          {
            lendinger_id,
            borrowinger_id,
            created_at,
          },
          trx,
        ),
        this.operationsRepository.findCountDeadlineExpired(
          lendinger_id,
          borrowinger_id,
          trx,
        ),
      ]);
      // Agar birkunda bir necha marta operatsiya create bo'lgan bo'lsa
      // va usha kundigidan birontasini o'z vaqtida topshirgan bo'lsa,
      // bitta score qoshamiza
      if (countByCreatedDate.count === 1) {
        await this.accountsService.userScoreUp(borrowinger_id, trx);
      }

      // Agar qarizdor hamma qarizlaridan qutilgan bo'lsa,
      // unda ban royhatidan olib tashlimiza
      if (countDeadlineExpired.count === 0) {
        await this.bannedUsersService.unbanedUser(
          lendinger_id,
          borrowinger_id,
          trx,
        );
      }
      // Notification send
      await this.notificationsService.sendNotification(
        {
          author_id: userId,
          item_id: updatedTransaction.id,
          item_type: NotificationType.TRANSACTION,
          title: notificationMesseges.transaction.confirm.title,
          description: textReplace(
            notificationMesseges.transaction.confirm.description,
            [`${transaction.amount} ${currency}`],
          ),
          reciver_ids: [borrowinger_id],
        },
        trx,
      );

      return updatedTransaction;
    });
  }

  public async operationTransactionRefusal(
    userId: number,
    transactionId: number,
  ) {
    return this.knexTransactionsService.useTransaction(async (trx) => {
      const transaction =
        await this.transactionsRepository.findById(transactionId);

      if (!transaction) {
        throw new NotFoundException(HTTPMessages.transaction.errors.notFound);
      }

      if (transaction.status === TransactionStatus.CONFIRM) {
        throw new BadRequestException(
          HTTPMessages.transaction.errors.connotRefusalAlreadyConfirm,
        );
      }

      const operation = await this.operationsRepository.findById(
        userId,
        transaction.operation_id,
      );

      if (!operation) {
        throw new NotFoundException(HTTPMessages.operation.errors.notFound);
      }

      const transactionEntity = new TransactionEntity(
        transaction,
      ) as Required<TransactionEntity>;
      transactionEntity.refusal();

      const updatedTransaction =
        await this.transactionsRepository.updateOne(transactionEntity);

      // Notification send
      await this.notificationsService.sendNotification(
        {
          author_id: userId,
          item_id: updatedTransaction.id,
          item_type: NotificationType.TRANSACTION,
          title: notificationMesseges.transaction.refusal.title,
          description: textReplace(
            notificationMesseges.transaction.refusal.description,
            [`${transaction.amount} ${operation.currency}`],
          ),
          reciver_ids: [operation.borrowinger_id],
        },
        trx,
      );

      return updatedTransaction;
    });
  }

  public getOperationTransactions(
    id: number,
    dto: GetOperationTransactionListDto,
  ) {
    return this.transactionsRepository.findAllOperationId(id, dto);
  }
}
