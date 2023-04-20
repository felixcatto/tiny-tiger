import { isNull } from 'lodash-es';
import {
  IAxiosInstance,
  INotification,
  IReduxActions,
  IReduxState,
  IUser,
} from '../../lib/types.js';
import { createAction, createAsyncThunk } from './utils.js';

type IMakeThunksOpts = {
  axios: IAxiosInstance;
  actions: IReduxActions;
};

export const reduxActions = {
  signIn: createAction<IUser>(),
  signOut: createAction<IUser>(),
  addNotificationMount: createAction<INotification>(),
  addNotificationAnimationStart: createAction<INotification>(),
  removeNotificationAnimationStart: createAction<string>(),
  removeNotificationUnmount: createAction<string>(),
  setNotificationAnimationDuration: createAction<number>(),
};

export const makeThunks = ({ actions }: IMakeThunksOpts) => {
  const removeNotification = createAsyncThunk<void, string>(async (id, api) => {
    api.dispatch(actions.removeNotificationAnimationStart(id));

    const { notificationAnimationDuration } = api.getState() as IReduxState;
    await new Promise(resolve => setTimeout(resolve, notificationAnimationDuration));
    api.dispatch(actions.removeNotificationUnmount(id));
  });

  return {
    removeNotification,
    addNotification: createAsyncThunk<void, INotification>(async (notification, api) => {
      const { autoremoveTimeout } = notification;
      api.dispatch(actions.addNotificationMount(notification));

      await new Promise(resolve => setTimeout(resolve, 50));
      api.dispatch(actions.addNotificationAnimationStart(notification));

      if (isNull(autoremoveTimeout)) return;
      await new Promise(resolve => setTimeout(resolve, autoremoveTimeout));
      await api.dispatch(removeNotification(notification.id));
    }),
  };
};
