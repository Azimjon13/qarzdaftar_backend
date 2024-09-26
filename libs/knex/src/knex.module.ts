import { DynamicModule, Module } from '@nestjs/common';
import { KnexModuleAsyncOptionsI, KnexModuleOptionsI } from './interfaces';
import { KnexCoreModule } from './knex.core.module';

@Module({})
export class KnexModule {
  public static forRoot(
    options: KnexModuleOptionsI,
    connection?: string,
  ): DynamicModule {
    return {
      module: KnexModule,
      imports: [KnexCoreModule.forRoot(options, connection)],
    };
  }

  public static forRootAsync(
    options: KnexModuleAsyncOptionsI,
    connection?: string,
  ): DynamicModule {
    return {
      module: KnexModule,
      imports: [KnexCoreModule.forRootAsync(options, connection)],
    };
  }
}
