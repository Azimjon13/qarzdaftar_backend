import type { Knex } from 'knex';
import {
  BaseResponse,
  CursorInterface,
  FilterParamsInterface,
} from './interfaces';

export class KnexService {
  /**
   * @description filter data with given params and return query
   * @param query { Knex.QueryBuilder }
   * @param params { FilterParamsInterface }
   */
  public static filter(
    query: Knex.QueryBuilder,
    params?: FilterParamsInterface,
  ): Knex.QueryBuilder {
    if (!params) {
      return query;
    }
    return Object.entries(params).reduce(
      (query: Knex.QueryBuilder, [key, value]: any) => {
        if (key === 'search') {
          const { columns, value: searchValue }: any = value;

          const searchConditions = columns.map((column, index) => {
            const operator =
              index === 0
                ? 'LOWER(' + column + ') LIKE ?'
                : ' OR LOWER(' + column + ') LIKE ?';

            return operator;
          });
          const likeValue: string = `%${searchValue.toLowerCase()}%`;
          return query.whereRaw(
            '(' + searchConditions.join('') + ')',
            searchConditions.map(() => likeValue),
          );
        }
        if (
          key !== 'sort' &&
          typeof value === 'object' &&
          !Array.isArray(value) &&
          value !== null
        ) {
          return Object.entries(value).reduce(
            (query, [subKey, subValue]: any) => {
              if (Array.isArray(subValue)) {
                return query.whereIn(key + '.' + subKey, subValue);
              }
              if (typeof subValue === 'object') {
                if (subValue.min && subValue.max) {
                  return query.whereBetween(key + '.' + subKey, [
                    subValue.min,
                    subValue.max,
                  ]);
                } else {
                  if (subValue.min) {
                    return query.andWhere(
                      key + '.' + subKey,
                      '>=',
                      subValue.min,
                    );
                  }
                  if (subValue.max) {
                    return query.andWhere(
                      key + '.' + subKey,
                      '<=',
                      subValue.max,
                    );
                  }
                }
              }
              return query.andWhere({ [key + '.' + subKey]: subValue });
            },
            query,
          );
        }
        if (Array.isArray(value) && value.length > 0) {
          return query.whereIn(key, value);
        }

        if (key === 'sort') {
          return query.orderBy(value.column, value.order);
        }
        return query.where(key, value);
      },
      query,
    );
  }

  /**
   * @description paginate data with cursor pagination method and return data with pagination metadata and total count of data
   * @param query { Knex.QueryBuilder }
   * @param cursorParams { CursorInterface }
   * @param options { { key: string } }
   * @param countQuery { Knex.QueryBuilder }
   */
  public static async paginate<T>({
    query,
    cursorParams,
    options,
    countQuery,
  }: CursorInterface): Promise<BaseResponse<T>> {
    const cursorColumnPrefix: string = options.keyPrefix || 'id';
    const cursorId: number = Number(cursorParams.cursor || 0);
    const cursorTake: number = Number(cursorParams.take || 10);
    const cursorDirection: 'next' | 'prev' = cursorParams.direction || 'next';

    let totalCount: number = 0;
    if (countQuery) {
      const result = await countQuery;
      totalCount = Number(result[0].count || 0);
    } else {
      const countQuery = query
        .clone()
        .clearSelect()
        .clearCounters()
        .clearGroup()
        .clearHaving()
        .clearOrder()
        .countDistinct(`${cursorColumnPrefix} as count`);
      const result = await countQuery;
      totalCount = Number(result[0].count || 0);
    }

    const [startAndEndCursor]: { start_cursor: number; end_cursor: number }[] =
      await query
        .clone()
        .clearSelect()
        .clearCounters()
        .clearGroup()
        .clearHaving()
        .clearOrder()
        .select([
          query.client.raw(`MIN(${cursorColumnPrefix}) as start_cursor`),
          query.client.raw(`MAX(${cursorColumnPrefix}) as end_cursor`),
        ]);

    const whereOperator = this.getWhereOperator(cursorDirection);
    if (cursorParams.cursor) {
      query
        .where(cursorColumnPrefix, whereOperator.action, cursorId)
        .orderBy(cursorColumnPrefix, whereOperator.orderBy);
    } else {
      query.orderBy(cursorColumnPrefix, whereOperator.orderBy || 'asc');
    }
    const result = await query.limit(Number(cursorTake + 1));

    return {
      data: result,
      startCursor: startAndEndCursor.start_cursor,
      endCursor: startAndEndCursor.end_cursor,
      totalCount,
    };
  }

  /**
   * @description get where operator for cursor pagination
   * @param direction { "next" | "prev" }
   * @private
   * @returns { { action: string, orderBy: string } }
   */
  public static getWhereOperator(direction: 'next' | 'prev'): {
    action: string;
    orderBy: string;
  } {
    if (direction === 'next') {
      return { action: '>', orderBy: 'asc' };
    } else {
      return { action: '<', orderBy: 'desc' };
    }
  }
}
