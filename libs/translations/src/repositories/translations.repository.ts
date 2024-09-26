import { Knex } from 'knex';
import { CreateUpdateTranslationsDto } from '../dto/create-update-translations.dto';
import { InjectKnex } from '@app/knex';

export class TranslationsRepository {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  findOneIlikeName(name: string, code: string) {
    return this.knex('translations')
      .where('name', 'ilike', name)
      .orWhere('code', 'ilike', code)
      .first();
  }

  updateAllIsDefaultToFalse() {
    return this.knex('translations')
      .update('is_default', false)
      .where('is_default', true);
  }

  insert(dto: CreateUpdateTranslationsDto) {
    return this.knex('translations')
      .insert({ ...dto })
      .returning('*');
  }

  update(id: number, dto: CreateUpdateTranslationsDto) {
    return this.knex('translations')
      .update({ ...dto })
      .where({ id })
      .returning('*');
  }

  findAll() {
    return this.knex('translations').select('*');
  }

  findOneById(id: number) {
    return this.knex('translations').select('*').where({ id }).first();
  }

  findOneWhereNotIdAndWhereNameIlike(id: number, name: string, code: string) {
    return this.knex('translations')
      .whereNot('id', id)
      .where(this.knex.raw(`(name ilike ? or code ilike ?)`, [name, code]))
      .first();
  }

  remove(id: number) {
    return this.knex('translations').where({ id }).del().returning('*');
  }
}
