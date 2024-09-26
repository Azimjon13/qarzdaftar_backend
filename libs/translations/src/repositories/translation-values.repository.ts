import { Knex } from 'knex';
import { InjectKnex } from '@app/knex';
import { TranslationValues } from '@app/translations/dto/translation-values-interface';

export class TranslationValueRepository {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  removeAndInsert(id: number, translationValues: TranslationValues[]) {
    return this.knex.transaction(async (trx) => {
      return trx('translation_values')
        .where('translation_id', id)
        .del()
        .then(() => {
          return trx('translation_values')
            .insert(translationValues)
            .returning('*');
        })
        .then(trx.commit)
        .catch(trx.rollback);
    });
  }

  findOneByKeyId(keyId: number) {
    return this.knex('translation_values')
      .select('*')
      .where('translation_key_id', keyId)
      .first();
  }
}
