import { createReducer, createSelector } from '@reduxjs/toolkit';
import { IActions, IAsyncState, INotification, IReduxState, IUser } from '../../lib/types.js';
import { guestUser } from '../lib/utils.js';
import { isAdmin, isSignedIn } from '../lib/utils.jsx';

export const makeReducers = {
  currentUser: (actions: IActions, initialState: IUser = guestUser) =>
    createReducer(initialState, builder => {
      builder
        .addCase(actions.signIn, (state, action) => action.payload)
        .addCase(actions.signOut, (state, action) => action.payload);
    }),

  notificationAnimationDuration: (actions: IActions, initialState = 0) =>
    createReducer(initialState, builder => {
      builder.addCase(
        actions.setNotificationAnimationDuration,
        (state, { payload: animationDuration }) => animationDuration
      );
    }),

  notifications: (actions: IActions, initialState: INotification[] = []) =>
    createReducer(initialState, builder => {
      builder
        .addCase(actions.addNotificationMount, (state, { payload: newNotification }) =>
          [newNotification].concat(state)
        )
        .addCase(actions.addNotificationAnimationStart, (state, { payload: newNotification }) => {
          const item = state.find(el => el.id === newNotification.id);
          if (!item) return;
          item.isHidden = false;
        })
        .addCase(actions.removeNotificationAnimationStart, (state, { payload: id }) => {
          const item = state.find(el => el.id === id);
          if (!item) return;
          item.isHidden = true;
          item.isInverseAnimation = true;
        })
        .addCase(actions.removeNotificationUnmount, (state, { payload: id }) =>
          state.filter(el => el.id !== id)
        );
    }),

  prefetchRoutesStates: (actions: IActions, initialState: Record<any, IAsyncState> = {}) =>
    createReducer(initialState, builder => {
      builder.addCase(actions.setRoutePrefetchState, (state, { payload }) => {
        state[payload.swrRequestKey] = payload.state;
      });
    }),
};

export const selectSession = createSelector(
  (state: IReduxState) => state.currentUser,
  currentUser => ({
    currentUser,
    isSignedIn: isSignedIn(currentUser),
    isAdmin: isAdmin(currentUser),
  })
);
