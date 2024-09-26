import { Injectable, OnModuleInit } from '@nestjs/common';
import { SettingsRepository } from './settings.repository';
import { SettingEntity } from './setting.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ISettingModel } from './setting.model';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  public getSetting() {
    return this.settingsRepository.findOne();
  }

  public async updateSetting(dto: UpdateSettingsDto) {
    const setting = await this.settingsRepository.findOne();
    if (!setting) {
      return this.createSetting(dto);
    }
    const settingEntity = new SettingEntity(setting) as Required<SettingEntity>;
    settingEntity.updateData(dto);
    return this.settingsRepository.updateOne(settingEntity);
  }

  private async createSetting(data?: Partial<Omit<ISettingModel, 'id'>>) {
    const { global_blacklist_count, local_blacklist_count } = data || {};
    return this.settingsRepository.createOne(
      new SettingEntity({
        global_blacklist_count: global_blacklist_count ?? 5,
        local_blacklist_count: local_blacklist_count ?? 3,
      }),
    );
  }

  async onModuleInit() {
    const setting = await this.settingsRepository.findOne();
    if (!setting) {
      await this.createSetting();
    }
  }
}
