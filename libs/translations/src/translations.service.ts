import { TranslationsRepository } from './repositories/translations.repository';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUpdateTranslationsDto } from './dto/create-update-translations.dto';
import { Translations } from './dto/translation-values.dto';
import { TranslationValueRepository } from './repositories/translation-values.repository';
import { TranslationKeyRepository } from '@app/translation-keys/repository/translation-key.repository';

@Injectable()
export class TranslationsService {
  constructor(
    private readonly translationsRepository: TranslationsRepository,
    private readonly translationValuesRepository: TranslationValueRepository,
    private readonly translationKeyRepository: TranslationKeyRepository,
  ) {}

  async create(createTranslationsDto: CreateUpdateTranslationsDto) {
    const data = await this.translationsRepository.findOneIlikeName(
      createTranslationsDto.name,
      createTranslationsDto.code,
    );

    if (data) {
      throw new ConflictException('This Translations already exists');
    }
    if (createTranslationsDto.is_default) {
      await this.translationsRepository.updateAllIsDefaultToFalse();
    }

    return this.translationsRepository.insert(createTranslationsDto);
  }

  findAll() {
    return this.translationsRepository.findAll();
  }

  findOne(id: number) {
    return this.translationKeyRepository.findAllKeyByTranslationId(id);
  }

  async update(id: number, updateTranslationsDto: CreateUpdateTranslationsDto) {
    const [hasTranslations, duplicateLang] = await Promise.all([
      this.translationsRepository.findOneById(id),
      this.translationsRepository.findOneWhereNotIdAndWhereNameIlike(
        id,
        updateTranslationsDto.name,
        updateTranslationsDto.code,
      ),
    ]);
    if (!hasTranslations) throw new NotFoundException('Translations not found');
    if (duplicateLang)
      throw new ConflictException('This Translations or code already exists');

    if (!hasTranslations.is_default && updateTranslationsDto.is_default) {
      await this.translationsRepository.updateAllIsDefaultToFalse();
    } else if (
      hasTranslations.is_default &&
      !updateTranslationsDto.is_default
    ) {
      throw new ConflictException(
        'First you have to mark default Translations',
      );
    }
    return this.translationsRepository.update(id, updateTranslationsDto);
  }

  async translations(id: number, translations: Translations) {
    const key_ids: number[] = [];
    translations.items.map((item) => key_ids.push(item.key_id));

    const [hasTranslations, translationKeys] = await Promise.all([
      this.translationsRepository.findOneById(id),
      this.translationKeyRepository.findAllByIds(key_ids),
    ]);

    if (!hasTranslations) throw new NotFoundException('Translations not found');

    if (translationKeys.length != translations.items.length)
      throw new NotFoundException('Some keys not found');

    const translationValues: any[] = translations.items.map((item) => ({
      translation_id: id,
      name: item.value,
      translation_key_id: item.key_id,
    }));
    return this.translationValuesRepository.removeAndInsert(
      id,
      translationValues,
    );
  }

  async remove(id: number) {
    const hasTranslations = await this.translationsRepository.findOneById(id);

    if (!hasTranslations) throw new NotFoundException('Translations not found');

    return this.translationsRepository.remove(id);
  }
}
