import { InjectKnex } from '@app/knex';
import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { ISettingModel } from './setting.model';

@Injectable()
export class SettingsRepository {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  private getBuilder(trx?: Knex.Transaction) {
    return trx
      ? trx<Required<ISettingModel>>('settings')
      : this.knex<Required<ISettingModel>>('settings');
  }

  public async createOne(setting: ISettingModel, trx?: Knex.Transaction) {
    const [created] = await this.getBuilder(trx).insert(setting, 'id');
    return created;
  }

  public async updateOne(
    setting: Required<ISettingModel>,
    trx?: Knex.Transaction,
  ) {
    const { id, ...partialEntityData } = setting;
    const [updated] = await this.getBuilder(trx)
      .where({ id })
      .update(partialEntityData, 'id');
    return updated;
  }

  public async findOne() {
    return this.getBuilder().first('*');
  }
}
