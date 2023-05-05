import { gql } from 'graphql-request';

const userFields = gql`
  fragment userFields on IUser {
    id
    name
    role
    email
  }
`;

const todoFields = gql`
  fragment todoFields on ITodo {
    id
    text
    author_id
    is_completed
    is_edited_by_admin
  }
`;

export const getUsers = gql`
  query getUsers($withTodos: Boolean = false) {
    getUsers(withTodos: $withTodos) {
      ...userFields
      todos {
        ...todoFields
      }
    }
  }
  ${userFields}
  ${todoFields}
`;

export const getTodos = gql`
  query getTodos(
    $withAuthor: Boolean = false
    $filters: String
    $sortOrder: String
    $sortBy: String
    $page: Int
    $size: Int
  ) {
    getTodos(
      withAuthor: $withAuthor
      filters: $filters
      sortOrder: $sortOrder
      sortBy: $sortBy
      page: $page
      size: $size
    ) {
      rows {
        ...todoFields
        author {
          ...userFields
        }
      }
      totalRows
    }
  }
  ${userFields}
  ${todoFields}
`;

export const postTodos = gql`
  mutation postTodos($text: String!, $name: String, $email: String, $is_completed: Boolean) {
    postTodos(text: $text, name: $name, email: $email, is_completed: $is_completed) {
      id
    }
  }
`;

export const putTodos = gql`
  mutation putTodos($id: Int!, $text: String!, $is_completed: Boolean) {
    putTodos(id: $id, text: $text, is_completed: $is_completed) {
      id
    }
  }
`;

export const deleteTodos = gql`
  mutation deleteTodos($id: Int!) {
    deleteTodos(id: $id)
  }
`;
