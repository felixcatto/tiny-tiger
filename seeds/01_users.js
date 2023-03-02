import crypto from 'crypto';
import dotenv from 'dotenv';
import { omit } from 'lodash-es';
import path from 'path';
import { dirname } from '../lib/devUtils.js';
import users from '../__tests__/fixtures/users.js';

const __dirname = dirname(import.meta.url);
dotenv.config({ path: path.resolve(__dirname, '../.env.development') });

const keys = process.env.KEYS.split(',');
const encrypt = value => crypto.createHmac('sha256', keys[0]).update(value).digest('hex');

export const seed = async knex => {
  const newUsers = users
    .map(user => ({ ...user, password_digest: encrypt(user.password) }))
    .map(user => omit(user, 'password'));
  await knex('users').delete();
  await knex('users').insert(newUsers);
};
