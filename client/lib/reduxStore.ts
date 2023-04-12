import { createAction, createReducer, createSelector } from '@reduxjs/toolkit';
import { isNull } from 'lodash-es';
import {
  IActions,
  IAxiosInstance,
  INotification,
  IReduxActions,
  IReduxState,
  IUser,
  IUserLoginCreds,
} from '../../lib/types.js';
import { getApiUrl, guestUser, iCreateAsyncThunk, isAdmin, isSignedIn } from './utils.js';

type IMakeThunksOpts = {
  axios: IAxiosInstance;
  actions: IReduxActions;
};

export const reduxActions = {
  addNotificationMount: createAction<INotification>('addNotificationMount'),
  addNotificationAnimationStart: createAction<INotification>('addNotificationAnimationStart'),
  removeNotificationAnimationStart: createAction<string>('removeNotificationAnimationStart'),
  removeNotificationUnmount: createAction<string>('removeNotificationUnmount'),
  setNotificationAnimationDuration: createAction<number>('setNotificationAnimationDuration'),
};

export const makeThunks = ({ axios, actions }: IMakeThunksOpts) => ({
  signIn: iCreateAsyncThunk<IUser, IUserLoginCreds>('signIn', async userCreds =>
    axios.post(getApiUrl('session'), userCreds)
  ),
  signOut: iCreateAsyncThunk<IUser>('signOut', async () => axios.delete(getApiUrl('session'))),
  addNotification: iCreateAsyncThunk<void, INotification>(
    'addNotification',
    async (notification, api) => {
      const { autoremoveTimeout } = notification;
      api.dispatch(actions.addNotificationMount(notification));

      await new Promise(resolve => setTimeout(resolve, 50));
      api.dispatch(actions.addNotificationAnimationStart(notification));

      if (isNull(autoremoveTimeout)) return;
      await new Promise(resolve => setTimeout(resolve, autoremoveTimeout));
      api.dispatch(actions.removeNotificationAnimationStart(notification.id));

      const { notificationAnimationDuration }: IReduxState = api.getState();
      await new Promise(resolve => setTimeout(resolve, notificationAnimationDuration));
      api.dispatch(actions.removeNotificationUnmount(notification.id));
    }
  ),
  removeNotification: iCreateAsyncThunk<void, string>('removeNotification', async (id, api) => {
    api.dispatch(actions.removeNotificationAnimationStart(id));

    const { notificationAnimationDuration }: IReduxState = api.getState();
    await new Promise(resolve => setTimeout(resolve, notificationAnimationDuration));
    api.dispatch(actions.removeNotificationUnmount(id));
  }),
});

export const makeCurUserReducer = (actions: IActions, initialState: IUser = guestUser) =>
  createReducer(initialState, builder => {
    builder
      .addCase(actions.signIn.fulfilled, (state, action) => action.payload)
      .addCase(actions.signOut.fulfilled, (state, action) => action.payload);
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

export const selectSession = createSelector(
  (state: IReduxState) => state.currentUser,
  currentUser => ({
    currentUser,
    isSignedIn: isSignedIn(currentUser),
    isAdmin: isAdmin(currentUser),
  })
);
