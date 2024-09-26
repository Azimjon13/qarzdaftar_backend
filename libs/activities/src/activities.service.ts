import { Injectable } from '@nestjs/common';
import { ActivitiesRepository } from './activities.repository';
import { IActivityModel } from './activity.model';
import { ActivityEntity } from './activity.entity';
import { QueryActivityDto } from './dto/query-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private readonly activitiesRepository: ActivitiesRepository) {}

  public createActivity(data: Omit<IActivityModel, 'id' | 'created_at'>) {
    const activityEntity = new ActivityEntity(data);
    return this.activitiesRepository.createOne(activityEntity);
  }

  public findAll(query: QueryActivityDto) {
    return this.activitiesRepository.findAll(query);
  }
}
