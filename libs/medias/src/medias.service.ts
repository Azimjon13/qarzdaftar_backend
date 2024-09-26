import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMediaDto, MediaParamSchemaDto } from './dto/create-media.dto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ConfigService } from '@nestjs/config';
import 'multer';
import { uuid } from '@app/shared/utils/uuid';
import { MediasRepository } from '@app/medias/medias.repository';

@Injectable()
export class MediasService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mediasRepository: MediasRepository,
  ) {}

  async create(
    data: CreateMediaDto,
    files: Express.Multer.File[],
    account_id: number,
  ) {
    const filePath = `assets/files/${account_id}/${data.tag}`;
    const fileWritePromises: any[] = [];
    const response: any[] = [];
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true });
    }

    const inserted_object: any[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const { buffer, mimetype, size } = files[i];
        const originalname = Buffer.from(
          files[i].originalname,
          'ascii',
        ).toString();
        const extension = path.extname(originalname);
        const generated_uuid = uuid();
        const filename = generated_uuid + extension;
        const full_path = `${filePath}/${filename}`;
        fileWritePromises.push(fs.promises.writeFile(full_path, buffer));
        const name = this.configService.get('BASE_URL') as string;
        response.push(name + '/medias/' + generated_uuid);

        inserted_object.push({
          filename: generated_uuid,
          extension,
          mimetype,
          original_name: originalname,
          size,
          path: filePath,
        });
      }
      await Promise.all([
        fileWritePromises,
        this.mediasRepository.create(inserted_object),
      ]);
    } catch (error) {
      throw error;
    }
    return response;
  }

  async remove(data: MediaParamSchemaDto) {
    const [hasMedia] = await this.mediasRepository.delete(data.filename);
    if (!hasMedia) {
      throw new NotFoundException('Media not found');
    }
    const filePath = path.join(
      __dirname,
      '..',
      hasMedia.path,
      data.filename + hasMedia.extension,
    );
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    await fs.promises.unlink(filePath);
    return { ...data };
  }

  async findOne(filenameUUID: string, res: any) {
    const hasMedia = await this.mediasRepository.findByName(filenameUUID);
    if (!hasMedia) {
      throw new NotFoundException('Media not found');
    }
    const filename = filenameUUID + hasMedia.extension;
    const filePath = path.join(__dirname, '..', hasMedia.path, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }
    const fileStream = fs.createReadStream(filePath);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    fileStream.pipe(res);
    fileStream.on('error', (error) => {
      res.status(500).send(error);
    });
    return res;
  }
}
