import { Model } from 'objection';
import path from 'path';
import * as y from 'yup';
import { encrypt } from '../lib/utils.js';
import { ITodo, IRole } from '../lib/types.js';
import { roles } from '../lib/utils.js';
import { Todo } from './Todo.js';

export class User extends Model {
  id: number;
  name: string;
  role: IRole;
  email: string;
  password_digest: string;
  is_signed_in: boolean;
  todos?: ITodo[];

  static get tableName() {
    return 'users';
  }

  static get relationMappings() {
    return {
      todos: {
        relation: Model.HasManyRelation,
        modelClass: Todo,
        join: {
          from: 'users.id',
          to: 'todos.author_id',
        },
      },
    };
  }

  set password(value) {
    this.password_digest = encrypt(value);
  }
}

export const userSchema = y.object({
  name: y.string().required('required'),
  role: y.mixed().oneOf(Object.values(roles)).required('required'),
  email: y.string().email().required('required'),
  password: y.string().required('required'),
});

export const userLoginSchema = y.object({
  email: y.string().email().required('required'),
  password: y.string().required('required'),
});
