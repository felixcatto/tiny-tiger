import { memoize } from 'proxy-memoize';
import { IStoreSlice, IUser } from '../../server/lib/types.js';
import { guestUser, isAdmin, isSignedIn } from '../lib/utils.jsx';

export const storeSlice = {
  currentUser: (initialState: IUser = guestUser) => initialState,
};

export const session = memoize((state: IStoreSlice) => {
  const currentUser = state.currentUser;
  return {
    currentUser,
    isSignedIn: isSignedIn(currentUser),
    isAdmin: isAdmin(currentUser),
  };
});
