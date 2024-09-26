import { InjectKnex } from '@app/knex';
import { Knex } from 'knex';

export class MediasRepository {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  create(data: any) {
    return this.knex('medias').insert(data).returning('filename');
  }

  findByName(filename: string) {
    return this.knex('medias')
      .select('extension', 'path')
      .where({ filename })
      .first();
  }

  delete(filename: string) {
    return this.knex('medias')
      .where({ filename })
      .del()
      .returning(['extension', 'path']);
  }
}
