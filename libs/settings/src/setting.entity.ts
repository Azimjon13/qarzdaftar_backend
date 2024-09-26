import { ISettingModel } from './setting.model';

export class SettingEntity implements ISettingModel {
  id?: number;
  global_blacklist_count: number;
  local_blacklist_count: number;

  constructor(setting: ISettingModel) {
    this.id = setting.id;
    this.global_blacklist_count = setting.global_blacklist_count;
    this.local_blacklist_count = setting.local_blacklist_count;
  }

  public updateData(setUpdate: Partial<Omit<ISettingModel, 'id'>>) {
    this.global_blacklist_count =
      setUpdate.global_blacklist_count ?? this.global_blacklist_count;
    this.local_blacklist_count =
      setUpdate.local_blacklist_count ?? this.local_blacklist_count;
  }
}
