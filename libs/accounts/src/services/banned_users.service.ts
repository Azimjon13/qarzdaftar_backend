import { Injectable } from '@nestjs/common';
import { BannedUsersRepository } from '../repository/banned_users.repository';
import { Knex } from 'knex';
import { GetMeBannedListDto } from '../dto/get-me-banned-list.dto';

@Injectable()
export class BannedUsersService {
  constructor(private readonly bannedUsersRepository: BannedUsersRepository) {}

  public async getBannedUserListByAuthor(
    authorId: number,
    dto: GetMeBannedListDto,
  ) {
    return this.bannedUsersRepository.findAllByAuthor(authorId, dto);
  }

  public getCountUserBanned(userId: number) {
    return this.bannedUsersRepository.findCount(userId);
  }

  public bannedUsersByOperationExpired() {
    return this.bannedUsersRepository.createManySelectOperation();
  }

  public unbanedUser(
    authorId: number,
    bannedId: number,
    trx?: Knex.Transaction,
  ) {
    return this.bannedUsersRepository.deleteOneByAuthorId(
      authorId,
      bannedId,
      trx,
    );
  }
}
