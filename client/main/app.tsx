import { configureStore } from '@reduxjs/toolkit';
import originalAxios from 'axios';
import React from 'react';
import { Provider } from 'react-redux';
import { SWRConfig } from 'swr';
import { Route, Switch } from 'wouter';
import { IBindedActions, IContext, IUser } from '../../lib/types.js';
import Context from '../lib/context.js';
import { makeThunks, reduxActions } from '../lib/reduxActions.js';
import { makeCurUserReducer } from '../lib/reduxReducers.js';
import { getUrl, routes } from '../lib/utils.js';
import Login from '../session/Login.js';
import TodoList from '../todoList/Todolist.js';

type IAppProps = {
  initialState: {
    currentUser: IUser;
  };
};

export const App = (props: IAppProps) => {
  console.log(props);
  const { currentUser } = props.initialState;

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
  };

  const reduxThunks = makeThunks({ axios });
  const actions = { ...reduxActions, ...reduxThunks };

  const reduxStore = configureStore({
    reducer: {
      [makeCurUserReducer.key]: makeCurUserReducer(actions, currentUser),
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
          </Switch>
        </SWRConfig>
      </Context.Provider>
    </Provider>
  );
};
