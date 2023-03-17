import { createReducer, createSelector } from '@reduxjs/toolkit';
import { IActions, IReduxState, ITodolistState, IUser } from '../../lib/types.js';
import { defaultFilters } from '../todoList/utils.js';
import { guestUser, isAdmin, isSignedIn } from './utils.js';

export const makeCurUserReducer = (actions: IActions, initialState: IUser = guestUser) =>
  createReducer(initialState, builder => {
    builder
      .addCase(actions.signIn.fulfilled, (state, action) => action.payload)
      .addCase(actions.signOut.fulfilled, (state, action) => action.payload);
  });

makeCurUserReducer.key = 'currentUser' as const;

export const selectSession = createSelector(
  (state: IReduxState) => state.currentUser,
  currentUser => ({
    currentUser,
    isSignedIn: isSignedIn(currentUser),
    isAdmin: isAdmin(currentUser),
  })
);

const todolistInitialState = {
  editingTodo: null,
  page: 0,
  size: 3,
  sortBy: null,
  sortOrder: null,
  filters: defaultFilters,
};

export const makeTodolistReducer = (
  actions: IActions,
  initialState: ITodolistState = todolistInitialState
) =>
  createReducer(initialState, builder => {
    builder.addCase(actions.setTodolist, (state, action) => ({ ...state, ...action.payload }));
  });

makeTodolistReducer.key = 'todolist' as const;
