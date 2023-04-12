import { configureStore } from '@reduxjs/toolkit';
import originalAxios from 'axios';
import { Provider } from 'react-redux';
import { SWRConfig } from 'swr';
import { Route, Switch } from 'wouter';
import { IBindedActions, IContext, IUser } from '../../lib/types.js';
import Context from '../lib/context.js';
import {
  makeCurUserReducer,
  makeNotificationAnimationDuration,
  makeNotificationsReducer,
  makeThunks,
  reduxActions,
} from '../lib/reduxStore.js';
import { getUrl, routes } from '../lib/utils.js';
import Login from '../session/Login.js';
import TodoList from '../todoList/Todolist.js';
import { Users } from '../users/Users.js';

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
      return Promise.reject(error.response.data);
    }
  );

  const swrConfig = {
    fetcher: axios.get,
    revalidateOnFocus: false,
    fallback,
  };

  const reduxThunks = makeThunks({ axios, actions: reduxActions });
  const actions = { ...reduxActions, ...reduxThunks };

  const reduxStore = configureStore({
    reducer: {
      [makeCurUserReducer.key]: makeCurUserReducer(actions, currentUser),
      [makeNotificationAnimationDuration.key]: makeNotificationAnimationDuration(actions),
      [makeNotificationsReducer.key]: makeNotificationsReducer(actions),
    },
  });

  const bindedReduxActions = Object.keys(reduxActions).reduce(
    (acc, actionType) => ({
      ...acc,
      [actionType]: arg => reduxStore.dispatch(reduxActions[actionType](arg)),
    }),
    {}
  );
  const bindedThunks = Object.keys(reduxThunks).reduce(
    (acc, actionType) => ({
      ...acc,
      [actionType]: arg => reduxStore.dispatch(reduxThunks[actionType](arg)).unwrap(),
    }),
    {}
  );
  const bindedActions = { ...bindedReduxActions, ...bindedThunks } as IBindedActions;

  const contextStore: IContext = {
    axios,
    actions: bindedActions,
  };

  return (
    <Provider store={reduxStore}>
      <Context.Provider value={contextStore}>
        <SWRConfig value={swrConfig}>
          <Switch>
            <Route path={routes.home} component={TodoList} />
            <Route path={routes.newSession} component={Login} />
            <Route path={routes.users} component={Users} />
          </Switch>
        </SWRConfig>
      </Context.Provider>
    </Provider>
  );
};
