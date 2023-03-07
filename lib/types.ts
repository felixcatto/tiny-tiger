import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Knex } from 'knex';
import * as y from 'yup';
import { reduxActions, makeThunks } from '../client/common/reduxActions.js';
import * as models from '../models/index.js';
import { Todo, todoSchema, todoSortSchema, User, userLoginSchema } from '../models/index.js';
import { asyncStates, paginationSchema, roles } from './utils.js';

export type IMakeEnum = <T extends ReadonlyArray<string>>(
  ...args: T
) => { [key in T[number]]: key };

export type IMakeUrlFor = <T extends object>(
  rawRoutes: T
) => (name: keyof T, args?, opts?) => string;

export type IRole = keyof typeof roles;
export type IAsyncState = keyof typeof asyncStates;

export type IMode = 'test' | 'development' | 'production';

export type IPaginationSchema = y.InferType<typeof paginationSchema>;

export type IUser = {
  id: number;
  name: string;
  role: IRole;
  email: string;
  password_digest: string;
  is_signed_in: boolean;
  todos?: ITodo[];
};
export type IUserClass = typeof User;
export type IUserLoginSchema = y.InferType<typeof userLoginSchema>;

export type IUserLoginCreds = {
  email: string;
  password: string;
};

export type ITodo = {
  id: number;
  text: string;
  author_id: any;
  is_completed: boolean;
  is_edited_by_admin: boolean;
  author?: IUser;
};
export type ITodoClass = typeof Todo;
export type ITodoSchema = y.InferType<typeof todoSchema>;
export type ITodoSortSchema = y.InferType<typeof todoSortSchema>;

type IModels = {
  [Property in keyof typeof models]: (typeof models)[Property];
};
export type IObjection = { knex: Knex<any, any> } & IModels;

export interface IAxiosInstance extends AxiosInstance {
  request<T = any, R = T, D = any>(config: AxiosRequestConfig<D>): Promise<R>;
  get<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
  delete<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
  head<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
  options<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
  post<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  put<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  patch<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
}

declare module 'fastify' {
  interface FastifyInstance {
    objection: IObjection;
    mode: IMode;
    keygrip: any;
  }
  interface FastifyRequest {
    vlBody: any;
    vlQuery: any;
    currentUser: IUser;
  }
}

export type IApiErrors = {
  apiErrors: any;
  setApiErrors: any;
};

export type IPayloadTypes = 'query' | 'body';
export type IValidateFn = (schema, payloadType?: IPayloadTypes) => (req, res) => any;

type IAnyFn = (...args: any) => any;
type IThunkArg<T extends IAnyFn> = Parameters<T>;
type IThunkReturn<T extends IAnyFn> = ReturnType<ReturnType<ReturnType<T>>['unwrap']>;
export type IReduxActions = typeof reduxActions;
export type IReduxThunks = ReturnType<typeof makeThunks>;
export type IBindedThunks = {
  [K in keyof IReduxThunks]: (...args: IThunkArg<IReduxThunks[K]>) => IThunkReturn<IReduxThunks[K]>;
};
export type IActions = IReduxActions & IReduxThunks;
export type IBindedActions = IReduxActions & IBindedThunks;

export type IReduxState = {
  currentUser: IUser;
};

export type IContext = {
  axios: IAxiosInstance;
  actions: IBindedActions;
};

export type IGetTodosResponse = {
  rows: ITodo[];
  totalRows: number;
};

export type IOnSubmit = (values) => Promise<any>;
export type IUseSubmit = (onSubmit: IOnSubmit) => IOnSubmit;
