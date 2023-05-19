import { createReducer } from '@reduxjs/toolkit';
import { IActions, IAsyncState, INotification, IUser } from '../../lib/types.js';
import { guestUser } from '../lib/utils.js';

export const makeCurUserReducer = (actions: IActions, initialState: IUser = guestUser) =>
  createReducer(initialState, builder => {
    builder
      .addCase(actions.signIn, (state, action) => action.payload)
      .addCase(actions.signOut, (state, action) => action.payload);
  });

makeCurUserReducer.key = 'currentUser' as const;

export const makeNotificationAnimationDuration = (actions: IActions, initialState = 0) =>
  createReducer(initialState, builder => {
    builder.addCase(
      actions.setNotificationAnimationDuration,
      (state, { payload: animationDuration }) => animationDuration
    );
  });

makeNotificationAnimationDuration.key = 'notificationAnimationDuration' as const;

export const makeNotificationsReducer = (actions: IActions, initialState: INotification[] = []) =>
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
  });

makeNotificationsReducer.key = 'notifications' as const;

export const makePrefetchRoutesStates = (
  actions: IActions,
  initialState: Record<any, IAsyncState> = {}
) =>
  createReducer(initialState, builder => {
    builder.addCase(actions.setRoutePrefetchState, (state, { payload }) => {
      state[payload.swrRequestKey] = payload.state;
    });
  });

makePrefetchRoutesStates.key = 'prefetchRoutesStates' as const;
