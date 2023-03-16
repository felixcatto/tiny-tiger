import { createAsyncThunk } from '@reduxjs/toolkit';
import { IAxiosInstance, IUser, IUserLoginCreds } from '../../lib/types.js';
import { getApiUrl, thunk } from './utils.js';

export const reduxActions = {};

export const makeThunks = ({ axios }: { axios: IAxiosInstance }) => ({
  signIn: createAsyncThunk<IUser, IUserLoginCreds>(
    'signIn',
    thunk(async userCreds => axios.post(getApiUrl('session'), userCreds))
  ),
  signOut: createAsyncThunk<IUser>(
    'signOut',
    thunk(async () => axios.delete(getApiUrl('session')))
  ),
});
