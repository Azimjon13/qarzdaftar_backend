import { forwardRef, Module } from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { TranslationsController } from '@app/translations/translations.controller';
import { TranslationKeysModule } from '@app/translation-keys';
import { TranslationsRepository } from '@app/translations/repositories/translations.repository';
import { TranslationValueRepository } from '@app/translations/repositories/translation-values.repository';

@Module({
  imports: [forwardRef(() => TranslationKeysModule)],
  controllers: [TranslationsController],
  providers: [
    TranslationsService,
    TranslationsRepository,
    TranslationValueRepository,
  ],
  exports: [TranslationValueRepository],
})
export class TranslationsModule {}
