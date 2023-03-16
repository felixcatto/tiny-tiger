import { configureStore } from '@reduxjs/toolkit';
import originalAxios from 'axios';
import React from 'react';
import { Provider } from 'react-redux';
import { SWRConfig } from 'swr';
import { IBindedActions, IContext } from '../../lib/types.js';
import Context from '../lib/context.js';
import { makeThunks, reduxActions } from '../lib/reduxActions.js';
import { makeCurUserReducer } from '../lib/reduxReducers.js';
import { getUrl, restoreUser } from '../lib/utils.js';

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

    const initialUserState = restoreUser();

    const reduxStore = configureStore({
      reducer: {
        [makeCurUserReducer.key]: initialUserState
          ? makeCurUserReducer(actions, initialUserState)
          : makeCurUserReducer(actions),
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
