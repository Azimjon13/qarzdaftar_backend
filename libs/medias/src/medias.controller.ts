import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { MediasService } from './medias.service';
import { CreateMediaDto, MediaParamSchemaDto } from './dto/create-media.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import 'multer';
import { User } from '@app/shared/decorators/user.decorator';
import { IsPublic } from '@app/shared/decorators/is-public.decorator';

@Controller()
export class MediasController {
  constructor(private readonly mediasService: MediasService) {}

  @Post('medias')
  @UseInterceptors(FilesInterceptor('file'))
  create(
    @Body() createMediaDto: CreateMediaDto,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 100000000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    files: Array<Express.Multer.File>,
    @User('id') account_id: number,
  ) {
    return this.mediasService.create(createMediaDto, files, account_id);
  }

  @Post('mobile/medias')
  @UseInterceptors(FilesInterceptor('file'))
  createMobile(
    @Body() createMediaDto: CreateMediaDto,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 100000000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    files: Array<Express.Multer.File>,
    @User('id') account_id: number,
  ) {
    return this.mediasService.create(createMediaDto, files, account_id);
  }

  @IsPublic()
  @Get('medias/:filename')
  findOne(@Param() data: MediaParamSchemaDto, @Res() res: Response) {
    return this.mediasService.findOne(data.filename, res);
  }

  @IsPublic()
  @Get('mobile/medias/:filename')
  findOneMobile(@Param() data: MediaParamSchemaDto, @Res() res: Response) {
    return this.mediasService.findOne(data.filename, res);
  }

  @Delete('medias/:filename')
  remove(@Param() dto: MediaParamSchemaDto) {
    return this.mediasService.remove(dto);
  }

  @Delete('mobile/medias/:filename')
  removeMobile(@Param() dto: MediaParamSchemaDto) {
    return this.mediasService.remove(dto);
  }
}
