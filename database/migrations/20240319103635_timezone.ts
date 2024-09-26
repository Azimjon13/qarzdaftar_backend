import { Knex } from 'knex';
import * as dotenv from 'dotenv';
dotenv.config();
const { DB_NAME } = process.env;
export async function up(knex: Knex): Promise<void> {
  return knex.raw(`ALTER DATABASE ${DB_NAME} SET timezone TO 'Asia/Tashkent'`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`ALTER DATABASE  ${DB_NAME}  SET timezone TO 'Etc/UTC'`);
}
