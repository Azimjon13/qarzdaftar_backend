import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { OperationsService } from './operations.service';
import { CreateOperationDto } from './dto/create-operation.dto';
import { GetOperationListDto } from './dto/get-operation-list.dto';
import { IdParamDto } from '@app/shared/dto/id-param.dto';
import { EditOperationDeadlineDto } from './dto/edit-operation-deadline.dto';
import { User } from '@app/shared/decorators/user.decorator';
import { OperationPayDto } from './dto/operation-pay.dto';
import { GetOperationTransactionListDto } from './dto/get-operation-transaction-list.dto';
import { GetMeGraphicStatisticsDto } from './dto/get-me-graphic-statistics.dto';
import { Activity } from '@app/shared/decorators/activity.decorator';
import {
  ActivityActionType,
  ActivityType,
} from 'database/migrations/20240417060633_activities';
import { activityMessages } from '@app/shared/constants/activity-messages';

@Controller('mobile/operations')
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Get('/')
  @Activity({
    action_type: ActivityActionType.READ,
    item_type: ActivityType.OPERATION,
    description: activityMessages.operation.readList,
  })
  getOperationList(
    @User('id') userId: number,
    @Query() getOperationListDto: GetOperationListDto,
  ) {
    return this.operationsService.getOperationsList(
      userId,
      getOperationListDto,
    );
  }

  @Get('/:id')
  @Activity({
    action_type: ActivityActionType.READ,
    item_type: ActivityType.OPERATION,
    description: activityMessages.operation.readOne,
  })
  getOperationById(@User('id') userId: number, @Param() { id }: IdParamDto) {
    return this.operationsService.getOperationById(userId, id);
  }

  @Get('/me/given-amount/statistics')
  @Activity({
    action_type: ActivityActionType.READ,
    item_type: ActivityType.OPERATION,
    description: activityMessages.operation.readAmountStatistics,
  })
  getMeGivenStatistics(@User('id') userId: number) {
    return this.operationsService.getMeGivenAmountStatistics(userId);
  }

  @Get('/me/taken-amount/statistics')
  @Activity({
    action_type: ActivityActionType.READ,
    item_type: ActivityType.OPERATION,
    description: activityMessages.operation.readAmountStatistics,
  })
  getMeTakenStatistics(@User('id') userId: number) {
    return this.operationsService.getMeTakenAmountStatistics(userId);
  }

  @Get('/me/graphic/statistics')
  @Activity({
    action_type: ActivityActionType.READ,
    item_type: ActivityType.OPERATION,
    description: activityMessages.operation.readGraphicStatistics,
  })
  getMeGraphicStatistics(
    @User('id') userId: number,
    @Query() getMeGraphicStatisticsDto: GetMeGraphicStatisticsDto,
  ) {
    return this.operationsService.getMeGraphcStatistics(
      userId,
      getMeGraphicStatisticsDto,
    );
  }

  @Post('/')
  @Activity({
    action_type: ActivityActionType.CREATE,
    item_type: ActivityType.OPERATION,
    description: activityMessages.operation.create,
  })
  createOperation(
    @User('id') userId: number,
    @Body() createOperationDto: CreateOperationDto,
  ) {
    return this.operationsService.createOperation(
      userId,
      createOperationDto as Required<CreateOperationDto>,
    );
  }

  @Patch('/:id/deadline')
  @Activity({
    action_type: ActivityActionType.UPDATE,
    item_type: ActivityType.OPERATION,
    description: activityMessages.operation.editDeadline,
  })
  editOperationDeadline(
    @User('id') userId: number,
    @Param() { id }: IdParamDto,
    @Body() editOperationDeadlineDto: EditOperationDeadlineDto,
  ) {
    return this.operationsService.editOperationDeadline(
      userId,
      id,
      editOperationDeadlineDto,
    );
  }

  @Patch('/:id/confirm')
  @Activity({
    action_type: ActivityActionType.CONFIRM,
    item_type: ActivityType.OPERATION,
    description: activityMessages.operation.confirm,
  })
  operationConfirm(@User('id') userId: number, @Param() { id }: IdParamDto) {
    return this.operationsService.operationAction(userId, id, 'confirm');
  }

  @Patch('/:id/refusal')
  @Activity({
    action_type: ActivityActionType.REFUSAL,
    item_type: ActivityType.OPERATION,
    description: activityMessages.operation.refusal,
  })
  operationRefusal(@User('id') userId: number, @Param() { id }: IdParamDto) {
    return this.operationsService.operationAction(userId, id, 'refusal');
  }

  @Get('/:id/transactions')
  @Activity({
    action_type: ActivityActionType.READ,
    item_type: ActivityType.TRANSACTION,
    description: activityMessages.transaction.readList,
  })
  getOperationTransactions(
    @Param() { id }: IdParamDto,
    @Query() getOperationTransactionListDto: GetOperationTransactionListDto,
  ) {
    return this.operationsService.getOperationTransactions(
      id,
      getOperationTransactionListDto,
    );
  }

  @Post('/:id/transactions')
  @Activity({
    action_type: ActivityActionType.CREATE,
    item_type: ActivityType.TRANSACTION,
    description: activityMessages.transaction.create,
  })
  createOperationTransaction(
    @User('id') userId: number,
    @Param() { id }: IdParamDto,
    @Body() operationPayDto: OperationPayDto,
  ) {
    return this.operationsService.createOperationTransaction(
      userId,
      id,
      operationPayDto as Required<OperationPayDto>,
    );
  }

  @Patch('/transactions/:id/confirm')
  @Activity({
    action_type: ActivityActionType.CONFIRM,
    item_type: ActivityType.TRANSACTION,
    description: activityMessages.transaction.confirm,
  })
  transactionConfirm(@User('id') userId: number, @Param() { id }: IdParamDto) {
    return this.operationsService.operationTransactionConfirm(userId, id);
  }

  @Patch('/transactions/:id/refusal')
  @Activity({
    action_type: ActivityActionType.REFUSAL,
    item_type: ActivityType.TRANSACTION,
    description: activityMessages.transaction.refusal,
  })
  transactionRefusal(@User('id') userId: number, @Param() { id }: IdParamDto) {
    return this.operationsService.operationTransactionRefusal(userId, id);
  }
}
