import { Controller, Get, Query } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { QueryActivityDto } from './dto/query-activity.dto';
import { Scope } from '@app/shared/decorators/scope.decorator';
import { Role } from 'database/migrations/20240409001219_users';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @Scope(Role.SUPER_ADMIN)
  findAllActivities(@Query() query: QueryActivityDto) {
    return this.activitiesService.findAll(query);
  }
}
