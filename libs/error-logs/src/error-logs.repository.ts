import { InjectKnex, KnexService } from '@app/knex';
import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { IErrorLog } from './error-log.model';
import { GetErrorLogsDto } from './dto/get-error-logs.dto';

@Injectable()
export class ErrorLogsRepository {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  private getBuilder() {
    return this.knex<Required<IErrorLog>>('error_logs');
  }

  public createOne(errorLog: IErrorLog) {
    return this.getBuilder().insert(errorLog, 'id');
  }

  public findOneById(id: number) {
    return this.getBuilder().where({ id }).select('*').first();
  }

  public findAll({ filter, ...cursorParams }: GetErrorLogsDto) {
    const queryBuilder = this.getBuilder();
    return KnexService.paginate({
      query: KnexService.filter(queryBuilder, filter),
      cursorParams: cursorParams as Required<typeof cursorParams>,
      options: {
        key: 'id',
        keyPrefix: 'error_logs.id',
      },
    });
  }
}
