import originalAxios from 'axios';
import { SWRConfig } from 'swr';
import { Route, Switch } from 'wouter';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { IContext, IUser } from '../../lib/types.js';
import { storeSlice } from '../globalStore/store.js';
import Context from '../lib/context.js';
import { getUrl, routes } from '../lib/utils.js';
import Login from '../pages/session/Login.js';
import TodoList from '../pages/todoList/Todolist.js';
import { User } from '../pages/users/User.jsx';
import { Users } from '../pages/users/Users.js';
import makeActions from '../globalStore/actions.js';

type IAppProps = {
  initialState: {
    currentUser: IUser;
    fallback: any;
  };
};

export const App = (props: IAppProps) => {
  const { currentUser, fallback = {} } = props.initialState;

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
    fallback,
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

  const contextStore: IContext = { axios, useStore };

  return (
    <Context.Provider value={contextStore}>
      <SWRConfig value={swrConfig}>
        <Switch>
          <Route path={routes.home} component={TodoList} />
          <Route path={routes.newSession} component={Login} />
          <Route path={routes.users} component={Users} />
          <Route path={routes.user} component={User} />
        </Switch>
      </SWRConfig>
    </Context.Provider>
  );
};
