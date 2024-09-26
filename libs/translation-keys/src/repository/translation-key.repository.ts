import { InjectKnex } from '@app/knex';
import { Knex } from 'knex';

export class TranslationKeyRepository {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  findWhereIn(name: string[]) {
    return this.knex('translation_keys').whereIn('name', name);
  }

  async insert(data: any[]) {
    return this.knex('translation_keys').insert(data).returning('id');
  }

  findAll() {
    return this.knex('translation_keys').select('*');
  }

  findAllByIds(ids: number[]) {
    return this.knex('translation_keys').whereIn('id', ids);
  }

  findOneById(id: number) {
    return this.knex('translation_keys').where({ id }).first();
  }

  remove(id: number) {
    return this.knex('translation_keys').where({ id }).del().returning('*');
  }

  findAllKeyByTranslationId(translation_id: number) {
    return this.knex('translation_keys')
      .select(
        this.knex.raw(
          `translation_keys.id,translation_keys.name as key,translation_keys.title, translation_values.name as value`,
        ),
      )
      .leftJoin('translation_values', function () {
        return this.on(
          'translation_values.translation_key_id',
          '=',
          'translation_keys.id',
        ).andOnVal('translation_values.translation_id', '=', translation_id);
      });
  }
}
