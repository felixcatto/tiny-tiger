import originalAxios from 'axios';
import { SWRConfig } from 'swr';
import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { getUrl } from '../../lib/sharedUtils.js';
import { IAppProps, IContext } from '../../lib/types.js';
import makeActions from '../globalStore/actions.js';
import { storeSlice } from '../globalStore/store.js';
import { Context } from '../lib/context.jsx';
import { AppRoutes } from './AppRoutes.jsx';

export const App = (props: IAppProps) => {
  const { currentUser, pathname, query, loaderData } = props;

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

  const initializedStoreSlice = Object.keys(storeSlice).reduce((acc, key) => {
    const makeFn = storeSlice[key];
    return { ...acc, [key]: makeFn() };
  }, {});

  const globalStoreState = (set, get) => ({
    setGlobalState: set,
    ...makeActions(set, get),
    ...initializedStoreSlice,
    currentUser: storeSlice.currentUser(currentUser),
  });

  const globalStore: any = createStore(immer(globalStoreState));

  const contextStore: IContext = {
    axios,
    globalStore,
    initialPathname: pathname,
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
