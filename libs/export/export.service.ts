import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { join } from 'path';
import fs from 'fs';
import { ExportDto } from './dto/export.dto';
import { Response } from 'express';
import { ActivitiesService } from '@app/activities';
import { QueryActivityDto } from '@app/activities/dto/query-activity.dto';
import { GetEmployeesListDto } from '@app/accounts/dto/get-employees-list.dto';
import { AccountsService } from '@app/accounts';

@Injectable()
export class ExportService {
  proposalsRepository: any;

  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly accountsService: AccountsService,
  ) {}

  async export(exportDto: ExportDto, user: any, res: Response) {
    const filePath: string = await this.getService(exportDto.filter);
    // return res.json({ filePath });
    const fileName = filePath.split('/').pop();
    const fileStream = fs.createReadStream(filePath);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    fileStream.pipe(res);

    return res;
  }

  private async getService(filter: ExportDto['filter']): Promise<string> {
    switch (filter) {
      case 'activities':
        return this.getActivities('activities');
      case 'employees':
        return this.getEmployees('employees');
      default:
        throw new UnprocessableEntityException('Invalid url');
    }
  }

  private async getActivities(dirname: string): Promise<string> {
    const filter = {
      sort: {
        column: 'activities.created_at',
        order: 'desc',
      },
    } satisfies QueryActivityDto['filter'];

    const { data } = await this.activitiesService.findAll({
      cursor: 0,
      take: 99,
      direction: 'next',
      filter,
    });

    return this.csvGenerator(dirname, data);
  }

  private async getEmployees(dirname: string): Promise<string> {
    const filter = {
      sort: {
        column: 'users.created_at',
        order: 'desc',
      },
    } satisfies GetEmployeesListDto['filter'];

    const { data } = await this.accountsService.getEmployeeList({
      cursor: 0,
      take: 99,
      direction: 'next',
      filter,
    });

    return this.csvGenerator(dirname, data);
  }

  private csvGenerator(dir_name: string, data: any[]): string {
    try {
      const fileName = `${Date.now()}.csv`;
      const assetsPath = join(__dirname, `../../../assets/csv/${dir_name}`);
      const filePath: string = `${assetsPath}/${fileName}`;

      if (!fs.existsSync(assetsPath)) {
        fs.mkdirSync(assetsPath, { recursive: true });
      }

      const columns = Object.keys(data[0]).map((col) =>
        col.toLocaleUpperCase(),
      );
      const csv = data.map((row) =>
        columns.map((column) => row[column.toLocaleLowerCase()]),
      );
      csv.unshift(columns);
      const csvData = csv.join('\n');
      fs.writeFileSync(filePath, csvData);

      return filePath;
    } catch (error: any) {
      console.error('Csv yuklashdagi xatolik:', error);
      throw new NotFoundException('File not found');
    }
  }
}
