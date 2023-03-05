import { createReducer, createSelector } from '@reduxjs/toolkit';
import { IActions, IReduxState, IUser } from '../../lib/types.js';
import { guestUser, isAdmin, isSignedIn } from '../lib/utils.js';

export const makeCurUserReducer = (actions: IActions, initialState: IUser = guestUser) =>
  createReducer(initialState, builder => {
    builder
      .addCase(actions.signIn.fulfilled, (state, action) => action.payload)
      .addCase(actions.signOut.fulfilled, (state, action) => action.payload);
  });

export const selectSession = createSelector(
  (state: IReduxState) => state.currentUser,
  currentUser => ({
    currentUser,
    isSignedIn: isSignedIn(currentUser),
    isAdmin: isAdmin(currentUser),
  })
);
