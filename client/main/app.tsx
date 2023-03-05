import { configureStore } from '@reduxjs/toolkit';
import originalAxios from 'axios';
import React from 'react';
import { Provider } from 'react-redux';
import { SWRConfig } from 'swr';
import { IBindedActions, IContext } from '../../lib/types.js';
import { makeThunks, reduxActions } from '../common/reduxActions.js';
import { makeCurUserReducer } from '../common/reduxReducers.js';
import Context from '../lib/context.js';
import { restoreUser } from '../lib/utils.js';

type IAppProps = {
  Component: (props) => JSX.Element;
};

const App = (props: IAppProps) => {
  const { Component } = props;

  const { contextStore, reduxStore, swrConfig } = React.useMemo(() => {
    const axios = originalAxios.create();
    axios.interceptors.response.use(
      response => response.data,
      error => {
        console.log(error.response);
        return Promise.reject(error.response.data);
      }
    );

    const swrConfig = {
      fetcher: axios.get,
      revalidateOnFocus: false,
    };

    const reduxThunks = makeThunks({ axios });
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
    const actions = { ...reduxActions, ...reduxThunks };
    const bindedActions = { ...bindedReduxActions, ...bindedThunks } as IBindedActions;

    const initialUserState = restoreUser();

    const reduxStore = configureStore({
      reducer: {
        currentUser: initialUserState
          ? makeCurUserReducer(actions, initialUserState)
          : makeCurUserReducer(actions),
      },
    });

    const contextStore: IContext = {
      axios,
      actions: bindedActions,
    };

    return { contextStore, reduxStore, swrConfig };
  }, []);

  return (
    <Provider store={reduxStore}>
      <Context.Provider value={contextStore}>
        <SWRConfig value={swrConfig}>
          <Component />
        </SWRConfig>
      </Context.Provider>
    </Provider>
  );
};

export default App;
