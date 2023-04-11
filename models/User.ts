import { Model } from 'objection';
import * as y from 'yup';
import { IRole, ITodo } from '../lib/types.js';
import { encrypt } from '../lib/utils.js';
import { Todo } from './Todo.js';

export class User extends Model {
  id: number;
  name: string;
  role: IRole;
  email: string;
  password_digest: string;
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

export const userLoginSchema = y.object({
  name: y.string().required('required'),
  password: y.string().required('required'),
});
