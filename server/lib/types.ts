/// <reference types="vite/client" />
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { FastifyInstance, FastifyReply } from 'fastify';
import { FormikHelpers } from 'formik';
import { Draft } from 'immer';
import { Knex } from 'knex';
import * as y from 'yup';
import { StoreApi } from 'zustand';
import makeActions from '../../client/globalStore/actions.js';
import { storeSlice } from '../../client/globalStore/store.js';
import { Query } from '../../client/gqlTypes/graphql.js';
import { selectedRowsStates } from '../../client/lib/utils.jsx';
import * as models from '../models/index.js';
import {
  Todo,
  User,
  todoPostGuestSchema,
  todoPostUserSchema,
  todoPutSchema,
  userGetSchema,
  userLoginSchema,
} from '../models/index.js';
import {
  apiTypes,
  asyncStates,
  filterTypes,
  paginationSchema,
  roles,
  routeDataSchema,
  sortOrders,
} from './utils.js';

export type IAnyObj = {
  [key: string]: any;
};

export type IMakeEnum = <T extends ReadonlyArray<string>>(
  ...args: T
) => { [key in T[number]]: key };

export type IMakeUrlFor = <T extends object>(
  rawRoutes: T
) => (name: keyof T, args?, opts?) => string;

export type IRole = keyof typeof roles;
export type IAsyncState = keyof typeof asyncStates;
export type ISelectedRowsState = keyof typeof selectedRowsStates;

export type IMode = 'test' | 'development' | 'production';

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
export type IUserGetSchema = y.InferType<typeof userGetSchema>;

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

type IModels = typeof models;
export type IOrm = { knex: Knex<any, any> } & IModels;

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
    orm: IOrm;
    mode: IMode;
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

export type IYupError = {
  message: string;
  errors: IAnyObj;
};

export type IAuthenticate = (
  rawCookies,
  keygrip,
  fetchUser: (id) => Promise<IUser | undefined>
) => Promise<[currentUser: IUser, shouldRemoveSession: boolean]>;

type IYupOpts = {
  stripUnknown?: boolean;
};
export type IValidate = <T = any>(
  schema,
  payload,
  yupOpts?: IYupOpts
) => [data: T, error: null] | [data: null, error: IYupError];
export type IPayloadTypes = 'query' | 'body';
export type IValidateMW = (
  schema,
  payloadType?: IPayloadTypes,
  yupOpts?: IYupOpts
) => (req, res) => any;

type IRawStoreSlice = typeof storeSlice;
export type IStoreSlice = {
  [key in keyof IRawStoreSlice]: ReturnType<IRawStoreSlice[key]>;
};

export type IActions = ReturnType<typeof makeActions>;

type ISetStateUpdateFn = (state: Draft<IStoreSlice>) => Partial<IStoreSlice> | void;
export type ISetGlobalState = (arg: Partial<IStoreSlice> | ISetStateUpdateFn) => void;
export type IGetGlobalState = () => IStoreSlice & IActions;

export type IStore = IStoreSlice & IActions & { setGlobalState: ISetGlobalState };

export type IUseStore = <T>(selector: (state: IStore) => T) => T;

type IAnyFn = (...args: any) => any;

export type IContext = {
  axios: IAxiosInstance;
  globalStore: StoreApi<IStore>;
};

export type IGetTodosResponse = {
  rows: ITodo[];
  totalRows: number;
};

export type IOnSubmit = (values, actions: FormikHelpers<any>) => Promise<any>;
export type IUseSubmit = (onSubmit: IOnSubmit) => IOnSubmit;

type Anyify<T> = { [K in keyof T]: any };

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

export type IMixedFilter = ISearchFilter | ISelectFilter;

export type ISelectFilterObj = {
  filterBy: string;
  filterType: IFilterTypes['select'];
  filter: ISelectFilter;
  filterOptions: ISelectFilter;
  customFilterFn?: (rowValue, filter: IMixedFilter) => boolean;
};

export type ISearchFilterObj = {
  filterBy: string;
  filterType: IFilterTypes['search'];
  filter: ISearchFilter;
  customFilterFn?: (rowValue, filter: IMixedFilter) => boolean;
};

export type IFilter = ISelectFilterObj | ISearchFilterObj;
export type IFiltersMap = Record<string, Anyify<IFilter> & { filterOptions?: any }>;

export type IRouteDataSchema = y.InferType<typeof routeDataSchema>;
export type IPaginationSchema = y.InferType<typeof paginationSchema>;
export type ISortSchema = {
  sortOrder?: Exclude<ISortOrder, 'none'>;
  sortBy?: string;
};
export type IFilterSchema = {
  filterBy: string;
  filter: string | any[];
};
export type IFiltersSchema = {
  filters?: IFilterSchema[];
};
export type IClientFiltersSchema = {
  filters: IFiltersMap;
};

export type IFSPSchema = IFiltersSchema & ISortSchema & IPaginationSchema;
export type IClientFSPSchema = IClientFiltersSchema & ISortSchema & IPaginationSchema;

export type ISelectFilterProps = {
  name: string;
  setIsOpen: any;
  filterOptions: ISelectFilter;
  filter: ISelectFilter;
  onFilter: (filter: ISelectFilter, filterBy: string) => void;
};

export type ISearchFilterProps = {
  name: string;
  setIsOpen: any;
  filter: ISearchFilter;
  onFilter: (filter: ISearchFilter, filterBy: string) => void;
};

export type IHeaderCellProps = {
  children: any;
  name: string;
  onSortChange: (sortOrder: ISortOrder, sortBy: string) => void;
  onFilterChange: (filter: IMixedFilter, filterBy: string) => void;
  filters: IFiltersMap;
  sortable?: boolean;
  sortBy?: string;
  sortOrder?: ISortOrder;
  className?: string;
};

export type IUseTableState = {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: ISortOrder;
  filters?: IFiltersMap;
};

export type IUseTableProps<T = any> = {
  rows?: T[];
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: ISortOrder;
  filters?: IFiltersMap;
};

export type IUseTable = <T extends IAnyObj, TActualProps extends IUseTableProps>(
  props: IUseTableProps<T> & TActualProps
) => {
  rows: T[];
  totalRows: number;

  page: TActualProps['page'];
  size: TActualProps['size'];
  sortBy: TActualProps['sortBy'];
  sortOrder: TActualProps['sortOrder'];
  filters: TActualProps['filters'];

  paginationProps: {
    page;
    size;
    onPageChange;
    onSizeChange;
  };

  headerCellProps: {
    sortBy;
    sortOrder;
    filters;
    onSortChange;
    onFilterChange;
  };
};

export type IUseSelectedRows = <T extends object>(props: {
  rows: T[];
  defaultSelectedRows?: Record<string, T>;
  rowKey?: string;
}) => {
  selectedRows: Record<string, T>;
  setSelectedRows: any;
  isRowSelected: (row: T) => boolean;
  onSelectRow: (row: T) => () => void;
  selectAllRowsCheckboxProps: {
    onChange: () => void;
    checked: boolean;
    partiallyChecked: boolean;
  };
};

export type IEncodeFSPOptsProps = {
  page?: number;
  size?: number;
  sortBy?: string | null;
  sortOrder?: ISortOrder;
  filters: Record<any, IFilter>;
};

export type IEncodeFSPOpts = (props: IEncodeFSPOptsProps) => {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: ISortOrder;
  filters?: string;
};

type IFn<T> = (freshState: T) => Partial<T>;
type ISetState<T> = (fnOrObject: Partial<T> | IFn<T>) => void;
export type IUseMergeState = <T>(initialState: T) => [state: T, setState: ISetState<T>];

type INotificationText = { text: string; component?: undefined };
type INotificationComponent = {
  text?: undefined;
  component: () => JSX.Element;
};
export type INotification = {
  id: string;
  title: string;
  isHidden: boolean;
  isInverseAnimation: boolean;
  autoremoveTimeout: number | null;
} & (INotificationText | INotificationComponent);

type IMakeNotificationOpts = {
  title: INotification['title'];
  autoremoveTimeout?: INotification['autoremoveTimeout'];
} & (INotificationText | INotificationComponent);
export type IMakeNotification = (opts: IMakeNotificationOpts) => INotification;

export type IInitialState = {
  currentUser: IUser;
  routeData: IAnyObj;
};

declare global {
  interface Window {
    INITIAL_STATE: IInitialState;
  }
}

export type IGqlApi = { method: 'post'; url: string };

export type IGqlCtx = {
  app: FastifyInstance;
  reply: FastifyReply;
};

export type IApiType = keyof typeof apiTypes;

export type IGqlResponse<T extends keyof Query> = {
  [key in T]: Query[T];
};

export type ISpinnerProps = {
  wrapperClass?: string;
  spinnerClass?: string;
  isVisible?: boolean;
};

export type ILoadable = <T extends IAnyFn>(
  dynamicImportFn: T,
  opts?: { fallback: any }
) => Awaited<ReturnType<T>>['default'];
