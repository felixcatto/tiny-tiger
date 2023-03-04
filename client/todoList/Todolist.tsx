import { Form, Formik } from 'formik';
import React from 'react';
import Layout from '../common/layout.js';
import {
  Field,
  ErrorMessage,
  SubmitBtn,
  WithApiErrors,
  getApiUrl,
  useContext,
  useImmerState,
} from '../lib/utils.js';
// import s from './styles.module.css';
import useSWR from 'swr';
import { ITodo } from '../../lib/types.js';
import cn from 'classnames';

type IState = {
  editingTodo: ITodo | null;
};

const TodoList = WithApiErrors(() => {
  const onSubmit = () => {};
  const { axios } = useContext();
  const { data: todos, mutate } = useSWR<ITodo[]>(getApiUrl('todos'));
  const [state, setState] = useImmerState<IState>({
    editingTodo: null,
  });
  const { editingTodo } = state;
  const initialValues = editingTodo
    ? { name: editingTodo.author?.name, email: editingTodo.author?.email, text: editingTodo.text }
    : { name: '', email: '', text: '' };
  console.log(todos);

  const editTodo = todo => async () => {
    setState({ editingTodo: todo });
  };
  const changeTodoStatus = todo => async () => {
    await axios.put(getApiUrl('todo', { id: todo.id }), {
      ...todo,
      is_completed: !todo.is_completed,
    });
    mutate();
  };
  const cancelEdit = () => {
    setState({ editingTodo: null });
  };
  const deleteTodo = id => async () => {
    await axios.delete(getApiUrl('todo', { id }));
    mutate();
  };

  const todoClass = todo =>
    cn('fa', {
      'fa-check': todo.is_completed,
      'fa-dove': !todo.is_completed,
    });
  const changeStatusIconClass = todo =>
    cn('fa fa_big mr-3 clickable', {
      'fa-check': !todo.is_completed,
      'fa-dove': todo.is_completed,
    });
  const changeStatusIconTitle = todo =>
    todo.is_completed ? 'Mark as Incomplete' : 'Mark as Completed';

  return (
    <Layout>
      <div className="row">
        <div className="col-4">
          <Formik key={editingTodo?.id ?? '?'} initialValues={initialValues} onSubmit={onSubmit}>
            <Form>
              <div className="flex mb-4 items-center">
                <h3 className="mb-0">Add new todo</h3>
                {editingTodo && <i className="fa fa-pen ml-4 text-xl text-secondary"></i>}
              </div>
              <div className="mb-4">
                <label className="text-sm">Name</label>
                <Field className="form-control" name="name" />
                <ErrorMessage name="name" />
              </div>
              <div className="mb-4">
                <label className="text-sm">Email</label>
                <Field className="form-control" name="email" />
                <ErrorMessage name="email" />
              </div>
              <div className="mb-6">
                <label className="text-sm">Text</label>
                <Field className="form-control" name="text" as="textarea" />
                <ErrorMessage name="text" />
              </div>
              {editingTodo && (
                <div className="link mr-3" onClick={cancelEdit}>
                  Cancel edit
                </div>
              )}
              <SubmitBtn className="btn">Save</SubmitBtn>
            </Form>
          </Formik>
        </div>

        <div className="col-8">
          <h3 className="mb-4">List of todos</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Text</th>
                <th className="text-center">Status</th>
                <th className=""></th>
              </tr>
            </thead>
            <tbody>
              {todos?.map(todo => (
                <tr key={todo.id}>
                  <td>{todo.author?.name}</td>
                  <td>{todo.author?.email}</td>
                  <td>{todo.text}</td>
                  <td className="text-center">
                    <i
                      className={todoClass(todo)}
                      title={todo.is_completed ? 'Completed' : 'Incomplete'}
                    ></i>
                  </td>
                  <td className="text-right">
                    <i
                      className={changeStatusIconClass(todo)}
                      title={changeStatusIconTitle(todo)}
                      onClick={changeTodoStatus(todo)}
                    ></i>
                    <i
                      className="fa fa-edit fa_big mr-3 clickable"
                      title="Edit"
                      onClick={editTodo(todo)}
                    ></i>
                    <i
                      className="far fa-trash-can fa_big clickable"
                      title="Delete"
                      onClick={deleteTodo(todo.id)}
                    ></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
});

export default TodoList;
