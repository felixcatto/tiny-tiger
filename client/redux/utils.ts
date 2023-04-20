import {
  createAction as createActionRaw,
  createAsyncThunk as createAsyncThunkRaw,
} from '@reduxjs/toolkit';
import { uniqueId } from 'lodash-es';
import { TypedUseSelectorHook, useSelector as useSelectorRaw } from 'react-redux';
import { IBindedActions, ICreateAsyncThunk, IReduxState } from '../../lib/types.js';

export const createAction = <TPayload = void>(type?: string) =>
  createActionRaw<TPayload>(type || uniqueId('action_'));

export const createAsyncThunk: ICreateAsyncThunk = fn =>
  createAsyncThunkRaw(uniqueId('thunk_'), fn);

export const useSelector: TypedUseSelectorHook<IReduxState> = useSelectorRaw;

export const bindActions = (reduxActions, reduxThunks, dispatch) => {
  const bindedReduxActions = Object.keys(reduxActions).reduce(
    (acc, actionType) => ({
      ...acc,
      [actionType]: arg => dispatch(reduxActions[actionType](arg)),
    }),
    {}
  );

  const bindedThunks = Object.keys(reduxThunks).reduce(
    (acc, actionType) => ({
      ...acc,
      [actionType]: arg => dispatch(reduxThunks[actionType](arg)).unwrap(),
    }),
    {}
  );

  return { ...bindedReduxActions, ...bindedThunks } as IBindedActions;
};
