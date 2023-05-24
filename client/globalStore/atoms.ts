import { atom } from 'jotai';
import { atomWithImmer } from 'jotai-immer';
import { IAsyncState, IJotaiAtoms, INotification, IUser } from '../../lib/types.js';
import { guestUser, isAdmin, isSignedIn } from '../lib/utils.jsx';

export const makeAtoms = {
  currentUserAtom: (initialState: IUser = guestUser) => atom(initialState),

  notificationAnimationDurationAtom: (initialState = 0) => atom(initialState),

  notificationsAtom: (initialState: INotification[] = []) => atomWithImmer(initialState),

  prefetchRoutesStatesAtom: (initialState: Record<any, IAsyncState> = {}) =>
    atomWithImmer(initialState),
};

export const makeComputed = (atoms: IJotaiAtoms) => ({
  sessionAtom: atom(get => {
    const currentUser = get(atoms.currentUserAtom);
    return {
      currentUser,
      isSignedIn: isSignedIn(currentUser),
      isAdmin: isAdmin(currentUser),
    };
  }),
});
