import { isArray, isEmpty, isString, isUndefined } from 'lodash-es';
import { Model } from 'objection';
import * as y from 'yup';
import { IUser } from '../lib/types.js';
import { sortOrders, yupFromJson } from '../lib/utils.js';
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

export const todoFields = ['id', 'text', 'is_completed', 'is_edited_by_admin', 'author.name'];

export const todoPostGuestSchema = y.object({
  text: y.string().required('required'),
  name: y.string().required('required'),
  email: y.string().email().required('required'),
  is_completed: y.boolean().default(false),
});

export const todoPostUserSchema = y.object({
  text: y.string().required('required'),
  is_completed: y.boolean().default(false),
});

export const todoPutSchema = y.object({
  text: y.string().required('required'),
  is_completed: y.boolean().default(false),
});

export const todoSortSchema = y.object({
  sortOrder: y.string().oneOf([sortOrders.asc, sortOrders.desc]),
  sortBy: y.string().oneOf(todoFields),
});

export const todoFilterSchema = y.object({
  filters: y
    .array()
    .of(
      y.object({
        filterBy: y.string().oneOf(todoFields).required(),
        filter: y.mixed().test({
          message: 'filter should be non empty String or Any[]',
          test: value => {
            if (!isString(value) && !isArray(value)) return false;
            return !isEmpty(value);
          },
        }),
      })
    )
    .test({
      message: 'filters should be not empty []',
      test: value => (isArray(value) && !isEmpty(value)) || isUndefined(value),
    })
    .transform(yupFromJson),
});
