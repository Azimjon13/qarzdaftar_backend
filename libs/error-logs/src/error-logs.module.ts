import { Module } from '@nestjs/common';
import { ErrorLogsService } from './error-logs.service';
import { ErrorLogsController } from './error-logs.controller';
import { ErrorLogsRepository } from './error-logs.repository';

@Module({
  controllers: [ErrorLogsController],
  providers: [ErrorLogsService, ErrorLogsRepository],
  exports: [ErrorLogsService, ErrorLogsRepository],
})
export class ErrorLogsModule {}
