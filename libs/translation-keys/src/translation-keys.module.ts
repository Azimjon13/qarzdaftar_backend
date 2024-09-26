import { forwardRef, Module } from '@nestjs/common';
import { TranslationKeysService } from './translation-keys.service';
import { TranslationKeyRepository } from '@app/translation-keys/repository/translation-key.repository';
import { TranslationKeysController } from '@app/translation-keys/translation-keys.controller';
import { TranslationsModule } from '@app/translations';

@Module({
  imports: [forwardRef(() => TranslationsModule)],
  controllers: [TranslationKeysController],
  providers: [TranslationKeysService, TranslationKeyRepository],
  exports: [TranslationKeyRepository],
})
export class TranslationKeysModule {}
