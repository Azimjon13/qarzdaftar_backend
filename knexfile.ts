import type { Knex } from 'knex';
import * as dotenv from 'dotenv';
dotenv.config();
const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_CLIENT, DB_PORT } =
  process.env;

const config: { [key: string]: Knex.Config } = {
  development: {
    client: DB_CLIENT,
    connection: {
      host: DB_HOST,
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD,
      port: parseInt(DB_PORT || '5432'),
    },
    pool: {
      min: 2,
      max: 10,
    },
    seeds: {
      directory: './database/seeds',
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './database/migrations',
    },
  },
  staging: {
    client: DB_CLIENT,
    connection: {
      host: DB_HOST,
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD,
      port: parseInt(DB_PORT || '5432'),
    },
    pool: {
      min: 2,
      max: 10,
    },
    seeds: {
      directory: './database/seeds',
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './database/migrations',
    },
  },
  production: {
    client: DB_CLIENT,
    connection: {
      host: DB_HOST,
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD,
      port: parseInt(DB_PORT || '5432'),
    },
    pool: {
      min: 2,
      max: 10,
    },
    seeds: {
      directory: './database/seeds',
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './database/migrations',
    },
  },
};

module.exports = config;
