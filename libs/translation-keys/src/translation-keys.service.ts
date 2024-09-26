import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TranslationKeyRepository } from './repository/translation-key.repository';
import { CreateKeyDto } from './dto/create-key-dto';
import { TranslationValueRepository } from '@app/translations/repositories/translation-values.repository';

@Injectable()
export class TranslationKeysService {
  constructor(
    private readonly translationValuesRepository: TranslationValueRepository,
    private readonly translationKeyRepository: TranslationKeyRepository,
  ) {}

  async create(createKeyDto: CreateKeyDto) {
    const data = await this.translationKeyRepository.findWhereIn(
      createKeyDto.keys.map((k) => k.name),
    );

    if (data.length !== 0) {
      throw new ConflictException('Some keys already exists');
    }
    return this.translationKeyRepository.insert(createKeyDto.keys);
  }

  findAll() {
    return this.translationKeyRepository.findAll();
  }

  async remove(id: number) {
    const hasKey = await this.translationKeyRepository.findOneById(id);

    if (!hasKey) throw new NotFoundException('Key not found');

    return this.translationKeyRepository.remove(id);
  }
}
