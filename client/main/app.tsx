import originalAxios from 'axios';
import { Provider } from 'jotai';
import { SWRConfig } from 'swr';
import { Route, Switch } from 'wouter';
import { IContext, IJotaiAtoms, IUser } from '../../lib/types.js';
import makeActions from '../globalStore/actions.js';
import { makeAtoms, makeComputed } from '../globalStore/atoms.js';
import Context from '../lib/context.js';
import { getUrl, routes } from '../lib/utils.js';
import Login from '../pages/session/Login.js';
import TodoList from '../pages/todoList/Todolist.js';
import { User } from '../pages/users/User.jsx';
import { Users } from '../pages/users/Users.js';

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

  const atoms = Object.keys(makeAtoms).reduce((acc, key) => {
    const makeFn = makeAtoms[key];
    return { ...acc, [key]: makeFn() };
  }, {} as IJotaiAtoms);

  atoms['currentUserAtom'] = makeAtoms.currentUserAtom(currentUser);

  const computed = makeComputed(atoms);
  const actions = makeActions({ ...atoms, ...computed });

  const contextStore: IContext = { axios, ...atoms, ...computed, ...actions };

  return (
    <Provider>
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
    </Provider>
  );
};
