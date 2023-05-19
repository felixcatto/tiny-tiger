import { createSelector } from '@reduxjs/toolkit';
import { IReduxState } from '../../lib/types.js';
import { isAdmin, isSignedIn } from '../lib/utils.jsx';

export const selectSession = createSelector(
  (state: IReduxState) => state.currentUser,
  currentUser => ({
    currentUser,
    isSignedIn: isSignedIn(currentUser),
    isAdmin: isAdmin(currentUser),
  })
);
