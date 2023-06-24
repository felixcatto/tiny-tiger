import { NotificationsProvider } from '@felixcatto/ui';
import originalAxios from 'axios';
import { SWRConfig } from 'swr';
import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { IContext, IInitialState } from '../../server/lib/types.js';
import makeActions from '../globalStore/actions.js';
import { storeSlice } from '../globalStore/store.js';
import { Context } from '../lib/context.jsx';
import { Route, Switch } from '../lib/router.jsx';
import { getUrl, routes } from '../lib/utils.jsx';
import { ProjectStructureAsync } from '../pages/projectStructure/Index.jsx';
import { NewSession } from '../pages/session/New.jsx';
import { Todos } from '../pages/todos/Index.jsx';
import { User } from '../pages/users/@id.jsx';
import { Users } from '../pages/users/Index.jsx';

export const App = (props: IInitialState) => {
  const { currentUser } = props;

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

  const contextStore: IContext = { axios, globalStore };

  return (
    <Context.Provider value={contextStore}>
      <SWRConfig value={swrConfig}>
        <NotificationsProvider>
          <Switch>
            <Route path={routes.home} component={Todos} />
            <Route path={routes.newSession} component={NewSession} />
            <Route path={routes.users} component={Users} />
            <Route path={routes.user} component={User} />
            <Route path={routes.projectStructure} component={ProjectStructureAsync} />
          </Switch>
        </NotificationsProvider>
      </SWRConfig>
    </Context.Provider>
  );
};
