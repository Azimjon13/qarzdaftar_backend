import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ErrorLogsService } from './error-logs.service';
import { GetErrorLogsDto } from './dto/get-error-logs.dto';
import { IdParamDto } from '@app/shared/dto/id-param.dto';
import { CreateErrorLogDto } from './dto/create-error-log.dto';

@Controller('mobile/error-logs')
export class ErrorLogsController {
  constructor(private readonly errorLogsService: ErrorLogsService) {}

  @Get('/')
  public getErrorLogsList(@Query() getErrorLogsDto: GetErrorLogsDto) {
    return this.errorLogsService.getErrorLogsList(getErrorLogsDto);
  }

  @Get('/:id')
  public getErrorLogById(@Param() { id }: IdParamDto) {
    return this.errorLogsService.getErrorLogById(id);
  }

  @Post('/')
  public createErrorLog(@Body() createErrorLogDto: CreateErrorLogDto) {
    return this.errorLogsService.createErrorLog(
      createErrorLogDto as Required<CreateErrorLogDto>,
    );
  }
}
