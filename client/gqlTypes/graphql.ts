/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type IGetTodos = {
  __typename?: 'IGetTodos';
  rows: Array<ITodo>;
  totalRows: Scalars['Int'];
};

export type ITodo = {
  __typename?: 'ITodo';
  author?: Maybe<IUser>;
  author_id: Scalars['Int'];
  id: Scalars['Int'];
  is_completed: Scalars['Boolean'];
  is_edited_by_admin: Scalars['Boolean'];
  text: Scalars['String'];
};

export type IUser = {
  __typename?: 'IUser';
  email: Scalars['String'];
  id: Scalars['Int'];
  name: Scalars['String'];
  role: Scalars['String'];
  todos?: Maybe<Array<ITodo>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  deleteTodos?: Maybe<Scalars['Int']>;
  postTodos?: Maybe<ITodo>;
  putTodos?: Maybe<ITodo>;
};


export type MutationDeleteTodosArgs = {
  id: Scalars['Int'];
};


export type MutationPostTodosArgs = {
  email?: InputMaybe<Scalars['String']>;
  is_completed?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
  text: Scalars['String'];
};


export type MutationPutTodosArgs = {
  id: Scalars['Int'];
  is_completed?: InputMaybe<Scalars['Boolean']>;
  text: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  getTodos?: Maybe<IGetTodos>;
  getUsers: Array<IUser>;
};


export type QueryGetTodosArgs = {
  filters?: InputMaybe<Scalars['String']>;
  page?: InputMaybe<Scalars['Int']>;
  size?: InputMaybe<Scalars['Int']>;
  sortBy?: InputMaybe<Scalars['String']>;
  sortOrder?: InputMaybe<Scalars['String']>;
  withAuthor?: InputMaybe<Scalars['Boolean']>;
};


export type QueryGetUsersArgs = {
  withTodos?: InputMaybe<Scalars['Boolean']>;
};
