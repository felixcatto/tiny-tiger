import { without } from 'lodash-es';
import { Model } from 'objection';
import * as y from 'yup';
import { IUser } from '../lib/types.js';
import { sortOrder } from '../lib/utils.js';
import { User } from './User.js';

export class Todo extends Model {
  id: number;
  text: string;
  author_id: number;
  is_completed: boolean;
  is_edited_by_admin: boolean;
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

const todoFields = without(Object.keys(new Todo()), 'author');

export const todoSchema = y.object({
  text: y.string().required('required'),
  author_id: y.number().required('required'),
  is_completed: y.boolean().default(false),
});

export const todoSortSchema = y.object({
  sortOrder: y.string().oneOf(sortOrder),
  sortBy: y.string().oneOf(todoFields),
});
