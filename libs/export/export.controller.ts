import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { ExportDto } from './dto/export.dto';
import { User } from '@app/shared/decorators/user.decorator';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get()
  exportData(
    @Query() params: ExportDto,
    @User() user: any,
    @Res() res: Response,
  ) {
    return this.exportService.export(params, user, res);
  }
}
