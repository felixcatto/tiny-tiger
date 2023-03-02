import { Model } from 'objection';
import * as y from 'yup';
import { IUser } from '../lib/types.js';
import { User } from './User.js';

export class Todo extends Model {
  id: number;
  text: string;
  author_id: number;
  is_completed: boolean;
  author?: IUser;

  static get tableName() {
    return 'todos';
  }

  static get relationMappings() {
    return {
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'todos.author_id',
          to: 'users.id',
        },
      },
    };
  }
}

export const todoSchema = y.object({
  text: y.string().required('required'),
  author_id: y.number().required('required'),
  is_completed: y.boolean().default(false),
});
