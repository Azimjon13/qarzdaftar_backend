import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { TranslationKeysService } from './translation-keys.service';
import { CreateKeyDto } from './dto/create-key-dto';
import { IdParamDto } from '@app/shared/dto/id-param.dto';
import { User } from '@app/shared/decorators/user.decorator';
import { Scope } from '@app/shared/decorators/scope.decorator';
import { Role } from 'database/migrations/20240409001219_users';

@Controller('translation-keys')
export class TranslationKeysController {
  constructor(
    private readonly translationKeysService: TranslationKeysService,
  ) {}

  @Post()
  @Scope(Role.SUPER_ADMIN)
  create(@User() user: any, @Body() createTranslationKeyDto: CreateKeyDto) {
    return this.translationKeysService.create(createTranslationKeyDto);
  }

  @Get()
  @Scope(Role.SUPER_ADMIN)
  findAll() {
    return this.translationKeysService.findAll();
  }

  @Delete(':id')
  @Scope(Role.SUPER_ADMIN)
  remove(@Param() data: IdParamDto) {
    return this.translationKeysService.remove(data.id);
  }
}
