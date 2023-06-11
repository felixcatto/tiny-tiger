import { memoize } from 'proxy-memoize';
import { guestUser, isAdmin, isSignedIn } from '../../lib/sharedUtils.js';
import { INotification, IStoreSlice, IUser } from '../../lib/types.js';

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
