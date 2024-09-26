import { Translations } from './dto/translation-values.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { CreateUpdateTranslationsDto } from './dto/create-update-translations.dto';
import { IsPublic } from '@app/shared/decorators/is-public.decorator';
import { IdParamDto } from '@app/shared/dto/id-param.dto';
import { Scope } from '@app/shared/decorators/scope.decorator';
import { Role } from 'database/migrations/20240409001219_users';

@Controller()
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  @Post('translations')
  @Scope(Role.SUPER_ADMIN)
  async create(@Body() createTranslationsDto: CreateUpdateTranslationsDto) {
    return this.translationsService.create(createTranslationsDto);
  }

  @Get('translations')
  @Scope(Role.SUPER_ADMIN)
  findAll() {
    return this.translationsService.findAll();
  }

  @Get('mobile/languages')
  @Scope(Role.SUPER_ADMIN)
  findAllMobile() {
    return this.translationsService.findAll();
  }

  @IsPublic()
  @Get('translations/home')
  findAllHome() {
    return this.translationsService.findAll();
  }

  @Get('translations/:id')
  @Scope(Role.SUPER_ADMIN)
  findOne(@Param() data: IdParamDto) {
    return this.translationsService.findOne(data.id);
  }

  @IsPublic()
  @Get('translations/home/:id')
  findOneHome(@Param() data: IdParamDto) {
    return this.translationsService.findOne(data.id);
  }

  @Patch('translations/:id')
  @Scope(Role.SUPER_ADMIN)
  update(
    @Param() data: IdParamDto,
    @Body() updateTranslationsDto: CreateUpdateTranslationsDto,
  ) {
    return this.translationsService.update(data.id, updateTranslationsDto);
  }

  @Patch('translations/:id/value')
  @Scope(Role.SUPER_ADMIN)
  translations(@Param() data: IdParamDto, @Body() translations: Translations) {
    return this.translationsService.translations(data.id, translations);
  }

  @Delete('translations/:id')
  @Scope(Role.SUPER_ADMIN)
  remove(@Param() data: IdParamDto) {
    return this.translationsService.remove(data.id);
  }
}
