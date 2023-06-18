import originalAxios from 'axios';
import { SWRConfig } from 'swr';
import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { getUrl } from '../../lib/sharedUtils.js';
import { routes } from '../../lib/sharedUtils.js';
import { IContext, IInitialState } from '../../lib/types.js';
import makeActions from '../globalStore/actions.js';
import { storeSlice } from '../globalStore/store.js';
import { Context } from '../lib/context.jsx';
import { Route, Switch } from '../lib/router.jsx';
import { ProjectStructureAsync } from '../pages/projectStructure/ProjectStructureAsync.jsx';
import Login from '../pages/session/Login.jsx';
import Todolist from '../pages/todoList/Todolist.jsx';
import { User } from '../pages/users/User.jsx';
import { Users } from '../pages/users/Users.jsx';

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
        <Switch>
          <Route path={routes.home} component={Todolist} />
          <Route path={routes.newSession} component={Login} />
          <Route path={routes.users} component={Users} />
          <Route path={routes.user} component={User} />
          <Route path={routes.projectStructure} component={ProjectStructureAsync} />
        </Switch>
      </SWRConfig>
    </Context.Provider>
  );
};
