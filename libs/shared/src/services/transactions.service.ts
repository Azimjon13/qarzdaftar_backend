import { InjectKnex } from '@app/knex';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class TransactionsService {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  public async useTransaction<T>(cb: (trx: Knex.Transaction) => Promise<T>) {
    try {
      const result = await this.knex.transaction(cb);
      return result;
    } catch (e) {
      if (e instanceof HttpException) {
        throw new HttpException(e.getResponse(), e.getStatus());
      }
      throw new InternalServerErrorException(e.message);
    }
  }
}
