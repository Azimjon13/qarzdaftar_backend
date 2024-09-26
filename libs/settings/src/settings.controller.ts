import { Body, Controller, Get, Put } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Activity } from '@app/shared/decorators/activity.decorator';
import {
  ActivityActionType,
  ActivityType,
} from 'database/migrations/20240417060633_activities';
import { activityMessages } from '@app/shared/constants/activity-messages';
import { Scope } from '@app/shared/decorators/scope.decorator';
import { Role } from 'database/migrations/20240409001219_users';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('/')
  @Scope(Role.SUPER_ADMIN)
  @Activity({
    item_type: ActivityType.SETTINGS,
    action_type: ActivityActionType.READ,
    description: activityMessages.settings.read,
  })
  public getSetting() {
    return this.settingsService.getSetting();
  }

  @Put('/')
  @Scope(Role.SUPER_ADMIN)
  @Activity({
    item_type: ActivityType.SETTINGS,
    action_type: ActivityActionType.UPDATE,
    description: activityMessages.settings.update,
  })
  public updateSetting(@Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.updateSetting(updateSettingsDto);
  }
}
