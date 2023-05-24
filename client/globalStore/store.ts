import { memoize } from 'proxy-memoize';
import { IAsyncState, INotification, IStoreSlice, IUser } from '../../lib/types.js';
import { guestUser, isAdmin, isSignedIn } from '../lib/utils.jsx';

export const storeSlice = {
  currentUser: (initialState: IUser = guestUser) => initialState,

  notificationAnimationDuration: (initialState = 0) => initialState,

  notifications: (initialState: INotification[] = []) => initialState,

  prefetchRoutesStates: (initialState: Record<any, IAsyncState> = {}) => initialState,
};

export const session = memoize((state: IStoreSlice) => {
  const currentUser = state.currentUser;
  return {
    currentUser,
    isSignedIn: isSignedIn(currentUser),
    isAdmin: isAdmin(currentUser),
  };
});
