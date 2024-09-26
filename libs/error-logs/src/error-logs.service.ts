import { Injectable, NotFoundException } from '@nestjs/common';
import { ErrorLogsRepository } from './error-logs.repository';
import { CreateErrorLogDto } from './dto/create-error-log.dto';
import { GetErrorLogsDto } from './dto/get-error-logs.dto';
import { HTTPMessages } from '@app/shared/constants/http-messages';

@Injectable()
export class ErrorLogsService {
  constructor(private readonly errorLogsRepository: ErrorLogsRepository) {}

  public createErrorLog(dto: Required<CreateErrorLogDto>) {
    return this.errorLogsRepository.createOne(dto);
  }

  public async getErrorLogById(id: number) {
    const errorLog = await this.errorLogsRepository.findOneById(id);
    if (!errorLog) {
      throw new NotFoundException(HTTPMessages.errorLog.errors.notFound);
    }
    return errorLog;
  }

  public getErrorLogsList(dto: GetErrorLogsDto) {
    return this.errorLogsRepository.findAll(dto);
  }
}
