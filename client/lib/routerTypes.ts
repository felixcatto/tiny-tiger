import { asyncStates } from '../../server/lib/routerUtils.js';

export type IAnyObj = {
  [key: string]: any;
};

export type IMakeEnum = <T extends ReadonlyArray<string>>(
  ...args: T
) => { [key in T[number]]: key };

export type IAsyncState = keyof typeof asyncStates;

export type IGetGenericDataRoute = (
  url: string,
  dataRoutes: readonly string[]
) => {
  url: string;
  genericUrl: string;
  params: IAnyObj;
  query: IAnyObj;
} | null;

export type IRouterProps = {
  routeData: IAnyObj;
  dataRoutes: readonly string[];
  fetchRouteData?: (url: string) => Promise<IAnyObj>;
  pathname?: string;
  query?: IAnyObj;
  children?: any;
};

export type IRouterActions = {
  setRouterState: ISetRouterState;
  refreshRouteData: () => Promise<void>;
  navigate: (href: string) => Promise<void>;
};

export type IRouterSlice = {
  initialQuery: IAnyObj;
  initialPathname: string;

  routeDataState: IAsyncState;
  dynamicPathname: string;
  routeData: IAnyObj;
};

type ISetRouterStateUpdateFn = (state: IRouterSlice) => Partial<IRouterSlice> | void;
export type ISetRouterState = (arg: Partial<IRouterSlice> | ISetRouterStateUpdateFn) => void;
export type IGetRouterState = () => IRouterSlice & IRouterActions;

type IRouterStore = IRouterActions & IRouterSlice;

export type IUseRouter = <T>(selector: (state: IRouterStore) => T) => T;

export type IRoute = {
  path: string;
  component: React.FC;
  shouldRender?: boolean;
  routeData?: any;
};
