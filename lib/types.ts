import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { FormikHelpers } from 'formik';
import { Knex } from 'knex';
import * as y from 'yup';
import { makeThunks, reduxActions } from '../client/lib/reduxActions.js';
import { makeCurUserReducer } from '../client/lib/reduxReducers.js';
import * as models from '../models/index.js';
import {
  Todo,
  todoPostGuestSchema,
  todoPostUserSchema,
  todoPutSchema,
  User,
  userLoginSchema,
} from '../models/index.js';
import { asyncStates, filterTypes, paginationSchema, roles, sortOrders } from './utils.js';

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
export type ISortSchema = {
  sortOrder: Exclude<ISortOrder, 'none'>;
  sortBy: string;
};
export type IFilterSchema = {
  filterBy: string;
  filter: string | any[];
};
export type IFiltersSchema = {
  filters: IFilterSchema[];
};

export type IUser = {
  id: number;
  name: string;
  role: IRole;
  email: string;
  password_digest: string;
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
export type ITodoPostGuestSchema = y.InferType<typeof todoPostGuestSchema>;
export type ITodoPostUserSchema = y.InferType<typeof todoPostUserSchema>;
export type ITodoPutSchema = y.InferType<typeof todoPutSchema>;

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
    isProduction: boolean;
    keygrip: any;
    template: string;
    pathPublic: string;
    vite: any;
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

export type IAuthenticate = (
  rawCookies,
  keygrip,
  fetchUser: (id) => Promise<IUser | undefined>
) => Promise<[currentUser: IUser, shouldRemoveSession: boolean]>;

export type IValidate = <T = any>(
  schema,
  payload
) => [data: T, error: null] | [data: null, error: object];
export type IPayloadTypes = 'query' | 'body';
export type IValidateMW = (schema, payloadType?: IPayloadTypes) => (req, res) => any;

type IAnyFn = (...args: any) => any;
type IReducerKey = { key: any };
type IGenericReducer = IAnyFn & IReducerKey;

type IReduxRecord<T extends IGenericReducer> = Record<
  T['key'],
  ReturnType<ReturnType<T>['getInitialState']>
>;

type IThunkArg<T extends IAnyFn> = Parameters<T>;
type IThunkReturn<T extends IAnyFn> = ReturnType<ReturnType<ReturnType<T>>['unwrap']>;
export type IReduxActions = typeof reduxActions;
export type IReduxThunks = ReturnType<typeof makeThunks>;
export type IBindedThunks = {
  [K in keyof IReduxThunks]: (...args: IThunkArg<IReduxThunks[K]>) => IThunkReturn<IReduxThunks[K]>;
};
export type IActions = IReduxActions & IReduxThunks;
export type IBindedActions = IReduxActions & IBindedThunks;

export type IReduxState = IReduxRecord<typeof makeCurUserReducer>;

export type IContext = {
  axios: IAxiosInstance;
  actions: IBindedActions;
};

export type IGetTodosResponse = {
  rows: ITodo[];
  totalRows: number;
};

export type IOnSubmit = (values, actions: FormikHelpers<any>) => Promise<any>;
export type IUseSubmit = (onSubmit: IOnSubmit) => IOnSubmit;

export type ISelectOption = {
  value: any;
  label: string;
  [key: string]: any;
};
export type ISelectedOption = ISelectOption | null;

export type ISortOrder = keyof typeof sortOrders | null;
export type IFilterTypes = typeof filterTypes;

export type ISelectFilter = ISelectOption[];
export type ISearchFilter = string;

export type IFilter =
  | {
      filterBy: string;
      filterType: IFilterTypes['select'];
      filter: ISelectFilter;
    }
  | {
      filterBy: string;
      filterType: IFilterTypes['search'];
      filter: ISearchFilter;
    };

export type IMixedOnFilter = (filter: ISearchFilter | ISelectFilter, filterBy: string) => void;

export type ISelectFilterProps = {
  name: string;
  setIsOpen: any;
  selectFilterOptions: ISelectFilter;
  filter: ISelectFilter;
  onFilter: (filter: ISelectFilter, filterBy: string) => void;
};

export type ISearchFilterProps = {
  name: string;
  setIsOpen: any;
  filter: ISearchFilter;
  onFilter: (filter: ISearchFilter, filterBy: string) => void;
};

export type INonFilterableOpts = {
  filterType?: undefined;
};

export type ISelectFilterOpts = {
  filterType: typeof filterTypes.select;
  filter: ISelectFilterProps['filter'];
  onFilter: ISelectFilterProps['onFilter'];
  selectFilterOptions: ISelectFilterProps['selectFilterOptions'];
};

export type ISearchFilterOpts = {
  filterType: typeof filterTypes.search;
  filter: ISearchFilterProps['filter'];
  onFilter: ISearchFilterProps['onFilter'];
};

export type IHeaderCellProps = {
  children: any;
  onSort: (sortOrder: ISortOrder, sortBy: string) => void;
  name: string;
  sortOrder?: ISortOrder;
  className?: string;
} & (ISearchFilterOpts | ISelectFilterOpts | INonFilterableOpts);

export type IUseTableProps<T> = {
  rows: T;
  page: number;
  size: number;
  sortBy: string | null;
  sortOrder: ISortOrder;
  filters: Map<string, IFilter>;
};

export type IUseTable = <T extends any[]>(
  props: IUseTableProps<T>
) => { rows: T; totalRows: number };

export type IUseQueryProps = {
  page: number;
  size: number;
  sortBy: string | null;
  sortOrder: ISortOrder;
  filters: Map<string, IFilter>;
};

export type IUseQuery = (props: IUseQueryProps) => {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: ISortOrder;
  filters?: IFilter[];
};

type IProduceFn<T> = (draftState: T) => any;
type ISetState<T> = (fnOrObject: Partial<T> | IProduceFn<T>) => void;
export type IUseImmerState = <T>(initialState: T) => [state: T, setState: ISetState<T>];
