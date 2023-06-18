import { memoize } from 'proxy-memoize';
import { INotification, IStoreSlice, IUser } from '../../server/lib/types.js';
import { guestUser, isAdmin, isSignedIn } from '../lib/utils.jsx';

export const storeSlice = {
  currentUser: (initialState: IUser = guestUser) => initialState,

  notificationAnimationDuration: (initialState = 0) => initialState,

  notifications: (initialState: INotification[] = []) => initialState,
};

export const session = memoize((state: IStoreSlice) => {
  const currentUser = state.currentUser;
  return {
    currentUser,
    isSignedIn: isSignedIn(currentUser),
    isAdmin: isAdmin(currentUser),
  };
});
