import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Knex } from 'knex';
import * as y from 'yup';
import * as models from '../models/index.js';
import { Todo, todoSchema, User, userLoginSchema } from '../models/index.js';
import { asyncStates, getApiUrl, roles } from './utils.js';

export type IMakeEnum = <T extends ReadonlyArray<string>>(
  ...args: T
) => { [key in T[number]]: key };

export type IMakeUrlFor = <T extends object>(
  rawRoutes: T
) => (name: keyof T, args?, opts?) => string;

export type IGetApiUrl = typeof getApiUrl;

export type IRole = keyof typeof roles;
export type IAsyncState = keyof typeof asyncStates;

export type IMode = 'test' | 'development' | 'production';

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
export type IUserSchema = y.InferType<typeof userSchema>;
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
  author?: IUser;
};
export type ITodoClass = typeof Todo;
export type ITodoSchema = y.InferType<typeof todoSchema>;

export type ISession = {
  currentUser: IUser;
  isAdmin: boolean;
  isSignedIn: boolean;
  status: IAsyncState;
  errors: any;
};

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

export type IContext = {
  axios: IAxiosInstance;
  // actions: IActions;
  // $session: ISessionStore;
};

export type IApiErrors = {
  apiErrors: any;
  setApiErrors: any;
};

export type IPayloadTypes = 'query' | 'body';
export type IValidateFn = (schema, payloadType?: IPayloadTypes) => (req, res) => any;
