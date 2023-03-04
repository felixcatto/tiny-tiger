import React from 'react';
import { SWRConfig } from 'swr';
import Context from '../lib/context.js';
import originalAxios from 'axios';
import { IContext } from '../../lib/types.js';

type IAppProps = {
  Component: () => JSX.Element;
};

const App = (props: IAppProps) => {
  const { Component } = props;

  const axios = originalAxios.create();
  axios.interceptors.response.use(
    response => response.data,
    error => {
      console.log(error.response);
      return Promise.reject(error);
    }
  );

  const swrConfig = {
    fetcher: axios.get,
    revalidateOnFocus: false,
  };

  const store: IContext = {
    axios,
  };

  return (
    <Context.Provider value={store}>
      <SWRConfig value={swrConfig}>
        <Component />
      </SWRConfig>
    </Context.Provider>
  );
};

export default App;
