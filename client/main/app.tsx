import originalAxios from 'axios';
import { SWRConfig } from 'swr';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { getUrl } from '../../lib/sharedUtils.js';
import { IContext, IUser } from '../../lib/types.js';
import { AppRoutes } from '../common/AppRoutes.jsx';
import makeActions from '../globalStore/actions.js';
import { storeSlice } from '../globalStore/store.js';
import { Context } from '../lib/context.jsx';

type IAppProps = {
  currentUser: IUser;
  query: object;
  loaderData: any;
};

export const App = (props: IAppProps) => {
  const { currentUser, query, loaderData } = props;

  const axios = originalAxios.create();
  axios.interceptors.response.use(
    response => response.data,
    error => {
      console.log(error.response);
      const { status } = error.response;
      if ([401, 403].includes(status)) {
        window.location.href = getUrl('newSession');
      }
      return Promise.reject(error);
    }
  );

  const swrConfig = {
    fetcher: axios.get,
    revalidateOnFocus: false,
    dedupingInterval: 7000,
  };

  const store = Object.keys(storeSlice).reduce((acc, key) => {
    const makeFn = storeSlice[key];
    return { ...acc, [key]: makeFn() };
  }, {});

  const useStore = create<any>(
    immer((set, get) => ({
      setGlobalState: set,
      ...makeActions(set, get),
      ...store,
      currentUser: storeSlice.currentUser(currentUser),
    }))
  );

  const contextStore: IContext = {
    axios,
    useStore,
    initialQuery: query,
    initialLoaderData: loaderData,
  };

  return (
    <Context.Provider value={contextStore}>
      <SWRConfig value={swrConfig}>
        <AppRoutes />
      </SWRConfig>
    </Context.Provider>
  );
};
